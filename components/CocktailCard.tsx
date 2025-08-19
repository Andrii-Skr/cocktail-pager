import Image from "next/image";
import { Button } from "@/components/ui/button";

export function CocktailCard({
  cocktail,
  onOrder,
}: {
  cocktail: { id: number; name: string; description: string; imageUrl: string };
  onOrder: () => void;
}) {
  return (
    <div className="h-dvh flex flex-col">
      <div className="relative flex-1">
        <Image
          src={cocktail.imageUrl}
          alt={cocktail.name}
          fill
          sizes="100dvw"
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{cocktail.name}</h3>
        <p className="text-sm text-gray-400 mb-4">{cocktail.description}</p>
        <Button onClick={onOrder} className="w-full">
          🛎 Заказать
        </Button>
      </div>
    </div>
  );
}
