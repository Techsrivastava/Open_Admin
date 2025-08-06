"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Users, Package, Mountain, Compass } from "lucide-react"
import DashboardLayout from "./dashboard-layout"
import { RecentBookings } from "./recent-bookings"
import { UpcomingTours } from "./upcoming-tours"
import { useEffect, useState } from "react"
import { getOverallSummary, getAllBookings } from "@/app/api/booking-controller"
import { getPackages } from "@/app/api/package-controller"

export default function DashboardView() {
  const [totalBookings, setTotalBookings] = useState(0)
  const [charDhamBookings, setCharDhamBookings] = useState(0)
  const [trekBookings, setTrekBookings] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Get all bookings
        const bookings = await getAllBookings()
        setTotalBookings(bookings?.length || 0)
        // Get all packages
        const packagesRes = await getPackages()
        let charDhamCount = 0
        let trekCount = 0
        if (packagesRes.success && packagesRes.data) {
          for (const pkg of packagesRes.data) {
            if (pkg.category?.toLowerCase().includes("char dham")) charDhamCount++
            if (pkg.category?.toLowerCase().includes("trek")) trekCount++
          }
        }
        setCharDhamBookings(charDhamCount)
        setTrekBookings(trekCount)
      } catch {
        setTotalBookings(0)
        setCharDhamBookings(0)
        setTrekBookings(0)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">March 17, 2025</span>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? 0 : totalBookings}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Char Dham Bookings</CardTitle>
                  <Compass className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? 0 : charDhamBookings}</div>
                  <p className="text-xs text-muted-foreground">+18% from last season</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Trek Bookings</CardTitle>
                  <Mountain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? 0 : trekBookings}</div>
                  <p className="text-xs text-muted-foreground">+7% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>There were 248 bookings in the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentBookings />
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Upcoming Tours</CardTitle>
                  <CardDescription>Tours scheduled for the next 14 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <UpcomingTours />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>View detailed analytics for your travel packages and bookings</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Analytics dashboard coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>Generate and download reports for your business</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Reports dashboard coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

