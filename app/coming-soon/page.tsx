export default function ComingSoonPage() {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-screen bg-[#0a0a0a] text-[#fafafa] flex items-center justify-center p-8">
        <div className="text-center max-w-md space-y-6">
          <div className="text-7xl font-bold">🔜</div>
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tight">Coming Soon</h1>
            <p className="text-[#888] mt-3 text-lg">
              Something exciting is in the works. Stay tuned.
            </p>
          </div>
          <a href="/" className="inline-block px-6 py-2 rounded-lg border border-white/10 text-sm hover:bg-white/5 transition-colors">
            ← Back to Home
          </a>
        </div>
      </body>
    </html>
  );
}
