// ============================================================================
// Property Card Component
// ============================================================================

"use client";

import Link from "next/link";

interface PropertyCardProps {
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
    imageUrl: string | null;
    averageRating: number;
    totalReviews: number;
    hostName?: string;
    hostEmail?: string;
  };
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const typeIcons: Record<string, string> = {
  APARTMENT: "🏢",
  HOUSE: "🏡",
  VILLA: "🏰",
  CABIN: "🛖",
  COTTAGE: "🏘️",
  STUDIO: "🎛️",
};

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  UNAVAILABLE: "bg-red-100 text-red-800",
  MAINTENANCE: "bg-yellow-100 text-yellow-800",
};

export default function PropertyCard({ property, showActions, onEdit, onDelete }: PropertyCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Image / Placeholder */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
        {property.imageUrl ? (
          <img src={property.imageUrl} alt={property.propertyName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-6xl">{typeIcons[property.propertyType] || "🏠"}</span>
          </div>
        )}
        {/* Status Badge */}
        <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${statusColors[property.status] || "bg-slate-100 text-slate-800"}`}>
          {property.status}
        </span>
        {/* Type Badge */}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur-sm">
          {typeIcons[property.propertyType] || ""} {property.propertyType}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900 leading-tight">{property.propertyName}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <span>📍</span> {property.location}
        </p>

        {property.description && (
          <p className="mt-2 text-sm text-slate-600 line-clamp-2">{property.description}</p>
        )}

        {/* Details */}
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <span>👤</span> {property.maxGuests} guests
          </span>
          {property.averageRating > 0 && (
            <span className="flex items-center gap-1">
              <span>⭐</span> {property.averageRating.toFixed(1)} ({property.totalReviews})
            </span>
          )}
        </div>

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {property.amenities.slice(0, 4).map((amenity) => (
              <span key={amenity} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {amenity}
              </span>
            ))}
            {property.amenities.length > 4 && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                +{property.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Price and Actions */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-slate-900">${property.pricePerNight}</span>
            <span className="text-sm text-slate-500">/night</span>
          </div>
          <div className="flex gap-2">
            {property.status === "AVAILABLE" && (
              <Link
                href={`/guest/property/${property.id}`}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Book
              </Link>
            )}
            {showActions && (
              <>
                {onEdit && (
                  <button
                    onClick={() => onEdit(property.id)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    ✏️ Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(property.id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    🗑️
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Host info */}
        {property.hostName && (
          <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
            Hosted by {property.hostName}
          </p>
        )}
      </div>
    </div>
  );
}
