import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "@/components/SessionProvider";
import PageTransition from "@/components/layout/PageTransition";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShieldLedger",
  description: "Blockchain document authentication platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-text`}>
        <SessionProvider>
          <PageTransition>{children}</PageTransition>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#111E35",
                color: "#F0F0F0",
                border: "1px solid rgba(255,255,255,0.08)",
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
