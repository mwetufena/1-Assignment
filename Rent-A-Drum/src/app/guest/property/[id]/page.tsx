// ============================================================================
// Property Detail + Book Page - search_property + book_property RPC
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface PropertyDetail {
  property: {
    id: string;
    propertyName: string;
    location: string;
    propertyType: string;
    pricePerNight: number;
    status: string;
    description: string | null;
    maxGuests: number;
    amenities: string[];
    averageRating: number;
    totalReviews: number;
    hostId: string;
  };
  hostName: string;
}

const typeIcons: Record<string, string> = { APARTMENT: "🏢", HOUSE: "🏡", VILLA: "🏰", CABIN: "🛖", COTTAGE: "🏘️", STUDIO: "🎛️" };

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState<{ id: string; name: string }[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [bookForm, setBookForm] = useState({ guestId: "", checkIn: "", checkOut: "", numberOfGuests: "1" });
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) setProperty(data.data);
      })
      .finally(() => setLoading(false));

    fetch("/api/users?role=GUEST")
      .then((r) => r.json())
      .then((data) => { if (data.success) setGuests(data.data); });
  }, [id]);

  // Calculate estimated cost
  useEffect(() => {
    if (property && bookForm.checkIn && bookForm.checkOut) {
      const checkIn = new Date(bookForm.checkIn);
      const checkOut = new Date(bookForm.checkOut);
      const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
      if (nights > 0) {
        setEstimatedCost(property.property.pricePerNight * nights);
      } else {
        setEstimatedCost(null);
      }
    } else {
      setEstimatedCost(null);
    }
  }, [property, bookForm.checkIn, bookForm.checkOut]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: bookForm.guestId,
          propertyId: id,
          checkIn: bookForm.checkIn,
          checkOut: bookForm.checkOut,
          numberOfGuests: parseInt(bookForm.numberOfGuests),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Added to cart! Estimated cost: $${data.data.estimatedCost}. Go to your cart to confirm.` });
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to add to cart" });
    }
  };

  if (loading) return <div className="py-12 text-center text-slate-400">Loading...</div>;

  if (!property) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <span className="text-4xl">❌</span>
        <p className="mt-3 text-lg font-semibold text-slate-700">Not Available</p>
        <p className="text-slate-500">Property not found or not available for booking.</p>
        <button onClick={() => router.push("/guest/browse")} className="mt-4 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Browse Properties</button>
      </div>
    );
  }

  const prop = property.property;

  return (
    <div className="mx-auto max-w-4xl">
      {message && (
        <div className={`mb-6 rounded-lg p-4 ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-4 font-bold">×</button>
        </div>
      )}

      {/* Property Header */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex h-56 items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
          <span className="text-8xl">{typeIcons[prop.propertyType] || "🏠"}</span>
        </div>
        <div className="p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{prop.propertyName}</h1>
              <p className="mt-1 text-slate-500">📍 {prop.location} • {prop.propertyType}</p>
              <p className="mt-1 text-sm text-slate-500">Hosted by {property.hostName}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-slate-900">${prop.pricePerNight}</span>
              <span className="text-slate-400">/night</span>
              {prop.averageRating > 0 && (
                <p className="mt-1 text-sm text-slate-500">⭐ {prop.averageRating.toFixed(1)} ({prop.totalReviews} reviews)</p>
              )}
            </div>
          </div>

          {prop.description && <p className="mt-4 text-slate-600">{prop.description}</p>}

          <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
            <span>👤 Up to {prop.maxGuests} guests</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${prop.status === "AVAILABLE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{prop.status}</span>
          </div>

          {prop.amenities?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-700">Amenities</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {prop.amenities.map((a) => (
                  <span key={a} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Form */}
      {prop.status === "AVAILABLE" && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-blue-900">Book This Property</h2>
          <p className="mt-1 text-sm text-blue-700">book_property (Simple RPC) — Adds to your temporary booking cart</p>
          <form onSubmit={handleBook} className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Guest Account *</label>
              <select required value={bookForm.guestId} onChange={(e) => setBookForm({ ...bookForm, guestId: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
                <option value="">— Select Guest —</option>
                {guests.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              {guests.length === 0 && <p className="mt-1 text-xs text-amber-600">No guests found. Create a Guest user first.</p>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Check-in *</label>
                <input required type="date" value={bookForm.checkIn} onChange={(e) => setBookForm({ ...bookForm, checkIn: e.target.value })} min={new Date().toISOString().split("T")[0]} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Check-out *</label>
                <input required type="date" value={bookForm.checkOut} onChange={(e) => setBookForm({ ...bookForm, checkOut: e.target.value })} min={bookForm.checkIn || new Date().toISOString().split("T")[0]} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Guests</label>
                <input type="number" min="1" max={prop.maxGuests} value={bookForm.numberOfGuests} onChange={(e) => setBookForm({ ...bookForm, numberOfGuests: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
              </div>
            </div>

            {estimatedCost && bookForm.checkIn && bookForm.checkOut && (
              <div className="rounded-lg bg-white p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">${prop.pricePerNight} × {Math.max(1, Math.ceil((new Date(bookForm.checkOut).getTime() - new Date(bookForm.checkIn).getTime()) / (1000 * 60 * 60 * 24)))} nights</span>
                  <span className="text-xl font-bold text-slate-900">${estimatedCost.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">🛒 Add to Booking Cart</button>
              <button type="button" onClick={() => router.push("/guest/cart")} className="rounded-lg bg-slate-100 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200">View Cart</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
