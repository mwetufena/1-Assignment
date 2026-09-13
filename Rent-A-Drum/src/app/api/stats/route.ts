// ============================================================================
// API Route: Dashboard Statistics
// ============================================================================

import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, properties, bookings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totalUsers] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const [totalHosts] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "HOST"));
    const [totalGuests] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "GUEST"));
    const [totalProperties] = await db.select({ count: sql<number>`count(*)::int` }).from(properties);
    const [availableProperties] = await db.select({ count: sql<number>`count(*)::int` }).from(properties).where(eq(properties.status, "AVAILABLE"));
    const [totalBookings] = await db.select({ count: sql<number>`count(*)::int` }).from(bookings);
    const [confirmedBookings] = await db.select({ count: sql<number>`count(*)::int` }).from(bookings).where(eq(bookings.status, "CONFIRMED"));
    const [revenue] = await db.select({ total: sql<number>`coalesce(sum(total_cost), 0)::float` }).from(bookings).where(eq(bookings.status, "CONFIRMED"));

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers.count,
        totalHosts: totalHosts.count,
        totalGuests: totalGuests.count,
        totalProperties: totalProperties.count,
        availableProperties: availableProperties.count,
        totalBookings: totalBookings.count,
        confirmedBookings: confirmedBookings.count,
        totalRevenue: revenue.total,
      },
      message: "Stats retrieved",
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ success: false, data: null, message: "Failed to fetch stats" }, { status: 500 });
  }
}
