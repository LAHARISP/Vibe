import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VC Intelligence Interface",
  description: "Discover and enrich VC intelligence data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
