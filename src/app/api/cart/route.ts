// ============================================================================
// API Route: Booking Cart - Add, List, Remove Cart Items
// ============================================================================
// Maps to book_property RPC: adds booking request to temporary cart
// GET: List cart items for a guest
// POST: Add item to cart (book_property)
// DELETE: Remove item from cart
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookingCart, properties, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/cart?guestId=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get("guestId");

    if (!guestId) {
      return NextResponse.json({ success: false, data: null, message: "guestId is required" }, { status: 400 });
    }

    const result = await db.select({
      cart: bookingCart,
      property: properties,
    }).from(bookingCart)
      .innerJoin(properties, eq(bookingCart.propertyId, properties.id))
      .where(eq(bookingCart.guestId, guestId))
      .orderBy(bookingCart.createdAt);

    // Enrich with calculated estimated cost
    const enriched = result.map((row) => {
      const checkIn = new Date(row.cart.checkIn);
      const checkOut = new Date(row.cart.checkOut);
      const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
      return {
        ...row.cart,
        propertyName: row.property.propertyName,
        propertyLocation: row.property.location,
        propertyType: row.property.propertyType,
        pricePerNight: row.property.pricePerNight,
        estimatedCost: row.property.pricePerNight * nights,
        numberOfNights: nights,
      };
    });

    return NextResponse.json({ success: true, data: enriched, message: "Cart retrieved" });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ success: false, data: null, message: "Failed to fetch cart" }, { status: 500 });
  }
}

// POST /api/cart - Add to booking cart (book_property RPC)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestId, propertyId, checkIn, checkOut, numberOfGuests } = body;

    // Validate required fields
    if (!guestId || !propertyId || !checkIn || !checkOut) {
      return NextResponse.json({ success: false, data: null, message: "Missing required fields" }, { status: 400 });
    }

    // Validate dates: check-out must be after check-in
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      return NextResponse.json({ success: false, data: null, message: "Check-out date must be after check-in date" }, { status: 400 });
    }

    // Validate property exists and is available
    const propResult = await db.select().from(properties).where(eq(properties.id, propertyId));
    if (propResult.length === 0) {
      return NextResponse.json({ success: false, data: null, message: "Property not found" }, { status: 404 });
    }
    if (propResult[0].status !== "AVAILABLE") {
      return NextResponse.json({ success: false, data: null, message: "Property is not available for booking" }, { status: 400 });
    }

    // Add to cart
    const [cartItem] = await db.insert(bookingCart).values({
      guestId,
      propertyId,
      checkIn,
      checkOut,
      numberOfGuests: numberOfGuests || 1,
    }).returning();

    // Calculate estimated cost
    const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
    const estimatedCost = propResult[0].pricePerNight * nights;

    return NextResponse.json({
      success: true,
      data: { ...cartItem, estimatedCost, numberOfNights: nights },
      message: "Property added to booking cart",
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ success: false, data: null, message: "Failed to add to cart" }, { status: 500 });
  }
}

// DELETE /api/cart?id= - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, data: null, message: "Cart item ID is required" }, { status: 400 });
    }

    await db.delete(bookingCart).where(eq(bookingCart.id, id));

    return NextResponse.json({ success: true, data: null, message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json({ success: false, data: null, message: "Failed to remove from cart" }, { status: 500 });
  }
}
