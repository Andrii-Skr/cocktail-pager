import Image from "next/image";

export function CocktailCard({
  cocktail,
  onOrder,
}: {
  cocktail: { id: number; name: string; description: string; imageUrl: string };
  onOrder: () => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden shadow mb-6">
      <Image
        src={cocktail.imageUrl}
        alt={cocktail.name}
        width={800}
        height={1266}
        className="w-full"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{cocktail.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{cocktail.description}</p>
        <button
          onClick={onOrder}
          className="bg-rose-600 text-white px-4 py-2 rounded-xl w-full active:scale-95 transition"
        >
          🛎 Заказать
        </button>
      </div>
    </div>
  );
}
