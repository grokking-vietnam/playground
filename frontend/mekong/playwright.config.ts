import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E test configuration for Mekong PWA
 *
 * Tests run against the production build served locally.
 * Start the server manually with `pnpm run serve` or let Playwright handle it.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: "./tests/e2e",
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use */
	reporter: [
		["list"],
		["html", { outputFolder: "playwright-report", open: "never" }],
	],
	/* Shared settings for all the projects below */
	use: {
		/* Base URL – override with BASE_URL env var in CI */
		baseURL: process.env.BASE_URL || "http://localhost:3000",
		/* Collect trace on failure */
		trace: "on-first-retry",
		/* Screenshot on failure */
		screenshot: "only-on-failure",
	},

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},
		/* iOS Safari – PWA install instructions */
		{
			name: "Mobile Safari (iPhone)",
			use: { ...devices["iPhone 13"] },
		},
		/* Android Chrome – native beforeinstallprompt */
		{
			name: "Mobile Chrome (Android)",
			use: { ...devices["Pixel 5"] },
		},
	],

	/* Start the production build server automatically when running tests */
	webServer: {
		command: "pnpm run serve",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
});
