// ============================================================================
// My Bookings Page - View confirmed bookings
// ============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface BookingRow {
  booking: {
    id: string;
    guestId: string;
    propertyId: string;
    checkIn: string;
    checkOut: string;
    numberOfGuests: number;
    numberOfNights: number;
    pricePerNight: number;
    totalCost: number;
    status: string;
    createdAt: string;
  };
  propertyName: string;
  propertyLocation: string;
  guestName: string;
}

interface User { id: string; name: string; }

export default function BookingsPage() {
  const [guests, setGuests] = useState<User[]>([]);
  const [selectedGuest, setSelectedGuest] = useState("");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/users?role=GUEST")
      .then((r) => r.json())
      .then((data) => { if (data.success) setGuests(data.data); });
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!selectedGuest) { setBookings([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?guestId=${selectedGuest}`);
      const data = await res.json();
      if (data.success) setBookings(data.data || []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, [selectedGuest]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-green-50 text-green-700 border-green-200",
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
    COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
        <p className="mt-1 text-slate-500">View your confirmed accommodation bookings</p>
      </div>

      {/* Guest Selection */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="text-sm font-medium text-slate-700">Select Guest Account</label>
        <select value={selectedGuest} onChange={(e) => setSelectedGuest(e.target.value)} className="mt-2 w-full max-w-md rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
          <option value="">— Choose a Guest —</option>
          {guests.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        {guests.length === 0 && (
          <p className="mt-2 text-sm text-amber-600">No guests found. <Link href="/users" className="underline">Create a Guest user</Link> first.</p>
        )}
      </div>

      {loading ? (
        <p className="text-slate-400">Loading bookings...</p>
      ) : !selectedGuest ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span className="text-4xl">👆</span>
          <p className="mt-3 text-slate-500">Select a guest account to view their bookings</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span className="text-4xl">📋</span>
          <p className="mt-3 text-slate-500">No bookings yet.</p>
          <Link href="/guest/browse" className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Browse & Book</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((row) => (
            <div key={row.booking.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{row.propertyName}</h3>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[row.booking.status] || "bg-slate-50 text-slate-700"}`}>
                      {row.booking.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">📍 {row.propertyLocation}</p>
                  <div className="mt-3 grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Check-in</span>
                      <p className="font-medium text-slate-800">{row.booking.checkIn}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Check-out</span>
                      <p className="font-medium text-slate-800">{row.booking.checkOut}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Nights</span>
                      <p className="font-medium text-slate-800">{row.booking.numberOfNights}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Guests</span>
                      <p className="font-medium text-slate-800">{row.booking.numberOfGuests}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Price/night</span>
                      <p className="font-medium text-slate-800">${row.booking.pricePerNight}</p>
                    </div>
                  </div>
                </div>
                <div className="ml-6 text-right">
                  <p className="text-xs text-slate-400">Total Cost</p>
                  <p className="text-3xl font-bold text-emerald-600">${row.booking.totalCost.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                <span>Booking ID: {row.booking.id}</span>
                <span>Booked on {new Date(row.booking.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
