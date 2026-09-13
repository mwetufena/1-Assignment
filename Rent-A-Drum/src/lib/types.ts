// ============================================================================
// TypeScript Type Definitions - Rental Accommodation System
// Mirrors the .proto contract for type-safe frontend-backend communication
// ============================================================================

// --- Enums ---
export type UserRole = "HOST" | "GUEST";
export type PropertyType = "APARTMENT" | "HOUSE" | "VILLA" | "CABIN" | "COTTAGE" | "STUDIO";
export type PropertyStatus = "AVAILABLE" | "UNAVAILABLE" | "MAINTENANCE";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

// --- User Types ---
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address?: string;
}

// --- Property Types ---
export interface Property {
  id: string;
  hostId: string;
  propertyName: string;
  location: string;
  propertyType: PropertyType;
  pricePerNight: number;
  status: PropertyStatus;
  description: string | null;
  maxGuests: number;
  amenities: string[];
  imageUrl: string | null;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddPropertyInput {
  hostId: string;
  propertyName: string;
  location: string;
  propertyType: PropertyType;
  pricePerNight: number;
  status: PropertyStatus;
  description?: string;
  maxGuests: number;
  amenities: string[];
  imageUrl?: string;
}

export interface UpdatePropertyInput {
  propertyId: string;
  hostId: string;
  propertyName?: string;
  location?: string;
  propertyType?: PropertyType;
  pricePerNight?: number;
  status?: PropertyStatus;
  description?: string;
  maxGuests?: number;
  imageUrl?: string;
}

export interface PropertyFilter {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  maxGuests?: number;
}

// --- Booking Cart Types ---
export interface BookingCartItem {
  id: string;
  guestId: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  propertyName: string;
  propertyLocation: string;
  pricePerNight: number;
  estimatedCost: number;
  createdAt: Date;
}

export interface AddToCartInput {
  guestId: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
}

// --- Booking Types ---
export interface Booking {
  id: string;
  guestId: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  numberOfNights: number;
  pricePerNight: number;
  totalCost: number;
  status: BookingStatus;
  propertyName: string;
  propertyLocation: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfirmBookingResult {
  success: boolean;
  booking: Booking | null;
  message: string;
}

// --- API Response Types ---
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}

// --- Dashboard Stats ---
export interface DashboardStats {
  totalUsers: number;
  totalHosts: number;
  totalGuests: number;
  totalProperties: number;
  availableProperties: number;
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
}

// --- Property with host info ---
export interface PropertyWithHost extends Property {
  hostName: string;
  hostEmail: string;
}

// --- Booking with full details ---
export interface BookingWithDetails extends Booking {
  guestName: string;
  hostName: string;
}
