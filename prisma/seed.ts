import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

export async function seed() {
  const result = await db.cocktail.createMany({
    data: [
      { name: "Negroni", description: "Джин, кампари и сладкий вермут — классика.", imageUrl: "/img/negroni.jpg" },
      { name: "Mojito",  description: "Ром, лайм, мята; освежает моментально.",  imageUrl: "/img/mojito.jpg"  },
    ],
  });

  // ← вот здесь лог будет виден в терминале
  console.log(`✅ Seed завершён: добавлено ${result.count} коктейлей`);
}

seed()
  .catch((e) => {
    console.error("❌ Ошибка сидирования:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
