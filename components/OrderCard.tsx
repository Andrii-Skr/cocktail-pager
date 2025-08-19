"use client";

import { useState, useRef } from "react";
import { OrderWithCocktail } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  order:  OrderWithCocktail;
  onSave: () => void; // вызывается после любого PATCH
}

export function OrderCard({ order, onSave }: Props) {
  const [note, setNote] = useState(order.note ?? "");
  const [status, setStatus] = useState(order.status);
  const initialName = order.user?.name ?? "Guest";
  const [name, setName] = useState(initialName);

  const isGuest = initialName === "Guest";
  const userId = order.userId; // <— это связь на Users.deviceId
  const isSavingUser = useRef(false);
  const isSavingOrder = useRef(false);

  /* PATCH заказ */
  const patchOrder = async (data: Partial<OrderWithCocktail>) => {
    if (isSavingOrder.current) return;
    isSavingOrder.current = true;
    try {
      await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      onSave();
    } finally {
      isSavingOrder.current = false;
    }
  };

  /* PATCH имя пользователя в Users (по deviceId == userId) */
  const patchUser = async (newName: string) => {
    if (!userId) return;
    const trimmed = newName.trim();
    if (!trimmed || trimmed === "Guest") return;
    if (isSavingUser.current) return;

    isSavingUser.current = true;
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        // опционально можно показать тост/ошибку
        return;
      }
      onSave();
    } finally {
      isSavingUser.current = false;
    }
  };

  return (
    <div className="rounded-2xl border p-4 mb-4 bg-white shadow">
      <h3 className="font-semibold mb-1 text-black">
        {order.cocktail.name}
      </h3>

      {/* Показываем исходный deviceId заказа (это НЕ id юзера) */}
      <p className="text-xs text-gray-500 overflow-x-auto">{order.deviceId}</p>

      {/* Имя пользователя: редактируем, только если он 'Guest' */}
      {isGuest ? (
        <Input
          placeholder="Имя гостя"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          onBlur={() => {
            if (name && name !== "Guest") patchUser(name);
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (name && name !== "Guest") patchUser(name);
            } else if (e.key === "Escape") {
              setName(initialName);
              (e.currentTarget as HTMLInputElement).blur();
            }
          }}
        />
      ) : (
        <p className="text-sm mt-1 font-medium text-black">{name}</p>
      )}

      {/* Примечание */}
      <Textarea
        rows={2}
        placeholder="Примечание…"
        value={note}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
        onBlur={() => {
          // не слать пустые PATCH’и, если ничего не изменилось
          if (note !== (order.note ?? "")) {
            patchOrder({ note });
          }
        }}
      />

      {/* Кнопки статуса */}
      <div className="flex gap-2 mt-3 text-sm">
        {status !== "IN_PROGRESS" && (
          <Button
            onClick={() => {
              setStatus("IN_PROGRESS");
              patchOrder({ status: "IN_PROGRESS" });
            }}
            className="flex-1"
          >
            В работе
          </Button>
        )}
        <Button
          onClick={() => {
            setStatus("DONE");
            patchOrder({ status: "DONE" });
          }}
          className="flex-1"
        >
          Готово
        </Button>
      </div>
    </div>
  );
}

export default OrderCard;
