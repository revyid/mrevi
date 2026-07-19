import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const posts = [
  { title: "Starting and Growing a Career in Web Design", excerpt: "As the internet continues to develop and grow exponentially, jobs related to the industry do too, particularly those that relate to web design and development.", date: "Apr 8, 2022", readTime: "6min read", slug: "starting-a-career-in-web-design" },
  { title: "Create a Landing Page That Performs Great", excerpt: "Whether you work in marketing, sales, or product design, you understand the importance of a quality landing page. Landing pages are standalone websites used to generate leads or sales.", date: "Mar 15, 2022", readTime: "6min read", slug: "create-a-landing-page-that-performs-great" },
  { title: "How Can Designers Prepare for the Future?", excerpt: "Whether you work in marketing, sales, or product design, you understand the importance of a quality landing page.", date: "Feb 28, 2022", readTime: "6min read", slug: "how-can-designers-prepare-for-the-future" },
  { title: "Building a Navigation Component with Variables", excerpt: "Whether you work in marketing, sales, or product design, you understand the importance of a quality landing page.", date: "Feb 6, 2022", readTime: "6min read", slug: "building-a-navigation-component" },
  { title: "How to Create an Effective Design Portfolio", excerpt: "Whether you work in marketing, sales, or product design, you understand the importance of a quality landing page.", date: "Jan 12, 2022", readTime: "6min read", slug: "how-to-create-an-effective-design-portfolio" },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen">
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-32">
        <div className="mb-16">
          <p className="text-muted-foreground text-sm mb-4">Aaabad Ahmed</p>
          <p className="text-muted-foreground text-sm mb-8 max-w-md">A Software Engineer who has developed countless innovative solutions.</p>
          <h1 className="font-poppins text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight">Design <span className="text-accent">Thoughts</span></h1>
        </div>
        <div className="space-y-4">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group block p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-muted-foreground text-sm">{p.date}</span>
                    <span className="text-muted-foreground text-sm">{p.readTime}</span>
                  </div>
                  <h2 className="font-poppins font-semibold text-xl mb-2 group-hover:text-primary transition-colors">{p.title}</h2>
                  <p className="text-muted-foreground leading-relaxed max-w-2xl">{p.excerpt}</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
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
