import type { Metadata } from "next";

import { ToastContainer } from "react-toastify";

import { ThemeProvider } from "@/components/theme/ThemeProvider";

import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScholarLinq",
  description: "ScholarLinq | Empowering Education, Simplifying Management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning data-theme="light">
      <body className="min-h-full font-sans antialiased">
        <ThemeProvider>
          {children}
          <ToastContainer position="bottom-right" theme="dark" />
        </ThemeProvider>
      </body>
    </html>
  );
}
