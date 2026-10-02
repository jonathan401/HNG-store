import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { CartHydration } from "@/components/store/cart-hydration";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "HNG Store",
  description: "A small shop of goods for daily use.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-display",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} ${display.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartHydration />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
