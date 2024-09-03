import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kr" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-full`}>
        <header>
          <NavBar />
        </header>
        <main className="flex-grow container mx-auto px-10 py-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
