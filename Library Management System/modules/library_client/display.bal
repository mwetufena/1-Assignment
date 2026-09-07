// Pretty-printing helpers shared by the menu screens.
import ballerina/io;

const string RESET = "\u{001B}[0m";
const string BOLD = "\u{001B}[1m";
const string DIM = "\u{001B}[2m";
const string CYAN = "\u{001B}[36m";
const string GREEN = "\u{001B}[32m";
const string YELLOW = "\u{001B}[33m";
const string RED = "\u{001B}[31m";
const string BLUE = "\u{001B}[34m";
const string MAGENTA = "\u{001B}[35m";

public function clearScreen() {
    io:print("\u{001B}[2J\u{001B}[H");
}

public function banner(string title) {
    io:println(CYAN + "============================================================" + RESET);
    io:println(BOLD + "  " + title + RESET);
    io:println(CYAN + "============================================================" + RESET);
}

public function section(string title) {
    io:println("");
    io:println(BOLD + BLUE + "▸ " + title + RESET);
    io:println(DIM + "------------------------------------------------------------" + RESET);
}

public function ok(string msg) {
    io:println(GREEN + "✓ " + msg + RESET);
}

public function warn(string msg) {
    io:println(YELLOW + "! " + msg + RESET);
}

public function err(string msg) {
    io:println(RED + "✗ " + msg + RESET);
}

public function info(string msg) {
    io:println(DIM + "  " + msg + RESET);
}

public function prompt(string label) returns string {
    string|error r = io:readln(BOLD + CYAN + label + RESET + " ");
    if r is error { return ""; }
    return r;
}

public function statusColor(string status) returns string {
    if status == "AVAILABLE" { return GREEN + status + RESET; }
    if status == "LOANED_OUT" { return YELLOW + status + RESET; }
    if status == "OCCUPIED" { return MAGENTA + status + RESET; }
    if status == "UNDER_MAINTENANCE" { return RED + status + RESET; }
    if status == "DISPOSED" { return DIM + status + RESET; }
    return status;
}

// ---- Safe JSON accessors --------------------------------------------------

public function jstr(json j, string fallback) returns string {
    if j is string { return j; }
    return fallback;
}

public function jint(json j, int fallback) returns int {
    if j is int { return j; }
    if j is decimal { return <int>j; }
    if j is float { return <int>j; }
    return fallback;
}

public function jarr(json j) returns json[] {
    if j is json[] { return j; }
    return [];
}

public function jobj(json j) returns map<json> {
    if j is map<json> { return j; }
    return {};
}

public function jbool(json j) returns boolean {
    if j is boolean { return j; }
    return false;
}

// ---- Printers -------------------------------------------------------------

public function printAssetRow(json a) {
    map<json> m = jobj(a);
    string tag = jstr(m["assetTag"], "?");
    string name = jstr(m["name"], "?");
    string inst = jstr(m["institution"], "?");
    string site = jstr(m["site"], "?");
    string status = jstr(m["status"], "?");

    io:print(BOLD);
    io:print(padRight(tag, 22));
    io:print(RESET);
    io:print(padRight(name, 32));
    io:print(padRight(inst, 36));
    io:print(padRight(site, 36));
    io:println(statusColor(status));
}

public function printAssetList(json body) {
    json[] arr = jarr(body);
    if arr.length() == 0 {
        warn("No assets found.");
        return;
    }
    io:println(BOLD + padRight("ASSET TAG", 22) + padRight("NAME", 32) + padRight("INSTITUTION", 36) + padRight("SITE", 36) + "STATUS" + RESET);
    foreach json a in arr {
        printAssetRow(a);
    }
}

public function printAsset(json a) {
    map<json> m = jobj(a);
    string tag = jstr(m["assetTag"], "?");
    string name = jstr(m["name"], "?");
    string desc = jstr(m["description"], "");
    string inst = jstr(m["institution"], "?");
    string site = jstr(m["site"], "?");
    string status = jstr(m["status"], "?");
    string acquired = jstr(m["dateAcquired"], "?");

    io:println(BOLD + tag + RESET + " — " + name);
    io:println("  " + DIM + desc + RESET);
    io:println("  " + DIM + "Institution: " + RESET + inst);
    io:println("  " + DIM + "Site:        " + RESET + site);
    io:println("  " + DIM + "Status:      " + RESET + statusColor(status));
    io:println("  " + DIM + "Acquired:    " + RESET + acquired);

    json[] comps = jarr(m["components"]);
    if comps.length() > 0 {
        io:println("  " + DIM + "Components (" + comps.length().toString() + "):" + RESET);
        foreach json c in comps {
            map<json> cm = jobj(c);
            string cid = jstr(cm["compId"], "?");
            string cname = jstr(cm["name"], "?");
            io:println("    • " + BOLD + cid + RESET + " — " + cname);
        }
    }

    json[] scheds = jarr(m["schedules"]);
    if scheds.length() > 0 {
        io:println("  " + DIM + "Schedules (" + scheds.length().toString() + "):" + RESET);
        foreach json s in scheds {
            map<json> sm = jobj(s);
            string sid = jstr(sm["scheduleId"], "?");
            string stype = jstr(sm["type"], "?");
            string due = jstr(sm["dueDate"], "?");
            string sdesc = jstr(sm["description"], "");
            io:println("    • " + BOLD + sid + RESET + " [" + stype + " due " + due + "] " + sdesc);
        }
    }

    json[] wos = jarr(m["workOrders"]);
    if wos.length() > 0 {
        io:println("  " + DIM + "Work orders (" + wos.length().toString() + "):" + RESET);
        foreach json w in wos {
            map<json> wm = jobj(w);
            string wid = jstr(wm["orderId"], "?");
            string wst = jstr(wm["status"], "?");
            string wdesc = jstr(wm["description"], "");
            io:println("    • " + BOLD + wid + RESET + " [" + wst + "] " + wdesc);
            json[] tasks = jarr(wm["tasks"]);
            foreach json t in tasks {
                map<json> tm = jobj(t);
                string tid = jstr(tm["taskId"], "?");
                string td = jstr(tm["description"], "");
                boolean done = jbool(tm["completed"]);
                string mark = done ? (GREEN + "[x]" + RESET) : (YELLOW + "[ ]" + RESET);
                io:println("       " + mark + " " + tid + " — " + td);
            }
        }
    }
}

public function padRight(string s, int width) returns string {
    int len = s.length();
    if len >= width {
        return s;
    }
    string out = s;
    int i = 0;
    while i < (width - len) {
        out += " ";
        i += 1;
    }
    return out;
}

public function showResult(ApiResult|error r) {
    if r is error {
        err("Network error: " + r.message());
        return;
    }
    if r.statusCode >= 200 && r.statusCode < 300 {
        ok("OK (" + r.statusCode.toString() + ")");
        io:println(r.body.toJsonString());
    } else {
        err("HTTP " + r.statusCode.toString() + " — " + r.body.toJsonString());
    }
}
