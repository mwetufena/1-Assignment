// ============================================================================
// API Route: Users - Create and List Users
// ============================================================================
// POST: Create one or more users (simulates client-side streaming create_users)
// GET: List all users, optionally filtered by role
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, like } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/users?role=HOST|GUEST
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    let result;
    if (role) {
      result = await db.select().from(users).where(eq(users.role, role)).orderBy(users.createdAt);
    } else {
      result = await db.select().from(users).orderBy(users.createdAt);
    }

    return NextResponse.json({ success: true, data: result, message: "Users retrieved successfully" });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ success: false, data: null, message: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/users - Create single or multiple users
// Body: { user: {...} } for single, or { users: [{...}, {...}] } for batch (streaming simulation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Batch creation (simulates client-side streaming create_users)
    if (body.users && Array.isArray(body.users)) {
      const createdUsers = [];
      for (const userData of body.users) {
        const [created] = await db.insert(users).values({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          phone: userData.phone || "",
          address: userData.address || null,
        }).returning();
        createdUsers.push(created);
      }
      return NextResponse.json({
        success: true,
        data: { createdUsers, totalCount: createdUsers.length },
        message: `${createdUsers.length} users created successfully (streamed)`,
      });
    }

    // Single user creation
    if (body.user) {
      const userData = body.user;
      const [created] = await db.insert(users).values({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone || "",
        address: userData.address || null,
      }).returning();

      return NextResponse.json({ success: true, data: created, message: "User created successfully" });
    }

    return NextResponse.json({ success: false, data: null, message: "Invalid request body" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Error creating users:", error);
    const msg = error instanceof Error && error.message.includes("unique") ? "Email already exists" : "Failed to create users";
    return NextResponse.json({ success: false, data: null, message: msg }, { status: 500 });
  }
}
