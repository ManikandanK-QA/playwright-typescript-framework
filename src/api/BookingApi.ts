import type { APIResponse } from '@playwright/test';
import type { ApiClient } from './ApiClient';
import {
  AuthResponseSchema,
  BookingListSchema,
  BookingSchema,
  CreateBookingResponseSchema,
  type Booking,
  type CreatedBooking,
} from './schemas/booking';

export type BookerCredentials = {
  username: string;
  password: string;
};

/**
 * Endpoint object for Restful Booker.
 *
 * Responsibilities kept here: paths, payload shapes, token handling and
 * response contracts. Assertions stay in the specs.
 */
export class BookingApi {
  private token: string | null = null;

  constructor(
    private readonly client: ApiClient,
    private readonly credentials: BookerCredentials,
  ) {}

  async authenticate(): Promise<string> {
    if (this.token) {
      return this.token;
    }

    const response = await this.client.post('/auth', { data: this.credentials });
    const body = await this.client.parse(response, AuthResponseSchema);
    this.token = body.token;
    return body.token;
  }

  async create(payload: Booking): Promise<CreatedBooking> {
    const response = await this.client.post('/booking', { data: payload });

    if (response.status() !== 200) {
      throw new Error(`POST /booking failed (${response.status()}): ${await response.text()}`);
    }

    const body = await this.client.parse(response, CreateBookingResponseSchema);
    return { id: body.bookingid, booking: body.booking };
  }

  getResponse(id: number): Promise<APIResponse> {
    return this.client.get(`/booking/${id}`);
  }

  async getBooking(id: number): Promise<Booking> {
    const response = await this.getResponse(id);

    if (response.status() !== 200) {
      throw new Error(`GET /booking/${id} failed (${response.status()})`);
    }

    return this.client.parse(response, BookingSchema);
  }

  async list(params?: Record<string, string>): Promise<number[]> {
    const response = await this.client.get('/booking', { params });
    const body = await this.client.parse(response, BookingListSchema);
    return body.map((entry) => entry.bookingid);
  }

  async replace(id: number, payload: Booking): Promise<APIResponse> {
    return this.client.put(`/booking/${id}`, {
      data: payload,
      headers: await this.authHeaders(),
    });
  }

  async partialUpdate(id: number, payload: Partial<Booking>): Promise<APIResponse> {
    return this.client.patch(`/booking/${id}`, {
      data: payload,
      headers: await this.authHeaders(),
    });
  }

  async remove(id: number): Promise<APIResponse> {
    return this.client.delete(`/booking/${id}`, {
      headers: await this.authHeaders(),
    });
  }

  private async authHeaders(): Promise<Record<string, string>> {
    const token = this.token ?? (await this.authenticate());
    return { Cookie: `token=${token}` };
  }
}
