// Interactive CLI client for the Library & Resource Management System.
// Connects to the local REST service on http://localhost:9090/library.
import ballerina/io;

public function main() returns error? {
    clearScreen();
    banner("Ministry of Higher Education — Library & Resource Manager");
    io:println(DIM + "  Connected to: http://localhost:9090/library" + RESET);
    info("All actions are confirmed before being sent to the service.");

    while true {
        io:println("");
        io:println(BOLD + CYAN + "Main Menu" + RESET);
        io:println("  " + BOLD + "1" + RESET + " — Loan / return an asset");
        io:println("  " + BOLD + "2" + RESET + " — Book a meeting room or lab");
        io:println("  " + BOLD + "3" + RESET + " — Global view (all assets)");
        io:println("  " + BOLD + "4" + RESET + " — Campus / institution view");
        io:println("  " + BOLD + "5" + RESET + " — Overdue maintenance dashboard");
        io:println("  " + BOLD + "6" + RESET + " — Schedule manager (add/remove)");
        io:println("  " + BOLD + "7" + RESET + " — Manage assets (CRUD)");
        io:println("  " + BOLD + "8" + RESET + " — Manage components");
        io:println("  " + BOLD + "9" + RESET + " — Work orders & sub-tasks");
        io:println("  " + BOLD + "0" + RESET + " — Exit");
        io:println("");
        string choice = prompt("Choose [0-9]");

        if choice == "1" { check loanFlow(); }
        else if choice == "2" { check bookingFlow(); }
        else if choice == "3" { check globalViewFlow(); }
        else if choice == "4" { check campusViewFlow(); }
        else if choice == "5" { check overdueFlow(); }
        else if choice == "6" { check scheduleFlow(); }
        else if choice == "7" { check assetsFlow(); }
        else if choice == "8" { check componentsFlow(); }
        else if choice == "9" { check workOrdersFlow(); }
        else if choice == "0" || choice == "q" || choice == "Q" {
            io:println("");
            ok("Goodbye.");
            return;
        }
        else if choice == "" {}
        else { warn("Unknown option: " + choice); }
    }
}

// =============================================================
// Menu 1 — Loan / return
// =============================================================
function loanFlow() returns error? {
    section("Loan / return an asset");
    string tag = prompt("Asset tag (e.g. IUM-LAB-LP-014)");
    if tag == "" { warn("Cancelled."); return; }
    io:println("  " + BOLD + "1" + RESET + " — Loan this asset");
    io:println("  " + BOLD + "2" + RESET + " — Return (checkin) this asset");
    string op = prompt("Operation [1-2]");
    if op == "1" {
        string borrower = prompt("Borrower name");
        if borrower == "" { warn("Borrower required."); return; }
        string due = prompt("Expected return date (YYYY-MM-DD, blank if unknown)");
        json payload = {borrower: borrower, expectedReturnDate: due};
        showResult(loanAsset(tag, payload));
    } else if op == "2" {
        showResult(checkinAsset(tag));
    } else {
        warn("Cancelled.");
    }
}

// =============================================================
// Menu 2 — Book a space
// =============================================================
function bookingFlow() returns error? {
    section("Book a meeting room or lab");
    string tag = prompt("Space asset tag (e.g. NUST-MR-CONF-007)");
    if tag == "" { warn("Cancelled."); return; }
    string bookedBy = prompt("Booked by");
    if bookedBy == "" { warn("Booked-by required."); return; }
    string date = prompt("Scheduled date (YYYY-MM-DD)");
    if date == "" { warn("Date required."); return; }
    string purpose = prompt("Purpose");
    if purpose == "" { warn("Purpose required."); return; }
    json payload = {bookedBy: bookedBy, scheduledDate: date, purpose: purpose};
    showResult(bookSpace(tag, payload));
}

// =============================================================
// Menu 3 — Global view
// =============================================================
function globalViewFlow() returns error? {
    section("Global view — all assets");
    ApiResult|error r = listAssets();
    if r is error { err("Network error: " + r.message()); return; }
    if r.statusCode != 200 { err("HTTP " + r.statusCode.toString()); return; }
    printAssetList(r.body);
    info("Total: " + countOf(r.body).toString() + " asset(s).");
    _ = prompt("Press Enter to continue");
}

// =============================================================
// Menu 4 — Campus / institution view
// =============================================================
function campusViewFlow() returns error? {
    section("Campus / institution view");
    io:println("  " + BOLD + "1" + RESET + " — List known institutions");
    io:println("  " + BOLD + "2" + RESET + " — Filter by institution");
    io:println("  " + BOLD + "3" + RESET + " — Filter by site / campus");
    string op = prompt("Operation [1-3]");
    if op == "1" {
        ApiResult|error r = listInstitutions();
        if r is error { err("Network error: " + r.message()); return; }
        json[] insts = jarr(r.body);
        if insts.length() == 0 { info("No institutions yet."); }
        foreach json i in insts {
            io:println("  • " + jstr(i, ""));
        }
    } else if op == "2" {
        string name = prompt("Institution name (exact match)");
        if name == "" { return; }
        ApiResult|error r = assetsByInstitution(name);
        showResult(r);
        if r is ApiResult && r.statusCode == 200 { printAssetList(r.body); }
    } else if op == "3" {
        string site = prompt("Site / campus (exact match)");
        if site == "" { return; }
        ApiResult|error r = assetsBySite(site);
        showResult(r);
        if r is ApiResult && r.statusCode == 200 { printAssetList(r.body); }
    }
    _ = prompt("Press Enter to continue");
}

// =============================================================
// Menu 5 — Overdue dashboard
// =============================================================
function overdueFlow() returns error? {
    section("Overdue maintenance dashboard");
    ApiResult|error r = overdueMaintenance();
    if r is error { err("Network error: " + r.message()); return; }
    if r.statusCode != 200 { err("HTTP " + r.statusCode.toString()); return; }
    map<json> body = jobj(r.body);
    string asOf = jstr(body["asOf"], "?");
    int count = jint(body["count"], 0);
    io:println(DIM + "As of: " + asOf + RESET);
    io:println(BOLD + "Overdue items: " + count.toString() + RESET);
    json[] items = jarr(body["items"]);
    if items.length() > 0 {
        io:println("");
        foreach json it in items {
            map<json> m = jobj(it);
            string tag = jstr(m["assetTag"], "?");
            string name = jstr(m["name"], "?");
            string inst = jstr(m["institution"], "?");
            string sid = jstr(m["scheduleId"], "?");
            string due = jstr(m["dueDate"], "?");
            string desc = jstr(m["description"], "");
            io:println(RED + "  ⚠ " + tag + RESET + " — " + name);
            io:println("    " + DIM + inst + RESET);
            io:println("    " + DIM + "Schedule: " + sid + " (due " + due + ") — " + desc + RESET);
        }
    } else {
        ok("No overdue items right now.");
    }
    _ = prompt("Press Enter to continue");
}

// =============================================================
// Menu 6 — Schedule manager
// =============================================================
function scheduleFlow() returns error? {
    section("Schedule manager");
    string tag = prompt("Asset tag");
    if tag == "" { return; }

    ApiResult|error ar = getAsset(tag);
    if ar is ApiResult && ar.statusCode == 200 {
        io:println(DIM + "Current schedules:" + RESET);
        json[] schs = jarr(jobj(ar.body)["schedules"]);
        if schs.length() == 0 { info("  (none)"); }
        foreach json s in schs {
            map<json> sm = jobj(s);
            string sid = jstr(sm["scheduleId"], "?");
            string stype = jstr(sm["type"], "?");
            string due = jstr(sm["dueDate"], "?");
            io:println("  • " + sid + " [" + stype + " due " + due + "]");
        }
    }

    io:println("");
    io:println("  " + BOLD + "1" + RESET + " — Add MAINTENANCE schedule");
    io:println("  " + BOLD + "2" + RESET + " — Add BOOKING schedule");
    io:println("  " + BOLD + "3" + RESET + " — Remove a schedule by id");
    string op = prompt("Operation [1-3]");
    if op == "1" || op == "2" {
        string sid = prompt("Schedule id (e.g. SCH-999)");
        string due = prompt("Due date (YYYY-MM-DD)");
        string desc = prompt("Description");
        json payload = {
            scheduleId: sid,
            'type: op == "1" ? "MAINTENANCE" : "BOOKING",
            dueDate: due,
            description: desc
        };
        showResult(addSchedule(tag, payload));
    } else if op == "3" {
        string sid = prompt("Schedule id to remove");
        if sid == "" { return; }
        showResult(removeSchedule(tag, sid));
    } else {
        warn("Cancelled.");
    }
}

// =============================================================
// Menu 7 — Asset CRUD
// =============================================================
function assetsFlow() returns error? {
    section("Manage assets (CRUD)");
    io:println("  " + BOLD + "1" + RESET + " — View one asset (full details)");
    io:println("  " + BOLD + "2" + RESET + " — Create new asset");
    io:println("  " + BOLD + "3" + RESET + " — Update an asset");
    io:println("  " + BOLD + "4" + RESET + " — Delete an asset");
    string op = prompt("Operation [1-4]");
    if op == "1" {
        string tag = prompt("Asset tag");
        ApiResult|error r = getAsset(tag);
        showResult(r);
        if r is ApiResult && r.statusCode == 200 {
            printAsset(r.body);
        }
        _ = prompt("Press Enter to continue");
    } else if op == "2" {
        string tag = prompt("Asset tag (unique key)");
        if tag == "" { return; }
        string name = prompt("Name");
        string desc = prompt("Description");
        string inst = prompt("Institution");
        string site = prompt("Site");
        string acquired = prompt("Date acquired (YYYY-MM-DD)");
        string st = prompt("Status [AVAILABLE / LOANED_OUT / OCCUPIED / UNDER_MAINTENANCE / DISPOSED] (default AVAILABLE)");
        if st == "" { st = "AVAILABLE"; }
        json payload = {
            assetTag: tag,
            name: name,
            description: desc,
            institution: inst,
            site: site,
            status: st,
            dateAcquired: acquired,
            components: [],
            schedules: [],
            workOrders: []
        };
        showResult(createAsset(payload));
        _ = prompt("Press Enter to continue");
    } else if op == "3" {
        string tag = prompt("Asset tag to update");
        if tag == "" { return; }
        string name = prompt("New name (blank = keep)");
        string desc = prompt("New description (blank = keep)");
        string st = prompt("New status (blank = keep)");
        map<json> patch = {};
        if name != "" { patch["name"] = name; }
        if desc != "" { patch["description"] = desc; }
        if st != "" { patch["status"] = st; }
        if patch.length() == 0 {
            warn("Nothing to update.");
            return;
        }
        showResult(updateAsset(tag, patch));
        _ = prompt("Press Enter to continue");
    } else if op == "4" {
        string tag = prompt("Asset tag to delete");
        if tag == "" { return; }
        string confirm = prompt("Type 'delete' to confirm");
        if confirm != "delete" { warn("Cancelled."); return; }
        showResult(deleteAsset(tag));
        _ = prompt("Press Enter to continue");
    }
}

// =============================================================
// Menu 8 — Components
// =============================================================
function componentsFlow() returns error? {
    section("Manage components");
    string tag = prompt("Asset tag");
    if tag == "" { return; }
    io:println("  " + BOLD + "1" + RESET + " — Add component");
    io:println("  " + BOLD + "2" + RESET + " — Remove component");
    string op = prompt("Operation [1-2]");
    if op == "1" {
        string cid = prompt("Component id (e.g. C201)");
        string cname = prompt("Component name");
        string cdesc = prompt("Component description");
        showResult(addComponent(tag, {compId: cid, name: cname, description: cdesc}));
    } else if op == "2" {
        string cid = prompt("Component id to remove");
        if cid == "" { return; }
        showResult(removeComponent(tag, cid));
    }
    _ = prompt("Press Enter to continue");
}

// =============================================================
// Menu 9 — Work orders
// =============================================================
function workOrdersFlow() returns error? {
    section("Work orders & sub-tasks");
    string tag = prompt("Asset tag");
    if tag == "" { return; }
    io:println("  " + BOLD + "1" + RESET + " — Open new work order");
    io:println("  " + BOLD + "2" + RESET + " — Update work order (status / add task)");
    io:println("  " + BOLD + "3" + RESET + " — Close (remove) work order");
    string op = prompt("Operation [1-3]");
    if op == "1" {
        string wid = prompt("Work order id (e.g. WO-123)");
        string wdesc = prompt("Description");
        string wst = prompt("Status [OPEN / IN_PROGRESS / CLOSED] (default OPEN)");
        if wst == "" { wst = "OPEN"; }
        json payload = {
            orderId: wid,
            status: wst,
            description: wdesc,
            tasks: []
        };
        showResult(openWorkOrder(tag, payload));
    } else if op == "2" {
        string wid = prompt("Work order id");
        if wid == "" { return; }
        io:println("  " + BOLD + "a" + RESET + " — Change status / description");
        io:println("  " + BOLD + "b" + RESET + " — Add a sub-task");
        string sub = prompt("Operation [a/b]");
        if sub == "a" {
            string st = prompt("New status (blank = keep)");
            string dsc = prompt("New description (blank = keep)");
            map<json> patch = {};
            if st != "" { patch["status"] = st; }
            if dsc != "" { patch["description"] = dsc; }
            if patch.length() == 0 { warn("Nothing to update."); return; }
            showResult(updateWorkOrder(tag, wid, patch));
        } else if sub == "b" {
            string tid = prompt("Task id (e.g. T1)");
            string tdesc = prompt("Task description");
            json task = {taskId: tid, description: tdesc, completed: false};
            // Fetch the current asset, splice the new task into the matching WO, send it.
            ApiResult|error cur = getAsset(tag);
            if cur is error { err("Network: " + cur.message()); return; }
            if cur.statusCode != 200 { err("HTTP " + cur.statusCode.toString()); return; }
            map<json> asset = jobj(cur.body);
            json[] wos = jarr(asset["workOrders"]);
            json[] tasks = [];
            string wdesc = "";
            string wst = "OPEN";
            boolean found = false;
            foreach json w in wos {
                map<json> wm = jobj(w);
                if jstr(wm["orderId"], "") == wid {
                    found = true;
                    wdesc = jstr(wm["description"], "");
                    wst = jstr(wm["status"], "OPEN");
                    json[] existingTasks = jarr(wm["tasks"]);
                    foreach json t in existingTasks { tasks.push(t); }
                }
            }
            if !found { err("Work order " + wid + " not found on " + tag); return; }
            tasks.push(task);
            json patch = {
                status: wst,
                description: wdesc,
                tasks: tasks
            };
            showResult(updateWorkOrder(tag, wid, patch));
        }
    } else if op == "3" {
        string wid = prompt("Work order id to close/remove");
        if wid == "" { return; }
        showResult(closeWorkOrder(tag, wid));
    }
    _ = prompt("Press Enter to continue");
}

function countOf(json body) returns int {
    if body is json[] { return body.length(); }
    return 0;
}
