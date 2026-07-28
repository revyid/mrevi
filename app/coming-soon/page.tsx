export default function ComingSoonPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Coming Soon</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;900&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { height: 100%; }
          body {
            background: #0a0a0a;
            color: #fafafa;
            font-family: 'Inter', -apple-system, sans-serif;
            min-height: 100vh;
            padding: 2rem;
            display: flex;
            align-items: center;
          }
          .wrap { max-width: 900px; padding: 2rem 0; width: 100%; }
          .label {
            font-family: 'Inter', sans-serif;
            font-size: 0.75rem;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: #555;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
          }
          .dots { display: inline-flex; gap: 3px; }
          .dots span {
            width: 4px; height: 4px; border-radius: 50%; background: #555;
            animation: bounce 1.4s infinite ease-in-out;
          }
          .dots span:nth-child(2) { animation-delay: 0.2s; }
          .dots span:nth-child(3) { animation-delay: 0.4s; }
          @keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:0.3} 40%{transform:translateY(-3px);opacity:1} }
          h1 {
            font-family: 'Poppins', sans-serif;
            font-size: clamp(3.5rem, 12vw, 8rem);
            font-weight: 900;
            text-transform: uppercase;
            line-height: 0.95;
            letter-spacing: -0.03em;
          }
          h1 .faded { color: rgba(250,250,250,0.12); display: block; }
          .desc {
            margin-top: 3rem;
            color: #666;
            font-size: 1rem;
            line-height: 1.6;
            max-width: 400px;
            border-left: 1px solid #282828;
            padding-left: 1.25rem;
          }
          .back {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 2.5rem;
            padding: 0.55rem 1.1rem;
            border: 1px solid #282828;
            border-radius: 0.5rem;
            font-size: 0.8rem;
            color: #666;
            text-decoration: none;
            transition: all 0.15s;
            font-family: 'Inter', sans-serif;
          }
          .back:hover { border-color: #444; color: #fafafa; background: rgba(255,255,255,0.03); }
          .back svg { width: 13px; height: 13px; }
        `}</style>
      </head>
      <body>
        <div className="wrap">
          <div className="label">
            <span className="dots"><span /><span /><span /></span>
            In Development
          </div>
          <h1>
            COMING
            <span className="faded">SOON</span>
          </h1>
          <p className="desc">
            Something new is being built here. Check back soon.
          </p>
          <a href="/" className="back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to Home
          </a>
        </div>
      </body>
    </html>
  );
}
