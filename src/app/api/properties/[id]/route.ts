// ============================================================================
// API Route: Property by ID - Search, Update, Remove
// ============================================================================
// GET: Search property by ID (search_property RPC)
// PUT: Update property details (update_property RPC)
// DELETE: Remove property, return remaining in region (remove_property RPC)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/properties/[id] - Search property by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select({
      property: properties,
      hostName: users.name,
      hostEmail: users.email,
    }).from(properties)
      .leftJoin(users, eq(properties.hostId, users.id))
      .where(eq(properties.id, id));

    if (result.length === 0) {
      return NextResponse.json({ success: true, data: null, message: "Not Available - Property not found" });
    }

    const prop = result[0];
    if (prop.property.status !== "AVAILABLE") {
      return NextResponse.json({ success: true, data: prop, message: `Not Available - Property status: ${prop.property.status}` });
    }

    return NextResponse.json({ success: true, data: prop, message: "Property found" });
  } catch (error) {
    console.error("Error searching property:", error);
    return NextResponse.json({ success: false, data: null, message: "Failed to search property" }, { status: 500 });
  }
}

// PUT /api/properties/[id] - Update property (partial update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check property exists and host owns it
    const existing = await db.select().from(properties).where(eq(properties.id, id));
    if (existing.length === 0) {
      return NextResponse.json({ success: false, data: null, message: "Property not found" }, { status: 404 });
    }

    if (body.hostId && existing[0].hostId !== body.hostId) {
      return NextResponse.json({ success: false, data: null, message: "Unauthorized: Host does not own this property" }, { status: 403 });
    }

    // Build update object (only provided fields - partial update)
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.propertyName) updateData.propertyName = body.propertyName;
    if (body.location) updateData.location = body.location;
    if (body.propertyType) updateData.propertyType = body.propertyType;
    if (body.pricePerNight !== undefined && body.pricePerNight > 0) updateData.pricePerNight = body.pricePerNight;
    if (body.status) updateData.status = body.status;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.maxGuests) updateData.maxGuests = body.maxGuests;
    if (body.amenities) updateData.amenities = body.amenities;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;

    const [updated] = await db.update(properties)
      .set(updateData)
      .where(eq(properties.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updated, message: "Property updated successfully" });
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json({ success: false, data: null, message: "Failed to update property" }, { status: 500 });
  }
}

// DELETE /api/properties/[id]?hostId= - Remove property, return remaining in region
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get("hostId");

    // Check property exists
    const existing = await db.select().from(properties).where(eq(properties.id, id));
    if (existing.length === 0) {
      return NextResponse.json({ success: false, data: null, message: "Property not found" }, { status: 404 });
    }

    if (hostId && existing[0].hostId !== hostId) {
      return NextResponse.json({ success: false, data: null, message: "Unauthorized: Host does not own this property" }, { status: 403 });
    }

    const region = existing[0].location;

    // Delete the property
    await db.delete(properties).where(eq(properties.id, id));

    // Get remaining properties in the same region
    const remaining = await db.select().from(properties)
      .where(and(eq(properties.location, region), eq(properties.status, "AVAILABLE")));

    return NextResponse.json({
      success: true,
      data: { removed: id, remainingProperties: remaining },
      message: `Property removed. ${remaining.length} properties remaining in ${region}`,
    });
  } catch (error) {
    console.error("Error removing property:", error);
    return NextResponse.json({ success: false, data: null, message: "Failed to remove property" }, { status: 500 });
  }
}
