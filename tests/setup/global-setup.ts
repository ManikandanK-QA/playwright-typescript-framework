import { rmSync } from 'node:fs';

/**
 * Allure's Playwright reporter appends to its results directory. Without a
 * clean start, local runs accumulate stale results and the generated report
 * shows duplicate or long-gone tests. CI starts from a fresh checkout, but
 * developers do not.
 */
export default function globalSetup(): void {
  rmSync('allure-results', { recursive: true, force: true });
}
