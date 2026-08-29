import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AuthProvider } from "@/lib/auth/provider";
import { rehydrateQuoteStore, useQuoteStore } from "@/store/quote-store";
import appCss from "../styles.css?url";

const APP_NAME = "InstantQuote";

const THEME_BOOT = `(function(){try{var k=["instantquote-v3","instantquote-v2","instantquote-v1"];var r=null;for(var i=0;i<k.length;i++){r=localStorage.getItem(k[i]);if(r)break;}if(!r)return;var s=JSON.parse(r).state;if(s&&s.theme==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Send a quote that looks like a real company. Free one-page estimates and invoices for sole traders.",
      },
      { name: "theme-color", content: "#141416" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "InstantQuote" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "application-name", content: "InstantQuote" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Outfit:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="min-h-dvh bg-bg text-fg">
        <PreviewHostBridge />
        <AuthProvider>
          <StoreBoot />
          <Outlet />
          <ToasterHost />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

function StoreBoot() {
  const theme = useQuoteStore((s) => s.theme);
  const hydrated = useQuoteStore((s) => s._hasHydrated);

  useEffect(() => {
    rehydrateQuoteStore();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, hydrated]);

  return null;
}

function ToasterHost() {
  const theme = useQuoteStore((s) => s.theme);
  return (
    <Toaster
      theme={theme}
      position="top-center"
      richColors={false}
      closeButton
      toastOptions={{
        className: "font-sans",
      }}
    />
  );
}
