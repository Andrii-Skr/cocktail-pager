"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  return (
    <html lang="ru">
      <body>
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
        <Toaster
          position="bottom-center" // 👍 удобно на телефоне
          gutter={8}
          toastOptions={{
            success: {
              className:
                "rounded-xl bg-emerald-600 text-gray-500 text-sm px-4 py-2 shadow-lg",
            },
            error: {
              className:
                "rounded-xl bg-red-600 text-white text-sm px-4 py-2 shadow-lg",
            },
          }}
        />
      </body>
    </html>
  );
}
