import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { GlobalProvider } from "@/lib/GlobalContext";
import { ClientPadding } from "@/components/layout/ClientPadding";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrackMe - Student Discipline",
  description: "Master your time, finances, and habits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <GlobalProvider>
          <ClientPadding>
            {children}
          </ClientPadding>
          <Navbar />
        </GlobalProvider>
      </body>
    </html>
  );
}
