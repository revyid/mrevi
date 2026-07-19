import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { ProfileCard } from "@/components/profile-card";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "Sawad - Software Engineer",
  description: "A sleek and modern portfolio designed for creatives",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground font-sans">
        {/* Top Pill Navigation */}
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
          <Navigation />
        </div>

        <div className="flex min-h-screen pt-20">
          {/* Left Sidebar - Profile Card */}
          <aside className="hidden xl:block w-[320px] shrink-0 sticky top-20 h-[calc(100vh-5rem)] py-8 px-6">
            <ProfileCard />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
