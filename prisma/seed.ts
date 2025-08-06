import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

export async function seed() {
  await db.$transaction([
    // 1. чистим нужные таблицы (в нужном порядке при связях)
    db.order.deleteMany(),
    db.cocktail.deleteMany(),
    // если есть зависимости, удаляйте дочерние таблицы раньше родительских
    // db.order.deleteMany(),
    // db.user.deleteMany(),
  ]);

  // 2. заполняем свежими данными
  const result = await db.cocktail.createMany({
    data: [
          {
        name: "B-52",
        description: "Вкуснейший напиток, принадлежащий семейству пус-кафе (pousse café). В его состав входят ликеры трех видов: кофейный, сливочный и крепкий апельсиновый",
        imageUrl: "/img/b52.jpg",
      },
      {
        name: "Mojito",
        description: "Это кубинский коктейль, который обычно состоит из белого рома, сахара, лайма, мяты и газированной воды",
        imageUrl: "/img/mojito.jpg",
      },
      {
        name: "Tequila Sunrise",
        description:
          "Это слабоалкогольный цитрусовый лонг на основе текилы с добавлением гренадина и апельсинового сока. Простой, но очень вкусный и красивый: переходящий в оранжевый цвет красный гренадин действительно напоминает восходящее солнце.",
        imageUrl: "/img/tekila-sanraiz.webp",
      },
      {
        name: "Long Island Iced Tea",
        description:
          "Коктейль на основе водки, джина, текилы и рома, плюс трипл-сек и кола. Один из самых крепких лонгов — около 22 °.",
        imageUrl: "/img/long-island.jpg",
      },
      {
        name: "Margarita",
        description:
          "Алкогольный коктейль на основе текилы с ликером и соком лайма.",
        imageUrl: "/img/margarita.jpg",
      },
      {
        name: "Whisky Cola",
        description:
          "Это простой алкогольный коктейль, состоящий из виски и кока-колы. Он характеризуется сладким вкусом газировки и нотками виски.",
        imageUrl: "/img/whisky-cola.jpg",
      },
        {
        name: "Gin & Tonic",
        description:
          "Это коктейль, который состоит из джина и тоника, обычно с добавлением лайма или лимона и льда",
        imageUrl: "/img/gin-tonic.webp",
      },

    ],
    // если хотите пропускать дубликаты по уникальным полям:
    // skipDuplicates: true,
  });

  console.log(`✅ Seed завершён: добавлено ${result.count} коктейлей`);
}

seed()
  .catch((e) => {
    console.error("❌ Ошибка сидирования:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
