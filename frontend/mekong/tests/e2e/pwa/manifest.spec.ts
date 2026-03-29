import { expect, test } from "@playwright/test";

/**
 * PWA Manifest tests
 *
 * Verify the web app manifest is correctly served and contains all
 * required fields for a valid PWA (installability, icons, display mode).
 */

test.describe("PWA Manifest", () => {
	test("manifest.webmanifest is served with correct content-type", async ({
		request,
	}) => {
		const response = await request.get("/manifest.webmanifest");
		expect(response.ok()).toBeTruthy();

		const contentType = response.headers()["content-type"];
		// Accepts both application/manifest+json and application/json
		expect(contentType).toMatch(/json/);
	});

	test("manifest contains required PWA fields", async ({ request }) => {
		const response = await request.get("/manifest.webmanifest");
		const manifest = await response.json();

		expect(manifest.name).toBe("Mekong - Composable Data Workspace");
		expect(manifest.short_name).toBe("Mekong");
		expect(manifest.start_url).toBe("/");
		expect(manifest.display).toBe("standalone");
		expect(manifest.theme_color).toBe("#0f172a");
		expect(manifest.background_color).toBe("#ffffff");
	});

	test("manifest contains icons at required sizes", async ({ request }) => {
		const response = await request.get("/manifest.webmanifest");
		const manifest = await response.json();

		const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
		// Minimum required for installability
		expect(sizes).toContain("192x192");
		expect(sizes).toContain("512x512");
	});

	test("manifest icons are reachable", async ({ request }) => {
		const response = await request.get("/manifest.webmanifest");
		const manifest = await response.json();

		for (const icon of manifest.icons) {
			const iconResponse = await request.get(icon.src);
			expect(
				iconResponse.ok(),
				`Icon ${icon.src} should be reachable`,
			).toBeTruthy();
		}
	});

	test("HTML page links to the manifest", async ({ page }) => {
		await page.goto("/");
		const manifestLink = page.locator('link[rel="manifest"]');
		await expect(manifestLink).toHaveAttribute("href", "/manifest.webmanifest");
	});

	test("HTML page has iOS PWA meta tags", async ({ page }) => {
		await page.goto("/");

		const mobileWebAppCapable = page.locator(
			'meta[name="apple-mobile-web-app-capable"]',
		);
		await expect(mobileWebAppCapable).toHaveAttribute("content", "yes");

		const appTitle = page.locator('meta[name="apple-mobile-web-app-title"]');
		await expect(appTitle).toHaveAttribute("content", "Mekong");

		const statusBarStyle = page.locator(
			'meta[name="apple-mobile-web-app-status-bar-style"]',
		);
		await expect(statusBarStyle).toHaveCount(1);
	});

	test("HTML page has theme-color meta tag", async ({ page }) => {
		await page.goto("/");
		const themeColor = page.locator('meta[name="theme-color"]');
		await expect(themeColor).toHaveAttribute("content", "#0f172a");
	});

	test("HTML page has apple-touch-icon", async ({ page }) => {
		await page.goto("/");
		const appleIcon = page.locator('link[rel="apple-touch-icon"]').first();
		await expect(appleIcon).toHaveAttribute("href", "/icons/icon-180.png");
	});
});
