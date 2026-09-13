// ============================================================================
// Browse Properties Page - Server-side Streaming Simulation
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
  averageRating: number;
  totalReviews: number;
  hostName: string;
}

const PROPERTY_TYPES = ["", "APARTMENT", "HOUSE", "VILLA", "CABIN", "COTTAGE", "STUDIO"];
const typeIcons: Record<string, string> = { APARTMENT: "🏢", HOUSE: "🏡", VILLA: "🏰", CABIN: "🛖", COTTAGE: "🏘️", STUDIO: "🎛️" };

export default function BrowsePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [streamProgress, setStreamProgress] = useState(0);
  const [filters, setFilters] = useState({ location: "", minPrice: "", maxPrice: "", type: "", maxGuests: "" });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", "AVAILABLE");
      if (filters.location) params.set("location", filters.location);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.type) params.set("type", filters.type);
      if (filters.maxGuests) params.set("maxGuests", filters.maxGuests);

      const res = await fetch(`/api/properties?${params}`);
      const data = await res.json();
      if (data.success) {
        setProperties(data.data.map((r: { property: Property }) => r.property));
      }
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  // Simulate server-side streaming animation
  const handleStreamBrowse = async () => {
    setStreaming(true);
    setStreamProgress(0);
    setProperties([]);

    const params = new URLSearchParams();
    params.set("status", "AVAILABLE");
    if (filters.location) params.set("location", filters.location);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.type) params.set("type", filters.type);
    if (filters.maxGuests) params.set("maxGuests", filters.maxGuests);

    try {
      const res = await fetch(`/api/properties?${params}`);
      const data = await res.json();
      if (data.success) {
        const allProps = data.data.map((r: { property: Property }) => r.property);
        // Simulate streaming: deliver properties one by one
        for (let i = 0; i < allProps.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          setProperties((prev) => [...prev, allProps[i]]);
          setStreamProgress(Math.round(((i + 1) / allProps.length) * 100));
        }
      }
    } catch {
      // error
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Browse Properties</h1>
        <p className="mt-1 text-slate-500">Find and explore available accommodations — list_available_properties (Server-side Streaming)</p>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Filters</h2>
        <div className="mt-3 grid grid-cols-5 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500">Location</label>
            <input value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} placeholder="City, State" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Min Price</label>
            <input type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} placeholder="$0" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Max Price</label>
            <input type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} placeholder="No limit" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Type</label>
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t || "All Types"}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Min Guests</label>
            <input type="number" value={filters.maxGuests} onChange={(e) => setFilters({ ...filters, maxGuests: e.target.value })} placeholder="Any" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={fetchProperties} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">🔍 Search</button>
          <button onClick={handleStreamBrowse} disabled={streaming} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {streaming ? `⚡ Streaming... ${streamProgress}%` : "⚡ Stream Results (gRPC)"}
          </button>
        </div>
        {streaming && (
          <div className="mt-3">
            <div className="h-2 w-full rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${streamProgress}%` }} />
            </div>
            <p className="mt-1 text-xs text-blue-600">Streaming properties one by one from server...</p>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12"><p className="text-slate-400">Loading properties...</p></div>
      ) : properties.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span className="text-4xl">🔍</span>
          <p className="mt-3 text-slate-500">No properties found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500">{properties.length} properties available</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((prop) => (
              <div key={prop.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="flex h-full items-center justify-center">
                    <span className="text-5xl">{typeIcons[prop.propertyType] || "🏠"}</span>
                  </div>
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {prop.propertyType}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-slate-900 leading-tight">{prop.propertyName}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">📍 {prop.location}</p>
                  {prop.description && <p className="mt-2 text-sm text-slate-600 line-clamp-2">{prop.description}</p>}
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span>👤 {prop.maxGuests} guests</span>
                    {prop.averageRating > 0 && <span>⭐ {prop.averageRating.toFixed(1)}</span>}
                  </div>
                  {prop.amenities?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {prop.amenities.slice(0, 3).map((a) => (
                        <span key={a} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{a}</span>
                      ))}
                      {prop.amenities.length > 3 && <span className="text-xs text-slate-400">+{prop.amenities.length - 3}</span>}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-slate-900">${prop.pricePerNight}</span>
                      <span className="text-sm text-slate-400">/night</span>
                    </div>
                    <Link href={`/guest/property/${prop.id}`} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                      Book
                    </Link>
                  </div>
                  {prop.hostName && <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-400">Hosted by {prop.hostName}</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
