import "./globals.css";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${playfair.variable} min-h-screen`}>
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-28 border-b border-[var(--border)] bg-white/78 backdrop-blur-xl" />
            <div className="absolute -left-28 top-20 h-72 w-72 rounded-full bg-[var(--accent-light)]/55 blur-3xl" />
            <div className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-[#f6e8f0] blur-3xl" />
            <div className="absolute bottom-20 left-1/2 h-72 w-[32rem] -translate-x-1/2 rounded-full bg-white/85 blur-3xl" />
          </div>

          <Navbar />

          <main className="flex-1">
            {children}
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}