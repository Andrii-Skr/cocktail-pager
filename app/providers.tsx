"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { useState } from "react"
import { Toaster } from "react-hot-toast"

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={qc}>
      {children}
      <Toaster
        position="bottom-center"
        gutter={8}
        toastOptions={{
          success: {
            duration: 2500,
            className:
              "rounded-xl bg-emerald-600 text-gray-500 text-sm px-4 py-2 shadow-lg pointer-events-none sm:pointer-events-auto",
          },
          error: {
            duration: 4000,
            className:
              "rounded-xl bg-red-600 text-white text-sm px-4 py-2 shadow-lg pointer-events-none sm:pointer-events-auto",
          },
        }}
      />
    </QueryClientProvider>
  )
}
