// ============================================================================
// Add Property Page - Host registers new listing (add_property RPC)
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User { id: string; name: string; email: string; role: string; }

const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "VILLA", "CABIN", "COTTAGE", "STUDIO"];
const AMENITY_OPTIONS = ["WiFi", "Pool", "Parking", "AC", "Heating", "Kitchen", "Washer", "TV", "Beach Access", "Hot Tub", "Fireplace", "Gym", "Balcony", "Garden", "Pet Friendly", "Workspace"];

export default function AddPropertyPage() {
  const router = useRouter();
  const [hosts, setHosts] = useState<User[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    hostId: "",
    propertyName: "",
    location: "",
    propertyType: "APARTMENT",
    pricePerNight: "",
    status: "AVAILABLE",
    description: "",
    maxGuests: "2",
    amenities: [] as string[],
    imageUrl: "",
  });

  useEffect(() => {
    fetch("/api/users?role=HOST")
      .then((r) => r.json())
      .then((data) => { if (data.success) setHosts(data.data); });
  }, []);

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          pricePerNight: parseFloat(form.pricePerNight),
          maxGuests: parseInt(form.maxGuests),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Property added! ID: ${data.data.id}` });
        setTimeout(() => router.push("/host/dashboard"), 2000);
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to add property" });
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Add Property</h1>
        <p className="mt-1 text-slate-500">Register a new accommodation listing — add_property (Simple RPC)</p>
      </div>

      {message && (
        <div className={`mb-6 rounded-lg p-4 ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-4 font-bold">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-5">
          {/* Host Selection */}
          <div>
            <label className="text-sm font-medium text-slate-700">Host Account *</label>
            <select required value={form.hostId} onChange={(e) => setForm({ ...form, hostId: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
              <option value="">— Select Host —</option>
              {hosts.map((h) => <option key={h.id} value={h.id}>{h.name} ({h.email})</option>)}
            </select>
            {hosts.length === 0 && <p className="mt-1 text-xs text-amber-600">No hosts found. Create a Host user first.</p>}
          </div>

          {/* Property Name */}
          <div>
            <label className="text-sm font-medium text-slate-700">Property Name *</label>
            <input required value={form.propertyName} onChange={(e) => setForm({ ...form, propertyName: e.target.value })} placeholder="e.g., Oceanfront Paradise Villa" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-slate-700">Location *</label>
            <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g., Miami, FL" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
          </div>

          {/* Property Type & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Property Type *</label>
              <select value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
                <option value="AVAILABLE">Available</option>
                <option value="UNAVAILABLE">Unavailable</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Price & Max Guests */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Price per Night ($) *</label>
              <input required type="number" step="0.01" min="0" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Max Guests</label>
              <input type="number" min="1" value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe your property..." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
          </div>

          {/* Amenities */}
          <div>
            <label className="text-sm font-medium text-slate-700">Amenities</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${form.amenities.includes(a) ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="text-sm font-medium text-slate-700">Image URL</label>
            <input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
              🏠 Add Property
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-lg bg-slate-100 px-8 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
