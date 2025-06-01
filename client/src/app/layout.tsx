import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { Toaster } from "@/components/ui/toaster";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Journalshe - Master Your English",
  description: "Improve your English writing skills with AI-guided feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ThemeProvider>
        <ToastProvider>
          <body className={`${manrope.variable} antialiased`}>
            {children}
            <Toaster />
          </body>
        </ToastProvider>
      </ThemeProvider>
    </html>
  );
}
