import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { ZodType } from 'zod';
import { logger, type Logger } from '../utils/logger';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestOptions = {
  data?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
};

/**
 * Thin, typed wrapper around Playwright's APIRequestContext.
 *
 * It centralises request logging and contract parsing so endpoint classes and
 * tests never repeat status handling, JSON casting or response validation.
 */
export class ApiClient {
  private readonly log: Logger;

  constructor(
    private readonly context: APIRequestContext,
    log: Logger = logger.child('api'),
  ) {
    this.log = log;
  }

  get(path: string, options?: RequestOptions): Promise<APIResponse> {
    return this.send('GET', path, options);
  }

  post(path: string, options?: RequestOptions): Promise<APIResponse> {
    return this.send('POST', path, options);
  }

  put(path: string, options?: RequestOptions): Promise<APIResponse> {
    return this.send('PUT', path, options);
  }

  patch(path: string, options?: RequestOptions): Promise<APIResponse> {
    return this.send('PATCH', path, options);
  }

  delete(path: string, options?: RequestOptions): Promise<APIResponse> {
    return this.send('DELETE', path, options);
  }

  /**
   * Parses a response body against a Zod schema and fails with the exact
   * contract violations, instead of letting a wrong shape leak into assertions.
   */
  async parse<T>(response: APIResponse, schema: ZodType<T>): Promise<T> {
    const payload: unknown = await response.json();
    const result = schema.safeParse(payload);

    if (!result.success) {
      const issues = JSON.stringify(result.error.issues, null, 2);
      throw new Error(
        `Response contract violation for ${response.url()} (status ${response.status()}):\n${issues}`,
      );
    }

    return result.data;
  }

  private async send(
    method: HttpMethod,
    path: string,
    options?: RequestOptions,
  ): Promise<APIResponse> {
    const startedAt = Date.now();
    const response = await this.context.fetch(path, {
      method,
      data: options?.data,
      headers: options?.headers,
      params: options?.params,
    });

    this.log.debug(`${method} ${path} -> ${response.status()}`, {
      durationMs: Date.now() - startedAt,
    });

    return response;
  }
}
