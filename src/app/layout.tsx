import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AIbbas — AI Content Producer",
  description:
    "AI Content Producer | Motion Graphics | Editor. From Raw Ideas to Rendered Perfection.",
  openGraph: {
    title: "AIbbas — AI Content Producer",
    description: "From Raw Ideas to Rendered Perfection.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${montserrat.variable} font-body antialiased bg-[#080808] text-white`}>
        {children}
      </body>
    </html>
  );
}
