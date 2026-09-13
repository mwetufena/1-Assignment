// ============================================================================
// Host Dashboard - Manage Properties (update_property, remove_property)
// ============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Property {
  id: string;
  propertyName: string;
  location: string;
  propertyType: string;
  pricePerNight: number;
  status: string;
  description: string | null;
  maxGuests: number;
  amenities: string[];
  hostId: string;
  hostName: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function HostDashboardPage() {
  const [hosts, setHosts] = useState<User[]>([]);
  const [selectedHost, setSelectedHost] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editForm, setEditForm] = useState({ propertyName: "", location: "", pricePerNight: "", status: "", description: "", maxGuests: "" });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/users?role=HOST")
      .then((r) => r.json())
      .then((data) => { if (data.success) setHosts(data.data); });
  }, []);

  const fetchProperties = useCallback(async () => {
    if (!selectedHost) { setProperties([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/properties?hostId=${selectedHost}&status=`);
      const data = await res.json();
      if (data.success) {
        setProperties(data.data.map((r: { property: Property }) => r.property));
      }
    } catch {
      setMessage({ type: "error", text: "Failed to fetch properties" });
    } finally {
      setLoading(false);
    }
  }, [selectedHost]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property?")) return;
    try {
      const res = await fetch(`/api/properties/${id}?hostId=${selectedHost}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Removed. ${data.data.remainingProperties.length} properties remaining in region.` });
        fetchProperties();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete" });
    }
  };

  const startEdit = (prop: Property) => {
    setEditingProperty(prop);
    setEditForm({
      propertyName: prop.propertyName,
      location: prop.location,
      pricePerNight: String(prop.pricePerNight),
      status: prop.status,
      description: prop.description || "",
      maxGuests: String(prop.maxGuests),
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    try {
      const res = await fetch(`/api/properties/${editingProperty.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostId: selectedHost,
          propertyName: editForm.propertyName,
          location: editForm.location,
          pricePerNight: parseFloat(editForm.pricePerNight),
          status: editForm.status,
          description: editForm.description,
          maxGuests: parseInt(editForm.maxGuests),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Property updated successfully" });
        setEditingProperty(null);
        fetchProperties();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update" });
    }
  };

  const typeIcons: Record<string, string> = { APARTMENT: "🏢", HOUSE: "🏡", VILLA: "🏰", CABIN: "🛖", COTTAGE: "🏘️", STUDIO: "🎛️" };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Properties</h1>
          <p className="mt-1 text-slate-500">Host portal — manage your accommodation listings</p>
        </div>
        <Link href="/host/add-property" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          + Add Property
        </Link>
      </div>

      {message && (
        <div className={`mb-6 rounded-lg p-4 ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-4 font-bold">×</button>
        </div>
      )}

      {/* Host Selection */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="text-sm font-medium text-slate-700">Select Host Account</label>
        <select value={selectedHost} onChange={(e) => setSelectedHost(e.target.value)} className="mt-2 w-full max-w-md rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
          <option value="">— Choose a Host —</option>
          {hosts.map((h) => <option key={h.id} value={h.id}>{h.name} ({h.email})</option>)}
        </select>
        {hosts.length === 0 && <p className="mt-2 text-sm text-amber-600">No hosts found. Create a Host user first.</p>}
      </div>

      {/* Edit Modal */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Update Property</h2>
            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Property Name</label>
                <input value={editForm.propertyName} onChange={(e) => setEditForm({ ...editForm, propertyName: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Location</label>
                <input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Price/Night ($)</label>
                  <input type="number" step="0.01" value={editForm.pricePerNight} onChange={(e) => setEditForm({ ...editForm, pricePerNight: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Max Guests</label>
                  <input type="number" value={editForm.maxGuests} onChange={(e) => setEditForm({ ...editForm, maxGuests: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option value="AVAILABLE">Available</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Save Changes</button>
                <button type="button" onClick={() => setEditingProperty(null)} className="rounded-lg bg-slate-100 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : !selectedHost ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span className="text-4xl">👆</span>
          <p className="mt-3 text-slate-500">Select a host account to view their properties</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span className="text-4xl">🏠</span>
          <p className="mt-3 text-slate-500">No properties yet. Add your first listing!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((prop) => (
            <div key={prop.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                <span className="text-5xl">{typeIcons[prop.propertyType] || "🏠"}</span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-semibold text-slate-900">{prop.propertyName}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${prop.status === "AVAILABLE" ? "bg-green-50 text-green-700" : prop.status === "MAINTENANCE" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>
                    {prop.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">📍 {prop.location}</p>
                <p className="mt-1 text-lg font-bold text-slate-900">${prop.pricePerNight}<span className="text-sm font-normal text-slate-400">/night</span></p>
                <p className="mt-1 text-xs text-slate-400">👤 {prop.maxGuests} guests • {prop.propertyType}</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => startEdit(prop)} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">✏️ Edit</button>
                  <button onClick={() => handleDelete(prop.id)} className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
