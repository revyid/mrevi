// Root layout — next-intl middleware redirects "/" → "/en" or "/id"
// This file exists only to satisfy Next.js App Router requirements.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
