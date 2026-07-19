import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const experiences = [
  { company: "PixelForge Studios", description: "Led the design team in creating user-centric mobile and web applications, improving the user experience and increasing user engagement.", period: "Jan 2020 - Present" },
  { company: "BlueWave Innovators", description: "Developed and implemented design strategies for new product lines, collaborated closely with engineers and product managers.", period: "Jun 2017 - Dec 2019" },
  { company: "TrendCraft Solutions", description: "Designed user interfaces for e-commerce platforms, focusing on enhancing usability and visual appeal.", period: "Mar 2015 - May 2017" },
  { company: "Visionary Labs", description: "Assisted in the creation of wireframes and prototypes for various digital products, contributed to user research and testing.", period: "Sep 2013 - Feb 2015" },
];

export default function ExperiencePage() {
  return (
    <main className="min-h-screen">
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-32">
        <div className="mb-16">
          <p className="text-muted-foreground text-sm mb-4">Aaabad Ahmed</p>
          <p className="text-muted-foreground text-sm mb-8 max-w-md">A Software Engineer who has developed countless innovative solutions.</p>
          <h1 className="font-poppins text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight">12 Years of <span className="text-accent">Experience</span></h1>
        </div>
        <div className="space-y-6">
          {experiences.map((e) => (
            <Link key={e.company} href="#" className="group block p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-poppins font-semibold text-xl mb-2 group-hover:text-primary transition-colors">{e.company}</h3>
                  <p className="text-muted-foreground leading-relaxed">{e.description}</p>
                </div>
                <span className="text-muted-foreground text-sm shrink-0">{e.period}</span>
              </div>
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
