import ballerina/io;

RentalAccommodationServiceClient ep = check new ("http://localhost:9090");

public function main() returns error? {
    AddPropertyRequest add_propertyRequest = {host_id: "ballerina", property_name: "ballerina", location: "ballerina", property_type: APARTMENT, price_per_night: 1, status: AVAILABLE, description: "ballerina", max_guests: 1, amenities: ["ballerina"], image_url: "ballerina"};
    AddPropertyResponse add_propertyResponse = check ep->add_property(add_propertyRequest);
    io:println(add_propertyResponse);

    UpdatePropertyRequest update_propertyRequest = {property_id: "ballerina", host_id: "ballerina"};
    UpdatePropertyResponse update_propertyResponse = check ep->update_property(update_propertyRequest);
    io:println(update_propertyResponse);

    RemovePropertyRequest remove_propertyRequest = {property_id: "ballerina", host_id: "ballerina"};
    RemovePropertyResponse remove_propertyResponse = check ep->remove_property(remove_propertyRequest);
    io:println(remove_propertyResponse);

    SearchPropertyRequest search_propertyRequest = {property_id: "ballerina"};
    SearchPropertyResponse search_propertyResponse = check ep->search_property(search_propertyRequest);
    io:println(search_propertyResponse);

    BookPropertyRequest book_propertyRequest = {guest_id: "ballerina", property_id: "ballerina", check_in_date: "ballerina", check_out_date: "ballerina", number_of_guests: 1};
    BookPropertyResponse book_propertyResponse = check ep->book_property(book_propertyRequest);
    io:println(book_propertyResponse);

    ConfirmBookingRequest confirm_bookingRequest = {cart_id: "ballerina", guest_id: "ballerina"};
    ConfirmBookingResponse confirm_bookingResponse = check ep->confirm_booking(confirm_bookingRequest);
    io:println(confirm_bookingResponse);

    ListPropertiesRequest list_available_propertiesRequest = {guest_id: "ballerina"};
    stream<PropertyDetails, error?> list_available_propertiesResponse = check ep->list_available_properties(list_available_propertiesRequest);
    check list_available_propertiesResponse.forEach(function(PropertyDetails value) {
        io:println(value);
    });

    CreateUserRequest create_usersRequest = {name: "ballerina", email: "ballerina", role: HOST, phone: "ballerina", address: "ballerina"};
    Create_usersStreamingClient create_usersStreamingClient = check ep->create_users();
    check create_usersStreamingClient->sendCreateUserRequest(create_usersRequest);
    check create_usersStreamingClient->complete();
    CreateUsersResponse? create_usersResponse = check create_usersStreamingClient->receiveCreateUsersResponse();
    io:println(create_usersResponse);
}
