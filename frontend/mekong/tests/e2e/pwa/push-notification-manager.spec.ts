import { expect, test } from "@playwright/test";

/**
 * Push Notification Manager tests
 *
 * Verify the bell icon button in the header:
 * - Rendered in the page header
 * - Shows the correct aria-label and tooltip
 * - Reacts correctly when push is unsupported (hidden)
 * - Shows "denied" state title when permission is denied
 */

test.describe("Push Notification Manager", () => {
	test("push notification button is present in the header", async ({
		page,
	}) => {
		await page.goto("/");

		// The button is rendered when PushManager is supported
		// We look for either the subscribe or unsubscribe label
		const bellButton = page
			.getByRole("button", { name: /notifications/i })
			.first();
		await expect(bellButton).toBeVisible();
	});

	test("push notification button has correct initial aria-label", async ({
		page,
	}) => {
		await page.goto("/");

		// When not yet subscribed the button should say "Enable notifications"
		const enableButton = page.getByRole("button", {
			name: "Enable notifications",
		});
		await expect(enableButton).toBeVisible();
	});

	test("push notification button has a tooltip", async ({ page }) => {
		await page.goto("/");

		const bellButton = page.getByRole("button", {
			name: "Enable notifications",
		});
		// Verify the title attribute is present (used as tooltip)
		const title = await bellButton.getAttribute("title");
		expect(title).toBeTruthy();
		expect(title).toMatch(/notification/i);
	});

	test("push notification button is disabled when permission is denied", async ({
		page,
		browserName,
	}) => {
		test.skip(
			browserName === "webkit",
			"WebKit blocks programmatic notification permission mocking",
		);

		// Spoof a denied Notification.permission
		await page.addInitScript(() => {
			Object.defineProperty(Notification, "permission", {
				get: () => "denied",
				configurable: true,
			});
		});

		await page.goto("/");

		const bellButton = page
			.getByRole("button", {
				name: /notifications/i,
			})
			.first();

		await expect(bellButton).toBeDisabled();
	});

	test("push notification button shows correct title when permission is denied", async ({
		page,
		browserName,
	}) => {
		test.skip(
			browserName === "webkit",
			"WebKit blocks programmatic notification permission mocking",
		);

		await page.addInitScript(() => {
			Object.defineProperty(Notification, "permission", {
				get: () => "denied",
				configurable: true,
			});
		});

		await page.goto("/");

		const bellButton = page
			.getByRole("button", {
				name: /notifications/i,
			})
			.first();
		const title = await bellButton.getAttribute("title");
		expect(title).toContain("blocked");
	});

	test("push notification button is hidden when PushManager is unsupported", async ({
		page,
	}) => {
		// Remove PushManager to simulate an unsupported browser
		await page.addInitScript(() => {
			// biome-ignore lint/suspicious/noExplicitAny: needed to simulate unsupported browser
			(window as any).PushManager = undefined;
		});

		await page.goto("/");

		// Button should not appear when PushManager is missing and iOS hint is false
		const bellButton = page.getByRole("button", {
			name: /notifications/i,
		});
		await expect(bellButton).toHaveCount(0);
	});

	test("clicking enable notifications triggers a permission request", async ({
		page,
		browserName,
	}) => {
		test.skip(
			browserName === "webkit",
			"WebKit handles permission dialogs differently",
		);

		// Grant permission automatically to avoid dialog blocking
		await page.context().grantPermissions(["notifications"]);

		// Mock pushManager.subscribe to avoid actual subscription
		await page.addInitScript(() => {
			const fakeSub = {
				endpoint: "https://push.example.com/sub",
				expirationTime: null,
				keys: {},
				getKey: () => null,
				unsubscribe: async () => true,
				toJSON: () => ({
					endpoint: "https://push.example.com/sub",
					expirationTime: null,
					keys: {},
				}),
			};
			const fakeRegistration = {
				pushManager: {
					getSubscription: async () => null,
					subscribe: async () => fakeSub,
				},
				scope: "/",
			};
			// Override getRegistration and ready
			Object.defineProperty(navigator.serviceWorker, "ready", {
				get: () => Promise.resolve(fakeRegistration),
				configurable: true,
			});
			const originalGetReg = navigator.serviceWorker.getRegistration.bind(
				navigator.serviceWorker,
			);
			navigator.serviceWorker.getRegistration = async () =>
				fakeRegistration as unknown as ServiceWorkerRegistration;
		});

		// Mock the backend subscription endpoint
		await page.route("/api/push/subscribe", (route) => {
			route.fulfill({ status: 201, body: JSON.stringify({ message: "ok" }) });
		});

		await page.goto("/");

		await page.getByRole("button", { name: "Enable notifications" }).click();

		// After subscribing the button label should change
		await expect(
			page.getByRole("button", { name: "Disable notifications" }),
		).toBeVisible({ timeout: 5000 });
	});
});
