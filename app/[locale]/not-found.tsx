"use client";

import Link from "next/link";
import { DotmHex5 } from "@/components/ui/dotm-hex-5";

export default function NotFound() {
  return (
    <div className="space-y-24 w-full py-8">
      <section className="pt-8 pb-4">
        <DotmHex5 size={42} bloom className="mb-6" />
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[90px] font-bold uppercase leading-[0.95] tracking-tight font-heading">
          <span className="block">404</span>
          <span className="block text-muted-foreground/20">NOT FOUND</span>
        </h1>
      </section>

      <section className="space-y-6 max-w-md">
        <p className="text-muted-foreground text-[16px] leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist, has been moved, or you don&apos;t have permission to access it.
        </p>
        <div className="flex items-center gap-3">
          <Link href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Go Home
          </Link>
          <button
            onClick={() => history.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            Go Back
          </button>
        </div>
      </section>
    </div>
  );
}
