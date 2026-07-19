import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const tools = [
  { name: "Framer", category: "Website Builder", href: "https://framer.com", color: "bg-primary/10" },
  { name: "Figma", category: "Design Tool", href: "https://www.figma.com/", color: "bg-accent/10" },
  { name: "Lemon Squeezy", category: "Payments Provider", href: "https://www.lemonsqueezy.com/", color: "bg-primary/10" },
  { name: "ChatGPT", category: "AI Assistant", href: "https://chat.openai.com/", color: "bg-accent/10" },
  { name: "Notion", category: "Productivity Tool", href: "https://www.notion.so/", color: "bg-primary/10" },
  { name: "Next.js", category: "React Framework", href: "https://nextjs.org/", color: "bg-accent/10" },
];

export default function ToolsPage() {
  return (
    <main className="min-h-screen">
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-32">
        <div className="mb-16">
          <p className="text-muted-foreground text-sm mb-4">Aaabad Ahmed</p>
          <p className="text-muted-foreground text-sm mb-8 max-w-md">A Software Engineer who has developed countless innovative solutions.</p>
          <h1 className="font-poppins text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight">Premium <span className="text-primary">Tools</span></h1>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((t) => (
            <a key={t.name} href={t.href} target="_blank" rel="noopener noreferrer" className="group block p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all">
              <div className={`w-14 h-14 rounded-xl ${t.color} flex items-center justify-center font-poppins font-bold text-xl text-muted-foreground group-hover:text-primary transition-colors mb-4`}>{t.name.charAt(0)}</div>
              <h3 className="font-poppins font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{t.name}</h3>
              <p className="text-muted-foreground text-sm">{t.category}</p>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-4" />
            </a>
          ))}
        </div>
      </section>
      <section className="px-6 md:px-16 lg:px-24 py-32 text-center">
        <h2 className="font-poppins text-4xl md:text-6xl font-bold uppercase mb-6">Let&apos;s Work Together</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">Have a project in mind? I&apos;d love to hear about it.</p>
        <Link href="/contact" className="inline-flex items-center gap-2 bg-accent text-white hover:bg-accent/90 rounded-full px-8 py-3 text-sm font-semibold transition-colors">Get in Touch <ArrowUpRight className="w-5 h-5" /></Link>
      </section>
    </main>
  );
}
