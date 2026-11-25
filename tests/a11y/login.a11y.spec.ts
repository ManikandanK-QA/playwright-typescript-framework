import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../src/fixtures';

// The scan covers the public sign-in page, so no session is needed.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Accessibility', { tag: ['@a11y', '@regression'] }, () => {
  test('sign-in page has no critical WCAG violations', async ({ page }, testInfo) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    await testInfo.attach('axe-violations.json', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });

    const critical = results.violations.filter((violation) => violation.impact === 'critical');
    expect(critical.map((violation) => violation.id)).toEqual([]);
  });
});
