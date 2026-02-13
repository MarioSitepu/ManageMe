import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { GlobalProvider } from "@/lib/GlobalContext";

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
      <body className={inter.className}>
        <GlobalProvider>
          <div className="main-layout" style={{ paddingBottom: '80px' }}>
            {children}
          </div>
          <Navbar />
        </GlobalProvider>
      </body>
    </html>
  );
}
