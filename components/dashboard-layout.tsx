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
  Bell,
  Sparkles
} from "lucide-react";
import { OpenDoorLogo } from "./open-door-logo";
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-4 md:px-6 shadow-sm">
        {/* Sidebar Toggle Button for Mobile */}
        <Button variant="outline" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle Menu</span>
        </Button>

        <OpenDoorLogo size="md" showText={true} />

        <div className="ml-auto flex items-center gap-3">
          <div className="relative group">
            <NotificationBell isAdmin={true} />
          </div>
          <ModeToggle />
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            <Avatar className="relative ring-2 ring-blue-100 dark:ring-blue-900 group-hover:ring-blue-300 dark:group-hover:ring-blue-700 transition-all duration-300">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">AD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl transition-transform md:static md:translate-x-0 shadow-xl md:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* User Info */}
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-transparent dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-transparent"></div>
            <div className="relative flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300 rounded-full"></div>
                <Avatar className="relative ring-2 ring-blue-200 dark:ring-blue-800 group-hover:ring-blue-300 dark:group-hover:ring-blue-700 transition-all duration-300 transform group-hover:scale-105">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white font-bold">OD</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                  Admin
                  <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">admin@example.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-auto py-4">
            <div className="px-4 py-2">
              <div className="mb-3 px-2 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                <h2 className="text-xs font-bold tracking-wider text-blue-700 dark:text-blue-400 uppercase">Management</h2>
              </div>
              <div className="space-y-1">
                {routes.map((route) => (
                  <Button
                    key={route.href}
                    variant={isActive(route.href) ? "secondary" : "ghost"}
                    className={`w-full justify-start transition-all duration-200 group relative overflow-hidden ${
                      isActive(route.href) 
                        ? "bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-600/20 dark:via-indigo-600/20 dark:to-purple-600/20 text-blue-700 dark:text-blue-300 font-semibold shadow-sm border border-blue-200/50 dark:border-blue-800/50" 
                        : "hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-950/30 dark:hover:to-indigo-950/30 hover:border hover:border-blue-100/50 dark:hover:border-blue-900/30"
                    }`}
                    asChild
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Link href={route.href}>
                      {isActive(route.href) && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-r"></span>
                      )}
                      <route.icon className={`mr-2 h-4 w-4 transition-transform duration-200 ${
                        isActive(route.href) ? "" : "group-hover:scale-110"
                      }`} />
                      {route.title}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </nav>

          {/* Logout Button */}
          <div className="mt-auto border-t border-slate-200/50 dark:border-slate-800/50 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 to-orange-50/80 dark:from-red-950/20 dark:to-orange-950/20"></div>
            <Button
              variant="ghost"
              className="w-full justify-start relative group text-red-600 hover:text-red-700 hover:bg-red-100/80 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
              Log Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
