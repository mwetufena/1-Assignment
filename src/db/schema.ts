// ============================================================================
// Database Schema - Rental Accommodation System
// ============================================================================
// Maps the gRPC proto contract to PostgreSQL tables via Drizzle ORM.
// Enhanced with additional fields for performance and quality.
// ============================================================================

import { pgTable, uuid, text, varchar, integer, doublePrecision, timestamp, jsonb, index } from "drizzle-orm/pg-core";

// ============================================================================
// USERS TABLE
// Supports both HOST and GUEST roles as defined in the proto contract
// ============================================================================
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: varchar("role", { length: 20 }).notNull(), // "HOST" or "GUEST"
  phone: varchar("phone", { length: 50 }).notNull(),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("users_role_idx").on(table.role),
  index("users_email_idx").on(table.email),
]);

// ============================================================================
// PROPERTIES TABLE
// Core entity managed by Hosts; supports all proto-defined fields
// ============================================================================
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  hostId: uuid("host_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyName: varchar("property_name", { length: 500 }).notNull(),
  location: varchar("location", { length: 500 }).notNull(),
  propertyType: varchar("property_type", { length: 50 }).notNull(), // APARTMENT, HOUSE, VILLA, CABIN, COTTAGE, STUDIO
  pricePerNight: doublePrecision("price_per_night").notNull(),
  status: varchar("status", { length: 30 }).notNull().default("AVAILABLE"), // AVAILABLE, UNAVAILABLE, MAINTENANCE
  description: text("description"),
  maxGuests: integer("max_guests").notNull().default(1),
  amenities: jsonb("amenities").notNull().$type<string[]>().default([]),
  imageUrl: text("image_url"),
  averageRating: doublePrecision("average_rating").notNull().default(0),
  totalReviews: integer("total_reviews").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("properties_host_idx").on(table.hostId),
  index("properties_location_idx").on(table.location),
  index("properties_type_idx").on(table.propertyType),
  index("properties_status_idx").on(table.status),
  index("properties_price_idx").on(table.pricePerNight),
]);

// ============================================================================
// BOOKING CART TABLE
// Temporary storage for booking requests before confirmation
// Maps to the book_property -> confirm_booking flow in the proto contract
// ============================================================================
export const bookingCart = pgTable("booking_cart", {
  id: uuid("id").primaryKey().defaultRandom(),
  guestId: uuid("guest_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  checkIn: varchar("check_in", { length: 20 }).notNull(), // YYYY-MM-DD format
  checkOut: varchar("check_out", { length: 20 }).notNull(), // YYYY-MM-DD format
  numberOfGuests: integer("number_of_guests").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("booking_cart_guest_idx").on(table.guestId),
  index("booking_cart_property_idx").on(table.propertyId),
]);

// ============================================================================
// BOOKINGS TABLE
// Confirmed bookings with full details including total cost calculation
// Maps to the confirm_booking response in the proto contract
// ============================================================================
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  guestId: uuid("guest_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  checkIn: varchar("check_in", { length: 20 }).notNull(),
  checkOut: varchar("check_out", { length: 20 }).notNull(),
  numberOfGuests: integer("number_of_guests").notNull().default(1),
  numberOfNights: integer("number_of_nights").notNull(),
  pricePerNight: doublePrecision("price_per_night").notNull(),
  totalCost: doublePrecision("total_cost").notNull(),
  status: varchar("status", { length: 30 }).notNull().default("CONFIRMED"), // PENDING, CONFIRMED, CANCELLED, COMPLETED
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("bookings_guest_idx").on(table.guestId),
  index("bookings_property_idx").on(table.propertyId),
  index("bookings_status_idx").on(table.status),
  index("bookings_dates_idx").on(table.propertyId, table.checkIn, table.checkOut),
]);
