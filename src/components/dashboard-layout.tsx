"use client"

import type React from "react"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
  UserCircle,
  LineChart,
  Tag,
  Image,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "./mode-toggle"
import { useAuth } from "@/contexts/auth-context"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()

  const routes = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      title: "Dashboard",
      exact: true,
    },
    {
      href: "/packages",
      icon: Package,
      title: "Packages",
    },
    {
      href: "/guides",
      icon: Users,
      title: "Guides",
    },
    {
      href: "/treks",
      icon: Mountain,
      title: "Treks",
    },
    {
      href: "/char-dham",
      icon: Compass,
      title: "Char Dham",
    },
    {
      href: "/bookings",
      icon: Calendar,
      title: "Bookings",
    },
    {
      href: "/customers",
      icon: UserCircle,
      title: "Customers",
    },
    {
      href: "/leads",
      icon: LineChart,
      title: "Leads",
    },
    {
      href: "/ads",
      icon: Image,
      title: "Ads & Offers",
    },
    {
      href: "/coupons",
      icon: Tag,
      title: "Coupons",
    },
    {
      href: "/settings",
      icon: Settings,
      title: "Settings",
    },
  ]

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Button variant="outline" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <div className="flex items-center gap-2">
          <Mountain className="h-6 w-6" />
          <span className="font-bold">TravelEase Admin</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <ModeToggle />
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span>{user?.name}</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {user?.role === "super_admin" ? "Super Admin" : "Admin"}
            </span>
          </div>
          <Avatar>
            <AvatarImage src={user?.avatar || "/placeholder.svg?height=32&width=32"} alt="Avatar" />
            <AvatarFallback>{user?.name?.charAt(0) || "A"}</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <div className="flex flex-1">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-background transition-transform md:static md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center border-b px-6">
            <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
              <Mountain className="h-6 w-6" />
              <span>TravelEase</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-auto py-4">
            <div className="px-4 py-2">
              <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight">Management</h2>
              <div className="space-y-1">
                {routes.map((route) => (
                  <Button
                    key={route.href}
                    variant={isActive(route.href, route.exact) ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to={route.href}>
                      <route.icon className="mr-2 h-4 w-4" />
                      {route.title}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </nav>
          <div className="mt-auto border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

