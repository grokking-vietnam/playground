import { expect, test } from "@playwright/test";

/**
 * Service Worker tests
 *
 * Verify that the service worker script is served correctly and that the
 * browser registers it as a service worker on the page.
 */

test.describe("Service Worker", () => {
	test("sw.js is served from the root path", async ({ request }) => {
		const response = await request.get("/sw.js");
		expect(response.ok()).toBeTruthy();

		const contentType = response.headers()["content-type"];
		expect(contentType).toMatch(/javascript/);
	});

	test("sw.js contains expected event listeners", async ({ request }) => {
		const response = await request.get("/sw.js");
		const body = await response.text();

		expect(body).toContain("install");
		expect(body).toContain("activate");
		expect(body).toContain("fetch");
		expect(body).toContain("push");
		expect(body).toContain("notificationclick");
	});

	test("sw.js defines a cache name", async ({ request }) => {
		const response = await request.get("/sw.js");
		const body = await response.text();
		// Should define CACHE_NAME
		expect(body).toContain("mekong-");
	});

	test("service worker is registered on the page", async ({
		page,
		browserName,
	}) => {
		// Service workers require a secure context.
		// In Playwright, localhost is treated as secure.
		test.skip(
			browserName === "webkit",
			"WebKit service worker registration requires HTTPS in tests",
		);

		await page.goto("/");

		// Wait for SW registration to complete
		const swRegistered = await page.evaluate(async () => {
			if (!("serviceWorker" in navigator)) return false;
			try {
				const reg = await navigator.serviceWorker.getRegistration("/");
				return !!reg;
			} catch {
				return false;
			}
		});

		expect(swRegistered).toBe(true);
	});

	test("service worker scope is set to root", async ({ page, browserName }) => {
		test.skip(
			browserName === "webkit",
			"WebKit service worker registration requires HTTPS in tests",
		);

		await page.goto("/");

		const swScope = await page.evaluate(async () => {
			if (!("serviceWorker" in navigator)) return null;
			try {
				const reg = await navigator.serviceWorker.getRegistration("/");
				return reg?.scope ?? null;
			} catch {
				return null;
			}
		});

		// Scope should end with "/"
		expect(swScope).toMatch(/\/$/);
	});
});
