import { test as base, expect } from '@playwright/test';
import { ApiClient } from '../api/ApiClient';
import { BookingApi } from '../api/BookingApi';
import type { Booking, CreatedBooking } from '../api/schemas/booking';
import { env } from '../config/env';
import { buildBooking } from '../data/factories/booking';
import { CartPage } from '../pages/saucedemo/CartPage';
import { CheckoutInformationPage } from '../pages/saucedemo/CheckoutInformationPage';
import { CheckoutOverviewPage } from '../pages/saucedemo/CheckoutOverviewPage';
import { InventoryPage } from '../pages/saucedemo/InventoryPage';
import { LoginPage } from '../pages/saucedemo/LoginPage';

export type Pages = {
  login: LoginPage;
  inventory: InventoryPage;
  cart: CartPage;
  checkoutInformation: CheckoutInformationPage;
  checkoutOverview: CheckoutOverviewPage;
};

/**
 * Creates bookings on demand and deletes every booking it created during
 * teardown, even when the test fails midway.
 */
export type BookingFactory = {
  create(overrides?: Partial<Booking>): Promise<CreatedBooking>;
};

type Fixtures = {
  pages: Pages;
  apiClient: ApiClient;
  bookingApi: BookingApi;
  bookings: BookingFactory;
};

export const test = base.extend<Fixtures>({
  pages: async ({ page }, use) => {
    await use({
      login: new LoginPage(page),
      inventory: new InventoryPage(page),
      cart: new CartPage(page),
      checkoutInformation: new CheckoutInformationPage(page),
      checkoutOverview: new CheckoutOverviewPage(page),
    });
  },

  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  bookingApi: async ({ apiClient }, use) => {
    await use(
      new BookingApi(apiClient, {
        username: env.BOOKER_USERNAME,
        password: env.BOOKER_PASSWORD,
      }),
    );
  },

  bookings: async ({ bookingApi }, use) => {
    const createdIds: number[] = [];

    const factory: BookingFactory = {
      create: async (overrides) => {
        const created = await bookingApi.create(buildBooking(overrides));
        createdIds.push(created.id);
        return created;
      },
    };

    await use(factory);

    for (const id of createdIds) {
      try {
        await bookingApi.remove(id);
      } catch {
        // Best-effort cleanup: the test may already have deleted the booking.
      }
    }
  },
});

export { expect };
