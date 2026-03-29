import { InstallPrompt } from "@/components/pwa/install-prompt";
import { NotificationSystem } from "@/components/shared/notification-system";
import { AuthProvider } from "@/lib/auth-context";
import { registerServiceWorker } from "@/lib/pwa";
import { SharedStateProvider } from "@/lib/shared-state";
import { Outlet } from "@modern-js/runtime/router";
import React, { useEffect } from "react";
import "@/styles/globals.css";

export default function Layout() {
	useEffect(() => {
		registerServiceWorker();
	}, []);

	return (
		<AuthProvider>
			<SharedStateProvider>
				<div className="microfrontend-container">
					<Outlet />
					<NotificationSystem />
					<InstallPrompt />
				</div>
			</SharedStateProvider>
		</AuthProvider>
	);
}
