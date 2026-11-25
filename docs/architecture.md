# Architecture

## Goals

1. Tests read as behaviour, not plumbing.
2. Each layer (UI, API, accessibility) owns its tools and is independently runnable.
3. Failures are diagnosable from CI output alone.
4. A new engineer can add a test without touching framework internals.

## Layer map

```
tests/                  executable scenarios (assertions live here)
  ui/*.spec.ts
  api/*.spec.ts
  a11y/*.spec.ts
  setup/auth.setup.ts

src/fixtures/           dependency injection for tests
src/pages/              page objects (intent + locators, no assertions)
src/components/         reusable UI fragments (header, cart badge)
src/api/                ApiClient, endpoint objects, Zod contracts
src/data/               typed static data + synthetic factories
src/config/             validated environment + shared paths
src/utils/              structured logger
```

Dependencies point downward only: tests → fixtures → pages/api → config/utils.
No page object imports a spec, and no API class knows about UI pages.

## Execution topology

Playwright projects split by **test layer**, not only by browser:

| Project | Runs | Browser | Auth |
| --- | --- | --- | --- |
| `setup` | `tests/setup/auth.setup.ts` | Chromium | none (creates session) |
| `chromium` | `tests/ui` | Chromium | `storageState` |
| `firefox` | `tests/ui` | Firefox | `storageState` |
| `webkit` | `tests/ui` | WebKit | `storageState` |
| `api` | `tests/api` | none | token per instance |
| `a11y` | `tests/a11y` | Chromium | signed out |

Consequences:

- REST tests execute **once**, not once per browser.
- Accessibility scans run on one engine to keep the signal/limit ratio sane.
- The UI matrix only installs the browser it needs in CI.

## Authentication flow

```
setup project
  └─ LoginPage.goto('/') → login() → assert /inventory.html
     └─ storageState('.auth/standard-user.json')

chromium/firefox/webkit projects
  └─ new context seeds cookies + localStorage from that file
     └─ specs start authenticated, no UI login per test

login.spec.ts
  └─ test.use({ storageState: { cookies: [], origins: [] } })
     └─ overrides the project state so the sign-in flow is genuinely tested
```

The file lives in `.auth/` and is git-ignored. It is a session credential:
treat it like a secret, which is why CI regenerates it instead of caching it.

## Fixture lifecycle

`src/fixtures/index.ts` extends the base test with four fixtures:

| Fixture | Scope | Responsibility |
| --- | --- | --- |
| `pages` | test | constructs the five page objects once per test |
| `apiClient` | test | wraps Playwright's `request` context, logs every call |
| `bookingApi` | test | endpoint object with lazy token acquisition |
| `bookings` | test | creates bookings on demand, deletes them in teardown |

`bookings` is the important one. A test asks for data, not for setup:

```ts
const { id, booking } = await bookings.create({ firstname: 'Manikandan' });
```

Teardown removes every id it created — including when the test fails halfway.
That removes the serial `describe.serial` lifecycle (where one failure poisons
the rest) and prevents orphaned records on the shared demo service.

## API design

`ApiClient` owns transport: base URL, JSON handling, duration logging.
`BookingApi` owns domain: paths, payloads, token header, response contracts.
Specs own assertions.

Contract validation uses Zod:

```ts
const body = await apiClient.parse(response, CreateBookingResponseSchema);
```

A drifted field or a string where a number is expected fails with the exact
path and message, before any assertion runs. This is the difference between
"expected true, received false" and "booking.totalprice: expected number,
received string".

## Error handling

- Missing configuration fails at import time with a field-by-field message.
- Non-2xx responses are returned to the test, which asserts the status it
  expects. Endpoint helpers that must succeed (create, typed get) throw with
  the status and body.
- Teardown cleanup is best-effort and silent; a 404 during cleanup means the
  test already deleted the record, which is not a failure.

## Extension points

| Need | Where |
| --- | --- |
| New page | `src/pages/saucedemo/`, extend `BasePage`, register in `Pages` |
| New API resource | `src/api/`, add endpoint class + Zod schema |
| New test data shape | `src/data/factories/` |
| New environment | `.env` only; no code change |
| New browser | `playwright.config.ts` project entry |

## Deliberate scope boundaries

Visual regression, network mocking and performance budgets are **not** in this
repository. They live in `advanced-playwright-labs`, so this framework stays a
focused, fast reference for layered functional automation.
