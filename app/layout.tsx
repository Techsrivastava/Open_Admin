import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { GuidesProvider } from "@/contexts/guides-context";
import { PackagesProvider } from "@/contexts/packages-context";
import { CouponsProvider } from '@/contexts/coupons-context';
import { NotificationProvider } from '@/contexts/notification-context';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Open Door Admin - Dashboard Management",
  description: "Open Door Admin Panel - Manage your expeditions with ease",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NotificationProvider isAdmin={true}>
          <GuidesProvider>
            <PackagesProvider>
              <CouponsProvider>
                {children}
              </CouponsProvider>
            </PackagesProvider>
          </GuidesProvider>
        </NotificationProvider>
        <Toaster />
      </body>
    </html>
  );
}
