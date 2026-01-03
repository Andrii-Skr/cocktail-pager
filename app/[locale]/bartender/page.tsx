// app/[locale]/bartender/page.tsx
"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { OrderCard } from "@/components/OrderCard"
import type { OrderWithCocktail } from "@/types/types"

export default function Bartender() {
  const t = useTranslations("bartender")
  const qc = useQueryClient()
  const audioRef = useRef<HTMLAudioElement>(null)

  /* ─────────── 1. Заказы ─────────── */
  const {
    data: orders = [],
    error: ordersError,
    refetch,
  } = useQuery<OrderWithCocktail[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const r = await fetch("/api/orders")
      if (!r.ok) {
        throw new Error(t("loadError"))
      }
      return r.json()
    },
  })

  /* ─────────── 2. Разблокировка + Socket ─────────── */
  useEffect(() => {
    /* a) первый жест → unlock audio */
    const unlock = () => {
      audioRef.current?.play().catch(() => {})
      window.removeEventListener("pointerdown", unlock)
    }
    window.addEventListener("pointerdown", unlock)

    /* b) подключаемся к /api/socket (Pages-роут) */
    const socket: Socket = io({ path: "/api/socket" })

    socket.on("connect", () => console.log("🟢 socket connected:", socket.id))

    const handleNewOrder = (order: OrderWithCocktail) => {
      console.log("⚡ new-order", order.id)

      /* мгновенно добавляем заказ в кэш */
      qc.setQueryData<OrderWithCocktail[]>(["orders"], (old = []) => {
        if (old.some((o) => o.id === order.id)) return old
        return [...old, order]
      })

      /* фоновый refetch на случай изменений */
      qc.invalidateQueries({ queryKey: ["orders"], refetchType: "active" })

      /* колокольчик */
      const bell = audioRef.current
      if (bell) {
        bell.pause()
        bell.currentTime = 0
        bell.play().catch(() => {})
      }
    }

    socket.on("new-order", handleNewOrder)

    /* cleanup */
    return () => {
      socket.removeListener("new-order", handleNewOrder)
      socket.disconnect()
      window.removeEventListener("pointerdown", unlock)
    }
  }, [qc])

  /* ─────────── 3. UI ─────────── */
  return (
    <main className="relative max-w-md mx-auto p-4">
      <LanguageSwitcher className="absolute right-4 top-4 z-10" />
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>

      {ordersError ? (
        <div className="text-red-600">{t("loadError")}</div>
      ) : (
        orders.map((o) => <OrderCard key={o.id} order={o} onSave={refetch} />)
      )}

      {/* biome-ignore lint/a11y/useMediaCaption: decorative notification sound */}
      <audio ref={audioRef} src="/bell.mp3" preload="auto" />
    </main>
  )
}
