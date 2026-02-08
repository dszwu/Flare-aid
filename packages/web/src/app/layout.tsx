import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Flare-Aid | Transparent Disaster Relief on Flare",
  description:
    "A decentralized disaster-relief platform built on Flare Network. Monitor global disasters, donate with full on-chain transparency, and track your impact.",
  keywords: ["Flare", "disaster relief", "blockchain", "transparency", "FTSO", "donations"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
