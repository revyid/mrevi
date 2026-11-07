import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const isDev = process.env.NODE_ENV !== "production";

// CSP notes:
// - script-src keeps 'unsafe-inline': the App Router streams the RSC payload via
//   inline <script>self.__next_f.push(...)</script>; removing it requires nonce
//   middleware, which is too risky to add without runtime verification.
// - style-src keeps 'unsafe-inline': Next injects inline styles for fonts/CSS.
// - 'unsafe-eval' is dev-only (React refresh); prod builds don't need it.
// - cdn.jsdelivr.net is only used by /en/sandbox (pyodide + typescript), so it
//   is scoped to that route below instead of being allowed site-wide.
function buildCsp({ allowJsdelivr = false, allowWasm = false }: { allowJsdelivr?: boolean; allowWasm?: boolean } = {}) {
  const jsdelivr = allowJsdelivr ? " https://cdn.jsdelivr.net" : "";
  const wasm = allowWasm ? " 'wasm-unsafe-eval'" : "";
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${wasm}${isDev ? " 'unsafe-eval'" : ""}${jsdelivr}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://framerusercontent.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://cdn.jsdelivr.net https://images.unsplash.com https://revy.biz.id",
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.revy.my.id${isDev ? " http://localhost:3001" : ""}${jsdelivr}`,
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Enable XSS filter in older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Control referrer information
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Enforce HTTPS for 1 year
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Restrict browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: buildCsp(),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "framerusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "revy.biz.id" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/en/privasi",
        destination: "/en/privacy",
        permanent: true,
      },
      {
        source: "/en/syarat",
        destination: "/en/terms",
        permanent: true,
      },
      {
        source: "/en/tentang",
        destination: "/en/about",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // Sandbox loads pyodide/typescript from cdn.jsdelivr.net and compiles wasm.
      // Last matching rule wins per key (Next headers docs), so this overrides
      // the strict CSP on that route only.
      {
        source: "/en/sandbox",
        headers: [
          {
            key: "Content-Security-Policy",
            value: buildCsp({ allowJsdelivr: true, allowWasm: true }),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
