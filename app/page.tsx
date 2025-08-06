// app/page.tsx
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef } from "react";

import CocktailSwiper from "@/components/CocktailSwiper";   // ← новый слайдер

/* ------------------------------------------------------------------ */
/* Страница                                                           */
/* ------------------------------------------------------------------ */
export default function Home() {
  /* 1. Загружаем коктейли --------------------------------------------------- */
  const { data: cocktails = [], error } = useQuery({
    queryKey: ["cocktails"],
    queryFn: async () => {
      const res = await fetch("/api/cocktails");
      if (!res.ok) throw new Error("Не удалось получить коктейли");
      return res.json();
    },
  });

  /* 2. Заказ + snackbar ----------------------------------------------------- */
  const [snackbar, setSnackbar] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const orderMutation = useMutation({
    mutationFn: async (id: number) =>
      fetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({ cocktailId: id }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      setSnackbar(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setSnackbar(false), 2500);
    },
    onError: () => alert("Не удалось отправить заказ"),
  });

  /* 3. UI ------------------------------------------------------------------ */
  return (
    <main className="h-screen overflow-hidden bg-zinc-950 text-white">
      {error ? (
        <div className="p-4 text-red-500">Ошибка загрузки коктейлей</div>
      ) : cocktails.length ? (
        <CocktailSwiper
          cocktails={cocktails}
          onOrder={(id) => orderMutation.mutate(id)}
        />
      ) : (
        <div className="p-4">Загрузка…</div>
      )}

      {snackbar && (
        <div className="fixed bottom-4 inset-x-0 flex justify-center">
          <div className="bg-emerald-600 text-white px-4 py-2 rounded-xl">
            🛎 Ваш заказ принят!
          </div>
        </div>
      )}
    </main>
  );
}
