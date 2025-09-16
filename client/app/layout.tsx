import Image from "next/image";
import "./globals.css";

import Header from "./ui/my_components/Header";
import { ThemeProvider } from "./ui/my_components/Theme/theme-provider";
import Footer from "./ui/my_components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main>{children}</main>
          <Footer className="px-20" />
        </ThemeProvider>

      </body>
    </html>
  );
}
