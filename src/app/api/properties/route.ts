// ============================================================================
// API Route: Properties - Add and List/Search Properties
// ============================================================================
// GET: List available properties with optional filters (server-side streaming simulation)
// POST: Add a new property listing
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties, users } from "@/db/schema";
import { eq, and, gte, lte, like, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/properties?location=&minPrice=&maxPrice=&type=&maxGuests=&status=&hostId=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const type = searchParams.get("type");
    const maxGuests = searchParams.get("maxGuests");
    const status = searchParams.get("status");
    const hostId = searchParams.get("hostId");
    const propertyId = searchParams.get("propertyId");

    // Search by specific property_id (maps to search_property RPC)
    if (propertyId) {
      const result = await db.select({
        property: properties,
        hostName: users.name,
        hostEmail: users.email,
      }).from(properties)
        .leftJoin(users, eq(properties.hostId, users.id))
        .where(eq(properties.id, propertyId));

      if (result.length === 0) {
        return NextResponse.json({ success: true, data: null, message: "Not Available - Property not found" });
      }
      return NextResponse.json({ success: true, data: result[0], message: "Property found" });
    }

    // Build conditions for filtering (maps to list_available_properties RPC)
    const conditions = [];
    if (status) conditions.push(eq(properties.status, status));
    else conditions.push(eq(properties.status, "AVAILABLE"));
    if (location) conditions.push(like(properties.location, `%${location}%`));
    if (minPrice) conditions.push(gte(properties.pricePerNight, parseFloat(minPrice)));
    if (maxPrice) conditions.push(lte(properties.pricePerNight, parseFloat(maxPrice)));
    if (type) conditions.push(eq(properties.propertyType, type));
    if (maxGuests) conditions.push(gte(properties.maxGuests, parseInt(maxGuests)));
    if (hostId) conditions.push(eq(properties.hostId, hostId));

    const result = await db.select({
      property: properties,
      hostName: users.name,
      hostEmail: users.email,
    }).from(properties)
      .leftJoin(users, eq(properties.hostId, users.id))
      .where(and(...conditions))
      .orderBy(properties.createdAt);

    return NextResponse.json({ success: true, data: result, message: `${result.length} properties found` });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json({ success: false, data: null, message: "Failed to fetch properties" }, { status: 500 });
  }
}

// POST /api/properties - Add a new property (maps to add_property RPC)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const [created] = await db.insert(properties).values({
      hostId: body.hostId,
      propertyName: body.propertyName,
      location: body.location,
      propertyType: body.propertyType,
      pricePerNight: body.pricePerNight,
      status: body.status || "AVAILABLE",
      description: body.description || null,
      maxGuests: body.maxGuests || 1,
      amenities: body.amenities || [],
      imageUrl: body.imageUrl || null,
      averageRating: 0,
      totalReviews: 0,
    }).returning();

    return NextResponse.json({
      success: true,
      data: created,
      message: `Property added successfully with ID: ${created.id}`,
    });
  } catch (error) {
    console.error("Error adding property:", error);
    return NextResponse.json({ success: false, data: null, message: "Failed to add property" }, { status: 500 });
  }
}
