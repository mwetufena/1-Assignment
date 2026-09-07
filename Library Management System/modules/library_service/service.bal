// RESTful service exposing Library & Resource Management operations.
// All endpoints are defined under the /library base path.
import ballerina/http;

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["*"]
    }
}
service /library on new http:Listener(9090) {

    // ---------- Health ----------
    resource function get health() returns json {
        return {status: "UP", serviceName: "library-ms", today: nowIso()};
    }

    // ---------- Asset CRUD ----------
    resource function post assets(@http:Payload AssetCreate payload)
            returns http:Created|http:BadRequest|http:Conflict {
        if payload.assetTag.trim() == "" {
            return <http:BadRequest>{
                body: {statusCode: 400, message: "assetTag is required"}
            };
        }
        if assetStore.hasKey(payload.assetTag) {
            return <http:Conflict>{
                body: {statusCode: 409, message: "Asset already exists", detail: payload.assetTag}
            };
        }
        if !isValidDate(payload.dateAcquired) {
            return <http:BadRequest>{
                body: {statusCode: 400, message: "dateAcquired must be ISO YYYY-MM-DD"}
            };
        }
        AssetStatus initial = "AVAILABLE";
        AssetStatus? maybeStatus = payload.status;
        if maybeStatus is AssetStatus {
            initial = maybeStatus;
        }
        Asset a = {
            assetTag: payload.assetTag,
            name: payload.name,
            description: payload.description,
            institution: payload.institution,
            site: payload.site,
            status: initial,
            dateAcquired: payload.dateAcquired,
            components: payload.components,
            schedules: payload.schedules,
            workOrders: payload.workOrders
        };
        assetStore[a.assetTag] = a;
        return <http:Created>{body: cloneAsset(a)};
    }

    resource function get assets() returns Asset[] {
        Asset[] out = [];
        foreach Asset a in assetStore {
            out.push(cloneAsset(a));
        }
        return out;
    }

    resource function get assets/[string assetTag]() returns Asset|http:NotFound {
        if !assetStore.hasKey(assetTag) {
            return <http:NotFound>{
                body: {statusCode: 404, message: "Asset not found", detail: assetTag}
            };
        }
        return cloneAsset(assetStore.get(assetTag));
    }

    resource function put assets/[string assetTag](@http:Payload AssetUpdate patch)
            returns Asset|http:NotFound|http:BadRequest {
        if !assetStore.hasKey(assetTag) {
            return <http:NotFound>{
                body: {statusCode: 404, message: "Asset not found", detail: assetTag}
            };
        }
        Asset current = assetStore.get(assetTag);
        Asset updated = {
            assetTag: current.assetTag,
            name: patch.name ?: current.name,
            description: patch.description ?: current.description,
            institution: patch.institution ?: current.institution,
            site: patch.site ?: current.site,
            status: patch.status ?: current.status,
            dateAcquired: patch.dateAcquired ?: current.dateAcquired,
            components: patch.components ?: current.components,
            schedules: patch.schedules ?: current.schedules,
            workOrders: patch.workOrders ?: current.workOrders
        };
        if !isValidDate(updated.dateAcquired) {
            return <http:BadRequest>{
                body: {statusCode: 400, message: "dateAcquired must be ISO YYYY-MM-DD"}
            };
        }
        assetStore[assetTag] = updated;
        return cloneAsset(updated);
    }

    resource function delete assets/[string assetTag]() returns json|http:NotFound {
        if !assetStore.hasKey(assetTag) {
            return <http:NotFound>{
                body: {statusCode: 404, message: "Asset not found", detail: assetTag}
            };
        }
        _ = assetStore.removeIfHasKey(assetTag);
        _ = loanStore.removeIfHasKey(assetTag);
        return {deleted: assetTag};
    }

    // ---------- Institution & Site filtering ----------
    resource function get institutions() returns string[] {
        return listInstitutions();
    }

    resource function get institutions/[string name]/assets() returns Asset[]|http:BadRequest {
        if name.trim() == "" {
            return <http:BadRequest>{
                body: {statusCode: 400, message: "institution name is required"}
            };
        }
        Asset[] out = [];
        foreach Asset a in assetStore {
            if a.institution == name {
                out.push(cloneAsset(a));
            }
        }
        return out;
    }

    resource function get sites/[string site]/assets() returns Asset[] {
        Asset[] out = [];
        foreach Asset a in assetStore {
            if a.site == site {
                out.push(cloneAsset(a));
            }
        }
        return out;
    }

    // ---------- Maintenance / overdue ----------
    resource function get maintenance/overdue() returns json {
        string today = nowIso();
        json[] items = [];
        foreach Asset a in assetStore {
            foreach Schedule s in a.schedules {
                if isOverdue(s, today) {
                    items.push({
                        assetTag: a.assetTag,
                        name: a.name,
                        institution: a.institution,
                        site: a.site,
                        scheduleId: s.scheduleId,
                        dueDate: s.dueDate,
                        description: s.description
                    });
                }
            }
        }
        return {asOf: today, count: items.length(), items: items};
    }

    // ---------- Components ----------
    resource function post assets/[string assetTag]/components(@http:Payload ComponentInput input)
            returns Asset|http:NotFound|http:BadRequest|http:Conflict {
        if !assetStore.hasKey(assetTag) {
            return <http:NotFound>{body: {statusCode: 404, message: "Asset not found", detail: assetTag}};
        }
        Asset a = assetStore.get(assetTag);
        foreach Component c in a.components {
            if c.compId == input.compId {
                return <http:Conflict>{
                    body: {statusCode: 409, message: "Component already exists", detail: input.compId}
                };
            }
        }
        a.components.push({
            compId: input.compId,
            name: input.name,
            description: input.description
        });
        assetStore[assetTag] = a;
        return cloneAsset(a);
    }

    resource function delete assets/[string assetTag]/components/[string compId]()
            returns Asset|http:NotFound {
        if !assetStore.hasKey(assetTag) {
            return <http:NotFound>{body: {statusCode: 404, message: "Asset not found", detail: assetTag}};
        }
        Asset a = assetStore.get(assetTag);
        int initialLen = a.components.length();
        a.components = filterComponents(a.components, compId);
        if a.components.length() == initialLen {
            return <http:NotFound>{
                body: {statusCode: 404, message: "Component not found", detail: compId}
            };
        }
        assetStore[assetTag] = a;
        return cloneAsset(a);
    }

    // ---------- Schedules (servicing & booking) ----------
    resource function post assets/[string assetTag]/schedules(@http:Payload ScheduleInput input)
            returns Asset|http:NotFound|http:BadRequest|http:Conflict {
        if !assetStore.hasKey(assetTag) {
            return <http:NotFound>{body: {statusCode: 404, message: "Asset not found", detail: assetTag}};
        }
        if !isValidDate(input.dueDate) {
            return <http:BadRequest>{
                body: {statusCode: 400, message: "dueDate must be ISO YYYY-MM-DD"}
            };
        }
        Asset a = assetStore.get(assetTag);
        foreach Schedule s in a.schedules {
            if s.scheduleId == input.scheduleId {
                return <http:Conflict>{
                    body: {statusCode: 409, message: "Schedule already exists", detail: input.scheduleId}
                };
            }
        }
        a.schedules.push({
            scheduleId: input.scheduleId,
            'type: input.'type,
            dueDate: input.dueDate,
            description: input.description
        });
        assetStore[assetTag] = a;
        return cloneAsset(a);
    }

    resource function delete assets/[string assetTag]/schedules/[string scheduleId]()
            returns Asset|http:NotFound {
        if !assetStore.hasKey(assetTag) {
            return <http:NotFound>{body: {statusCode: 404, message: "Asset not found", detail: assetTag}};
        }
        Asset a = assetStore.get(assetTag);
        int initialLen = a.schedules.length();
        a.schedules = filterSchedules(a.schedules, scheduleId);
        if a.schedules.length() == initialLen {
            return <http:NotFound>{
                body: {statusCode: 404, message: "Schedule not found", detail: scheduleId}
            };
        }
        assetStore[assetTag] = a;
        return cloneAsset(a);
    }

    // ---------- Work orders & sub-tasks ----------
    resource function post assets/[string assetTag]/workorders(@http:Payload WorkOrderInput input)
            returns Asset|http:NotFound|http:Conflict {
        if !assetStore.hasKey(assetTag) {
            return <http:NotFound>{body: {statusCode: 404, message: "Asset not found", detail: assetTag}};
        }
        Asset a = assetStore.get(assetTag);
        foreach WorkOrder w in a.workOrders {
            if w.orderId == input.orderId {
                return <http:Conflict>{
                    body: {statusCode: 409, message: "Work order already exists", detail: input.orderId}
                };
            }
        }
        a.workOrders.push({
            orderId: input.orderId,
            status: input.status,
            description: input.description,
            tasks: input.tasks
        });
        assetStore[assetTag] = a;
        return cloneAsset(a);
    }

    resource function put assets/[string assetTag]/workorders/[string orderId](@http:Payload WorkOrderUpdate patch)
            returns Asset|http:NotFound {
        if !assetStore.hasKey(assetTag) {
            return <http:NotFound>{body: {statusCode: 404, message: "Asset not found", detail: assetTag}};
        }
        Asset a = assetStore.get(assetTag);
        boolean found = false;
        WorkOrder[] updatedOrders = [];
        foreach WorkOrder w in a.workOrders {
            if w.orderId == orderId {
                found = true;
                WorkOrder next = {
                    orderId: w.orderId,
                    status: patch.status ?: w.status,
                    description: patch.description ?: w.description,
                    tasks: patch.tasks ?: w.tasks
                };
                updatedOrders.push(next);
            } else {
                updatedOrders.push(w);
            }
        }
        if !found {
            return <http:NotFound>{
                body: {statusCode: 404, message: "Work order not found", detail: orderId}
            };
        }
        a.workOrders = updatedOrders;
        assetStore[assetTag] = a;
        return cloneAsset(a);
    }

    resource function delete assets/[string assetTag]/workorders/[string orderId]()
            returns Asset|http:NotFound {
        if !assetStore.hasKey(assetTag) {
            return <http:NotFound>{body: {statusCode: 404, message: "Asset not found", detail: assetTag}};
        }
        Asset a = assetStore.get(assetTag);
        int initialLen = a.workOrders.length();
        a.workOrders = filterWorkOrders(a.workOrders, orderId);
        if a.workOrders.length() == initialLen {
            return <http:NotFound>{
                body: {statusCode: 404, message: "Work order not found", detail: orderId}
            };
        }
        assetStore[assetTag] = a;
        return cloneAsset(a);
    }

    // Sub-task on a work order
    resource function post assets/[string assetTag]/workorders/[string orderId]/tasks(@http:Payload TaskInput input)
            returns Asset|http:NotFound|http:Conflict {
        if !assetStore.hasKey(assetTag) {
            return <http:NotFound>{body: {statusCode: 404, message: "Asset not found", detail: assetTag}};
        }
        Asset a = assetStore.get(assetTag);
        boolean woFound = false;
        WorkOrder[] updatedOrders = [];
        foreach WorkOrder w in a.workOrders {
            if w.orderId == orderId {
                woFound = true;
                foreach Task t in w.tasks {
                    if t.taskId == input.taskId {
                        return <http:Conflict>{
                            body: {statusCode: 409, message: "Task already exists", detail: input.taskId}
                        };
                    }
                }
                Task[] newTasks = [...w.tasks, {
                    taskId: input.taskId,
                    description: input.description,
                    completed: input.completed
                }];
                updatedOrders.push({orderId: w.orderId, status: w.status, description: w.description, tasks: newTasks});
            } else {
                updatedOrders.push(w);
            }
        }
        if !woFound {
            return <http:NotFound>{
                body: {statusCode: 404, message: "Work order not found", detail: orderId}
            };
        }
        a.workOrders = updatedOrders;
        assetStore[assetTag] = a;
        return cloneAsset(a);
    }

    // ---------- Loan & Booking ----------
    resource function post assets/[string assetTag]/loan(@http:Payload LoanRequest req)
            returns json|http:NotFound|http:Conflict|http:BadRequest {
        if !assetStore.hasKey(assetTag) {
            return <http:NotFound>{body: {statusCode: 404, message: "Asset not found", detail: assetTag}};
        }
        Asset a = assetStore.get(assetTag);
        if a.status != "AVAILABLE" {
            return <http:Conflict>{
                body: {
                    statusCode: 409,
                    message: "Asset not available for loan",
                    detail: "current status: " + a.status
                }
            };
        }
        string? ret = req.expectedReturnDate;
        if ret is string && !isValidDate(ret) {
            return <http:BadRequest>{
                body: {statusCode: 400, message: "expectedReturnDate must be ISO YYYY-MM-DD"}
            };
        }
        a.status = "LOANED_OUT";
        assetStore[assetTag] = a;
        loanStore[assetTag] = {
            assetTag: assetTag,
            borrower: req.borrower,
            bookedAt: nowIso(),
            expectedReturnDate: ret
        };
        return {assetTag: assetTag, status: a.status, borrower: req.borrower, expectedReturnDate: ret};
    }

    resource function post assets/[string assetTag]/checkin() returns json|http:NotFound|http:Conflict {
        if !assetStore.hasKey(assetTag) {
            return <http:NotFound>{body: {statusCode: 404, message: "Asset not found", detail: assetTag}};
        }
        Asset a = assetStore.get(assetTag);
        if a.status != "LOANED_OUT" {
            return <http:Conflict>{
                body: {
                    statusCode: 409,
                    message: "Asset is not currently on loan",
                    detail: "current status: " + a.status
                }
            };
        }
        a.status = "AVAILABLE";
        assetStore[assetTag] = a;
        _ = loanStore.removeIfHasKey(assetTag);
        return {assetTag: assetTag, status: a.status};
    }

    resource function post assets/[string assetTag]/book(@http:Payload BookingRequest req)
            returns json|http:NotFound|http:Conflict|http:BadRequest {
        if !assetStore.hasKey(assetTag) {
            return <http:NotFound>{body: {statusCode: 404, message: "Asset not found", detail: assetTag}};
        }
        if !isValidDate(req.scheduledDate) {
            return <http:BadRequest>{
                body: {statusCode: 400, message: "scheduledDate must be ISO YYYY-MM-DD"}
            };
        }
        Asset a = assetStore.get(assetTag);
        if a.status != "AVAILABLE" {
            return <http:Conflict>{
                body: {
                    statusCode: 409,
                    message: "Space not available for booking",
                    detail: "current status: " + a.status
                }
            };
        }
        foreach Schedule s in a.schedules {
            if s.'type == "BOOKING" && s.dueDate == req.scheduledDate {
                return <http:Conflict>{
                    body: {
                        statusCode: 409,
                        message: "Already booked on this date",
                        detail: s.scheduleId
                    }
                };
            }
        }
        string cleaned = removeDashes(req.scheduledDate);
        string tail = assetTag.length() >= 3
            ? assetTag.substring(assetTag.length() - 3)
            : assetTag;
        string newId = "BK-" + tail + "-" + cleaned;
        a.schedules.push({
            scheduleId: newId,
            'type: "BOOKING",
            dueDate: req.scheduledDate,
            description: "Booked by " + req.bookedBy + " — " + req.purpose
        });
        a.status = "OCCUPIED";
        assetStore[assetTag] = a;
        return {assetTag: assetTag, scheduleId: newId, status: a.status};
    }

    // ---------- Loans bookkeeping ----------
    resource function get loans() returns LoanRecord[] {
        LoanRecord[] out = [];
        foreach LoanRecord r in loanStore {
            out.push(r);
        }
        return out;
    }
}
