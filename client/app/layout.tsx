"use client";
import "./globals.css";

import Header from "./ui/my_components/Header";
import { ThemeProvider } from "./ui/my_components/Theme/theme-provider";
import Footer from "./ui/my_components/Footer";
import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/context/QueryProvider";
import { Toaster } from "react-hot-toast";
import { GlobalLoader } from "./ui/my_components/GlobalLoader";
import { useLoadingStore } from "@/lib/loading-store";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoading } = useLoadingStore();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Toaster position="top-center" />
          <SessionProvider>
            <QueryProvider>
              <GlobalLoader show={isLoading} />
              <Header />
              <main
                className="flex flex-col justify-center overflow-x-hidden py-5"
              >
                {children}
              </main>
              <Footer className="px-20" />
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
