import { expect, test } from "@playwright/test";

/**
 * Install Prompt tests
 *
 * Verify the PWA install banner behaviour:
 * - Hidden by default (no beforeinstallprompt event fired)
 * - Visible when a beforeinstallprompt event is dispatched
 * - Dismissed when the user clicks the × button
 * - Shows iOS instructions when running on an iPhone user-agent
 */

test.describe("Install Prompt", () => {
	test("install banner is not visible by default", async ({ page }) => {
		await page.goto("/");

		// The banner should not be shown unless beforeinstallprompt fires
		const banner = page.getByText("Install Mekong");
		await expect(banner).not.toBeVisible();
	});

	test("install banner appears when beforeinstallprompt is dispatched", async ({
		page,
	}) => {
		await page.goto("/");

		// Simulate the beforeinstallprompt event
		await page.evaluate(() => {
			const event = new Event("beforeinstallprompt", { bubbles: true });
			// Attach required properties so the component can call prompt()
			Object.assign(event, {
				prompt: () => Promise.resolve(),
				userChoice: Promise.resolve({ outcome: "dismissed" }),
			});
			window.dispatchEvent(event);
		});

		const banner = page.getByText("Install Mekong");
		await expect(banner).toBeVisible();
	});

	test("install banner shows description text", async ({ page }) => {
		await page.goto("/");

		await page.evaluate(() => {
			const event = new Event("beforeinstallprompt", { bubbles: true });
			Object.assign(event, {
				prompt: () => Promise.resolve(),
				userChoice: Promise.resolve({ outcome: "dismissed" }),
			});
			window.dispatchEvent(event);
		});

		await expect(
			page.getByText(
				"Add Mekong to your home screen for a faster, app-like experience.",
			),
		).toBeVisible();
	});

	test("install banner has an Install button", async ({ page }) => {
		await page.goto("/");

		await page.evaluate(() => {
			const event = new Event("beforeinstallprompt", { bubbles: true });
			Object.assign(event, {
				prompt: () => Promise.resolve(),
				userChoice: Promise.resolve({ outcome: "dismissed" }),
			});
			window.dispatchEvent(event);
		});

		const installButton = page.getByRole("button", { name: "Install" });
		await expect(installButton).toBeVisible();
	});

	test("install banner is dismissed when × button is clicked", async ({
		page,
	}) => {
		await page.goto("/");

		await page.evaluate(() => {
			const event = new Event("beforeinstallprompt", { bubbles: true });
			Object.assign(event, {
				prompt: () => Promise.resolve(),
				userChoice: Promise.resolve({ outcome: "dismissed" }),
			});
			window.dispatchEvent(event);
		});

		await expect(page.getByText("Install Mekong")).toBeVisible();

		// Click the dismiss button
		await page.getByRole("button", { name: "Dismiss" }).click();

		await expect(page.getByText("Install Mekong")).not.toBeVisible();
	});

	test("iOS Safari shows Add to Home Screen instructions", async ({
		page,
		browserName,
	}) => {
		test.skip(
			browserName !== "webkit",
			"This test targets iOS Safari user-agent",
		);

		// Override user-agent to simulate iPhone
		await page.setExtraHTTPHeaders({
			"User-Agent":
				"Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
		});

		await page.goto("/");

		// Re-navigate with the UA override in effect
		await page.reload();

		// Should show iOS-specific instructions (no Install button, just text)
		await expect(page.getByText("Add to Home Screen")).toBeVisible();
	});
});
