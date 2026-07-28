export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>404 — Not Found</title>
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
            justify-content: center;
          }
          .wrap { max-width: 500px; padding: 2rem 0; width: 100%; text-align: center; }
          .label {
            font-size: 0.75rem;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: #555;
            margin-bottom: 1.5rem;
            font-family: 'Inter', sans-serif;
          }
          h1 {
            font-family: 'Poppins', sans-serif;
            font-size: clamp(4rem, 14vw, 10rem);
            font-weight: 900;
            text-transform: uppercase;
            line-height: 0.95;
            letter-spacing: -0.03em;
          }
          h1 .faded { color: rgba(250,250,250,0.12); display: block; }
          .desc {
            margin-top: 1.5rem;
            color: #666;
            font-size: 1rem;
            line-height: 1.6;
            max-width: 360px;
            margin-left: auto;
            margin-right: auto;
          }
          .actions { display: flex; gap: 0.75rem; margin-top: 2.5rem; flex-wrap: wrap; justify-content: center; }
          .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.55rem 1.1rem;
            border-radius: 0.5rem;
            font-size: 0.8rem;
            text-decoration: none;
            transition: all 0.15s;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            border: none;
          }
          .btn-primary { background: #fafafa; color: #0a0a0a; }
          .btn-primary:hover { background: #e5e5e5; }
          .btn-secondary { background: transparent; color: #666; border: 1px solid #282828; }
          .btn-secondary:hover { border-color: #444; color: #fafafa; background: rgba(255,255,255,0.03); }
          .btn svg { width: 13px; height: 13px; }
        `}</style>
      </head>
      <body>
        <div className="wrap">
          <p className="label">Error 404</p>
          <h1>
            NOT
            <span className="faded">FOUND</span>
          </h1>
          <p className="desc">
            The page you&apos;re looking for doesn&apos;t exist, has been moved, or you don&apos;t have permission to access it.
          </p>
          <div className="actions">
            <a href="/" className="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Go Home
            </a>
            <a href="javascript:history.back()" className="btn btn-secondary">Go Back</a>
          </div>
        </div>
      </body>
    </html>
  );
}
