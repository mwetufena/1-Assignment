// ============================================================================
// Dashboard Page - System Overview with Stats
// ============================================================================

import { db } from "@/db";
import { users, properties, bookings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [totalUsers] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const [totalHosts] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "HOST"));
    const [totalGuests] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "GUEST"));
    const [totalProperties] = await db.select({ count: sql<number>`count(*)::int` }).from(properties);
    const [availableProperties] = await db.select({ count: sql<number>`count(*)::int` }).from(properties).where(eq(properties.status, "AVAILABLE"));
    const [totalBookings] = await db.select({ count: sql<number>`count(*)::int` }).from(bookings);
    const [confirmedBookings] = await db.select({ count: sql<number>`count(*)::int` }).from(bookings).where(eq(bookings.status, "CONFIRMED"));
    const [revenue] = await db.select({ total: sql<number>`coalesce(sum(total_cost), 0)::float` }).from(bookings).where(eq(bookings.status, "CONFIRMED"));

    const recentProperties = await db.select().from(properties).orderBy(sql`${properties.createdAt} desc`).limit(5);
    const recentBookings = await db.select({
      booking: bookings,
      propertyName: properties.propertyName,
      guestName: users.name,
    }).from(bookings)
      .innerJoin(properties, eq(bookings.propertyId, properties.id))
      .innerJoin(users, eq(bookings.guestId, users.id))
      .orderBy(sql`${bookings.createdAt} desc`)
      .limit(5);

    return {
      totalUsers: totalUsers.count,
      totalHosts: totalHosts.count,
      totalGuests: totalGuests.count,
      totalProperties: totalProperties.count,
      availableProperties: availableProperties.count,
      totalBookings: totalBookings.count,
      confirmedBookings: confirmedBookings.count,
      totalRevenue: revenue.total,
      recentProperties,
      recentBookings,
    };
  } catch {
    return {
      totalUsers: 0, totalHosts: 0, totalGuests: 0,
      totalProperties: 0, availableProperties: 0,
      totalBookings: 0, confirmedBookings: 0, totalRevenue: 0,
      recentProperties: [], recentBookings: [],
    };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "bg-blue-50 text-blue-700", sub: `${stats.totalHosts} hosts, ${stats.totalGuests} guests` },
    { label: "Properties", value: stats.totalProperties, icon: "🏠", color: "bg-emerald-50 text-emerald-700", sub: `${stats.availableProperties} available` },
    { label: "Bookings", value: stats.totalBookings, icon: "📋", color: "bg-purple-50 text-purple-700", sub: `${stats.confirmedBookings} confirmed` },
    { label: "Revenue", value: `$${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: "💰", color: "bg-amber-50 text-amber-700", sub: "Total confirmed" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-500">Rental Accommodation System — gRPC Distributed Platform</p>
      </div>

      {/* Architecture Info Banner */}
      <div className="mb-8 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🏗️</span>
          <div>
            <h2 className="text-lg font-semibold text-blue-900">System Architecture</h2>
            <p className="mt-1 text-sm text-blue-700">
              This distributed system uses <strong>gRPC protocol</strong> with <strong>Ballerina</strong> for remote invocation.
              The proto contract defines Simple RPC, Client-side Streaming, and Server-side Streaming patterns.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "add_property → Simple RPC",
                "create_users → Client Streaming",
                "update_property → Simple RPC",
                "remove_property → Simple RPC",
                "list_available_properties → Server Streaming",
                "search_property → Simple RPC",
                "book_property → Simple RPC",
                "confirm_booking → Simple RPC",
              ].map((rpc) => (
                <span key={rpc} className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-blue-800">
                  {rpc}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-1 text-xs text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <Link href="/users" className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl group-hover:bg-blue-100">👥</span>
            <div>
              <h3 className="font-semibold text-slate-900">Manage Users</h3>
              <p className="text-sm text-slate-500">Create hosts & guests</p>
            </div>
          </div>
        </Link>
        <Link href="/host/add-property" className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-2xl group-hover:bg-emerald-100">🏠</span>
            <div>
              <h3 className="font-semibold text-slate-900">Add Property</h3>
              <p className="text-sm text-slate-500">List new accommodation</p>
            </div>
          </div>
        </Link>
        <Link href="/guest/browse" className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-purple-300 hover:shadow-md">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-2xl group-hover:bg-purple-100">🔍</span>
            <div>
              <h3 className="font-semibold text-slate-900">Browse & Book</h3>
              <p className="text-sm text-slate-500">Find accommodations</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Properties */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Recent Properties</h2>
          {stats.recentProperties.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No properties yet. Add your first listing!</p>
          ) : (
            <div className="mt-4 space-y-3">
              {stats.recentProperties.map((prop) => (
                <div key={prop.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{prop.propertyName}</p>
                    <p className="text-xs text-slate-400">📍 {prop.location} • ${prop.pricePerNight}/night</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${prop.status === "AVAILABLE" ? "bg-green-50 text-green-700" : "bg-slate-50 text-slate-500"}`}>
                    {prop.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Recent Bookings</h2>
          {stats.recentBookings.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No bookings yet. Browse and book a property!</p>
          ) : (
            <div className="mt-4 space-y-3">
              {stats.recentBookings.map((row) => (
                <div key={row.booking.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{row.propertyName}</p>
                    <p className="text-xs text-slate-400">👤 {row.guestName} • {row.booking.checkIn} → {row.booking.checkOut}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">${row.booking.totalCost}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
