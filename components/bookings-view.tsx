"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Filter, MoreHorizontal, Plus, Search } from "lucide-react"
import DashboardLayout from "./dashboard-layout"

const bookings = [
  {
    id: "B-1234",
    customerName: "Rahul Sharma",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    customerInitials: "RS",
    packageName: "Manali Adventure",
    packageType: "Domestic",
    bookingDate: "Mar 15, 2025",
    travelDate: "Apr 10, 2025",
    amount: "₹24,500",
    participants: 2,
    status: "Confirmed",
  },
  {
    id: "B-1235",
    customerName: "Priya Patel",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    customerInitials: "PP",
    packageName: "Complete Char Dham Yatra",
    packageType: "Pilgrimage",
    bookingDate: "Mar 14, 2025",
    travelDate: "May 20, 2025",
    amount: "₹45,000",
    participants: 1,
    status: "Confirmed",
  },
  {
    id: "B-1236",
    customerName: "Amit Kumar",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    customerInitials: "AK",
    packageName: "Valley of Flowers Trek",
    packageType: "Trek",
    bookingDate: "Mar 14, 2025",
    travelDate: "Jul 15, 2025",
    amount: "₹18,750",
    participants: 4,
    status: "Pending",
  },
  {
    id: "B-1237",
    customerName: "Neha Singh",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    customerInitials: "NS",
    packageName: "Kedarnath Trek",
    packageType: "Trek",
    bookingDate: "Mar 13, 2025",
    travelDate: "Jun 5, 2025",
    amount: "₹32,000",
    participants: 2,
    status: "Confirmed",
  },
  {
    id: "B-1238",
    customerName: "Vikram Malhotra",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    customerInitials: "VM",
    packageName: "Goa Beach Package",
    packageType: "Domestic",
    bookingDate: "Mar 12, 2025",
    travelDate: "Apr 2, 2025",
    amount: "₹15,800",
    participants: 3,
    status: "Confirmed",
  },
  {
    id: "B-1239",
    customerName: "Anjali Desai",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    customerInitials: "AD",
    packageName: "Rajasthan Heritage Tour",
    packageType: "Domestic",
    bookingDate: "Mar 10, 2025",
    travelDate: "Apr 25, 2025",
    amount: "₹32,500",
    participants: 2,
    status: "Cancelled",
  },
  {
    id: "B-1240",
    customerName: "Rajiv Kapoor",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    customerInitials: "RK",
    packageName: "Do Dham Yatra",
    packageType: "Pilgrimage",
    bookingDate: "Mar 8, 2025",
    travelDate: "May 15, 2025",
    amount: "₹32,000",
    participants: 5,
    status: "Confirmed",
  },
]

export default function BookingsView() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Booking
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center space-x-2 md:w-2/3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Date Range
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Travel Date</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={booking.customerAvatar} alt={booking.customerName} />
                        <AvatarFallback>{booking.customerInitials}</AvatarFallback>
                      </Avatar>
                      {booking.customerName}
                    </div>
                  </TableCell>
                  <TableCell>{booking.packageName}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        booking.packageType === "Trek"
                          ? "bg-blue-500 text-white"
                          : booking.packageType === "Pilgrimage"
                            ? "bg-orange-500 text-white"
                            : "bg-green-500 text-white"
                      }
                    >
                      {booking.packageType}
                    </Badge>
                  </TableCell>
                  <TableCell>{booking.travelDate}</TableCell>
                  <TableCell>{booking.participants}</TableCell>
                  <TableCell>{booking.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        booking.status === "Confirmed"
                          ? "bg-green-500 text-white"
                          : booking.status === "Pending"
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Booking</DropdownMenuItem>
                        <DropdownMenuItem>Send Confirmation</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Cancel Booking</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}

