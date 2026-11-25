/**
 * Shared, git-ignored paths. Keeping them here avoids magic strings drifting
 * between the Playwright config, the auth setup project and the fixtures.
 */
export const AUTH_DIR = '.auth';
export const AUTH_FILE = `${AUTH_DIR}/standard-user.json`;
