// In-memory store keyed by assetTag, with seed data and pure helpers
// used by the service layer.
import ballerina/time;

public final map<Asset> assetStore = {};
public final map<LoanRecord> loanStore = {};

public type LoanRecord record {|
    string assetTag;
    string borrower;
    string bookedAt;
    string? expectedReturnDate;
|};

function init() {
    seedAssets();
}

function seedAssets() {
    Asset[] seed = [
        {
            assetTag: "NUST-LIB-3DP-001",
            name: "Pro-Series 3D Printer",
            description: "High-precision laboratory printer for simulation and prototype development.",
            institution: "Namibia University of Science and Technology",
            site: "Main Campus - Innovation Lab",
            status: "AVAILABLE",
            dateAcquired: "2024-03-10",
            components: [
                {compId: "C101", name: "High-Torque Stepper Motor", description: "Main motor for X-axis movement."}
            ],
            schedules: [
                {
                    scheduleId: "SCH-882",
                    'type: "MAINTENANCE",
                    dueDate: "2026-09-01",
                    description: "Quarterly calibration and nozzle cleaning."
                }
            ],
            workOrders: [
                {
                    orderId: "WO-554",
                    status: "OPEN",
                    description: "Nozzle heat-bed failure",
                    tasks: [{taskId: "T1", description: "Check Thermal Sensor Connectivity.", completed: false}]
                }
            ]
        },
        {
            assetTag: "UNAM-LIB-1A-002",
            name: "Main Library Reading Hall A",
            description: "Open reading hall, 120 seats, silent study zone.",
            institution: "University of Namibia",
            site: "Main Campus - Library",
            status: "AVAILABLE",
            dateAcquired: "2018-01-15",
            components: [],
            schedules: [],
            workOrders: []
        },
        {
            assetTag: "IUM-LAB-LP-014",
            name: "Dell Latitude 7420 Loan Laptop",
            description: "Portable laptop for short-term student loans.",
            institution: "International University of Management",
            site: "Main Campus - ICT Lab",
            status: "LOANED_OUT",
            dateAcquired: "2022-08-20",
            components: [],
            schedules: [
                {
                    scheduleId: "SCH-201",
                    'type: "MAINTENANCE",
                    dueDate: "2026-08-25",
                    description: "Annual firmware update and battery health check."
                }
            ],
            workOrders: []
        },
        {
            assetTag: "NUST-MR-CONF-007",
            name: "Conference Room - Boardroom 2",
            description: "12-seat executive boardroom with video conferencing.",
            institution: "Namibia University of Science and Technology",
            site: "Main Campus - Admin Block",
            status: "AVAILABLE",
            dateAcquired: "2020-05-22",
            components: [],
            schedules: [],
            workOrders: []
        },
        {
            assetTag: "UNAM-TC-LAB-031",
            name: "Thin Client Lab 31",
            description: "30-seat thin-client lab for digital assessments.",
            institution: "University of Namibia",
            site: "Hifikepunye Pohamba Campus - Block C",
            status: "UNDER_MAINTENANCE",
            dateAcquired: "2021-11-04",
            components: [],
            schedules: [
                {
                    scheduleId: "SCH-455",
                    'type: "MAINTENANCE",
                    dueDate: "2026-08-22",
                    description: "Replace failing switches in row 4."
                }
            ],
            workOrders: [
                {
                    orderId: "WO-911",
                    status: "IN_PROGRESS",
                    description: "Network switch replacement",
                    tasks: [
                        {taskId: "T1", description: "Order replacement switch", completed: true},
                        {taskId: "T2", description: "Swap switch and verify connectivity", completed: false}
                    ]
                }
            ]
        }
    ];

    foreach Asset a in seed {
        assetStore[a.assetTag] = a;
    }
}

// ---- Helpers used by service.bal ----

public function cloneAsset(Asset a) returns Asset {
    Asset copy = {
        assetTag: a.assetTag,
        name: a.name,
        description: a.description,
        institution: a.institution,
        site: a.site,
        status: a.status,
        dateAcquired: a.dateAcquired,
        components: cloneComponents(a.components),
        schedules: cloneSchedules(a.schedules),
        workOrders: cloneWorkOrders(a.workOrders)
    };
    return copy;
}

function cloneComponents(Component[] src) returns Component[] {
    Component[] out = [];
    foreach Component c in src {
        out.push({compId: c.compId, name: c.name, description: c.description});
    }
    return out;
}

function cloneSchedules(Schedule[] src) returns Schedule[] {
    Schedule[] out = [];
    foreach Schedule s in src {
        out.push({scheduleId: s.scheduleId, 'type: s.'type, dueDate: s.dueDate, description: s.description});
    }
    return out;
}

function cloneWorkOrders(WorkOrder[] src) returns WorkOrder[] {
    WorkOrder[] out = [];
    foreach WorkOrder w in src {
        Task[] tasks = [];
        foreach Task t in w.tasks {
            tasks.push({taskId: t.taskId, description: t.description, completed: t.completed});
        }
        out.push({orderId: w.orderId, status: w.status, description: w.description, tasks: tasks});
    }
    return out;
}

public function nowIso() returns string {
    time:Utc now = time:utcNow();
    time:Civil civil = time:utcToCivil(now);
    return checkpanic time:civilToString(civil);
}

public function isOverdue(Schedule s, string today) returns boolean {
    // Simple ISO string compare works for the YYYY-MM-DD format.
    return s.'type == "MAINTENANCE" && s.dueDate < today;
}

public function listInstitutions() returns string[] {
    map<boolean> seen = {};
    foreach Asset a in assetStore {
        seen[a.institution] = true;
    }
    return seen.keys();
}

public function isValidDate(string s) returns boolean {
    if s.length() != 10 {
        return false;
    }
    return s.substring(4, 5) == "-" && s.substring(7, 8) == "-";
}

public function filterComponents(Component[] arr, string compId) returns Component[] {
    Component[] out = [];
    foreach Component c in arr {
        if c.compId != compId {
            out.push(c);
        }
    }
    return out;
}

public function filterSchedules(Schedule[] arr, string scheduleId) returns Schedule[] {
    Schedule[] out = [];
    foreach Schedule s in arr {
        if s.scheduleId != scheduleId {
            out.push(s);
        }
    }
    return out;
}

public function filterWorkOrders(WorkOrder[] arr, string orderId) returns WorkOrder[] {
    WorkOrder[] out = [];
    foreach WorkOrder w in arr {
        if w.orderId != orderId {
            out.push(w);
        }
    }
    return out;
}

public function removeDashes(string s) returns string {
    // Input is expected to be YYYY-MM-DD with exactly two dashes at positions 4 & 7.
    if s.length() == 10 && s.substring(4, 5) == "-" && s.substring(7, 8) == "-" {
        return s.substring(0, 4) + s.substring(5, 7) + s.substring(8, 10);
    }
    return s;
}
