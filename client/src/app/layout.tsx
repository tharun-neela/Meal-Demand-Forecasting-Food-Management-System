import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LPU Mess | Demand Forecasting & Food-Waste Management",
  description:
    "Lovely Professional University Mess Demand Forecasting & Food-Waste Management Portal. Planning attendance, ingredient preparation, and food waste reduction.",
  icons: {
    icon: [
      { url: "/lpu-round-logo.png", sizes: "any", type: "image/png" },
    ],
    shortcut: "/lpu-round-logo.png",
    apple: "/lpu-round-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/lpu-round-logo.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
