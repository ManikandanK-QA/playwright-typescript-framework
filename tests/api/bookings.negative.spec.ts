import { test, expect } from '../../src/fixtures';

test.describe('Booking API negative paths', { tag: ['@api', '@regression'] }, () => {
  test('returns 404 for an unknown booking id', async ({ bookingApi }) => {
    const response = await bookingApi.getResponse(9_999_999);
    expect(response.status()).toBe(404);
  });

  test('rejects a full update without a token', async ({ apiClient, bookings }) => {
    const { id, booking } = await bookings.create();

    const response = await apiClient.put(`/booking/${id}`, { data: booking });
    expect(response.status()).toBe(403);
  });

  test('rejects a delete without a token', async ({ apiClient, bookings }) => {
    const { id } = await bookings.create();

    const response = await apiClient.delete(`/booking/${id}`);
    expect(response.status()).toBe(403);
  });

  test('rejects a create payload with missing required fields', async ({ apiClient }) => {
    const response = await apiClient.post('/booking', {
      data: { firstname: 'Incomplete' },
    });

    expect(response.status()).toBe(500);
  });
});
