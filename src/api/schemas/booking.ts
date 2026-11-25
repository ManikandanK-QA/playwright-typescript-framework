import { z } from 'zod';

/** Contract for a booking as returned by Restful Booker. */
export const BookingDatesSchema = z.object({
  checkin: z.string().min(1),
  checkout: z.string().min(1),
});

export const BookingSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: BookingDatesSchema,
  additionalneeds: z.string().optional(),
});

export const BookingIdSchema = z.object({
  bookingid: z.number().int().positive(),
});

export const CreateBookingResponseSchema = BookingIdSchema.extend({
  booking: BookingSchema,
});

export const BookingListSchema = z.array(BookingIdSchema);

export const AuthResponseSchema = z.object({
  token: z.string().min(1),
});

/** Restful Booker answers invalid credentials with HTTP 200 and a reason body. */
export const AuthFailureSchema = z.object({
  reason: z.string(),
});

export type Booking = z.infer<typeof BookingSchema>;
export type BookingDates = z.infer<typeof BookingDatesSchema>;
export type CreatedBooking = {
  id: number;
  booking: Booking;
};
