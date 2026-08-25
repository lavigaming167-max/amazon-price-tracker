import type { Metadata } from "next";
import { Fraunces } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';
import { Inter } from 'next/font/google';
import "./globals.css";

const fraunces = Fraunces({ weight: ['700', '900'], subsets: ['latin'], variable: '--font-serif' });
const jetBrainsMono = JetBrains_Mono({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-mono' });
const inter = Inter({ weight: ['500'], subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Waitlist Landing Page",
  description: "Professional waitlist for Amazon price drop alerts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${fraunces.className} ${jetBrainsMono.className} ${inter.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}