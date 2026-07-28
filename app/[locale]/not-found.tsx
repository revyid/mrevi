"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-8">
      <div className="max-w-lg w-full space-y-8">
        {/* Big 404 */}
        <div>
          <p className="text-xs font-mono tracking-[0.2em] text-muted-foreground uppercase mb-4">
            Error 404
          </p>
          <h1 className="text-[clamp(5rem,18vw,10rem)] font-bold uppercase leading-[0.85] tracking-tight font-heading">
            <span className="block">NOT</span>
            <span className="block text-muted-foreground/15">FOUND</span>
          </h1>
        </div>

        <div className="h-px bg-border" />

        {/* Description + actions */}
        <div className="space-y-6">
          <p className="text-muted-foreground text-[15px] leading-relaxed max-w-sm">
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
            <button onClick={() => history.back()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              Go Back
            </button>
          </div>
        </div>

        {/* Decorative */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground/40 font-mono">
          <span className="size-1.5 rounded-full bg-muted-foreground/20" />
          <span>revy.my.id</span>
          <span className="size-1.5 rounded-full bg-muted-foreground/20" />
          <span>page not found</span>
        </div>
      </div>
    </div>
  );
}
