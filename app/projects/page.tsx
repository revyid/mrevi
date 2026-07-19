import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const projects = [
  { title: "NajmAI SaaS Framer Template", href: "#", color: "bg-primary/10" },
  { title: "Damas Free Framer Template", href: "#", color: "bg-accent/10" },
  { title: "Majd Free Portfolio Template", href: "#", color: "bg-primary/10" },
  { title: "Faseelh Free Framer Template", href: "#", color: "bg-accent/10" },
  { title: "ABJAD Portfolio Framer Template", href: "#", color: "bg-primary/10" },
  { title: "Bayt Real Estate Framer Template", href: "#", color: "bg-accent/10" },
  { title: "Stabraq Portfolio Framer Template", href: "#", color: "bg-primary/10" },
  { title: "PostWing Social Media Scheduler", href: "#", color: "bg-accent/10" },
];

export default function ProjectsPage() {
  return (
    <main className="min-h-screen">
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-32">
        <div className="mb-16">
          <p className="text-muted-foreground text-sm mb-4">Aaabad Ahmed</p>
          <p className="text-muted-foreground text-sm mb-8 max-w-md">A Software Engineer who has developed countless innovative solutions.</p>
          <h1 className="font-poppins text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight">Recent <span className="text-primary">Projects</span></h1>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <Link key={p.title} href={p.href} className="group block">
              <div className={`aspect-[16/10] rounded-2xl ${p.color} overflow-hidden mb-4 relative`}>
                <div className="absolute inset-0 flex items-center justify-center"><span className="font-poppins text-6xl font-bold text-white/5">{p.title.charAt(0)}</span></div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"><div className="bg-white/10 backdrop-blur-sm rounded-full p-2"><ArrowUpRight className="w-5 h-5 text-white" /></div></div>
              </div>
              <h3 className="font-poppins font-semibold text-lg group-hover:text-primary transition-colors">{p.title}</h3>
            </Link>
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
