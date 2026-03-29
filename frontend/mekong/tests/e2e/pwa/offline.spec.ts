import { expect, test } from "@playwright/test";

/**
 * Offline Support tests
 *
 * Verify the service worker caches the app shell so it can be served
 * when the network is unavailable.
 *
 * These tests simulate offline conditions using Playwright's network
 * interception and the service worker cache.
 */

test.describe("Offline Support", () => {
	test("app shell is available from cache when offline", async ({
		page,
		browserName,
	}) => {
		test.skip(
			browserName === "webkit",
			"WebKit service worker cache is not accessible in Playwright tests",
		);

		// First visit to prime the cache
		await page.goto("/");

		// Wait for service worker to be active
		await page.evaluate(async () => {
			await navigator.serviceWorker.ready;
		});

		// Go offline
		await page.context().setOffline(true);

		// Reload – should serve from SW cache
		const response = await page.goto("/");

		// Page should load from cache (2xx or from cache = no network error)
		expect(response?.status()).toBeLessThan(400);

		// Go back online
		await page.context().setOffline(false);
	});

	test("manifest.webmanifest is cached by service worker", async ({
		page,
		browserName,
	}) => {
		test.skip(
			browserName === "webkit",
			"WebKit service worker cache is not accessible in Playwright tests",
		);

		// Visit to prime the cache
		await page.goto("/");
		await page.evaluate(async () => {
			await navigator.serviceWorker.ready;
		});

		// Check the cache contains the manifest
		const isCached = await page.evaluate(async () => {
			const keys = await caches.keys();
			if (keys.length === 0) return false;
			const cache = await caches.open(keys[0]);
			const match = await cache.match("/manifest.webmanifest");
			return !!match;
		});

		expect(isCached).toBe(true);
	});

	test("API requests return offline error response when network is unavailable", async ({
		page,
		browserName,
	}) => {
		test.skip(
			browserName === "webkit",
			"WebKit service worker cache is not accessible in Playwright tests",
		);

		await page.goto("/");
		await page.evaluate(async () => {
			await navigator.serviceWorker.ready;
		});

		// Go offline
		await page.context().setOffline(true);

		// API request should get the SW offline JSON response
		const response = await page.evaluate(async () => {
			try {
				const res = await fetch("/api/query/execute", { method: "POST" });
				return { status: res.status, ok: res.ok };
			} catch {
				return { status: 0, ok: false };
			}
		});

		expect(response.status).toBe(503);

		await page.context().setOffline(false);
	});

	test("icons are served correctly", async ({ request }) => {
		const iconSizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

		for (const size of iconSizes) {
			const response = await request.get(`/icons/icon-${size}.png`);
			expect(response.ok(), `icon-${size}.png should be served`).toBeTruthy();
			expect(response.headers()["content-type"]).toMatch(/image\/png/);
		}
	});
});
