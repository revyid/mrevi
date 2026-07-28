export default function MaintenancePage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Under Maintenance</title>
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
            background: rgba(234,179,8,0.1);
            border: 1px solid rgba(234,179,8,0.2);
            border-radius: 20px;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 2rem;
          }
          .icon-wrap svg { width: 36px; height: 36px; color: #eab308; }
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
          .dot { width: 6px; height: 6px; border-radius: 50%; background: #eab308; display: inline-block; margin-right: 0.5rem; animation: pulse 2s infinite; }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
          .status { display: inline-flex; align-items: center; font-size: 0.75rem; color: #eab308; background: rgba(234,179,8,0.08); border: 1px solid rgba(234,179,8,0.15); padding: 0.25rem 0.75rem; border-radius: 9999px; margin-bottom: 1.5rem; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div className="status"><span className="dot" />Scheduled Maintenance</div>
          <p className="code">503 — Service Unavailable</p>
          <h1>Under<span>Maintenance</span></h1>
          <p>We&apos;re performing scheduled maintenance on this page. It will be back shortly.</p>
          <a href="/" className="btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Home
          </a>
        </div>
      </body>
    </html>
  );
}
