// components/OrderCard.tsx
"use client";

import { useState } from "react";
import { OrderWithCocktail } from "@/types/types";

interface Props {
  order:   OrderWithCocktail;
  onSave:  () => void;              // вызывается после любого PATCH
}

export function OrderCard({ order, onSave }: Props) {
  const [note,  setNote]  = useState(order.note ?? "");
  const [status,setStatus]= useState(order.status);
  const [name,  setName]  = useState(order.user?.name ?? "Guest");
  const isGuest           = name === "Guest";

  /* PATCH заказ */
  const patchOrder = async (data: Partial<OrderWithCocktail>) => {
    await fetch(`/api/orders/${order.id}`, {
      method : "PATCH",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify(data),
    });
    onSave();
  };

  /* PATCH имя пользователя */
  const patchUser = async (newName: string) => {
    await fetch(`/api/users/${order.deviceId}`, {
      method : "PATCH",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ name: newName }),
    });
    onSave();
  };

  return (
    <div className="rounded-2xl border p-4 mb-4 bg-white shadow">
      <h3 className="font-semibold mb-1 text-black">{order.cocktail.name}</h3>

      {/* deviceId */}
      <p className="text-xs text-gray-500 overflow-x-auto">{order.deviceId}</p>

      {/* Имя пользователя */}
      {isGuest ? (
        <input
          className="border rounded w-full mt-1 p-1 text-sm text-black"
          placeholder="Имя гостя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name && name !== "Guest") patchUser(name);
          }}
        />
      ) : (
        <p className="text-sm mt-1 font-medium text-black">{name}</p>
      )}

      {/* Примечание */}
      <textarea
        className="w-full border rounded mt-2 p-1 text-sm resize-none"
        rows={2}
        placeholder="Примечание…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => patchOrder({ note })}
      />

      {/* Кнопки статуса */}
      <div className="flex gap-2 mt-3 text-sm">
        {status !== "IN_PROGRESS" && (
          <button
            onClick={() => {
              setStatus("IN_PROGRESS");
              patchOrder({ status: "IN_PROGRESS" });
            }}
            className="flex-1 bg-amber-500 text-white py-1 rounded-lg active:scale-95 transition"
          >
            В работе
          </button>
        )}
        <button
          onClick={() => patchOrder({ status: "DONE" })}
          className="flex-1 bg-emerald-600 text-white py-1 rounded-lg active:scale-95 transition"
        >
          Готово
        </button>
      </div>
    </div>
  );
}
