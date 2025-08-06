// app/bartender/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { OrderCard, OrderWithCocktail } from "@/components/OrderCard";

export default function Bartender() {
  const qc = useQueryClient();
  const audioRef = useRef<HTMLAudioElement>(null);

  /* ─────────── 1. Заказы ─────────── */
  const { data: orders = [], refetch } = useQuery<OrderWithCocktail[]>({
    queryKey: ["orders"],
    queryFn: () => fetch("/api/orders").then((r) => r.json()),
  });

  /* ─────────── 2. Разблокировка + Socket ─────────── */
  useEffect(() => {
    /* a) первый жест → unlock audio */
    const unlock = () => {
      audioRef.current?.play().catch(() => {});
      window.removeEventListener("pointerdown", unlock);
    };
    window.addEventListener("pointerdown", unlock);

    /* b) подключаемся к /api/socket (Pages-роут) */
    const socket: Socket = io({ path: "/api/socket" });

    socket.on("connect", () =>
      console.log("🟢 socket connected:", socket.id),
    );

    socket.on("new-order", (order: OrderWithCocktail) => {
      console.log("⚡ new-order", order.id);

      /* мгновенно добавляем заказ в кэш */
      qc.setQueryData<OrderWithCocktail[]>(["orders"], (old = []) => {
        if (old.some((o) => o.id === order.id)) return old;
        return [...old, order];
      });

      const query = qc.getQueryCache().find({ queryKey: ["orders"] });
      if (query?.isActive()) {
        refetch();
      }

      /* фоновый refetch на случай изменений */
      qc.invalidateQueries({ queryKey: ["orders"] });

      /* колокольчик */
      const bell = audioRef.current;
      if (bell) {
        bell.pause();
        bell.currentTime = 0;
        bell.play().catch(() => {});
      }
    });

    /* cleanup */
    return () => {
      socket.off("new-order");
      socket.disconnect();
      window.removeEventListener("pointerdown", unlock);
    };
  }, [qc]);

  /* ─────────── 3. UI ─────────── */
  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Новые заказы</h1>

      {orders.map((o) => (
        <OrderCard key={o.id} order={o} onSave={refetch} />
      ))}

      <audio ref={audioRef} src="/bell.mp3" preload="auto" />
    </main>
  );
}
