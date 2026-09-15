// Root layout — next-intl proxy redirects "/" → "/en" or "/id"
// This file exists only to satisfy Next.js App Router requirements.
// globals.css is imported here so app/not-found.tsx gets base styles.
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
