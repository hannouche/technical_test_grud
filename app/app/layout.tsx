import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import ThemeProvider from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import DashboardLayoutClient from "@/components/layouts/dashboard/dashboard-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Storeify",
  description: "Storeify is a platform for creating and managing your store",
};

export interface Store {
  id: number;
  name: string;
  logo: string;
  domain: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  image: string;
}
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  const user = {
    id: 1,
    name: "Ayoub Hannouch",
    email: "ayoubhannouch0@gmail.com",
    image: "https://github.com/shadcn.png",
  }

  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
          <QueryProvider>
            <ThemeProvider>
              <DashboardLayoutClient user={user}>
                {children}
              </DashboardLayoutClient>
              <Toaster position="top-center"/>
            </ThemeProvider>
          </QueryProvider>
      </body>
    </html>
  );
}
