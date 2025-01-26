"use client";

import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Rubik_Bubbles } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rubikBubbles = Rubik_Bubbles({
  weight: "400",
  variable: "--font-rubik-bubbles",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${rubikBubbles.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <div className="min-h-screen animated-gradient">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}
