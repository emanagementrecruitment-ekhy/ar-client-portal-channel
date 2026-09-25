import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AR Corp Channel",
  description: "Portal khusus Client/Channel AR Corp untuk memantau data VCR/Fee talent.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }],
  },
  // Without this, iOS "Add to Home Screen" just bookmarks the page — the
  // icon opens in Safari with its address bar. This is what makes the
  // saved icon launch full-screen like a real app instead (see
  // /downloads/iphone for the install steps this depends on).
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AR Corp Channel",
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
