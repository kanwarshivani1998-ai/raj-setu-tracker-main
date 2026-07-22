import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { DataProvider, useData } from "@/lib/db/DataContext";
import { TopicContentProvider } from "@/lib/content/TopicContentContext";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { MotivationModal } from "@/components/MotivationModal";
import { AlarmManager } from "@/components/AlarmManager";
import { registerServiceWorker } from "@/lib/pwa/registerSW";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">पृष्ठ नहीं मिला</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          जिस पृष्ठ को आप ढूंढ रहे हैं वह मौजूद नहीं है।
        </p>
        <div className="mt-6">
          <a href="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            मुख्य पृष्ठ पर जाएँ
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">कुछ गड़बड़ हो गई</h1>
        <p className="mt-2 text-sm text-muted-foreground">कृपया पुनः प्रयास करें।</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            पुनः प्रयास करें
          </button>
          <a href="/" className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium">
            मुख्य पृष्ठ
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" },
      { name: "theme-color", content: "#e08a3c" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "CET Tracker" },
      { title: "Rajasthan CET Study Tracker — RSSB CET तैयारी" },
      { name: "description", content: "राजस्थान CET (स्नातक स्तर) परीक्षा के लिए हिंदी में ऑफलाइन अध्ययन ट्रैकर — पाठ्यक्रम, प्रगति, रिवीजन और सांख्यिकी।" },
      { name: "author", content: "Rajasthan CET Tracker" },
      { property: "og:title", content: "Rajasthan CET Study Tracker" },
      { property: "og:description", content: "राजस्थान CET की तैयारी के लिए हिंदी ऑफलाइन ट्रैकर।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/icon-512.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/icon-512.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Tiro+Devanagari+Hindi&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="hi">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function GlobalOverlays() {
  const { ready, settings, updateSettings } = useData();
  const [showMotivation, setShowMotivation] = useState(false);

  useEffect(() => {
    if (!ready || !settings.audioUnlocked) return;
    const today = new Date().toISOString().slice(0, 10);
    if (settings.lastMotivationShownDate !== today) setShowMotivation(true);
  }, [ready, settings.audioUnlocked, settings.lastMotivationShownDate]);

  if (!ready) return null;

  if (!settings.audioUnlocked) {
    return <WelcomeScreen onStart={() => updateSettings({ audioUnlocked: true })} />;
  }

  return (
    <>
      <MotivationModal
        isOpen={showMotivation}
        onClose={() => {
          setShowMotivation(false);
          updateSettings({ lastMotivationShownDate: new Date().toISOString().slice(0, 10) });
        }}
      />
      <AlarmManager />
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <TopicContentProvider>
          <Outlet />
          <GlobalOverlays />
          <Toaster position="top-center" richColors closeButton toastOptions={{ style: { fontFamily: "var(--font-sans)" } }} />
        </TopicContentProvider>
      </DataProvider>
    </QueryClientProvider>
  );
}
