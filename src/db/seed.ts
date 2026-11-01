import { config } from "dotenv";

config({ path: ".env.local" });

const defaultCategories = [
  { name: "한국경제(경제)", description: "경제, 금융, 증시, 부동산, 산업, 기업 관련 뉴스" },
  { name: "한국경제(IT)", description: "IT, 인공지능, 소프트웨어, 반도체, 플랫폼, 과학기술 관련 뉴스" },
  { name: "더케이뷰티사이언스(화장품)", description: "화장품, 뷰티, 스킨케어, 코스메틱 산업 관련 뉴스" },
  { name: "기타", description: "다른 카테고리에 해당하지 않는 뉴스", isDefault: true },
];

async function main() {
  const { db } = await import("./index");
  const { categories } = await import("./schema");

  await db
    .insert(categories)
    .values(defaultCategories)
    .onConflictDoNothing({ target: categories.name });

  const rows = await db.select().from(categories);
  console.log(rows.map((r) => `${r.id} ${r.name} default=${r.isDefault}`).join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
