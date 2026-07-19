import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BlogPostPage() {
  return (
    <main className="min-h-screen">
      <article className="max-w-3xl mx-auto px-6 md:px-16 lg:px-24 py-32">
        <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
        <header className="mb-12">
          <p className="text-muted-foreground text-sm mb-4">Aaabad Ahmed</p>
          <p className="text-muted-foreground text-sm mb-8 max-w-md">A Software Engineer who has developed countless innovative solutions.</p>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-muted-foreground text-sm">Apr 8, 2022</span>
            <span className="text-muted-foreground text-sm">6min read</span>
          </div>
          <h1 className="font-poppins text-4xl md:text-5xl font-bold tracking-tight mb-6">Starting and Growing a Career in Web Design</h1>
        </header>
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <p>As the internet continues to develop and grow exponentially, jobs related to the industry do too, particularly those that relate to web design and development. The prediction is that by 2029, the job outlook for these two fields will grow by 8%—significantly faster than average.</p>
          <h2 className="font-poppins text-2xl font-bold text-white pt-4">What does a career in web design involve?</h2>
          <p>A career in website design can involve the design, creation, and coding of a range of website types. Other tasks will typically include liaising with clients and discussing website specifications, incorporating feedback, working on graphic design and image editing, and enabling multimedia features such as audio and video.</p>
          <h2 className="font-poppins text-2xl font-bold text-white pt-4">Full-stack, back-end, and front-end web development</h2>
          <p>The U.S. Bureau of Labor Statistics (BLS) Occupational Outlook Handbook tends to group web developers and digital designers into one category. However, they define them separately, stating that web developers create and maintain websites and are responsible for the technical aspects including performance and capacity.</p>
          <h2 className="font-poppins text-2xl font-bold text-white pt-4">Are web designers in demand?</h2>
          <p>In our ever-increasingly digital environment, there is a constant need for websites—and therefore for web designers and developers. With 17.4 billion websites in existence as of January 2020, the demand for web developers is only expected to rise.</p>
          <h2 className="font-poppins text-2xl font-bold text-white pt-4">Starting Your Web Design Career Online</h2>
          <p>A strong career in web design needs two things working together: a <strong className="text-white">portfolio that impresses</strong> and a <strong className="text-white">presence that keeps you visible</strong>.</p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li><strong className="text-white">Templyo</strong> — ready-made Framer templates to build a professional portfolio</li>
            <li><strong className="text-white">PostWing</strong> — schedule and manage social posts across 8 platforms</li>
          </ul>
        </div>
        <div className="mt-16 pt-8 border-t border-white/10">
          <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /> All Articles</Link>
        </div>
      </article>
    </main>
  );
}
