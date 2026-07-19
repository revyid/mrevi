import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

const projects = [
  { title: "NajmAI", subtitle: "SaaS Framer Template", href: "#" },
  { title: "Damas", subtitle: "Free Framer Template", href: "#" },
  { title: "Majd", subtitle: "Free Portfolio Template", href: "#" },
];

const experiences = [
  { company: "PixelForge Studios", description: "Led the design team in creating user-centric mobile and web applications, improving the user experience and increasing user engagement.", period: "Jan 2020 - Present" },
  { company: "BlueWave Innovators", description: "Developed and implemented design strategies for new product lines, collaborated closely with engineers and product managers.", period: "Jun 2017 - Dec 2019" },
  { company: "TrendCraft Solutions", description: "Designed user interfaces for e-commerce platforms, focusing on enhancing usability and visual appeal.", period: "Mar 2015 - May 2017" },
];

const tools = [
  { name: "Framer", category: "Website Builder", href: "https://framer.com" },
  { name: "Figma", category: "Design Tool", href: "https://www.figma.com/" },
  { name: "Lemon Squeezy", category: "Payments Provider", href: "https://www.lemonsqueezy.com/" },
  { name: "ChatGPT", category: "AI Assistant", href: "https://chat.openai.com/" },
  { name: "Notion", category: "Productivity Tool", href: "https://www.notion.so/" },
  { name: "Next.js", category: "React Framework", href: "https://nextjs.org/" },
];

const blogPosts = [
  { title: "Starting and Growing a Career in Web Design", excerpt: "As the internet continues to develop and grow exponentially, jobs related to the industry do too, particularly those that relate to web design and development.", date: "Apr 8, 2022", readTime: "6min read", slug: "starting-a-career-in-web-design" },
  { title: "Create a Landing Page That Performs Great", excerpt: "Whether you work in marketing, sales, or product design, you understand the importance of a quality landing page.", date: "Mar 15, 2022", readTime: "6min read", slug: "create-a-landing-page-that-performs-great" },
  { title: "How Can Designers Prepare for the Future?", excerpt: "Whether you work in marketing, sales, or product design, you understand the importance of a quality landing page.", date: "Feb 28, 2022", readTime: "6min read", slug: "how-can-designers-prepare-for-the-future" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24">
        <div className="max-w-4xl">
          <div className="xl:hidden mb-8">
            <p className="text-sm font-medium">Aaabad Ahmed</p>
            <p className="text-muted-foreground text-sm mt-1">A Software Engineer who has developed countless innovative solutions.</p>
          </div>
          <h1 className="font-poppins text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase leading-[0.95] tracking-tight mb-8">
            SOFTWARE <span className="text-[rgba(182,180,189,0.35)]">ENGINEER</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed mb-12">
            Passionate about creating intuitive and engaging user experiences. Specialize in transforming ideas into beautifully crafted products.
          </p>
          <div className="flex flex-wrap gap-8 md:gap-16">
            <div>
              <span className="font-poppins text-4xl md:text-5xl lg:text-6xl font-semibold">+12</span>
              <p className="text-muted-foreground text-xs uppercase tracking-wider mt-1">Years of<br />Experience</p>
            </div>
            <div>
              <span className="font-poppins text-4xl md:text-5xl lg:text-6xl font-semibold">+46</span>
              <p className="text-muted-foreground text-xs uppercase tracking-wider mt-1">Projects<br />Completed</p>
            </div>
            <div>
              <span className="font-poppins text-4xl md:text-5xl lg:text-6xl font-semibold">+20</span>
              <p className="text-muted-foreground text-xs uppercase tracking-wider mt-1">Worldwide<br />Clients</p>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="px-6 md:px-16 lg:px-24 py-16">
        <div className="flex flex-wrap gap-3">
          {["Dynamic Animation", "Motion Design"].map((s) => (
            <span key={s} className="px-5 py-2.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-sm text-muted-foreground">{s}</span>
          ))}
          {["Framer", "Figma", "WordPress", "ReactJS"].map((t) => (
            <span key={t} className="px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary">{t}</span>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="px-6 md:px-16 lg:px-24 py-20">
        <div className="flex items-end justify-between mb-12 gap-4">
          <h2 className="font-poppins text-3xl md:text-5xl font-bold uppercase">Recent Projects</h2>
          <Link href="/projects" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm shrink-0 mb-2">View All <ArrowUpRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Link key={p.title} href={p.href} className="group block">
              <div className="aspect-[4/3] rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden mb-4 relative">
                <div className="absolute inset-0 flex items-center justify-center"><span className="font-poppins text-5xl font-bold text-white/5">{p.title.charAt(0)}</span></div>
              </div>
              <h3 className="font-poppins font-semibold text-lg group-hover:text-primary transition-colors">{p.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{p.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="px-6 md:px-16 lg:px-24 py-20">
        <h2 className="font-poppins text-3xl md:text-5xl font-bold uppercase mb-12">12 Years of Experience</h2>
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

      {/* Tools */}
      <section className="px-6 md:px-16 lg:px-24 py-20">
        <h2 className="font-poppins text-3xl md:text-5xl font-bold uppercase mb-12">Premium Tools</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((t) => (
            <a key={t.name} href={t.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all">
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center font-poppins font-bold text-lg text-muted-foreground group-hover:text-primary transition-colors">{t.name.charAt(0)}</div>
              <div>
                <h3 className="font-medium group-hover:text-primary transition-colors">{t.name}</h3>
                <p className="text-muted-foreground text-sm">{t.category}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Blog */}
      <section className="px-6 md:px-16 lg:px-24 py-20">
        <div className="flex items-end justify-between mb-12 gap-4">
          <h2 className="font-poppins text-3xl md:text-5xl font-bold uppercase">Design Thoughts</h2>
          <Link href="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm shrink-0 mb-2">View All <ArrowUpRight className="w-4 h-4" /></Link>
        </div>
        <div className="space-y-4">
          {blogPosts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group block p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-muted-foreground text-sm">{p.date}</span>
                    <span className="text-muted-foreground text-sm">{p.readTime}</span>
                  </div>
                  <h3 className="font-poppins font-semibold text-xl mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-2xl">{p.excerpt}</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="px-6 md:px-16 lg:px-24 py-32">
        <div className="max-w-md mx-auto text-center mb-10">
          <h2 className="font-poppins text-4xl md:text-6xl font-bold uppercase mb-6">Let&apos;s Work Together</h2>
          <p className="text-muted-foreground text-lg">Have a project in mind? I&apos;d love to hear about it.</p>
        </div>
        <div className="max-w-md mx-auto">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
