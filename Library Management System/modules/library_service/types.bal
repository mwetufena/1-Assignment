// Data models for the Library & Resource Management System.
// Status values follow the Ministry of Higher Education specification.
public type AssetStatus "AVAILABLE" | "LOANED_OUT" | "OCCUPIED" |
    "UNDER_MAINTENANCE" | "DISPOSED";

public type ScheduleType "MAINTENANCE" | "BOOKING";

public type WorkOrderStatus "OPEN" | "IN_PROGRESS" | "CLOSED";

public type Component record {|
    string compId;
    string name;
    string description;
|};

public type Schedule record {|
    string scheduleId;
    ScheduleType 'type;
    string dueDate; // ISO-8601 date (YYYY-MM-DD)
    string description;
|};

public type Task record {|
    string taskId;
    string description;
    boolean completed = false;
|};

public type WorkOrder record {|
    string orderId;
    WorkOrderStatus status;
    string description;
    Task[] tasks = [];
|};

public type Asset record {|
    string assetTag;
    string name;
    string description;
    string institution;
    string site;
    AssetStatus status;
    string dateAcquired; // ISO-8601 date
    Component[] components = [];
    Schedule[] schedules = [];
    WorkOrder[] workOrders = [];
|};

// Input payloads (omit server-controlled fields, allow partial updates)
public type AssetCreate record {|
    string assetTag;
    string name;
    string description;
    string institution;
    string site;
    AssetStatus status?;
    string dateAcquired;
    Component[] components = [];
    Schedule[] schedules = [];
    WorkOrder[] workOrders = [];
|};

public type AssetUpdate record {|
    string name?;
    string description?;
    string institution?;
    string site?;
    AssetStatus status?;
    string dateAcquired?;
    Component[] components?;
    Schedule[] schedules?;
    WorkOrder[] workOrders?;
|};

public type ComponentInput record {|
    string compId;
    string name;
    string description;
|};

public type ScheduleInput record {|
    string scheduleId;
    ScheduleType 'type;
    string dueDate;
    string description;
|};

public type WorkOrderInput record {|
    string orderId;
    WorkOrderStatus status;
    string description;
    Task[] tasks = [];
|};

public type WorkOrderUpdate record {|
    WorkOrderStatus status?;
    string description?;
    Task[] tasks?;
|};

public type TaskInput record {|
    string taskId;
    string description;
    boolean completed = false;
|};

public type LoanRequest record {|
    string borrower;
    string? expectedReturnDate;
|};

public type BookingRequest record {|
    string bookedBy;
    string scheduledDate;
    string purpose;
|};

public type ErrorResponse record {|
    int statusCode;
    string message;
    string? detail = ();
|};
