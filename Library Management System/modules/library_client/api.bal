// Thin HTTP wrapper around the library_service REST API.
// The client only depends on the wire format — no shared types required,
// so the modules stay decoupled.
import ballerina/http;

public final http:Client api = check new ("http://localhost:9090/library", {
    timeout: 30
});

public type ApiResult record {|
    int statusCode;
    json body;
|};

public function listAssets() returns ApiResult|error {
    json assets = check api->get("/assets");
    return {statusCode: 200, body: assets};
}

public function getAsset(string assetTag) returns ApiResult|error {
    json|error resp = api->get("/assets/" + assetTag);
    if resp is error {
        return errorToResult(resp);
    }
    return {statusCode: 200, body: resp};
}

public function createAsset(json payload) returns ApiResult|error {
    json|http:Response resp = check api->post("/assets", payload);
    if resp is http:Response {
        return {statusCode: resp.statusCode, body: check resp.getJsonPayload()};
    }
    return {statusCode: 201, body: resp};
}

public function updateAsset(string assetTag, json patch) returns ApiResult|error {
    json|error resp = api->put("/assets/" + assetTag, patch);
    if resp is error {
        return errorToResult(resp);
    }
    return {statusCode: 200, body: resp};
}

public function deleteAsset(string assetTag) returns ApiResult|error {
    json|error resp = api->delete("/assets/" + assetTag);
    if resp is error {
        return errorToResult(resp);
    }
    return {statusCode: 200, body: resp};
}

public function listInstitutions() returns ApiResult|error {
    json institutions = check api->get("/institutions");
    return {statusCode: 200, body: institutions};
}

public function assetsByInstitution(string name) returns ApiResult|error {
    json resp = check api->get("/institutions/" + encode(name) + "/assets");
    return {statusCode: 200, body: resp};
}

public function assetsBySite(string site) returns ApiResult|error {
    json resp = check api->get("/sites/" + encode(site) + "/assets");
    return {statusCode: 200, body: resp};
}

public function overdueMaintenance() returns ApiResult|error {
    json resp = check api->get("/maintenance/overdue");
    return {statusCode: 200, body: resp};
}

public function addComponent(string assetTag, json payload) returns ApiResult|error {
    json|http:Response resp = check api->post("/assets/" + assetTag + "/components", payload);
    if resp is http:Response {
        return {statusCode: resp.statusCode, body: check resp.getJsonPayload()};
    }
    return {statusCode: 200, body: resp};
}

public function removeComponent(string assetTag, string compId) returns ApiResult|error {
    json|error resp = api->delete("/assets/" + assetTag + "/components/" + compId);
    if resp is error {
        return errorToResult(resp);
    }
    return {statusCode: 200, body: resp};
}

public function addSchedule(string assetTag, json payload) returns ApiResult|error {
    json|http:Response resp = check api->post("/assets/" + assetTag + "/schedules", payload);
    if resp is http:Response {
        return {statusCode: resp.statusCode, body: check resp.getJsonPayload()};
    }
    return {statusCode: 200, body: resp};
}

public function removeSchedule(string assetTag, string scheduleId) returns ApiResult|error {
    json|error resp = api->delete("/assets/" + assetTag + "/schedules/" + scheduleId);
    if resp is error {
        return errorToResult(resp);
    }
    return {statusCode: 200, body: resp};
}

public function openWorkOrder(string assetTag, json payload) returns ApiResult|error {
    json|http:Response resp = check api->post("/assets/" + assetTag + "/workorders", payload);
    if resp is http:Response {
        return {statusCode: resp.statusCode, body: check resp.getJsonPayload()};
    }
    return {statusCode: 200, body: resp};
}

public function updateWorkOrder(string assetTag, string orderId, json patch) returns ApiResult|error {
    json|error resp = api->put("/assets/" + assetTag + "/workorders/" + orderId, patch);
    if resp is error {
        return errorToResult(resp);
    }
    return {statusCode: 200, body: resp};
}

public function closeWorkOrder(string assetTag, string orderId) returns ApiResult|error {
    json|error resp = api->delete("/assets/" + assetTag + "/workorders/" + orderId);
    if resp is error {
        return errorToResult(resp);
    }
    return {statusCode: 200, body: resp};
}

public function loanAsset(string assetTag, json payload) returns ApiResult|error {
    json|http:Response resp = check api->post("/assets/" + assetTag + "/loan", payload);
    if resp is http:Response {
        return {statusCode: resp.statusCode, body: check resp.getJsonPayload()};
    }
    return {statusCode: 200, body: resp};
}

public function checkinAsset(string assetTag) returns ApiResult|error {
    json|error resp = api->post("/assets/" + assetTag + "/checkin", {});
    if resp is error {
        return errorToResult(resp);
    }
    return {statusCode: 200, body: resp};
}

public function bookSpace(string assetTag, json payload) returns ApiResult|error {
    json|http:Response resp = check api->post("/assets/" + assetTag + "/book", payload);
    if resp is http:Response {
        return {statusCode: resp.statusCode, body: check resp.getJsonPayload()};
    }
    return {statusCode: 200, body: resp};
}

function errorToResult(error err) returns ApiResult {
    return {statusCode: 0, body: err.message()};
}

function encode(string s) returns string {
    // Minimal path-safe replacement — paths in this app are controlled
    // (no slashes) but spaces and punctuation get percent-encoded.
    string out = s;
    out = replaceAll(out, " ", "%20");
    out = replaceAll(out, "&", "%26");
    out = replaceAll(out, "?", "%3F");
    out = replaceAll(out, "#", "%23");
    return out;
}

function replaceAll(string src, string needle, string replacement) returns string {
    if needle.length() == 0 { return src; }
    string out = "";
    int i = 0;
    while i < src.length() {
        int idx = indexOfFrom(src, needle, i);
        if idx < 0 {
            out += src.substring(i);
            break;
        }
        out += src.substring(i, idx) + replacement;
        i = idx + needle.length();
    }
    return out;
}

function indexOfFrom(string src, string needle, int startAt) returns int {
    int pos = startAt;
    if pos < 0 { pos = 0; }
    int end = src.length() - needle.length();
    int i = pos;
    while i <= end {
        if src.substring(i, i + needle.length()) == needle {
            return i;
        }
        i += 1;
    }
    return -1;
}
