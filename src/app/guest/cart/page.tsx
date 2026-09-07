// ============================================================================
// Booking Cart Page - View cart & Confirm bookings (confirm_booking RPC)
// ============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface CartItem {
  id: string;
  guestId: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  propertyName: string;
  propertyLocation: string;
  propertyType: string;
  pricePerNight: number;
  estimatedCost: number;
  numberOfNights: number;
  createdAt: string;
}

interface User { id: string; name: string; }

export default function CartPage() {
  const [guests, setGuests] = useState<User[]>([]);
  const [selectedGuest, setSelectedGuest] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users?role=GUEST")
      .then((r) => r.json())
      .then((data) => { if (data.success) setGuests(data.data); });
  }, []);

  const fetchCart = useCallback(async () => {
    if (!selectedGuest) { setCartItems([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/cart?guestId=${selectedGuest}`);
      const data = await res.json();
      if (data.success) setCartItems(data.data || []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, [selectedGuest]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleConfirm = async (cartId: string) => {
    setConfirming(cartId);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, guestId: selectedGuest }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Booking confirmed! ID: ${data.data.id} | Total: $${data.data.totalCost.toFixed(2)} | ${data.data.numberOfNights} nights` });
        fetchCart();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to confirm booking" });
    } finally {
      setConfirming(null);
    }
  };

  const handleRemove = async (cartId: string) => {
    try {
      await fetch(`/api/cart?id=${cartId}`, { method: "DELETE" });
      fetchCart();
    } catch {
      setMessage({ type: "error", text: "Failed to remove item" });
    }
  };

  const totalEstimated = cartItems.reduce((sum, item) => sum + item.estimatedCost, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Booking Cart</h1>
        <p className="mt-1 text-slate-500">Review and confirm your bookings — confirm_booking (Simple RPC)</p>
      </div>

      {message && (
        <div className={`mb-6 rounded-lg p-4 ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-4 font-bold">×</button>
        </div>
      )}

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

      {/* Cart Items */}
      {loading ? (
        <p className="text-slate-400">Loading cart...</p>
      ) : !selectedGuest ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span className="text-4xl">👆</span>
          <p className="mt-3 text-slate-500">Select a guest account to view their booking cart</p>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span className="text-4xl">🛒</span>
          <p className="mt-3 text-slate-500">Your cart is empty.</p>
          <Link href="/guest/browse" className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Browse Properties</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">{item.propertyName}</h3>
                    <p className="mt-1 text-sm text-slate-500">📍 {item.propertyLocation} • {item.propertyType}</p>
                    <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Check-in</span>
                        <p className="font-medium text-slate-800">{item.checkIn}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Check-out</span>
                        <p className="font-medium text-slate-800">{item.checkOut}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Nights</span>
                        <p className="font-medium text-slate-800">{item.numberOfNights}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Guests</span>
                        <p className="font-medium text-slate-800">{item.numberOfGuests}</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 text-right">
                    <p className="text-xs text-slate-400">${item.pricePerNight} × {item.numberOfNights} nights</p>
                    <p className="text-2xl font-bold text-slate-900">${item.estimatedCost.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => handleConfirm(item.id)}
                    disabled={confirming === item.id}
                    className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {confirming === item.id ? "⏳ Confirming..." : "✅ Confirm Booking"}
                  </button>
                  <button onClick={() => handleRemove(item.id)} className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">Remove</button>
                  <span className="text-xs text-slate-400">confirm_booking: Verifies dates, checks overlaps, calculates total</span>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Total */}
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-emerald-900">Cart Total</h3>
                <p className="text-sm text-emerald-700">{cartItems.length} item(s) in cart</p>
              </div>
              <span className="text-3xl font-bold text-emerald-900">${totalEstimated.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
