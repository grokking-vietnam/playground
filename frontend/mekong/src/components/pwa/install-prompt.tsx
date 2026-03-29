import { Button } from "@/components/ui/button";
import { isInstalledPWA } from "@/lib/pwa";
import { Download, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWA install banner
 *
 * - On Android/Chrome: shows the native install prompt via the
 *   `beforeinstallprompt` event.
 * - On iOS Safari: shows manual instructions ("Add to Home Screen")
 *   because iOS doesn't support the `beforeinstallprompt` event.
 *
 * The banner is hidden once the app is already installed (standalone mode).
 */
export function InstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [showIOSInstructions, setShowIOSInstructions] = useState(false);
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		// Do not show the banner when already running in standalone mode
		if (isInstalledPWA()) return;

		const isIOS =
			/iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
		const isInStandaloneMode =
			("standalone" in window.navigator &&
				(window.navigator as { standalone?: boolean }).standalone) ||
			window.matchMedia("(display-mode: standalone)").matches;

		if (isIOS && !isInStandaloneMode) {
			setShowIOSInstructions(true);
			return;
		}

		const handler = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
		};

		window.addEventListener("beforeinstallprompt", handler);
		return () => window.removeEventListener("beforeinstallprompt", handler);
	}, []);

	const handleInstall = async () => {
		if (!deferredPrompt) return;
		await deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") {
			setDeferredPrompt(null);
		}
	};

	if (dismissed) return null;
	if (!deferredPrompt && !showIOSInstructions) return null;

	return (
		<div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-border bg-background p-4 shadow-xl">
			<div className="flex items-start gap-3">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
					<Download className="h-5 w-5" />
				</div>

				<div className="flex-1 min-w-0">
					<p className="font-semibold text-sm leading-tight">Install Mekong</p>

					{showIOSInstructions ? (
						<p className="mt-1 text-xs text-muted-foreground leading-relaxed">
							Tap the <strong>Share</strong> icon in Safari, then choose{" "}
							<strong>Add to Home Screen</strong> to install this app.
						</p>
					) : (
						<p className="mt-1 text-xs text-muted-foreground">
							Add Mekong to your home screen for a faster, app-like experience.
						</p>
					)}

					{!showIOSInstructions && (
						<Button
							size="sm"
							className="mt-3 h-7 text-xs"
							onClick={handleInstall}
						>
							Install
						</Button>
					)}
				</div>

				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7 shrink-0 text-muted-foreground"
					onClick={() => setDismissed(true)}
					aria-label="Dismiss"
				>
					<X className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
