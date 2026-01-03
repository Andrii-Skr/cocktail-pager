// app/[locale]/page.tsx
"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import toast from "react-hot-toast"
import CocktailSwiper from "@/components/CocktailSwiper"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import useFingerprintId from "@/hooks/useDeviceId"

export default function Home() {
  const t = useTranslations("home")
  const locale = useLocale()

  /* 1. Коктейли ------------------------------------------------------------ */
  const { data: cocktails = [], error } = useQuery({
    queryKey: ["cocktails", locale],
    queryFn: async () => {
      const res = await fetch(`/api/cocktails?locale=${locale}`)
      if (!res.ok) throw new Error(t("loadError"))
      return res.json()
    },
  })

  /* 2. Fingerprint --------------------------------------------------------- */
  const deviceId = useFingerprintId()

  /* 3. Локальный флаг от двойного тапа ------------------------------------ */
  const [clickLock, setClickLock] = useState(false)

  const showOrderAccepted = () => {
    const toastId = toast.success(t("orderAccepted"), { duration: 2500 })
    setTimeout(() => toast.dismiss(toastId), 2600)
  }

  /* 4. Мутация «создать заказ» -------------------------------------------- */
  const orderMutation = useMutation({
    mutationFn: async (cocktailId: number) => {
      if (!deviceId) {
        throw new Error(t("deviceNotReady"))
      }
      const res = await fetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({ cocktailId, deviceId }),
        headers: { "Content-Type": "application/json" },
      })
      if (!res.ok) {
        throw new Error(t("orderSubmitError"))
      }
      return res.json()
    },
    onMutate: () => setClickLock(true), // ← блокируем сразу
    onSuccess: showOrderAccepted,
    onError: (err) => {
      const message =
        err instanceof Error && err.message
          ? err.message
          : t("orderSubmitError")
      toast.error(message)
    },
    onSettled: () => setClickLock(false), // ← снимаем блок
  })

  /* 5. UI ------------------------------------------------------------------ */
  return (
    <main className="relative h-screen overflow-hidden bg-zinc-950 text-white">
      <LanguageSwitcher className="absolute right-4 top-4 z-10" />
      {error ? (
        <div className="p-4 text-red-500">{t("loadError")}</div>
      ) : cocktails.length ? (
        <CocktailSwiper
          cocktails={cocktails}
          disabled={orderMutation.isPending || clickLock}
          onOrder={(id) => {
            /* если запрос уже идёт или локальный блок активен — игнорируем */
            if (orderMutation.isPending || clickLock) return
            orderMutation.mutate(id)
          }}
        />
      ) : (
        <div className="p-4">{t("loading")}</div>
      )}
    </main>
  )
}
