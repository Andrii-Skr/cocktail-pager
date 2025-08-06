"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CocktailCard } from "@/components/CocktailCard";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const {
    data: cocktails = [],
    error: cocktailsError,
  } = useQuery({
    queryKey: ["cocktails"],
    queryFn: async () => {
      const r = await fetch("/api/cocktails");
      if (!r.ok) {
        throw new Error("Не удалось получить коктейли");
      }
      return r.json();
    },
  });

  const [snackbar, setSnackbar] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const orderMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({ cocktailId: id }),
        headers: { "Content-Type": "application/json" },
      });
      if (!r.ok) {
        throw new Error("Не удалось отправить заказ");
      }
    },
    onSuccess: () => {
      setSnackbar(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => setSnackbar(false), 2500);
    },
    onError: () => {
      alert("Не удалось отправить заказ");
    },
  });

  return (
    <main className="max-w-md mx-auto p-4">
      {cocktailsError ? (
        <div className="text-red-600">Ошибка загрузки коктейлей</div>
      ) : (
        cocktails.map((c: any) => (
          <CocktailCard
            key={c.id}
            cocktail={c}
            onOrder={() => orderMutation.mutate(c.id)}
          />
        ))
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
