import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Web Arcade",
  description: "Sua biblioteca de jogos retro na nuvem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-background-primary text-text-primary min-h-screen flex flex-col`}>
        <Navbar />
        
        <main className="flex-1">
          {children}
        </main>
        
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}