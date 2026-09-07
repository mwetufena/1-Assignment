# Library & Resource Management System

A RESTful backend + interactive CLI client for the Ministry of Higher Education
(Training and Innovations) **distributed Library Management System** — built
in **Ballerina 2201.13.5 (Swan Lake)**.

The system tracks books, electronic resources (laptops, thin clients), and
physical spaces (labs, meeting rooms) across all registered institutions of
higher learning, with full CRUD, institution/site filtering, overdue
maintenance checks, component & schedule management, and work-order
tracking.

> Everything in this repo is designed to be opened in a single IDE window
> and run with one click — no external services, no databases, no Docker.

---

## 1. Project layout

```
library-ms/
├── Ballerina.toml                    # workspace root (members = both modules)
├── README.md
├── start.cmd                         # one-click launcher (Windows .cmd)
├── start.ps1                         # one-click launcher (PowerShell)
├── smoke.ps1                         # automated smoke test against the service
├── sample-requests.http              # REST Client / IntelliJ HTTP Client
├── .vscode/
│   ├── launch.json                   # debug configurations
│   ├── tasks.json                    # build / run / graph tasks
│   └── settings.json
└── modules/
    ├── library_service/              # REST service on :9090/library
    │   ├── Ballerina.toml
    │   ├── types.bal                 # data model records
    │   ├── store.bal                 # in-memory map + helpers
    │   └── service.bal               # resource functions
    └── library_client/               # interactive CLI client
        ├── Ballerina.toml
        ├── api.bal                   # http:Client wrapper
        ├── display.bal               # colored output helpers
        └── main.bal                  # menu loop + flows
```

## 2. Quick start (IDE)

### VS Code

1. Install the **Ballerina** extension (`WSO2.ballerina`).
2. Open this folder (`File ▸ Open Folder… ▸ library-ms`).
3. Press `Ctrl+Shift+B` → choose **Ballerina: Build all**.
4. Press `F5` → choose **Run library_service**. (Use the **Run library_client**
   configuration in a second debug session to drive the UI.)
   Or use the **Service + Client (parallel)** compound launch.

### IntelliJ IDEA

1. Install the **Ballerina** plugin.
2. Open this folder as a project. Both modules appear under
   `modules/library_service` and `modules/library_client`.
3. Click the green **Run** gutter icon next to `main()` in either module,
   or right-click a module folder → **Run 'bal run …'**.

### Command line (one click)

```powershell
# from the repo root
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

or double-click `start.cmd`. The script builds both modules, launches the
service in a new console window on `http://localhost:9090`, waits for it to
be ready, then opens the interactive client.

### Browser dashboard

The standalone browser dashboard is [index.html](../index.html) in the
repository root. Start the Ballerina service first, then open that file
directly in a browser. It connects to `http://localhost:9090/library`.

For a local static server, run the following from the repository root after
starting the service:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/index.html`. Stop the static server with
`Ctrl+C`. The service must remain running separately because the HTML file is
only the browser interface; it does not start the Ballerina backend.

## 3. What the service exposes

Base path: **`http://localhost:9090/library`**

| Method | Path                                                  | Purpose |
|--------|--------------------------------------------------------|---------|
| GET    | `/health`                                              | Liveness probe |
| GET    | `/assets`                                              | List all assets |
| GET    | `/assets/{assetTag}`                                   | Get one asset |
| POST   | `/assets`                                              | Create asset |
| PUT    | `/assets/{assetTag}`                                   | Patch asset |
| DELETE | `/assets/{assetTag}`                                   | Delete asset |
| GET    | `/institutions`                                        | List institutions |
| GET    | `/institutions/{name}/assets`                          | Filter by institution |
| GET    | `/sites/{site}/assets`                                 | Filter by site |
| GET    | `/maintenance/overdue`                                 | Overdue maintenance dashboard |
| POST   | `/assets/{assetTag}/components`                       | Add component |
| DELETE | `/assets/{assetTag}/components/{compId}`               | Remove component |
| POST   | `/assets/{assetTag}/schedules`                         | Add maintenance / booking schedule |
| DELETE | `/assets/{assetTag}/schedules/{scheduleId}`            | Remove schedule |
| POST   | `/assets/{assetTag}/workorders`                        | Open work order |
| PUT    | `/assets/{assetTag}/workorders/{orderId}`              | Update work order (status / tasks) |
| DELETE | `/assets/{assetTag}/workorders/{orderId}`              | Close work order |
| POST   | `/assets/{assetTag}/workorders/{orderId}/tasks`        | Add sub-task |
| POST   | `/assets/{assetTag}/loan`                              | Loan asset |
| POST   | `/assets/{assetTag}/checkin`                           | Return asset |
| POST   | `/assets/{assetTag}/book`                              | Book a room / lab |
| GET    | `/loans`                                               | List active loans |

### Status codes

| Outcome | Code |
|---------|------|
| Successful create / write | `201 Created` |
| Successful read / update / delete | `200 OK` |
| Validation failure (bad date, missing field, etc.) | `400 Bad Request` |
| Asset / sub-resource not found | `404 Not Found` |
| Conflict (duplicate tag, loan when not available, double-booking) | `409 Conflict` |

## 4. Data model

```text
Asset
├── assetTag          string        ← unique key
├── name              string
├── description       string
├── institution       string
├── site              string
├── status            "AVAILABLE" | "LOANED_OUT" | "OCCUPIED" | "UNDER_MAINTENANCE" | "DISPOSED"
├── dateAcquired      string  (ISO YYYY-MM-DD)
├── components[]      Component
│   ├── compId
│   ├── name
│   └── description
├── schedules[]       Schedule
│   ├── scheduleId
│   ├── type          "MAINTENANCE" | "BOOKING"
│   ├── dueDate
│   └── description
└── workOrders[]      WorkOrder
    ├── orderId
    ├── status        "OPEN" | "IN_PROGRESS" | "CLOSED"
    ├── description
    └── tasks[]       Task
        ├── taskId
        ├── description
        └── completed   boolean
```

The store is a `map<Asset>` keyed by `assetTag` (per spec §5.3). Loan
bookkeeping lives in a separate `map<LoanRecord>` and is wiped when the
asset is checked in or deleted.

## 5. Sample asset payload (matches the spec §4)

```json
{
  "assetTag": "NUST-LIB-3DP-001",
  "name": "Pro-Series 3D Printer",
  "description": "High-precision laboratory printer for simulation and prototype development.",
  "institution": "Namibia University of Science and Technology",
  "site": "Main Campus - Innovation Lab",
  "status": "AVAILABLE",
  "dateAcquired": "2024-03-10",
  "components": [
    { "compId": "C101", "name": "High-Torque Stepper Motor", "description": "Main motor for X-axis movement." }
  ],
  "schedules": [
    { "scheduleId": "SCH-882", "type": "MAINTENANCE", "dueDate": "2026-09-01", "description": "Quarterly calibration and nozzle cleaning." }
  ],
  "workOrders": [
    {
      "orderId": "WO-554",
      "status": "OPEN",
      "description": "Nozzle heat-bed failure",
      "tasks": [
        { "taskId": "T1", "description": "Check Thermal Sensor Connectivity.", "completed": false }
      ]
    }
  ]
}
```

## 6. The client

Once the service is up, run the client (`bal run` inside `modules/library_client`
or via the VS Code launch config) and you'll get a coloured interactive menu:

```text
Main Menu
  1 — Loan / return an asset
  2 — Book a meeting room or lab
  3 — Global view (all assets)
  4 — Campus / institution view
  5 — Overdue maintenance dashboard
  6 — Schedule manager (add/remove)
  7 — Manage assets (CRUD)
  8 — Manage components
  9 — Work orders & sub-tasks
  0 — Exit
```

The client talks to the service over plain HTTP/JSON — it has **no shared
types** with the server, so they can evolve independently. The base URL
(`http://localhost:9090/library`) is at the top of `modules/library_client/api.bal`.

## 7. Testing

`smoke.ps1` exercises every endpoint in the matrix above (CRUD + components +
schedules + work orders + tasks + loan + checkin + book + overdue + filters).
Run it in a second terminal after `start.ps1` (or while the service is up
from any other run):

```powershell
powershell -ExecutionPolicy Bypass -File .\smoke.ps1
```

You can also point any REST client at `http://localhost:9090/library` —
`sample-requests.http` is preloaded with working examples for the
VS Code "REST Client" extension and IntelliJ's HTTP Client.

## 8. Notes

* **In-memory store** — data resets every time the service restarts. The
  `init()` function in `modules/library_service/store.bal` seeds five
  representative assets (per the spec, including the NUST 3D printer).
* **No external dependencies** — only `ballerina/http` and `ballerina/time`.
* **Ballerina version pinned** in each module's `Ballerina.toml`
  (`distribution = "2201.13.0"`).
* **CORS is open** for easy browser testing.
