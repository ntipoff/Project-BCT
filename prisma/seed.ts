import { db } from "../lib/db";

async function main() {
  const count = await db.member.count();
  if (count > 0) {
    console.log(`Skipping seed — ${count} member(s) already exist.`);
    return;
  }

  await db.member.create({ data: { name: "Book Club Owner" } });
  console.log("Seeded one Member: Book Club Owner");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
