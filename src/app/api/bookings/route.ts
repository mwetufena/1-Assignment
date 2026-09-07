// ============================================================================
// API Route: Bookings - Confirm and List Bookings
// ============================================================================
// GET: List bookings for a guest or all bookings
// POST: Confirm a booking from the cart (confirm_booking RPC)
//   - Verifies property availability for dates (no overlaps)
//   - Calculates total cost (price_per_night × number_of_nights)
//   - Creates confirmed booking and clears the cart item
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, bookingCart, properties, users } from "@/db/schema";
import { eq, and, lt, gt, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/bookings?guestId=&propertyId=&status=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get("guestId");
    const propertyId = searchParams.get("propertyId");
    const status = searchParams.get("status");

    const conditions = [];
    if (guestId) conditions.push(eq(bookings.guestId, guestId));
    if (propertyId) conditions.push(eq(bookings.propertyId, propertyId));
    if (status) conditions.push(eq(bookings.status, status));

    const result = await db.select({
      booking: bookings,
      propertyName: properties.propertyName,
      propertyLocation: properties.location,
      guestName: users.name,
    }).from(bookings)
      .innerJoin(properties, eq(bookings.propertyId, properties.id))
      .innerJoin(users, eq(bookings.guestId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(bookings.createdAt);

    return NextResponse.json({ success: true, data: result, message: `${result.length} bookings found` });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ success: false, data: null, message: "Failed to fetch bookings" }, { status: 500 });
  }
}

// POST /api/bookings - Confirm a booking (confirm_booking RPC)
// Body: { cartId: string, guestId: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, guestId } = body;

    if (!cartId || !guestId) {
      return NextResponse.json({ success: false, data: null, message: "cartId and guestId are required" }, { status: 400 });
    }

    // Retrieve cart item
    const cartItems = await db.select().from(bookingCart).where(eq(bookingCart.id, cartId));
    if (cartItems.length === 0) {
      return NextResponse.json({ success: false, data: null, message: "Cart item not found" }, { status: 404 });
    }

    const cart = cartItems[0];

    // Verify cart belongs to guest
    if (cart.guestId !== guestId) {
      return NextResponse.json({ success: false, data: null, message: "Unauthorized: Cart does not belong to this guest" }, { status: 403 });
    }

    // Verify property still exists
    const propResult = await db.select().from(properties).where(eq(properties.id, cart.propertyId));
    if (propResult.length === 0) {
      return NextResponse.json({ success: false, data: null, message: "Property no longer exists" }, { status: 404 });
    }
    const property = propResult[0];

    // Check for date overlaps with existing confirmed bookings
    // Overlap condition: existing_check_in < new_check_out AND existing_check_out > new_check_in
    const overlappingBookings = await db.select().from(bookings).where(
      and(
        eq(bookings.propertyId, cart.propertyId),
        eq(bookings.status, "CONFIRMED"),
        lt(bookings.checkIn, cart.checkOut),
        gt(bookings.checkOut, cart.checkIn),
      )
    );

    if (overlappingBookings.length > 0) {
      return NextResponse.json({
        success: false,
        data: null,
        message: "Property is not available for the selected dates (date overlap with existing booking)",
      }, { status: 409 });
    }

    // Calculate total cost
    const checkInDate = new Date(cart.checkIn);
    const checkOutDate = new Date(cart.checkOut);
    const numberOfNights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
    const totalCost = property.pricePerNight * numberOfNights;

    // Create confirmed booking
    const [booking] = await db.insert(bookings).values({
      guestId: cart.guestId,
      propertyId: cart.propertyId,
      checkIn: cart.checkIn,
      checkOut: cart.checkOut,
      numberOfGuests: cart.numberOfGuests,
      numberOfNights,
      pricePerNight: property.pricePerNight,
      totalCost,
      status: "CONFIRMED",
    }).returning();

    // Clear the cart item
    await db.delete(bookingCart).where(eq(bookingCart.id, cartId));

    return NextResponse.json({
      success: true,
      data: {
        ...booking,
        propertyName: property.propertyName,
        propertyLocation: property.location,
      },
      message: "Booking confirmed successfully",
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    return NextResponse.json({ success: false, data: null, message: "Failed to confirm booking" }, { status: 500 });
  }
}
