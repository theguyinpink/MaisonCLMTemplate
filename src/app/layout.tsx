import "./globals.css";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Inter, Playfair_Display } from "next/font/google";

export const metadata = {
  title: "Maison CLM — Templates modernes pour sites web",
  description: "Templates premium pour créer ton site rapidement.",
  verification: {
    google: "google-site-verification: googlee223452b28187cf7.html",
  },
  keywords: [
    "Maison CLM",
    "CLM templates",
    "templates site web",
    "template vitrine",
    "template portfolio",
    "web design moderne",
    "site web rapide",
    "templates HTML CSS JS",
  ],
  openGraph: {
    title: "Maison CLM",
    description: "Templates web modernes et élégants",
    url: "https://app.maisonclm.fr",
    siteName: "Maison CLM",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
};

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
        <div className="relative min-h-screen overflow-x-hidden bg-[var(--background)]">
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-28 border-b border-[var(--border)] bg-white/78 backdrop-blur-xl" />
            <div className="absolute -left-28 top-20 h-72 w-72 rounded-full bg-[var(--accent-light)]/40 blur-3xl" />
            <div className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-[#f7eef3] blur-3xl" />
            <div className="absolute bottom-20 left-1/2 h-72 w-[32rem] -translate-x-1/2 rounded-full bg-white/85 blur-3xl" />
          </div>

          <div className="flex min-h-screen w-full flex-col bg-[rgba(255,255,255,0.18)]">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
