// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nutri-Planner",
  description: "Modern meal planning and tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark"> {/* Default to dark mode */}
      <body 
        className={`${inter.className} bg-surface-light dark:bg-primary-deep-blue text-text-dark dark:text-surface-light`}
      >
        {/* We will add the Header component later once we decide which pages it should appear on. */}
        <main>{children}</main>
      </body>
    </html>
  );
}