"use client";

import { useState } from "react";
import type { Prisma } from "@prisma/client";

/** Тип «заказ вместе с коктейлем» */
export type OrderWithCocktail =
  Prisma.OrderGetPayload<{ include: { cocktail: true } }>;

interface Props {
  /** Сам заказ */
  order: OrderWithCocktail;
  /**
   * Колбэк, который вызывается после успешного PATCH.
   * Если нужен результат запроса — раскомментируйте параметр.
   */
  onSave: () => void;            // (updated: OrderWithCocktail) => void
}

export function OrderCard({ order, onSave }: Props) {
  const [note, setNote]       = useState(order.note ?? "");
  const [status, setStatus]   = useState(order.status);

  /** PATCH helper */
  const patch = async (data: Partial<OrderWithCocktail>) => {
    const res = await fetch(`/api/orders/${order.id}`, {
      method : "PATCH",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify(data),
    });
    // если хотите передавать обновлённый заказ в родителя:
    // const updated = (await res.json()) as OrderWithCocktail;
    onSave();
  };

  return (
    <div className="rounded-2xl border p-4 mb-4 bg-white shadow">
      <h3 className="font-semibold mb-1">{order.cocktail.name}</h3>

      {/* user-agent / deviceId */}
      <p className="text-xs text-gray-500 overflow-x-auto">
        {order.deviceId}
      </p>

      {/* editable note */}
      <textarea
        className="w-full border rounded mt-2 p-1 text-sm resize-none"
        rows={2}
        placeholder="Примечание…"
        value={note}
        onChange={e => setNote(e.target.value)}
        onBlur={() => patch({ note })}
      />

      {/* action buttons */}
      <div className="flex gap-2 mt-3 text-sm">
        {status !== "IN_PROGRESS" && (
          <button
            onClick={() => {
              setStatus("IN_PROGRESS");
              patch({ status: "IN_PROGRESS" });
            }}
            className="flex-1 bg-amber-500 text-white py-1 rounded-lg active:scale-95 transition"
          >
            В работе
          </button>
        )}
        <button
          onClick={() => patch({ status: "DONE" })}
          className="flex-1 bg-emerald-600 text-white py-1 rounded-lg active:scale-95 transition"
        >
          Готово
        </button>
      </div>
    </div>
  );
}
