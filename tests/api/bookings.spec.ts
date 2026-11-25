import type { Booking } from '../../src/api/schemas/booking';
import { test, expect } from '../../src/fixtures';

test.describe('Booking lifecycle', { tag: ['@api', '@regression'] }, () => {
  test(
    'creates a booking and reads it back by id',
    { tag: '@smoke' },
    async ({ bookings, bookingApi }) => {
      const { id, booking } = await bookings.create();

      expect(id).toBeGreaterThan(0);

      const fetched = await bookingApi.getBooking(id);
      expect(fetched).toEqual(booking);
    },
  );

  test('filters bookings by customer name', async ({ bookings, bookingApi }) => {
    const { id } = await bookings.create({
      firstname: 'Manikandan',
      lastname: 'Kandasamy',
    });

    const ids = await bookingApi.list({
      firstname: 'Manikandan',
      lastname: 'Kandasamy',
    });

    expect(ids).toContain(id);
  });

  test('replaces a booking with a full update', async ({ bookings, bookingApi }) => {
    const { id, booking } = await bookings.create();

    const updated: Booking = {
      ...booking,
      firstname: 'Updated',
      totalprice: booking.totalprice + 25,
      depositpaid: !booking.depositpaid,
    };

    const response = await bookingApi.replace(id, updated);
    expect(response.status()).toBe(200);

    const persisted = await bookingApi.getBooking(id);
    expect(persisted).toEqual(updated);
  });

  test('applies a partial update', async ({ bookings, bookingApi }) => {
    const { id, booking } = await bookings.create();

    const response = await bookingApi.partialUpdate(id, { additionalneeds: 'Airport transfer' });
    expect(response.status()).toBe(200);

    const persisted = await bookingApi.getBooking(id);
    expect(persisted.firstname).toBe(booking.firstname);
    expect(persisted.additionalneeds).toBe('Airport transfer');
  });

  test('deletes a booking and then reports it missing', async ({ bookings, bookingApi }) => {
    const { id } = await bookings.create();

    const deleted = await bookingApi.remove(id);
    expect(deleted.status()).toBe(201);

    const afterDelete = await bookingApi.getResponse(id);
    expect(afterDelete.status()).toBe(404);
  });
});
