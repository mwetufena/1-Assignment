import ballerina/grpc;
import ballerina/protobuf;

public const string RENTAL_ACCOMMODATION_DESC = "0A1A72656E74616C5F6163636F6D6D6F646174696F6E2E70726F746F121472656E74616C2E6163636F6D6D6F646174696F6E2299030A1241646450726F70657274795265717565737412170A07686F73745F69641801200128095206686F7374496412230A0D70726F70657274795F6E616D65180220012809520C70726F70657274794E616D65121A0A086C6F636174696F6E18032001280952086C6F636174696F6E12470A0D70726F70657274795F7479706518042001280E32222E72656E74616C2E6163636F6D6D6F646174696F6E2E50726F706572747954797065520C70726F70657274795479706512260A0F70726963655F7065725F6E69676874180520012801520D70726963655065724E69676874123C0A0673746174757318062001280E32242E72656E74616C2E6163636F6D6D6F646174696F6E2E50726F7065727479537461747573520673746174757312200A0B6465736372697074696F6E180720012809520B6465736372697074696F6E121D0A0A6D61785F67756573747318082001280552096D6178477565737473121C0A09616D656E69746965731809200328095209616D656E6974696573121B0A09696D6167655F75726C180A200128095208696D61676555726C226E0A1341646450726F7065727479526573706F6E7365121F0A0B70726F70657274795F6964180120012809520A70726F7065727479496412180A076D65737361676518022001280952076D657373616765121C0A0974696D657374616D70180320012803520974696D657374616D7022A1010A11437265617465557365725265717565737412120A046E616D6518012001280952046E616D6512140A05656D61696C1802200128095205656D61696C12320A04726F6C6518032001280E321E2E72656E74616C2E6163636F6D6D6F646174696F6E2E55736572526F6C655204726F6C6512140A0570686F6E65180420012809520570686F6E6512180A07616464726573731805200128095207616464726573732295010A134372656174655573657273526573706F6E736512430A0D637265617465645F757365727318012003280B321E2E72656E74616C2E6163636F6D6D6F646174696F6E2E55736572496E666F520C637265617465645573657273121F0A0B746F74616C5F636F756E74180220012805520A746F74616C436F756E7412180A076D65737361676518032001280952076D65737361676522B6010A0855736572496E666F12170A07757365725F6964180120012809520675736572496412120A046E616D6518022001280952046E616D6512140A05656D61696C1803200128095205656D61696C12320A04726F6C6518042001280E321E2E72656E74616C2E6163636F6D6D6F646174696F6E2E55736572526F6C655204726F6C6512140A0570686F6E65180520012809520570686F6E65121D0A0A637265617465645F6174180620012803520963726561746564417422C4040A1555706461746550726F706572747952657175657374121F0A0B70726F70657274795F6964180120012809520A70726F7065727479496412170A07686F73745F69641802200128095206686F7374496412280A0D70726F70657274795F6E616D651803200128094800520C70726F70657274794E616D65880101121F0A086C6F636174696F6E180420012809480152086C6F636174696F6E880101124C0A0D70726F70657274795F7479706518052001280E32222E72656E74616C2E6163636F6D6D6F646174696F6E2E50726F7065727479547970654802520C70726F706572747954797065880101122B0A0F70726963655F7065725F6E696768741806200128014803520D70726963655065724E6967687488010112410A0673746174757318072001280E32242E72656E74616C2E6163636F6D6D6F646174696F6E2E50726F70657274795374617475734804520673746174757388010112250A0B6465736372697074696F6E1808200128094805520B6465736372697074696F6E88010112220A0A6D61785F677565737473180920012805480652096D617847756573747388010112200A09696D6167655F75726C180A2001280948075208696D61676555726C88010142100A0E5F70726F70657274795F6E616D65420B0A095F6C6F636174696F6E42100A0E5F70726F70657274795F7479706542120A105F70726963655F7065725F6E6967687442090A075F737461747573420E0A0C5F6465736372697074696F6E420D0A0B5F6D61785F677565737473420C0A0A5F696D6167655F75726C228F010A1655706461746550726F7065727479526573706F6E736512180A077375636365737318012001280852077375636365737312180A076D65737361676518022001280952076D65737361676512410A0870726F706572747918032001280B32252E72656E74616C2E6163636F6D6D6F646174696F6E2E50726F706572747944657461696C73520870726F706572747922510A1552656D6F766550726F706572747952657175657374121F0A0B70726F70657274795F6964180120012809520A70726F7065727479496412170A07686F73745F69641802200128095206686F7374496422A6010A1652656D6F766550726F7065727479526573706F6E736512180A077375636365737318012001280852077375636365737312180A076D65737361676518022001280952076D65737361676512580A1472656D61696E696E675F70726F7065727469657318032003280B32252E72656E74616C2E6163636F6D6D6F646174696F6E2E50726F706572747944657461696C73521372656D61696E696E6750726F7065727469657322D3020A154C69737450726F7065727469657352657175657374121F0A086C6F636174696F6E180120012809480052086C6F636174696F6E88010112200A096D696E5F7072696365180220012801480152086D696E507269636588010112200A096D61785F7072696365180320012801480252086D61785072696365880101124C0A0D70726F70657274795F7479706518042001280E32222E72656E74616C2E6163636F6D6D6F646174696F6E2E50726F7065727479547970654803520C70726F70657274795479706588010112220A0A6D61785F677565737473180520012805480452096D617847756573747388010112190A0867756573745F6964180620012809520767756573744964420B0A095F6C6F636174696F6E420C0A0A5F6D696E5F7072696365420C0A0A5F6D61785F707269636542100A0E5F70726F70657274795F74797065420D0A0B5F6D61785F67756573747322A2040A0F50726F706572747944657461696C73121F0A0B70726F70657274795F6964180120012809520A70726F7065727479496412170A07686F73745F69641802200128095206686F7374496412230A0D70726F70657274795F6E616D65180320012809520C70726F70657274794E616D65121A0A086C6F636174696F6E18042001280952086C6F636174696F6E12470A0D70726F70657274795F7479706518052001280E32222E72656E74616C2E6163636F6D6D6F646174696F6E2E50726F706572747954797065520C70726F70657274795479706512260A0F70726963655F7065725F6E69676874180620012801520D70726963655065724E69676874123C0A0673746174757318072001280E32242E72656E74616C2E6163636F6D6D6F646174696F6E2E50726F7065727479537461747573520673746174757312200A0B6465736372697074696F6E180820012809520B6465736372697074696F6E121D0A0A6D61785F67756573747318092001280552096D6178477565737473121C0A09616D656E6974696573180A200328095209616D656E697469657312250A0E617665726167655F726174696E67180B20012801520D61766572616765526174696E6712230A0D746F74616C5F72657669657773180C20012805520C746F74616C52657669657773121B0A09696D6167655F75726C180D200128095208696D61676555726C121D0A0A637265617465645F6174180E20012803520963726561746564417422380A1553656172636850726F706572747952657175657374121F0A0B70726F70657274795F6964180120012809520A70726F706572747949642293010A1653656172636850726F7065727479526573706F6E7365121C0A09617661696C61626C651801200128085209617661696C61626C6512180A076D65737361676518022001280952076D65737361676512410A0870726F706572747918032001280B32252E72656E74616C2E6163636F6D6D6F646174696F6E2E50726F706572747944657461696C73520870726F706572747922C5010A13426F6F6B50726F70657274795265717565737412190A0867756573745F6964180120012809520767756573744964121F0A0B70726F70657274795F6964180220012809520A70726F7065727479496412220A0D636865636B5F696E5F64617465180320012809520B636865636B496E4461746512240A0E636865636B5F6F75745F64617465180420012809520C636865636B4F75744461746512280A106E756D6265725F6F665F677565737473180520012805520E6E756D6265724F66477565737473228A010A14426F6F6B50726F7065727479526573706F6E736512170A07636172745F6964180120012809520663617274496412180A076D65737361676518022001280952076D65737361676512180A077375636365737318032001280852077375636365737312250A0E657374696D617465645F636F7374180420012801520D657374696D61746564436F7374224B0A15436F6E6669726D426F6F6B696E675265717565737412170A07636172745F6964180120012809520663617274496412190A0867756573745F6964180220012809520767756573744964228F030A16436F6E6669726D426F6F6B696E67526573706F6E736512180A0773756363657373180120012808520773756363657373121D0A0A626F6F6B696E675F69641802200128095209626F6F6B696E674964121F0A0B70726F70657274795F6964180320012809520A70726F7065727479496412230A0D70726F70657274795F6E616D65180420012809520C70726F70657274794E616D6512220A0D636865636B5F696E5F64617465180520012809520B636865636B496E4461746512240A0E636865636B5F6F75745F64617465180620012809520C636865636B4F75744461746512280A106E756D6265725F6F665F6E6967687473180720012805520E6E756D6265724F664E696768747312260A0F70726963655F7065725F6E69676874180820012801520D70726963655065724E69676874121D0A0A746F74616C5F636F73741809200128015209746F74616C436F737412180A076D657373616765180A2001280952076D65737361676512210A0C636F6E6669726D65645F6174180B20012803520B636F6E6669726D6564417422070A05456D70747922450A094461746552616E6765121D0A0A73746172745F64617465180120012809520973746172744461746512190A08656E645F646174651802200128095207656E644461746522570A0D4572726F72526573706F6E736512120A04636F64651801200128055204636F646512180A076D65737361676518022001280952076D65737361676512180A0764657461696C73180320012809520764657461696C732A1F0A0855736572526F6C6512080A04484F5354100012090A05475545535410012A570A0C50726F706572747954797065120D0A0941504152544D454E54100012090A05484F555345100112090A0556494C4C41100212090A05434142494E1003120B0A07434F54544147451004120A0A0653545544494F10052A410A0E50726F7065727479537461747573120D0A09415641494C41424C451000120F0A0B554E415641494C41424C451001120F0A0B4D41494E54454E414E434510022A490A0D426F6F6B696E67537461747573120B0A0750454E44494E471000120D0A09434F4E4649524D45441001120D0A0943414E43454C4C45441002120D0A09434F4D504C45544544100332FA060A1A52656E74616C4163636F6D6D6F646174696F6E5365727669636512630A0C6164645F70726F706572747912282E72656E74616C2E6163636F6D6D6F646174696F6E2E41646450726F7065727479526571756573741A292E72656E74616C2E6163636F6D6D6F646174696F6E2E41646450726F7065727479526573706F6E736512640A0C6372656174655F757365727312272E72656E74616C2E6163636F6D6D6F646174696F6E2E43726561746555736572526571756573741A292E72656E74616C2E6163636F6D6D6F646174696F6E2E4372656174655573657273526573706F6E73652801126C0A0F7570646174655F70726F7065727479122B2E72656E74616C2E6163636F6D6D6F646174696F6E2E55706461746550726F7065727479526571756573741A2C2E72656E74616C2E6163636F6D6D6F646174696F6E2E55706461746550726F7065727479526573706F6E7365126C0A0F72656D6F76655F70726F7065727479122B2E72656E74616C2E6163636F6D6D6F646174696F6E2E52656D6F766550726F7065727479526571756573741A2C2E72656E74616C2E6163636F6D6D6F646174696F6E2E52656D6F766550726F7065727479526573706F6E736512710A196C6973745F617661696C61626C655F70726F70657274696573122B2E72656E74616C2E6163636F6D6D6F646174696F6E2E4C69737450726F70657274696573526571756573741A252E72656E74616C2E6163636F6D6D6F646174696F6E2E50726F706572747944657461696C733001126C0A0F7365617263685F70726F7065727479122B2E72656E74616C2E6163636F6D6D6F646174696F6E2E53656172636850726F7065727479526571756573741A2C2E72656E74616C2E6163636F6D6D6F646174696F6E2E53656172636850726F7065727479526573706F6E736512660A0D626F6F6B5F70726F706572747912292E72656E74616C2E6163636F6D6D6F646174696F6E2E426F6F6B50726F7065727479526571756573741A2A2E72656E74616C2E6163636F6D6D6F646174696F6E2E426F6F6B50726F7065727479526573706F6E7365126C0A0F636F6E6669726D5F626F6F6B696E67122B2E72656E74616C2E6163636F6D6D6F646174696F6E2E436F6E6669726D426F6F6B696E67526571756573741A2C2E72656E74616C2E6163636F6D6D6F646174696F6E2E436F6E6669726D426F6F6B696E67526573706F6E7365620670726F746F33";

public isolated client class RentalAccommodationServiceClient {
    *grpc:AbstractClientEndpoint;

    private final grpc:Client grpcClient;

    public isolated function init(string url, *grpc:ClientConfiguration config) returns grpc:Error? {
        self.grpcClient = check new (url, config);
        check self.grpcClient.initStub(self, RENTAL_ACCOMMODATION_DESC);
    }

    isolated remote function add_property(AddPropertyRequest|ContextAddPropertyRequest req) returns AddPropertyResponse|grpc:Error {
        map<string|string[]> headers = {};
        AddPropertyRequest message;
        if req is ContextAddPropertyRequest {
            message = req.content;
            headers = req.headers;
        } else {
            message = req;
        }
        var payload = check self.grpcClient->executeSimpleRPC("rental.accommodation.RentalAccommodationService/add_property", message, headers);
        [anydata, map<string|string[]>] [result, _] = payload;
        return <AddPropertyResponse>result;
    }

    isolated remote function add_propertyContext(AddPropertyRequest|ContextAddPropertyRequest req) returns ContextAddPropertyResponse|grpc:Error {
        map<string|string[]> headers = {};
        AddPropertyRequest message;
        if req is ContextAddPropertyRequest {
            message = req.content;
            headers = req.headers;
        } else {
            message = req;
        }
        var payload = check self.grpcClient->executeSimpleRPC("rental.accommodation.RentalAccommodationService/add_property", message, headers);
        [anydata, map<string|string[]>] [result, respHeaders] = payload;
        return {content: <AddPropertyResponse>result, headers: respHeaders};
    }

    isolated remote function update_property(UpdatePropertyRequest|ContextUpdatePropertyRequest req) returns UpdatePropertyResponse|grpc:Error {
        map<string|string[]> headers = {};
        UpdatePropertyRequest message;
        if req is ContextUpdatePropertyRequest {
            message = req.content;
            headers = req.headers;
        } else {
            message = req;
        }
        var payload = check self.grpcClient->executeSimpleRPC("rental.accommodation.RentalAccommodationService/update_property", message, headers);
        [anydata, map<string|string[]>] [result, _] = payload;
        return <UpdatePropertyResponse>result;
    }

    isolated remote function update_propertyContext(UpdatePropertyRequest|ContextUpdatePropertyRequest req) returns ContextUpdatePropertyResponse|grpc:Error {
        map<string|string[]> headers = {};
        UpdatePropertyRequest message;
        if req is ContextUpdatePropertyRequest {
            message = req.content;
            headers = req.headers;
        } else {
            message = req;
        }
        var payload = check self.grpcClient->executeSimpleRPC("rental.accommodation.RentalAccommodationService/update_property", message, headers);
        [anydata, map<string|string[]>] [result, respHeaders] = payload;
        return {content: <UpdatePropertyResponse>result, headers: respHeaders};
    }

    isolated remote function remove_property(RemovePropertyRequest|ContextRemovePropertyRequest req) returns RemovePropertyResponse|grpc:Error {
        map<string|string[]> headers = {};
        RemovePropertyRequest message;
        if req is ContextRemovePropertyRequest {
            message = req.content;
            headers = req.headers;
        } else {
            message = req;
        }
        var payload = check self.grpcClient->executeSimpleRPC("rental.accommodation.RentalAccommodationService/remove_property", message, headers);
        [anydata, map<string|string[]>] [result, _] = payload;
        return <RemovePropertyResponse>result;
    }

    isolated remote function remove_propertyContext(RemovePropertyRequest|ContextRemovePropertyRequest req) returns ContextRemovePropertyResponse|grpc:Error {
        map<string|string[]> headers = {};
        RemovePropertyRequest message;
        if req is ContextRemovePropertyRequest {
            message = req.content;
            headers = req.headers;
        } else {
            message = req;
        }
        var payload = check self.grpcClient->executeSimpleRPC("rental.accommodation.RentalAccommodationService/remove_property", message, headers);
        [anydata, map<string|string[]>] [result, respHeaders] = payload;
        return {content: <RemovePropertyResponse>result, headers: respHeaders};
    }

    isolated remote function search_property(SearchPropertyRequest|ContextSearchPropertyRequest req) returns SearchPropertyResponse|grpc:Error {
        map<string|string[]> headers = {};
        SearchPropertyRequest message;
        if req is ContextSearchPropertyRequest {
            message = req.content;
            headers = req.headers;
        } else {
            message = req;
        }
        var payload = check self.grpcClient->executeSimpleRPC("rental.accommodation.RentalAccommodationService/search_property", message, headers);
        [anydata, map<string|string[]>] [result, _] = payload;
        return <SearchPropertyResponse>result;
    }

    isolated remote function search_propertyContext(SearchPropertyRequest|ContextSearchPropertyRequest req) returns ContextSearchPropertyResponse|grpc:Error {
        map<string|string[]> headers = {};
        SearchPropertyRequest message;
        if req is ContextSearchPropertyRequest {
            message = req.content;
            headers = req.headers;
        } else {
            message = req;
        }
        var payload = check self.grpcClient->executeSimpleRPC("rental.accommodation.RentalAccommodationService/search_property", message, headers);
        [anydata, map<string|string[]>] [result, respHeaders] = payload;
        return {content: <SearchPropertyResponse>result, headers: respHeaders};
    }

    isolated remote function book_property(BookPropertyRequest|ContextBookPropertyRequest req) returns BookPropertyResponse|grpc:Error {
        map<string|string[]> headers = {};
        BookPropertyRequest message;
        if req is ContextBookPropertyRequest {
            message = req.content;
            headers = req.headers;
        } else {
            message = req;
        }
        var payload = check self.grpcClient->executeSimpleRPC("rental.accommodation.RentalAccommodationService/book_property", message, headers);
        [anydata, map<string|string[]>] [result, _] = payload;
        return <BookPropertyResponse>result;
    }

    isolated remote function book_propertyContext(BookPropertyRequest|ContextBookPropertyRequest req) returns ContextBookPropertyResponse|grpc:Error {
        map<string|string[]> headers = {};
        BookPropertyRequest message;
        if req is ContextBookPropertyRequest {
            message = req.content;
            headers = req.headers;
        } else {
            message = req;
        }
        var payload = check self.grpcClient->executeSimpleRPC("rental.accommodation.RentalAccommodationService/book_property", message, headers);
        [anydata, map<string|string[]>] [result, respHeaders] = payload;
        return {content: <BookPropertyResponse>result, headers: respHeaders};
    }

    isolated remote function confirm_booking(ConfirmBookingRequest|ContextConfirmBookingRequest req) returns ConfirmBookingResponse|grpc:Error {
        map<string|string[]> headers = {};
        ConfirmBookingRequest message;
        if req is ContextConfirmBookingRequest {
            message = req.content;
            headers = req.headers;
        } else {
            message = req;
        }
        var payload = check self.grpcClient->executeSimpleRPC("rental.accommodation.RentalAccommodationService/confirm_booking", message, headers);
        [anydata, map<string|string[]>] [result, _] = payload;
        return <ConfirmBookingResponse>result;
    }

    isolated remote function confirm_bookingContext(ConfirmBookingRequest|ContextConfirmBookingRequest req) returns ContextConfirmBookingResponse|grpc:Error {
        map<string|string[]> headers = {};
        ConfirmBookingRequest message;
        if req is ContextConfirmBookingRequest {
            message = req.content;
            headers = req.headers;
        } else {
            message = req;
        }
        var payload = check self.grpcClient->executeSimpleRPC("rental.accommodation.RentalAccommodationService/confirm_booking", message, headers);
        [anydata, map<string|string[]>] [result, respHeaders] = payload;
        return {content: <ConfirmBookingResponse>result, headers: respHeaders};
    }

    isolated remote function create_users() returns Create_usersStreamingClient|grpc:Error {
        grpc:StreamingClient sClient = check self.grpcClient->executeClientStreaming("rental.accommodation.RentalAccommodationService/create_users");
        return new Create_usersStreamingClient(sClient);
    }

    isolated remote function list_available_properties(ListPropertiesRequest|ContextListPropertiesRequest req) returns stream<PropertyDetails, grpc:Error?>|grpc:Error {
        map<string|string[]> headers = {};
        ListPropertiesRequest message;
        if req is ContextListPropertiesRequest {
            message = req.content;
            headers = req.headers;
        } else {
            message = req;
        }
        var payload = check self.grpcClient->executeServerStreaming("rental.accommodation.RentalAccommodationService/list_available_properties", message, headers);
        [stream<anydata, grpc:Error?>, map<string|string[]>] [result, _] = payload;
        PropertyDetailsStream outputStream = new PropertyDetailsStream(result);
        return new stream<PropertyDetails, grpc:Error?>(outputStream);
    }

    isolated remote function list_available_propertiesContext(ListPropertiesRequest|ContextListPropertiesRequest req) returns ContextPropertyDetailsStream|grpc:Error {
        map<string|string[]> headers = {};
        ListPropertiesRequest message;
        if req is ContextListPropertiesRequest {
            message = req.content;
            headers = req.headers;
        } else {
            message = req;
        }
        var payload = check self.grpcClient->executeServerStreaming("rental.accommodation.RentalAccommodationService/list_available_properties", message, headers);
        [stream<anydata, grpc:Error?>, map<string|string[]>] [result, respHeaders] = payload;
        PropertyDetailsStream outputStream = new PropertyDetailsStream(result);
        return {content: new stream<PropertyDetails, grpc:Error?>(outputStream), headers: respHeaders};
    }
}

public isolated client class Create_usersStreamingClient {
    private final grpc:StreamingClient sClient;

    isolated function init(grpc:StreamingClient sClient) {
        self.sClient = sClient;
    }

    isolated remote function sendCreateUserRequest(CreateUserRequest message) returns grpc:Error? {
        return self.sClient->send(message);
    }

    isolated remote function sendContextCreateUserRequest(ContextCreateUserRequest message) returns grpc:Error? {
        return self.sClient->send(message);
    }

    isolated remote function receiveCreateUsersResponse() returns CreateUsersResponse|grpc:Error? {
        var response = check self.sClient->receive();
        if response is () {
            return response;
        } else {
            [anydata, map<string|string[]>] [payload, _] = response;
            return <CreateUsersResponse>payload;
        }
    }

    isolated remote function receiveContextCreateUsersResponse() returns ContextCreateUsersResponse|grpc:Error? {
        var response = check self.sClient->receive();
        if response is () {
            return response;
        } else {
            [anydata, map<string|string[]>] [payload, headers] = response;
            return {content: <CreateUsersResponse>payload, headers: headers};
        }
    }

    isolated remote function sendError(grpc:Error response) returns grpc:Error? {
        return self.sClient->sendError(response);
    }

    isolated remote function complete() returns grpc:Error? {
        return self.sClient->complete();
    }
}

public class PropertyDetailsStream {
    private stream<anydata, grpc:Error?> anydataStream;

    public isolated function init(stream<anydata, grpc:Error?> anydataStream) {
        self.anydataStream = anydataStream;
    }

    public isolated function next() returns record {|PropertyDetails value;|}|grpc:Error? {
        var streamValue = self.anydataStream.next();
        if streamValue is () {
            return streamValue;
        } else if streamValue is grpc:Error {
            return streamValue;
        } else {
            record {|PropertyDetails value;|} nextRecord = {value: <PropertyDetails>streamValue.value};
            return nextRecord;
        }
    }

    public isolated function close() returns grpc:Error? {
        return self.anydataStream.close();
    }
}

public type ContextPropertyDetailsStream record {|
    stream<PropertyDetails, error?> content;
    map<string|string[]> headers;
|};

public type ContextCreateUserRequestStream record {|
    stream<CreateUserRequest, error?> content;
    map<string|string[]> headers;
|};

public type ContextUpdatePropertyResponse record {|
    UpdatePropertyResponse content;
    map<string|string[]> headers;
|};

public type ContextBookPropertyRequest record {|
    BookPropertyRequest content;
    map<string|string[]> headers;
|};

public type ContextListPropertiesRequest record {|
    ListPropertiesRequest content;
    map<string|string[]> headers;
|};

public type ContextPropertyDetails record {|
    PropertyDetails content;
    map<string|string[]> headers;
|};

public type ContextUpdatePropertyRequest record {|
    UpdatePropertyRequest content;
    map<string|string[]> headers;
|};

public type ContextSearchPropertyResponse record {|
    SearchPropertyResponse content;
    map<string|string[]> headers;
|};

public type ContextConfirmBookingRequest record {|
    ConfirmBookingRequest content;
    map<string|string[]> headers;
|};

public type ContextConfirmBookingResponse record {|
    ConfirmBookingResponse content;
    map<string|string[]> headers;
|};

public type ContextAddPropertyResponse record {|
    AddPropertyResponse content;
    map<string|string[]> headers;
|};

public type ContextRemovePropertyRequest record {|
    RemovePropertyRequest content;
    map<string|string[]> headers;
|};

public type ContextAddPropertyRequest record {|
    AddPropertyRequest content;
    map<string|string[]> headers;
|};

public type ContextCreateUserRequest record {|
    CreateUserRequest content;
    map<string|string[]> headers;
|};

public type ContextRemovePropertyResponse record {|
    RemovePropertyResponse content;
    map<string|string[]> headers;
|};

public type ContextCreateUsersResponse record {|
    CreateUsersResponse content;
    map<string|string[]> headers;
|};

public type ContextSearchPropertyRequest record {|
    SearchPropertyRequest content;
    map<string|string[]> headers;
|};

public type ContextBookPropertyResponse record {|
    BookPropertyResponse content;
    map<string|string[]> headers;
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type UpdatePropertyResponse record {|
    boolean success = false;
    string message = "";
    PropertyDetails property = {};
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type BookPropertyRequest record {|
    string guest_id = "";
    string property_id = "";
    string check_in_date = "";
    string check_out_date = "";
    int number_of_guests = 0;
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type ListPropertiesRequest record {|
    string guest_id = "";
    string location?;
    float max_price?;
    float min_price?;
    int max_guests?;
    PropertyType property_type?;
|};

isolated function isValidListpropertiesrequest(ListPropertiesRequest r) returns boolean {
    int _locationCount = 0;
    if r?.location !is () {
        _locationCount += 1;
    }
    int _max_priceCount = 0;
    if r?.max_price !is () {
        _max_priceCount += 1;
    }
    int _min_priceCount = 0;
    if r?.min_price !is () {
        _min_priceCount += 1;
    }
    int _max_guestsCount = 0;
    if r?.max_guests !is () {
        _max_guestsCount += 1;
    }
    int _property_typeCount = 0;
    if r?.property_type !is () {
        _property_typeCount += 1;
    }
    if _locationCount > 1 || _max_priceCount > 1 || _min_priceCount > 1 || _max_guestsCount > 1 || _property_typeCount > 1 {
        return false;
    }
    return true;
}

isolated function setListPropertiesRequest_Location(ListPropertiesRequest r, string location) {
    r.location = location;
}

isolated function setListPropertiesRequest_MaxPrice(ListPropertiesRequest r, float max_price) {
    r.max_price = max_price;
}

isolated function setListPropertiesRequest_MinPrice(ListPropertiesRequest r, float min_price) {
    r.min_price = min_price;
}

isolated function setListPropertiesRequest_MaxGuests(ListPropertiesRequest r, int max_guests) {
    r.max_guests = max_guests;
}

isolated function setListPropertiesRequest_PropertyType(ListPropertiesRequest r, PropertyType property_type) {
    r.property_type = property_type;
}

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type PropertyDetails record {|
    string property_id = "";
    string host_id = "";
    string property_name = "";
    string location = "";
    PropertyType property_type = APARTMENT;
    float price_per_night = 0.0;
    PropertyStatus status = AVAILABLE;
    string description = "";
    int max_guests = 0;
    string[] amenities = [];
    float average_rating = 0.0;
    int total_reviews = 0;
    string image_url = "";
    int created_at = 0;
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type UpdatePropertyRequest record {|
    string property_id = "";
    string host_id = "";
    string location?;
    string image_url?;
    int max_guests?;
    float price_per_night?;
    string description?;
    PropertyStatus status?;
    PropertyType property_type?;
    string property_name?;
|};

isolated function isValidUpdatepropertyrequest(UpdatePropertyRequest r) returns boolean {
    int _locationCount = 0;
    if r?.location !is () {
        _locationCount += 1;
    }
    int _image_urlCount = 0;
    if r?.image_url !is () {
        _image_urlCount += 1;
    }
    int _max_guestsCount = 0;
    if r?.max_guests !is () {
        _max_guestsCount += 1;
    }
    int _price_per_nightCount = 0;
    if r?.price_per_night !is () {
        _price_per_nightCount += 1;
    }
    int _descriptionCount = 0;
    if r?.description !is () {
        _descriptionCount += 1;
    }
    int _statusCount = 0;
    if r?.status !is () {
        _statusCount += 1;
    }
    int _property_typeCount = 0;
    if r?.property_type !is () {
        _property_typeCount += 1;
    }
    int _property_nameCount = 0;
    if r?.property_name !is () {
        _property_nameCount += 1;
    }
    if _locationCount > 1 || _image_urlCount > 1 || _max_guestsCount > 1 || _price_per_nightCount > 1 || _descriptionCount > 1 || _statusCount > 1 || _property_typeCount > 1 || _property_nameCount > 1 {
        return false;
    }
    return true;
}

isolated function setUpdatePropertyRequest_Location(UpdatePropertyRequest r, string location) {
    r.location = location;
}

isolated function setUpdatePropertyRequest_ImageUrl(UpdatePropertyRequest r, string image_url) {
    r.image_url = image_url;
}

isolated function setUpdatePropertyRequest_MaxGuests(UpdatePropertyRequest r, int max_guests) {
    r.max_guests = max_guests;
}

isolated function setUpdatePropertyRequest_PricePerNight(UpdatePropertyRequest r, float price_per_night) {
    r.price_per_night = price_per_night;
}

isolated function setUpdatePropertyRequest_Description(UpdatePropertyRequest r, string description) {
    r.description = description;
}

isolated function setUpdatePropertyRequest_Status(UpdatePropertyRequest r, PropertyStatus status) {
    r.status = status;
}

isolated function setUpdatePropertyRequest_PropertyType(UpdatePropertyRequest r, PropertyType property_type) {
    r.property_type = property_type;
}

isolated function setUpdatePropertyRequest_PropertyName(UpdatePropertyRequest r, string property_name) {
    r.property_name = property_name;
}

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type SearchPropertyResponse record {|
    boolean available = false;
    string message = "";
    PropertyDetails property = {};
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type UserInfo record {|
    string user_id = "";
    string name = "";
    string email = "";
    UserRole role = HOST;
    string phone = "";
    int created_at = 0;
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type ConfirmBookingRequest record {|
    string cart_id = "";
    string guest_id = "";
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type ConfirmBookingResponse record {|
    boolean success = false;
    string booking_id = "";
    string property_id = "";
    string property_name = "";
    string check_in_date = "";
    string check_out_date = "";
    int number_of_nights = 0;
    float price_per_night = 0.0;
    float total_cost = 0.0;
    string message = "";
    int confirmed_at = 0;
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type ErrorResponse record {|
    int code = 0;
    string message = "";
    string details = "";
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type Empty record {|
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type DateRange record {|
    string start_date = "";
    string end_date = "";
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type AddPropertyResponse record {|
    string property_id = "";
    string message = "";
    int timestamp = 0;
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type RemovePropertyRequest record {|
    string property_id = "";
    string host_id = "";
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type AddPropertyRequest record {|
    string host_id = "";
    string property_name = "";
    string location = "";
    PropertyType property_type = APARTMENT;
    float price_per_night = 0.0;
    PropertyStatus status = AVAILABLE;
    string description = "";
    int max_guests = 0;
    string[] amenities = [];
    string image_url = "";
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type CreateUserRequest record {|
    string name = "";
    string email = "";
    UserRole role = HOST;
    string phone = "";
    string address = "";
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type RemovePropertyResponse record {|
    boolean success = false;
    string message = "";
    PropertyDetails[] remaining_properties = [];
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type CreateUsersResponse record {|
    UserInfo[] created_users = [];
    int total_count = 0;
    string message = "";
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type SearchPropertyRequest record {|
    string property_id = "";
|};

@protobuf:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
public type BookPropertyResponse record {|
    string cart_id = "";
    string message = "";
    boolean success = false;
    float estimated_cost = 0.0;
|};

public enum UserRole {
    HOST, GUEST
}

public enum PropertyType {
    APARTMENT, HOUSE, VILLA, CABIN, COTTAGE, STUDIO
}

public enum PropertyStatus {
    AVAILABLE, UNAVAILABLE, MAINTENANCE
}

public enum BookingStatus {
    PENDING, CONFIRMED, CANCELLED, COMPLETED
}
