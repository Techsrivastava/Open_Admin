"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Users,
  Mountain,
  Compass,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Mail,
  User2,
  Book,
  ComponentIcon,
  Library,
  Rss,
  Tag,
  Briefcase,
  FileText,
  Bell
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "./mode-toggle";
import { NotificationBell } from "./notification-bell";
import { toast } from "react-hot-toast"; // ✅ Snackbar for notifications

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setTimeout(() => {
        router.push("/login");
      }, 500); // ✅ Delay to avoid flicker
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  // Sidebar Navigation Routes
  const routes = useMemo(() => [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Bookings",
      href: "/dashboard/bookings",
      icon: Calendar,
    },
    {
      title: "Packages",
      href: "/dashboard/packages",
      icon: Package,
    },
    {
      title: "Blogs",
      href: "/dashboard/blogs",
      icon: FileText,
    },
    {
      title: "Leads",
      href: "/dashboard/leads",
      icon: Book,
    },
    {
      title: "Customers",
      href: "/dashboard/customers",
      icon: User2,
    },
    {
      title: "Jobs & Applications",
      href: "/dashboard/jobs",
      icon: Briefcase,
    },
   
    { href: "/dashboard/categories", icon: Tag, title: "Categories" },
    { href: "/dashboard/coupons", icon: ComponentIcon, title: "Coupons" },
    { href: "/dashboard/ads", icon: Rss, title: "Ads" },
    { href: "/dashboard/notifications", icon: Bell, title: "Notifications" },
    { href: "/dashboard/notification-test", icon: Bell, title: "Notification Test" },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    }
  ], [pathname]);

  // ✅ Check active route
  const isActive = (href: string, exact = false) => exact ? pathname === href : pathname.startsWith(href);

  // ✅ Logout Function
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast.success("Logged out successfully!");
    router.push("/login");
  };

  // ✅ Redirect to login page if not authenticated
  if (!isAuthenticated) return null; // 👈 Prevents flicker while checking auth

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        {/* Sidebar Toggle Button for Mobile */}
        <Button variant="outline" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle Menu</span>
        </Button>

        <div className="flex items-center gap-2">
          <Mountain className="h-6 w-6" />
          <span className="font-bold">Open Door Expeditions Admin</span>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <NotificationBell isAdmin={true} />
          <ModeToggle />
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-background transition-transform md:static md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Admin</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Mail className="h-4 w-4" />
                  <span>admin@example.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-auto py-4">
            <div className="px-4 py-2">
              <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight">Management</h2>
              <div className="space-y-1">
                {routes.map((route) => (
                  <Button
                    key={route.href}
                    variant={isActive(route.href) ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Link href={route.href}>
                      <route.icon className="mr-2 h-4 w-4" />
                      {route.title}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </nav>

          {/* Logout Button */}
          <div className="mt-auto border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={handleLogout} // ✅ Logout Function
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
