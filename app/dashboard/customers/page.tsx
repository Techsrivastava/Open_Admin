"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MoreHorizontal, Plus, UserCircle, Upload, Trash2, Edit, Book, Send, Download } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { DateRangePicker } from "@/components/date-range-picker"
import { toast } from "sonner"
import type {
  Customer,
  CustomerStatus,
  CustomerFormData,
  CustomerFilters,
  CustomerStats,
} from "../../../types/customer"
import { User } from "lucide-react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { CustomerService } from "../../../services/customerService"

// Add this helper function at the top of the file
const formatCurrency = (amount: string) => {
  if (!amount) return "₹0"

  // Remove non-numeric characters except for digits
  const numericValue = Number.parseInt(amount.replace(/[^0-9]/g, "")) || 0

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericValue)
}

// Update the filters type to match DateRange from react-day-picker
interface Filters {
  search: string
  status: string
  location: string
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

// Add booking type definition after the imports
interface Booking {
  id: string
  packageName: string
  date: string
  amount: string
  status: "Confirmed" | "Pending" | "Completed" | "Cancelled"
}

// Helper to always extract array from API response
function extractCustomersArray(data: any) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  // If single customer object, return as array
  if (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) return [data.data];
  return [];
}

// Helper to calculate stats from customers array
function calculateStats(customersArray: Customer[]) {
  return {
    totalCustomers: customersArray.length,
    activeCustomers: customersArray.filter((c: Customer) => c.status === "Active").length,
    totalRevenue: customersArray.reduce((sum: number, c: Customer) => sum + (parseInt(c.totalSpent || "0")), 0),
    averageBookingsPerCustomer: customersArray.length
      ? customersArray.reduce((sum: number, c: Customer) => sum + (c.totalBookings || 0), 0) / customersArray.length
      : 0,
    averageLifetimeValue: customersArray.length
      ? customersArray.reduce((sum: number, c: Customer) => sum + (parseInt(c.totalSpent || "0")), 0) / customersArray.length
      : 0,
    topCustomers: customersArray
      .map((c: Customer) => ({ id: c._id, ltv: parseInt(c.totalSpent || "0") }))
      .sort((a, b) => b.ltv - a.ltv)
      .slice(0, 5),
  };
}

// Helper to format numbers in Indian units
function formatIndianNumber(num: number) {
  if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)} Cr`;
  if (num >= 1e5) return `₹${(num / 1e5).toFixed(2)} Lakh`;
  if (num >= 1e3) return `₹${(num / 1e3).toFixed(2)} Thousand`;
  return `₹${num}`;
}

export default function CustomersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [isViewBookingsOpen, setIsViewBookingsOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [customerBookings, setCustomerBookings] = useState<Record<string, Booking[]>>({})
  const [statistics, setStatistics] = useState<CustomerStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    totalRevenue: 0,
    averageBookingsPerCustomer: 0,
    averageLifetimeValue: 0,
    topCustomers: [],
  })
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    status: "Active",
    notes: "",
    tags: [],
    avatar: null,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [filters, setFilters] = useState<CustomerFilters>({
    search: "",
    status: "all_status",
    location: "all_location",
    dateRange: {
      from: undefined,
      to: undefined,
    },
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string>("")

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
  
        // Fetch customers data
        const response = await CustomerService.getAllCustomers();
        console.log("Raw API Response:", response);
  
        // Extract customers array safely
        const customersArray = extractCustomersArray(response);
  
        // Map customer data ensuring all fields exist
        const mappedCustomers = customersArray.map((customer: Customer) => {
          const bookings = Array.isArray((customer as any).bookings) ? (customer as any).bookings : [];
          const totalBookings = bookings.length;
          const totalSpent = bookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
          const lastBooking = bookings.length
            ? new Date(Math.max(...bookings.map((b: any) => new Date(b.bookingDate).getTime()))).toLocaleDateString()
            : "No bookings";
          return {
          ...customer,
          name: customer.name || `Customer ${customer.customerId}`,
          phone: customer.phone || "No Phone provided",
          location: customer.location || "Unknown",
            lastBooking,
            initials: (customer as any).initials || (customer.customerId ? customer.customerId.substring(0, 2) : "C"),
            avatar: typeof customer.avatar === 'string' ? customer.avatar : undefined,
            totalBookings,
            totalSpent: totalSpent.toString(),
          };
        });
  
        setCustomers(mappedCustomers);
        setStatistics(calculateStats(mappedCustomers));
        console.log("Processed customers:", mappedCustomers);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch customers data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  


  // Handle search
  const handleSearch = async (query: string) => {
    try {
      setLoading(true)
      const results = await CustomerService.searchCustomers(query)

      // Map the customer data to ensure all required fields exist
      const mappedResults = results.map((customer: Customer) => {
        const bookings = Array.isArray((customer as any).bookings) ? (customer as any).bookings : [];
        const totalBookings = bookings.length;
        const totalSpent = bookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
        const lastBooking = bookings.length
          ? new Date(Math.max(...bookings.map((b: any) => new Date(b.bookingDate).getTime()))).toLocaleDateString()
          : "No bookings";
        return {
        ...customer,
        name: customer.name || `Customer ${customer.customerId}`,
        email: customer.email || "No email provided",
        location: customer.location || "Unknown",
          lastBooking,
          initials: (customer as any).initials || (customer.customerId ? customer.customerId.substring(0, 2) : "C"),
          avatar: typeof customer.avatar === 'string' ? customer.avatar : undefined,
          totalBookings,
          totalSpent: totalSpent.toString(),
        };
      })

      setCustomers(mappedResults)
      setStatistics(calculateStats(mappedResults))
    } catch (error) {
      console.error("Error searching customers:", error)
      toast.error("Failed to search customers")
    } finally {
      setLoading(false)
    }
  }

  // Handle filter
  const handleFilter = async (filters: CustomerFilters) => {
    try {
      setLoading(true)
      const results = await CustomerService.filterCustomers({
        status: filters.status === "all_status" ? undefined : filters.status,
        location: filters.location === "all_location" ? undefined : filters.location,
        dateRange:
          filters.dateRange.from && filters.dateRange.to
            ? {
                from: new Date(filters.dateRange.from),
                to: new Date(filters.dateRange.to),
              }
            : undefined,
      })

      // Map the customer data to ensure all required fields exist
      const mappedResults = results.map((customer: Customer) => {
        const bookings = Array.isArray((customer as any).bookings) ? (customer as any).bookings : [];
        const totalBookings = bookings.length;
        const totalSpent = bookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
        const lastBooking = bookings.length
          ? new Date(Math.max(...bookings.map((b: any) => new Date(b.bookingDate).getTime()))).toLocaleDateString()
          : "No bookings";
        return {
        ...customer,
        name: customer.name || `Customer ${customer.customerId}`,
        email: customer.email || "No email provided",
        location: customer.location || "Unknown",
          lastBooking,
          initials: (customer as any).initials || (customer.customerId ? customer.customerId.substring(0, 2) : "C"),
          avatar: typeof customer.avatar === 'string' ? customer.avatar : undefined,
          totalBookings,
          totalSpent: totalSpent.toString(),
        };
      })

      setCustomers(mappedResults)
      setStatistics(calculateStats(mappedResults))
    } catch (error) {
      console.error("Error filtering customers:", error)
      toast.error("Failed to filter customers")
    } finally {
      setLoading(false)
    }
  }

  // Handle form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const formDataObj = new FormData()
      if (formData.avatar) {
        formDataObj.append("avatar", formData.avatar)
      }
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "avatar" && value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formDataObj.append(key, JSON.stringify(value))
          } else {
            formDataObj.append(key, value.toString())
          }
        }
      })

      if (selectedCustomer) {
        await CustomerService.updateCustomer(selectedCustomer._id, formDataObj)
        toast.success("Customer updated successfully")
      } else {
        await CustomerService.createCustomer(formDataObj)
        toast.success("Customer created successfully")
      }

      // Refresh the customer list and stats
      const customersData = await CustomerService.getAllCustomers()
      const customersArray = extractCustomersArray(customersData)
      setCustomers(customersArray)
      setStatistics(calculateStats(customersArray))

      setIsAddCustomerOpen(false)
      setIsEditCustomerOpen(false)
      setSelectedCustomer(null)
      setFormData({
        name: "",
        email: "",
        phone: "",
        location: "",
        status: "Active",
        notes: "",
        tags: [],
        avatar: null,
      })
    } catch (error) {
      console.error("Error saving customer:", error)
      toast.error("Failed to save customer")
    } finally {
      setLoading(false)
    }
  }

  // Handle delete customer
  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return

    try {
      setLoading(true)
      await CustomerService.deleteCustomer(id)
      toast.success("Customer deleted successfully")

      // Refresh the customer list and stats
      const customersData = await CustomerService.getAllCustomers()
      const customersArray = extractCustomersArray(customersData)
      setCustomers(customersArray)
      setStatistics(calculateStats(customersArray))
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast.error("Failed to delete customer")
    } finally {
      setLoading(false)
    }
  }

  // Handle view bookings
  const handleViewBookings = (customer: Customer) => {
    const bookings = Array.isArray((customer as any).bookings)
      ? (customer as any).bookings
      : [];
      setCustomerBookings((prev) => ({
        ...prev,
        [customer._id]: bookings,
    }));
    setSelectedCustomer(customer);
    setIsViewBookingsOpen(true);
  }

  // Handle profile image upload
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form change
  const handleFormChange = (field: keyof CustomerFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setFormErrors((prev) => ({
      ...prev,
      [field]: "",
    }))
  }

  // Render functions
  const renderCustomerStatus = (status: CustomerStatus) => {
    const statusColors = {
      Active: "bg-green-500",
      Inactive: "bg-gray-500",
      Pending: "bg-yellow-500",
    }

    return <Badge className={`${statusColors[status]} text-white`}>{status}</Badge>
  }

  const renderCustomerActions = (customer: Customer) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              setSelectedCustomer(customer)
              setFormData({
                name: customer.name || "",
                email: customer.email || "",
                phone: customer.phone || "",
                location: customer.location || "",
                status: customer.status,
                notes: customer.notes || "",
                tags: customer.tags || [],
                avatar: null,
              })
              setIsEditCustomerOpen(true)
            }}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleViewBookings(customer)}>
            <Book className="mr-2 h-4 w-4" /> View Bookings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setSelectedCustomer(customer)
              setIsEmailModalOpen(true)
            }}
          >
            <Send className="mr-2 h-4 w-4" /> Send Email
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteCustomer(customer._id)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Action handlers
  const handleImportCustomers = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        await CustomerService.importCustomers(file)
        toast.success("Customers imported successfully!")
        // Refresh the customers list
        const updatedCustomers = await CustomerService.getAllCustomers()
        setCustomers(updatedCustomers)
      } catch (error: any) {
        toast.error(error.message || "Failed to import customers")
      }
    }
  }

  const handleSendEmail = async () => {
    if (!selectedCustomer || !emailSubject || !emailMessage) return

    try {
      await CustomerService.sendEmail(selectedCustomer._id, {
        subject: emailSubject,
        message: emailMessage,
      })
      toast.success("Email sent successfully")
      setIsEmailModalOpen(false)
      setEmailSubject("")
      setEmailMessage("")
    } catch (error) {
      console.error("Error sending email:", error)
      toast.error("Failed to send email")
    }
  }

  // Update the exportCustomers function
  const handleExportCustomers = async () => {
    try {
      const blob = await CustomerService.exportCustomers()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "customers.csv"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Customers exported successfully!")
    } catch (error: any) {
      console.error("Error exporting customers:", error)
      toast.error(error.message || "Failed to export customers")
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Customers</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExportCustomers}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button onClick={() => setIsAddCustomerOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <UserCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">{statistics.activeCustomers} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatIndianNumber(statistics.totalRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.averageBookingsPerCustomer?.toFixed(1) || "0"} bookings per customer
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average LTV</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatIndianNumber(statistics.averageLifetimeValue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Per customer value</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search customers..."
              value={filters.search}
              onChange={(e) => {
                const query = e.target.value
                setFilters((prev) => ({ ...prev, search: query }))
                handleSearch(query)
              }}
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(value) => {
              setFilters((prev) => ({ ...prev, status: value }))
              handleFilter({ ...filters, status: value })
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_status">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.location}
            onValueChange={(value) => {
              setFilters((prev) => ({ ...prev, location: value }))
              handleFilter({ ...filters, location: value })
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_location">All</SelectItem>
              {Array.from(new Set((Array.isArray(customers) ? customers : []).map((c) => c.location).filter(Boolean))).map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DateRangePicker
            value={filters.dateRange}
            onChange={(range) => {
              setFilters((prev) => ({ ...prev, dateRange: range }))
              handleFilter({ ...filters, dateRange: range })
            }}
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead> 
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Bookings</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Booking</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(customers) ? customers : []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {loading ? (
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Loading customers...
                      </div>
                    ) : (
                      <div>No customers found. Try adjusting your filters or add a new customer.</div>
                    )}
                  </TableCell>
                </TableRow>
              )}
              {(Array.isArray(customers) ? customers : []).map((customer: Customer) => (
                <TableRow key={customer._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={customer.avatar} />
                        <AvatarFallback>
                          {customer.name || customer.customerId?.substring(0, 2) || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.name || `Customer ${customer.customerId}`}</div>
                        <div className="text-sm text-gray-500">
                          {customer.email || customer.phone || "No contact info"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.location || "Unknown"}</TableCell>
                  <TableCell>{renderCustomerStatus(customer.status)}</TableCell>
                  <TableCell>{customer.totalBookings || 0}</TableCell>
                  <TableCell>{formatIndianNumber(parseInt(customer.totalSpent || "0"))}</TableCell>
                  <TableCell>{customer.lastBooking || "No bookings"}</TableCell>
                  <TableCell className="text-right">{renderCustomerActions(customer)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Customer</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit}>
              <div className="grid gap-6 py-4">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      {profileImagePreview ? (
                        <AvatarImage src={profileImagePreview} />
                      ) : (
                        <AvatarFallback>
                          <User className="h-12 w-12" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute bottom-0 right-0"
                      onClick={() => document.getElementById("avatar-upload")?.click()}
                    >
                      <input
                        id="avatar-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                      />
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={formData.name} onChange={(e) => handleFormChange("name", e.target.value)} />
                    {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange("email", e.target.value)}
                    />
                    {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleFormChange("phone", e.target.value)}
                    />
                    {formErrors.phone && <p className="text-sm text-red-500">{formErrors.phone}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleFormChange("location", e.target.value)}
                    />
                    {formErrors.location && <p className="text-sm text-red-500">{formErrors.location}</p>}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleFormChange("status", value)}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.notes}
                    onChange={(e) => handleFormChange("notes", e.target.value)}
                    placeholder="Add any additional notes about the customer..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>Save</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isViewBookingsOpen} onOpenChange={setIsViewBookingsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Customer Bookings</DialogTitle>
              {selectedCustomer && <DialogDescription>Viewing bookings for {selectedCustomer.name}</DialogDescription>}
            </DialogHeader>
            {selectedCustomer && customerBookings[selectedCustomer._id] && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerBookings[selectedCustomer._id].length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No bookings found for this customer.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customerBookings[selectedCustomer._id].map((booking) => (
                      <TableRow key={booking._id || booking.id}>
                        <TableCell>{booking.package?.name || "N/A"}</TableCell>
                        <TableCell>{booking.travelDate ? new Date(booking.travelDate).toLocaleDateString() : "N/A"}</TableCell>
                        <TableCell>{formatIndianNumber(booking.amount || 0)}</TableCell>
                        <TableCell>
                          <Badge className={booking.status === "Confirmed" ? "bg-green-500" : "bg-yellow-500"}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Email</DialogTitle>
              {selectedCustomer && <DialogDescription>Sending email to {selectedCustomer.name}</DialogDescription>}
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email-message">Message</Label>
                <textarea
                  id="email-message"
                  rows={5}
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Enter your message"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSendEmail} disabled={!emailSubject || !emailMessage}>
                Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

