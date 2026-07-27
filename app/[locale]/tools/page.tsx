import { getTranslations } from "next-intl/server";
import { getDb } from "@/lib/db";

async function getTools() {
  const db = getDb();
  const { data } = await db.from("tools").select("*").order("sort_order");
  return data || [];
}

export default async function ToolsPage() {
  const t = await getTranslations("tools");
  const tools = await getTools();

  return (
    <div className="space-y-24 w-full">
      <section className="pt-8 pb-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[90px] font-bold uppercase leading-[0.95] tracking-tight font-heading">
          <span className="block">{t("title")}</span>
          <span className="block text-muted-foreground/20">{t("titleSub")}</span>
        </h1>
      </section>

      <section className="grid grid-cols-2 gap-[10px]" style={{ gridTemplateColumns: "repeat(2, minmax(220px, 1fr))" }}>
        {tools.map((tool: Record<string, unknown>) => (
          <a key={tool.id as string} href={tool.href as string} target="_blank" rel="noopener noreferrer"
            className="group flex items-center gap-4 p-4 rounded-lg hover:bg-white/[0.03] transition-all">
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
              <img src={tool.icon as string} alt={tool.name as string} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div>
              <h3 className="font-semibold text-[16px] group-hover:text-primary transition-colors font-heading">{tool.name as string}</h3>
              <p className="text-muted-foreground text-[14px] mt-0.5">{tool.category as string}</p>
            </div>
          </a>
        ))}
      </section>
    </div>
  );
}
