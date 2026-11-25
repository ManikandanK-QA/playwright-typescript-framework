import { faker } from '@faker-js/faker';
import type { Booking } from '../../api/schemas/booking';

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Builds a valid booking payload with synthetic data.
 *
 * Tests pass explicit overrides when the value matters and let the factory
 * supply the rest, so payloads stay realistic without shared mutable fixtures.
 */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const checkin = faker.date.soon({ days: 30 });
  const checkout = faker.date.soon({ days: 5, refDate: checkin });

  const base: Booking = {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 50, max: 500 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: {
      checkin: toIsoDate(checkin),
      checkout: toIsoDate(checkout),
    },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Late checkout', 'Extra pillows']),
  };

  return {
    ...base,
    ...overrides,
    bookingdates: {
      ...base.bookingdates,
      ...overrides.bookingdates,
    },
  };
}
