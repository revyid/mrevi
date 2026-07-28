export default function ComingSoonPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Coming Soon</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { height: 100%; }
          body {
            background: #0a0a0a;
            color: #fafafa;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 2rem;
          }
          .container { text-align: center; max-width: 420px; }
          .icon-wrap {
            width: 80px; height: 80px;
            background: rgba(99,102,241,0.1);
            border: 1px solid rgba(99,102,241,0.2);
            border-radius: 20px;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 2rem;
          }
          .icon-wrap svg { width: 36px; height: 36px; color: #818cf8; }
          .code { font-size: 0.75rem; font-family: monospace; letter-spacing: 0.15em; color: #555; text-transform: uppercase; margin-bottom: 0.75rem; }
          h1 { font-size: clamp(2rem, 6vw, 3.5rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1; text-transform: uppercase; }
          h1 span { display: block; color: rgba(250,250,250,0.15); }
          p { color: #888; margin-top: 1.25rem; font-size: 1rem; line-height: 1.6; }
          .btn {
            display: inline-flex; align-items: center; gap: 0.5rem;
            margin-top: 2rem; padding: 0.6rem 1.25rem;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 0.5rem; font-size: 0.875rem; color: #888;
            text-decoration: none; transition: all 0.15s;
            background: transparent;
          }
          .btn:hover { background: rgba(255,255,255,0.05); color: #fafafa; border-color: rgba(255,255,255,0.2); }
          .btn svg { width: 14px; height: 14px; }
          .status { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #818cf8; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.15); padding: 0.25rem 0.75rem; border-radius: 9999px; margin-bottom: 1.5rem; }
          .status svg { width: 12px; height: 12px; }
          .dots { display: flex; gap: 0.4rem; justify-content: center; margin-top: 2rem; }
          .dots span { width: 6px; height: 6px; border-radius: 50%; background: #818cf8; animation: bounce 1.4s infinite ease-in-out; }
          .dots span:nth-child(1) { animation-delay: 0s; }
          .dots span:nth-child(2) { animation-delay: 0.2s; }
          .dots span:nth-child(3) { animation-delay: 0.4s; }
          @keyframes bounce { 0%,80%,100%{transform:scale(0);opacity:0.3} 40%{transform:scale(1);opacity:1} }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v10l4.24 2.5M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0z"/>
            </svg>
          </div>
          <div className="status">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            In Development
          </div>
          <p className="code">— Coming Soon —</p>
          <h1>Almost<span>There</span></h1>
          <p>Something exciting is being built here. We&apos;ll be launching soon.</p>
          <div className="dots">
            <span /><span /><span />
          </div>
          <a href="/" className="btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Home
          </a>
        </div>
      </body>
    </html>
  );
}
