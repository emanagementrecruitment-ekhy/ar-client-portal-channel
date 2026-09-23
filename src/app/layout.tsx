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
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
