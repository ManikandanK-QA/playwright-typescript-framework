import { AuthFailureSchema } from '../../src/api/schemas/booking';
import { test, expect } from '../../src/fixtures';

test.describe('Authentication API', { tag: ['@api', '@regression'] }, () => {
  test('issues a token for valid credentials', { tag: '@smoke' }, async ({ bookingApi }) => {
    const token = await bookingApi.authenticate();

    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(5);
  });

  test('rejects invalid credentials without issuing a token', async ({ apiClient }) => {
    const response = await apiClient.post('/auth', {
      data: { username: 'invalid-user', password: 'invalid-password' },
    });

    // Restful Booker signals auth failure with HTTP 200 and a reason body.
    expect(response.status()).toBe(200);

    const body = await apiClient.parse(response, AuthFailureSchema);
    expect(body.reason).toBe('Bad credentials');
  });
});
