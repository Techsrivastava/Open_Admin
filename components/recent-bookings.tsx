"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { getAllBookings, Booking } from "@/app/api/booking-controller"

const recentBookings = [
  {
    id: "B-1234",
    customerName: "Rahul Sharma",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    customerInitials: "RS",
    packageName: "Manali Adventure",
    date: "Mar 15, 2025",
    amount: "₹24,500",
    status: "confirmed",
  },
  {
    id: "B-1235",
    customerName: "Priya Patel",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    customerInitials: "PP",
    packageName: "Char Dham Yatra",
    date: "Mar 14, 2025",
    amount: "₹45,000",
    status: "confirmed",
  },
  {
    id: "B-1236",
    customerName: "Amit Kumar",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    customerInitials: "AK",
    packageName: "Valley of Flowers Trek",
    date: "Mar 14, 2025",
    amount: "₹18,750",
    status: "pending",
  },
  {
    id: "B-1237",
    customerName: "Neha Singh",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    customerInitials: "NS",
    packageName: "Kedarnath Trek",
    date: "Mar 13, 2025",
    amount: "₹32,000",
    status: "confirmed",
  },
  {
    id: "B-1238",
    customerName: "Vikram Malhotra",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    customerInitials: "VM",
    packageName: "Goa Beach Package",
    date: "Mar 12, 2025",
    amount: "₹15,800",
    status: "confirmed",
  },
]

export function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllBookings()
      .then((data) => {
        setBookings(data)
      })
      .catch(() => {
        setBookings(null) // fallback to static if needed
      })
      .finally(() => setLoading(false))
  }, [])

  const displayBookings = bookings && bookings.length > 0 ? bookings : recentBookings

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : (
          displayBookings.map((booking: any) => (
            <Card key={booking._id || booking.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center p-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={booking.customerAvatar || "/placeholder.svg?height=40&width=40"} alt={booking.customer?.name || booking.customerName} />
                    <AvatarFallback>{booking.customer?.name?.split(" ").map((n: string) => n[0]).join("") || booking.customerInitials}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium leading-none">{booking.customer?.name || booking.customerName}</p>
                        <p className="ml-2 text-xs text-muted-foreground">#{booking.bookingId || booking.id}</p>
                      </div>
                      <Badge
                        variant={booking.status === "Confirmed" || booking.status === "confirmed" ? "default" : "outline"}
                        className={booking.status === "Confirmed" || booking.status === "confirmed" ? "bg-green-500" : ""}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-muted-foreground">{booking.package?.name || booking.packageName}</p>
                      <p className="font-medium">{booking.amount ? `₹${booking.amount}` : booking.amount}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{booking.travelDate || booking.date}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  )
}

