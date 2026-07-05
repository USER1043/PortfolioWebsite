import test from "node:test";
import assert from "node:assert/strict";
import {
  createRateLimiter,
  createBrowserRateLimiter,
} from "../src/lib/rateLimit.mjs";

test("rate limiter blocks requests after the configured threshold", async () => {
  const limiter = createRateLimiter({ windowMs: 100, maxRequests: 2 });

  await limiter("github:readme");
  await limiter("github:readme");

  const startedAt = Date.now();
  await limiter("github:readme");
  const elapsed = Date.now() - startedAt;

  assert.ok(elapsed >= 80, `expected a delay, but got ${elapsed}ms`);
});

test("browser rate limiter blocks repeated submissions for the same browser", async () => {
  const store = new Map();
  const localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };

  Object.defineProperty(globalThis, "localStorage", {
    value: localStorage,
    configurable: true,
  });

  const limiter = createBrowserRateLimiter({
    windowMs: 15 * 60_000,
    maxRequests: 3,
    keyPrefix: "contact-form",
  });

  assert.equal(await limiter("person@example.com"), true);
  assert.equal(await limiter("person@example.com"), true);
  assert.equal(await limiter("person@example.com"), true);
  assert.equal(await limiter("person@example.com"), false);
});
