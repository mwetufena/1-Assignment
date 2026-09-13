import ballerina/grpc;

listener grpc:Listener ep = new (9090);

@grpc:Descriptor {value: RENTAL_ACCOMMODATION_DESC}
service "RentalAccommodationService" on ep {

    remote function add_property(AddPropertyRequest value) returns AddPropertyResponse|error {
        return {
            property_id: "PROP-1",
            message: "Property added successfully",
            timestamp: 0
        };
    }

    remote function update_property(UpdatePropertyRequest value) returns UpdatePropertyResponse|error {
        return {
            success: true,
            message: "Property updated successfully",
            property: {
                property_id: value.property_id,
                host_id: value.host_id,
                property_name: value.property_name ?: "",
                location: value.location ?: "",
                property_type: APARTMENT,
                price_per_night: 0.0,
                status: AVAILABLE,
                description: "",
                max_guests: 0,
                amenities: [],
                average_rating: 0.0,
                total_reviews: 0,
                image_url: value.image_url ?: "",
                created_at: 0
            }
        };
    }

    remote function remove_property(RemovePropertyRequest value) returns RemovePropertyResponse|error {
        return {
            success: true,
            message: "Property removed successfully",
            remaining_properties: []
        };
    }

    remote function search_property(SearchPropertyRequest value) returns SearchPropertyResponse|error {
        return {
            available: true,
            message: "Property found",
            property: {
                property_id: value.property_id,
                host_id: "",
                property_name: "",
                location: "",
                property_type: APARTMENT,
                price_per_night: 0.0,
                status: AVAILABLE,
                description: "",
                max_guests: 0,
                amenities: [],
                average_rating: 0.0,
                total_reviews: 0,
                image_url: "",
                created_at: 0
            }
        };
    }

    remote function book_property(BookPropertyRequest value) returns BookPropertyResponse|error {
        return {
            cart_id: "CART-1",
            message: "Property added to cart",
            success: true,
            estimated_cost: 0.0
        };
    }

    remote function confirm_booking(ConfirmBookingRequest value) returns ConfirmBookingResponse|error {
        return {
            success: true,
            booking_id: "BK-1",
            property_id: "",
            property_name: "",
            check_in_date: "",
            check_out_date: "",
            number_of_nights: 0,
            price_per_night: 0.0,
            total_cost: 0.0,
            message: "Booking confirmed successfully",
            confirmed_at: 0
        };
    }

    remote function create_users(stream<CreateUserRequest, grpc:Error?> clientStream) returns CreateUsersResponse|error {
        return {
            created_users: [],
            total_count: 0,
            message: "No users created"
        };
    }

    remote function list_available_properties(ListPropertiesRequest value) returns stream<PropertyDetails, error?>|error {
        PropertyDetails[] emptyList = [];
        return emptyList.toStream();
    }
}