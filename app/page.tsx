// app/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import useFingerprintId from "@/hooks/useDeviceId";
import CocktailSwiper from "@/components/CocktailSwiper";

export default function Home() {
  /* 1. Коктейли ------------------------------------------------------------ */
  const { data: cocktails = [], error } = useQuery({
    queryKey: ["cocktails"],
    queryFn: async () => {
      const res = await fetch("/api/cocktails");
      if (!res.ok) throw new Error("Не удалось получить коктейли");
      return res.json();
    },
  });

  /* 2. Fingerprint --------------------------------------------------------- */
  const deviceId = useFingerprintId();
  const ready    = !!deviceId;

  /* 3. Локальный флаг от двойного тапа ------------------------------------ */
  const [clickLock, setClickLock] = useState(false);

  /* 4. Мутация «создать заказ» -------------------------------------------- */
  const orderMutation = useMutation({
    mutationFn: async (cocktailId: number) =>
      fetch("/api/orders", {
        method : "POST",
        body   : JSON.stringify({ cocktailId, deviceId }),
        headers: { "Content-Type": "application/json" },
      }),
    onMutate: () => setClickLock(true),              // ← блокируем сразу
    onSuccess: () => toast.success("🛎 Заказ принят!"),
    onError  : () => toast.error("Не удалось отправить заказ"),
    onSettled: () => setClickLock(false),            // ← снимаем блок
  });

  /* 5. UI ------------------------------------------------------------------ */
  return (
    <main className="h-screen overflow-hidden bg-zinc-950 text-white">
      {error ? (
        <div className="p-4 text-red-500">Ошибка загрузки коктейлей</div>
      ) : cocktails.length ? (
        <CocktailSwiper
          cocktails={cocktails}
          onOrder={(id) => {
            /* если запрос уже идёт или локальный блок активен — игнорируем */
            if (orderMutation.isPending || clickLock) return;
            orderMutation.mutate(id);
          }}
          // disabled={!ready || orderMutation.isPending || clickLock}
        />
      ) : (
        <div className="p-4">Загрузка…</div>
      )}
    </main>
  );
}
