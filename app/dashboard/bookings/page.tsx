"use client"

import { useState, useEffect, useMemo } from "react"
import { format, formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import {
  MoreHorizontal,
  Plus,
  Search,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CreditCard,
  Users,
  Tag,
  Percent,
  Calendar,
  Clock,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Receipt,
  TrendingUp,
  TrendingDown,
  Calculator,
  PlusCircle,
  MinusCircle,
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DayPicker } from "react-day-picker"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import axios from "axios"
import * as XLSX from "xlsx"

// Import expense management functions
import { 
  addExpenseToBooking, 
  getBookingExpenses, 
  deleteExpense, 
  getOverallSummary,
  type Expense,
  type BookingExpenses,
  type OverallSummary,
  type CreateExpenseData,
  collectPayment
} from "@/app/api/booking-controller"

// Enhanced DatePicker Component
interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
  placeholder?: string
}

function DatePicker({ date, onSelect, className, placeholder = "Pick a date" }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (date) {
      try {
        const parsedDate = typeof date === "string" ? new Date(date) : date
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate)
        }
      } catch (error) {
        console.error("Invalid date:", date)
        setSelectedDate(undefined)
      }
    } else {
      setSelectedDate(undefined)
    }
  }, [date])

  const handleSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate)
      onSelect?.(newDate)
      setIsOpen(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
          className="p-3"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              "border border-input hover:bg-accent hover:text-accent-foreground",
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
              "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              "hover:bg-accent hover:text-accent-foreground",
            ),
            day_range_end: "day-range-end",
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside:
              "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
          components={{
            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
            IconRight: () => <ChevronRight className="h-4 w-4" />,
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

// Interfaces
interface Booking {
  _id: string
  bookingId: string
  customer: {
    _id: string
    name: string
    email: string
    phone: string
  }
  package?: {
    _id: string
    name: string
    duration: string
    location: string
  }
  customPackage?: {
    name: string
    description?: string
    overview?: string
    duration?: string
    originalPrice?: string
    offerPrice?: string
    advancePayment?: string
    location?: string
    isActive?: boolean
  }
  travelDate: string
  amount: number
  participants: number
  bookedBy: "Self" | "Admin" | "Ravi Sir" | "Kuldeep Sir"
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed"
  createdAt: string
  updatedAt: string
  advance?: number
  payments?: {
    _id: string
    amount: number
    method: string
    collectedBy: string
    date: string
    notes?: string
  }[]
}

interface Package {
  _id: string
  name: string
  duration: number
  originalPrice: number
}

interface Customer {
  _id: string
  name: string
  email: string
  phone: string
}

interface Coupon {
  _id: string
  code: string
  discount: number
  type: "percentage" | "fixed"
  validFrom: string
  validTo: string
  packageId?: string
  isActive: boolean
}

// Form Schema
const customPackageSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  overview: z.string().optional(),
  duration: z.string().optional(),
  originalPrice: z.string().optional(),
  offerPrice: z.string().optional(),
  advancePayment: z.string().optional(),
  location: z.string().optional(),
  isActive: z.boolean().optional(),
})

const bookingFormSchema = z
  .object({
    customer: z.string().min(1, "Customer is required"),
    package: z.string().optional(),
    travelDate: z.string().min(1, "Travel date is required"),
    amount: z.number().min(0, "Amount must be greater than 0"),
    participants: z.number().min(1, "At least 1 participant is required"),
    bookedBy: z.enum(["Self", "Admin", "Ravi Sir", "Kuldeep Sir"]),
    advance: z.string().optional(),
    isCustom: z.boolean().optional(),
    customPackage: z
      .object({
        name: z.string().optional(),
        description: z.string().optional(),
        overview: z.string().optional(),
        duration: z.string().optional(),
        originalPrice: z.string().optional(),
        offerPrice: z.string().optional(),
        advancePayment: z.string().optional(),
        location: z.string().optional(),
        isActive: z.boolean().optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.isCustom) {
        return data.customPackage?.name && data.customPackage.name.length > 0
      } else {
        return data.package && data.package.length > 0
      }
    },
    {
      message: "Either package or custom package is required",
      path: ["package"],
    },
  )

type BookingFormValues = z.infer<typeof bookingFormSchema>

// Expense Form Schema
const expenseFormSchema = z.object({
  type: z.string().min(1, "Expense type is required"),
  description: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
})

type ExpenseFormValues = z.infer<typeof expenseFormSchema>

// Payment Collection Form Schema
const paymentCollectionSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.enum(["cash", "online"]),
  collectedBy: z.enum(["Ravi Sir", "Kuldeep Sir", "Dinesh Sir"]),
  notes: z.string().optional(),
})

type PaymentCollectionValues = z.infer<typeof paymentCollectionSchema>

// API Functions
const API_BASE_URL = "https://openbacken-production.up.railway.app/api"

const apiCall = async (url: string, options: any = {}) => {
  try {
    const response = await axios({
      url: `${API_BASE_URL}${url}`,
      timeout: 20000, // Increased timeout
      ...options,
    })
    return response.data
  } catch (error: any) {
    console.error(`API call failed for ${url}:`, error)
    throw new Error(error.response?.data?.message || error.message || "API call failed")
  }
}

const getAllBookings = async () => {
  const response = await apiCall("/bookings")
  return response.data || []
}

const createBooking = async (bookingData: any) => {
  return await apiCall("/bookings/create", {
    method: "POST",
    data: bookingData,
  })
}

// Fixed updateBooking function with proper error handling and logging
const updateBooking = async (id: string, bookingData: any) => {
  try {
    console.log("🔄 Starting booking update...")
    console.log("📋 Booking ID:", id)
    console.log("📦 Update data:", JSON.stringify(bookingData, null, 2))

    // Validate the booking ID
    if (!id || id.trim() === "") {
      throw new Error("Invalid booking ID provided")
    }

    // Clean the data - remove any undefined values
    const cleanedData = Object.fromEntries(Object.entries(bookingData).filter(([_, value]) => value !== undefined))

    console.log("🧹 Cleaned data:", JSON.stringify(cleanedData, null, 2))

    const requestConfig = {
      method: "PUT",
      url: `${API_BASE_URL}/bookings/${id}`,
      data: cleanedData,
      timeout: 30000, // Increased timeout to 30 seconds
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      validateStatus: (status: number) => {
        return status >= 200 && status < 300 // Only resolve for 2xx status codes
      },
    }

    console.log("🌐 Request config:", {
      method: requestConfig.method,
      url: requestConfig.url,
      headers: requestConfig.headers,
      dataKeys: Object.keys(cleanedData),
      timeout: requestConfig.timeout,
    })

    console.log("📡 Making PUT request to:", requestConfig.url)
    console.log("📤 Request payload:", JSON.stringify(cleanedData, null, 2))

    const response = await axios(requestConfig)

    console.log("✅ Update successful!")
    console.log("📊 Response status:", response.status)
    console.log("📄 Response data:", response.data)

    return response.data
  } catch (error: any) {
    console.error("❌ Update booking failed!")
    console.error("🔍 Error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        headers: error.config?.headers,
      },
    })

    // Log the full error for debugging
    console.error("🚨 Full error object:", error)

    // Provide more specific error messages
    if (error.response?.status === 404) {
      throw new Error(`Booking with ID ${id} not found`)
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || "Invalid booking data provided")
    } else if (error.response?.status === 500) {
      throw new Error("Server error occurred while updating booking")
    } else if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout - please try again")
    } else if (error.code === "NETWORK_ERROR") {
      throw new Error("Network error - please check your connection")
    }

    throw new Error(error.response?.data?.message || error.message || "Failed to update booking")
  }
}

const deleteBooking = async (id: string) => {
  return await apiCall(`/bookings/${id}`, {
    method: "DELETE",
  })
}

const updateBookingStatus = async (id: string, status: string) => {
  return await apiCall(`/bookings/${id}/status`, {
    method: "PATCH",
    data: { status },
  })
}

const getPackages = async () => {
  try {
    const response = await apiCall("/packages")
    return { success: true, data: response.data || [] }
  } catch (error) {
    return { success: false, data: [] }
  }
}

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusProps = () => {
    switch (status) {
      case "Completed":
        return {
          variant: "default" as const,
          icon: CheckCircle2,
          className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
        }
      case "Confirmed":
        return {
          variant: "default" as const,
          icon: Clock3,
          className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
        }
      case "Cancelled":
        return {
          variant: "destructive" as const,
          icon: XCircle,
          className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
        }
      case "Pending":
      default:
        return {
          variant: "secondary" as const,
          icon: AlertCircle,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
        }
    }
  }

  const { variant, icon: Icon, className } = getStatusProps()

  return (
    <Badge variant={variant} className={cn("flex items-center gap-1 font-medium", className)}>
      <Icon className="h-3 w-3" />
      <span>{status}</span>
    </Badge>
  )
}

// BookedBy Badge Component
const BookedByBadge = ({ bookedBy }: { bookedBy: string }) => {
  const getVariant = () => {
    switch (bookedBy) {
      case "Self":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Admin":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "Ravi Sir":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Kuldeep Sir":
        return "bg-teal-100 text-teal-800 border-teal-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return <Badge className={cn("whitespace-nowrap font-medium", getVariant())}>{bookedBy}</Badge>
}

// Main Component
export default function ModernBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])

  // Sorting and filtering states
  const [sortField, setSortField] = useState<string>("travelDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [bookedByFilter, setBookedByFilter] = useState<string>("all")
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    from?: Date
    to?: Date
  }>({})

  const [isCustom, setIsCustom] = useState(false)

  // Expense Management States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [isExpenseViewModalOpen, setIsExpenseViewModalOpen] = useState(false)
  const [selectedBookingForExpense, setSelectedBookingForExpense] = useState<Booking | null>(null)
  const [bookingExpenses, setBookingExpenses] = useState<BookingExpenses | null>(null)
  const [overallSummary, setOverallSummary] = useState<OverallSummary | null>(null)
  const [expensesLoading, setExpensesLoading] = useState(false)

  // Payment Collection States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null)
  const [remainingAmount, setRemainingAmount] = useState(0)

  // Forms
  const addForm = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customer: "",
      package: "",
      travelDate: "",
      amount: 0,
      participants: 1,
      bookedBy: "Admin",
      advance: "",
      isCustom: false,
      customPackage: {
        name: "",
        description: "",
        overview: "",
        duration: "",
        originalPrice: "",
        offerPrice: "",
        advancePayment: "",
        location: "",
        isActive: true,
      },
    },
  })

  const editForm = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customer: "",
      package: "",
      travelDate: "",
      amount: 0,
      participants: 1,
      bookedBy: "Admin",
      advance: "",
      isCustom: false,
      customPackage: {
        name: "",
        description: "",
        overview: "",
        duration: "",
        originalPrice: "",
        offerPrice: "",
        advancePayment: "",
        location: "",
        isActive: true,
      },
    },
  })

  const expenseForm = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      type: "",
      description: "",
      amount: 0,
    },
  })

  const paymentForm = useForm<PaymentCollectionValues>({
    resolver: zodResolver(paymentCollectionSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: "cash",
      collectedBy: "Ravi Sir",
      notes: "",
    },
  })

  useEffect(() => {
    loadBookings()
    loadCustomers()
    loadPackages()
    loadCoupons()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const bookingsData = await getAllBookings()
      if (Array.isArray(bookingsData)) {
        setBookings(bookingsData)
      } else {
        console.error("Invalid bookings data format:", bookingsData)
        setBookings([])
        toast({
          title: "Error",
          description: "Failed to load bookings data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading bookings:", error)
      setBookings([])
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async () => {
    try {
      const response = await apiCall("/customers")
      const customersData = response?.data || []
      if (Array.isArray(customersData)) {
        setCustomers(customersData)
      } else {
        console.error("Invalid customers data format:", customersData)
        setCustomers([])
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      setCustomers([])
    }
  }

  const loadPackages = async () => {
    try {
      const response = await getPackages()
      if (response.success && response.data) {
        setPackages(response.data)
      } else {
        console.error("Invalid packages data format:", response)
        setPackages([])
      }
    } catch (error) {
      console.error("Error loading packages:", error)
    }
  }

  const loadCoupons = async () => {
    try {
      const response = await apiCall("/coupons")
      if (response && response.data) {
        setCoupons(response.data)
      } else {
        console.error("Invalid coupons data format:", response)
        setCoupons([])
      }
    } catch (error) {
      console.error("Error loading coupons:", error)
    }
  }

  const handleAddBooking = async (data: BookingFormValues) => {
    try {
      const bookingData: any = {
        customer: data.customer,
        travelDate: data.travelDate,
        amount: data.amount,
        participants: data.participants,
        bookedBy: data.bookedBy,
        advance: data.advance ? Number(data.advance) : undefined,
      }

      if (data.isCustom && data.customPackage) {
        bookingData.customPackage = data.customPackage
      } else if (data.package) {
        bookingData.package = data.package
      }

      await createBooking(bookingData)
      toast({
        title: "Success",
        description: "Booking created successfully",
      })

      addForm.reset()
      setIsCustom(false)
      setIsAddModalOpen(false)
      loadBookings()
    } catch (error: any) {
      console.error("Error creating booking:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (booking: Booking) => {
    console.log("🖊️ Edit clicked for booking:", booking)
    setSelectedBooking(booking)

    const travelDate = new Date(booking.travelDate)
    const formattedDate = travelDate.toISOString().split("T")[0]

    const formData = {
      customer: booking.customer._id,
      package: booking.package?._id || "",
      travelDate: formattedDate,
      amount: booking.amount,
      participants: booking.participants,
      bookedBy: booking.bookedBy,
      advance: booking.advance ? booking.advance.toString() : "",
      isCustom: !!booking.customPackage,
      customPackage: booking.customPackage || {
        name: "",
        description: "",
        overview: "",
        duration: "",
        originalPrice: "",
        offerPrice: "",
        advancePayment: "",
        location: "",
        isActive: true,
      },
    }

    console.log("📝 Setting form data:", formData)
    editForm.reset(formData)
    setIsEditModalOpen(true)
  }

  const handleViewClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsViewModalOpen(true)
  }

  const handleEditBooking = async (data: BookingFormValues) => {
    console.log("🚀 FORM SUBMITTED - handleEditBooking called!")
    console.log("📝 Raw form data received:", data)

    if (!selectedBooking) {
      console.error("❌ No booking selected!")
      toast({
        title: "Error",
        description: "No booking selected for editing",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("🚀 Starting booking update process...")
      console.log("📋 Selected booking:", selectedBooking)
      console.log("📝 Form data:", data)

      // Check form validation manually
      const validationResult = bookingFormSchema.safeParse(data)
      if (!validationResult.success) {
        console.error("❌ Manual validation failed:", validationResult.error.issues)
        toast({
          title: "Validation Error",
          description: "Please check all required fields",
          variant: "destructive",
        })
        return
      }

      // Show loading toast immediately
      toast({
        title: "Updating...",
        description: "Please wait while we update the booking",
      })

      // Prepare the booking data with proper structure
      const bookingData: any = {
        customer: data.customer,
        travelDate: data.travelDate,
        amount: Number(data.amount),
        participants: Number(data.participants),
        bookedBy: data.bookedBy,
      }

      // Handle advance payment
      if (data.advance && data.advance.trim() !== "") {
        bookingData.advance = Number(data.advance)
      }

      // Handle package vs custom package
      if (data.isCustom && data.customPackage?.name) {
        bookingData.customPackage = {
          name: data.customPackage.name,
          description: data.customPackage.description || "",
          overview: data.customPackage.overview || "",
          duration: data.customPackage.duration || "",
          originalPrice: data.customPackage.originalPrice || "",
          offerPrice: data.customPackage.offerPrice || "",
          advancePayment: data.customPackage.advancePayment || "",
          location: data.customPackage.location || "",
          isActive: data.customPackage.isActive ?? true,
        }
        // Explicitly set package to null when using custom package
        bookingData.package = null
      } else if (data.package && data.package.trim() !== "") {
        bookingData.package = data.package
        // Explicitly set customPackage to null when using regular package
        bookingData.customPackage = null
      }

      console.log("📦 Final booking data to send:", bookingData)
      console.log("🌐 About to call updateBooking API...")
      console.log("🆔 Booking ID:", selectedBooking._id)

      const response = await updateBooking(selectedBooking._id, bookingData)

      console.log("✅ Update completed successfully:", response)

      toast({
        title: "Success",
        description: "Booking updated successfully",
      })

      // Close modal and reset form
      setIsEditModalOpen(false)
      setSelectedBooking(null)
      editForm.reset()

      // Reload bookings to show updated data
      await loadBookings()
    } catch (error: any) {
      console.error("❌ Error updating booking:", error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update booking. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return

    try {
      await deleteBooking(id)
      toast({
        title: "Success",
        description: "Booking deleted successfully",
      })
      loadBookings()
    } catch (error: any) {
      console.error("Error deleting booking:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete booking",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateBookingStatus(id, status)
      toast({
        title: "Success",
        description: "Booking status updated successfully",
      })
      loadBookings()
    } catch (error: any) {
      console.error("Error updating booking status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update booking status",
        variant: "destructive",
      })
    }
  }

  // Expense Management Functions
  const handleAddExpenseClick = async (booking: Booking) => {
    setSelectedBookingForExpense(booking)
    setIsExpenseModalOpen(true)
    expenseForm.reset()
  }

  const handleViewExpensesClick = async (booking: Booking) => {
    try {
      setExpensesLoading(true)
      setSelectedBookingForExpense(booking)
      const expenses = await getBookingExpenses(booking._id)
      console.log("📊 API Response for expenses:", expenses)
      console.log("📊 Expenses structure:", {
        expenses: expenses.expenses,
        totalExpenses: expenses.totalExpenses,
        revenue: expenses.revenue,
        profit: expenses.profit
      })
      setBookingExpenses(expenses)
      setIsExpenseViewModalOpen(true)
    } catch (error: any) {
      console.error("Error loading expenses:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load expenses",
        variant: "destructive",
      })
    } finally {
      setExpensesLoading(false)
    }
  }

  const handleAddExpense = async (data: ExpenseFormValues) => {
    if (!selectedBookingForExpense) return

    try {
      await addExpenseToBooking(selectedBookingForExpense._id, data)
      expenseForm.reset()
      setIsExpenseModalOpen(false)
      setSelectedBookingForExpense(null)
      
      // Refresh expenses if view modal is open
      if (isExpenseViewModalOpen && bookingExpenses) {
        const updatedExpenses = await getBookingExpenses(selectedBookingForExpense._id)
        setBookingExpenses(updatedExpenses)
      }
    } catch (error: any) {
      console.error("Error adding expense:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add expense",
        variant: "destructive",
      })
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    if (!selectedBookingForExpense) return

    try {
      await deleteExpense(selectedBookingForExpense._id, expenseId)
      
      // Refresh expenses
      if (bookingExpenses) {
        const updatedExpenses = await getBookingExpenses(selectedBookingForExpense._id)
        setBookingExpenses(updatedExpenses)
      }
    } catch (error: any) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive",
      })
    }
  }

  const loadOverallSummary = async () => {
    try {
      const summary = await getOverallSummary()
      setOverallSummary(summary)
    } catch (error: any) {
      console.error("Error loading overall summary:", error)
    }
  }

  // Load overall summary on component mount
  useEffect(() => {
    loadOverallSummary()
  }, [])

  // Payment Collection Functions
  const handleCollectPaymentClick = async (booking: Booking) => {
    const currentAdvance = booking.advance || 0
    const remaining = booking.amount - currentAdvance
    
    if (remaining <= 0) {
      toast({
        title: "No Payment Due",
        description: "This booking is already fully paid",
        variant: "default",
      })
      return
    }

    setSelectedBookingForPayment(booking)
    setRemainingAmount(remaining)
    paymentForm.setValue("amount", remaining)
    setIsPaymentModalOpen(true)
  }

  const handleCollectPayment = async (data: PaymentCollectionValues) => {
    if (!selectedBookingForPayment) return

    try {
      const currentAdvance = selectedBookingForPayment.advance || 0
      const newAdvance = currentAdvance + data.amount

      // Update the booking with new advance amount
      await updateBooking(selectedBookingForPayment._id, {
        advance: newAdvance,
      })

      // Here you would typically also save the payment collection record
      // For now, we'll just update the booking
      console.log("💰 Payment collected:", {
        bookingId: selectedBookingForPayment.bookingId,
        amount: data.amount,
        method: data.paymentMethod,
        collectedBy: data.collectedBy,
        notes: data.notes,
      })

      toast({
        title: "Payment Collected Successfully",
        description: `₹${data.amount.toLocaleString()} collected by ${data.collectedBy}`,
      })

      paymentForm.reset()
      setIsPaymentModalOpen(false)
      setSelectedBookingForPayment(null)
      setRemainingAmount(0)
      
      // Refresh bookings to show updated advance amount
      await loadBookings()
      await loadOverallSummary()
    } catch (error: any) {
      console.error("Error collecting payment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to collect payment",
        variant: "destructive",
      })
    }
  }

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter("all")
    setBookedByFilter("all")
    setDateRangeFilter({})
    setSearchQuery("")
  }

  // Filter and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
    if (!Array.isArray(bookings)) return []

    let result = [...bookings]

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      result = result.filter((booking) => {
        const packageName = booking.package?.name || booking.customPackage?.name || ""
        return (
          booking.bookingId.toLowerCase().includes(searchLower) ||
          booking.customer?.name?.toLowerCase().includes(searchLower) ||
          packageName.toLowerCase().includes(searchLower)
        )
      })
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((booking) => booking.status === statusFilter)
    }

    // BookedBy filter
    if (bookedByFilter !== "all") {
      result = result.filter((booking) => booking.bookedBy === bookedByFilter)
    }

    // Date range filter
    if (dateRangeFilter.from || dateRangeFilter.to) {
      result = result.filter((booking) => {
        const travelDate = new Date(booking.travelDate)

        if (dateRangeFilter.from && dateRangeFilter.to) {
          return travelDate >= dateRangeFilter.from && travelDate <= dateRangeFilter.to
        } else if (dateRangeFilter.from) {
          return travelDate >= dateRangeFilter.from
        } else if (dateRangeFilter.to) {
          return travelDate <= dateRangeFilter.to
        }

        return true
      })
    }

    // Sort
    return result.sort((a, b) => {
      let valueA, valueB

      switch (sortField) {
        case "travelDate":
          valueA = new Date(a.travelDate).getTime()
          valueB = new Date(b.travelDate).getTime()
          break
        case "amount":
          valueA = a.amount
          valueB = b.amount
          break
        case "participants":
          valueA = a.participants
          valueB = b.participants
          break
        case "status":
          valueA = a.status
          valueB = b.status
          break
        case "bookedBy":
          valueA = a.bookedBy
          valueB = b.bookedBy
          break
        case "customer":
          valueA = a.customer?.name || ""
          valueB = b.customer?.name || ""
          break
        case "package":
          valueA = a.package?.name || a.customPackage?.name || ""
          valueB = b.package?.name || b.customPackage?.name || ""
          break
        case "bookingId":
        default:
          valueA = a.bookingId
          valueB = b.bookingId
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })
  }, [bookings, searchQuery, sortField, sortDirection, statusFilter, bookedByFilter, dateRangeFilter])

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!Array.isArray(bookings))
      return {
        totalBookings: 0,
        totalAdvance: 0,
        totalRevenue: 0,
        totalAmount: 0,
        totalParticipants: 0,
        uniquePackages: 0,
        totalExpenses: 0,
        totalProfit: 0,
        byStatus: {},
        byBookedBy: {},
        revenueByBookedBy: {},
      }

    const totalAdvance = bookings.reduce((acc, booking) => acc + (booking.advance || 0), 0)
    const totalAmount = bookings.reduce((acc, booking) => acc + booking.amount, 0)
    const totalParticipants = bookings.reduce((acc, booking) => acc + booking.participants, 0)
    const uniquePackages = new Set(bookings.map((b) => b.package?._id || b.customPackage?.name).filter(Boolean)).size

    // Get expense data from overall summary
    const totalExpenses = overallSummary?.totalExpenses || 0
    const totalProfit = overallSummary?.totalProfit || 0

    const byStatus: Record<string, number> = {}
    bookings.forEach((booking) => {
      byStatus[booking.status] = (byStatus[booking.status] || 0) + 1
    })

    const byBookedBy: Record<string, number> = {}
    bookings.forEach((booking) => {
      byBookedBy[booking.bookedBy] = (byBookedBy[booking.bookedBy] || 0) + 1
    })

    const revenueByBookedBy: Record<string, number> = {}
    bookings.forEach((booking) => {
      revenueByBookedBy[booking.bookedBy] = (revenueByBookedBy[booking.bookedBy] || 0) + booking.amount
    })

    return {
      totalBookings: bookings.length,
      totalAdvance,
      totalRevenue: totalAdvance,
      totalAmount,
      totalParticipants,
      uniquePackages,
      totalExpenses,
      totalProfit,
      byStatus,
      byBookedBy,
      revenueByBookedBy,
    }
  }, [bookings, overallSummary])

  // Stats cards
  const statsCards = [
    {
      title: "Total Bookings",
      value: statistics.totalBookings.toString(),
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Revenue",
      value: `₹${overallSummary?.totalRevenue?.toLocaleString() || 0}`,
      icon: CreditCard,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Total Expenses",
      value: `₹${overallSummary?.totalExpenses?.toLocaleString() || 0}`,
      icon: Receipt,
      color: "from-red-500 to-red-600",
    },
    {
      title: "Total Profit",
      value: `₹${overallSummary?.totalProfit?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Total Advance",
      value: `₹${statistics.totalAdvance.toLocaleString()}`,
      icon: CreditCard,
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Total Participants",
      value: statistics.totalParticipants.toString(),
      icon: Users,
      color: "from-teal-500 to-teal-600",
    },
  ]

  // Custom Package Form Component
  const CustomPackageForm = ({ form }: { form: any }) => (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="customPackage.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Package Name *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter package name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="customPackage.location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter location" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="customPackage.duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duration</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g., 3 Days 2 Nights" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="customPackage.originalPrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Original Price</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter original price" type="number" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="customPackage.offerPrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Offer Price</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter offer price" type="number" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="customPackage.advancePayment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Advance Payment</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter advance amount" type="number" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="col-span-2">
        <FormField
          control={form.control}
          name="customPackage.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter package description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="col-span-2">
        <FormField
          control={form.control}
          name="customPackage.overview"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overview</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter package overview" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )

  function ExpensesTab() {
    const [allExpenses, setAllExpenses] = useState([]);

    useEffect(() => {
      const fetchExpenses = async () => {
        const response = await axios.get(`${API_BASE_URL}/bookings/expenses/all`);
        setAllExpenses(response.data.data);
      };
      fetchExpenses();
    }, []);

    const exportToExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(allExpenses);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
      XLSX.writeFile(workbook, "all-expenses.xlsx");
    };

    return (
      <div>
        <Button onClick={exportToExcel} className="mb-4">Export to Excel</Button>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allExpenses.map(exp => (
              <TableRow key={exp._id}>
                <TableCell>{exp.bookingId}</TableCell>
                <TableCell>{exp.customerName || "—"}</TableCell>
                <TableCell>{exp.type}</TableCell>
                <TableCell>{exp.description || "—"}</TableCell>
                <TableCell>₹{exp.amount?.toLocaleString() || 0}</TableCell>
                <TableCell>{exp.createdAt ? format(new Date(exp.createdAt), "MMM dd, yyyy") : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Booking Management
            </h1>
            <p className="text-slate-600 mt-2">Manage and track all your travel bookings</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadBookings} disabled={loading} className="shadow-sm">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button className="shadow-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {statsCards.map((stat, index) => (
                <Card key={`stat-${stat.title}-${index}`} className="overflow-hidden shadow-sm border-0 bg-white">
                  <CardContent className="p-0">
                    <div className={`h-2 bg-gradient-to-r ${stat.color}`} />
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                          <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-slate-900">Bookings by Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(statistics.byBookedBy || {}).map(([name, count], index) => (
                      <div
                        key={`booked-by-${name}-${index}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <BookedByBadge bookedBy={name} />
                          <span className="text-sm text-slate-600">{count} bookings</span>
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          ₹{(statistics.revenueByBookedBy?.[name] || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-slate-900">Bookings by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(statistics.byStatus || {}).map(([status, count], index) => (
                      <div
                        key={`status-${status}-${index}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                      >
                        <StatusBadge status={status} />
                        <span className="text-sm font-semibold text-slate-900">{count} bookings</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            {/* Filters and Actions */}
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search bookings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2 border-slate-200">
                          <Filter className="h-4 w-4" />
                          Filters
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-900">Filter Bookings</h4>

                          <div className="space-y-2">
                            <Label htmlFor="status-filter" className="text-sm font-medium">
                              Status
                            </Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                              <SelectTrigger id="status-filter">
                                <SelectValue placeholder="Filter by status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bookedby-filter" className="text-sm font-medium">
                              Booked By
                            </Label>
                            <Select value={bookedByFilter} onValueChange={setBookedByFilter}>
                              <SelectTrigger id="bookedby-filter">
                                <SelectValue placeholder="Filter by source" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Sources</SelectItem>
                                <SelectItem value="Self">Self</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Ravi Sir">Ravi Sir</SelectItem>
                                <SelectItem value="Kuldeep Sir">Kuldeep Sir</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Travel Date Range</Label>
                            <div className="flex flex-col gap-2">
                              <DatePicker
                                date={dateRangeFilter.from}
                                onSelect={(date) => setDateRangeFilter((prev) => ({ ...prev, from: date }))}
                                placeholder="From date"
                              />
                              <DatePicker
                                date={dateRangeFilter.to}
                                onSelect={(date) => setDateRangeFilter((prev) => ({ ...prev, to: date }))}
                                placeholder="To date"
                              />
                            </div>
                          </div>

                          <Button onClick={resetFilters} variant="outline" className="w-full">
                            Reset Filters
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Booking
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Add New Booking</DialogTitle>
                        <DialogDescription>Create a new booking for a customer</DialogDescription>
                      </DialogHeader>
                      <Form {...addForm}>
                        <form onSubmit={addForm.handleSubmit(handleAddBooking)} className="space-y-6">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isCustomAdd"
                              checked={isCustom}
                              onChange={(e) => {
                                setIsCustom(e.target.checked)
                                addForm.setValue("isCustom", e.target.checked)
                              }}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="isCustomAdd" className="text-sm font-medium">
                              Create Custom Package
                            </Label>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={addForm.control}
                              name="customer"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Customer *</FormLabel>
                                  <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select customer" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {customers.length > 0 ? (
                                          customers.map((customer) => (
                                            <SelectItem key={customer._id} value={customer._id}>
                                              {customer.name} - {customer.phone}
                                            </SelectItem>
                                          ))
                                        ) : (
                                          <SelectItem value="no-customers" disabled>
                                            No customers available
                                          </SelectItem>
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {!isCustom && (
                              <FormField
                                control={addForm.control}
                                name="package"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Package *</FormLabel>
                                    <FormControl>
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select package" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {packages.length > 0 ? (
                                            packages.map((pkg) => (
                                              <SelectItem key={pkg._id} value={pkg._id}>
                                                {pkg.name}
                                              </SelectItem>
                                            ))
                                          ) : (
                                            <SelectItem value="no-packages" disabled>
                                              No packages available
                                            </SelectItem>
                                          )}
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}

                            <FormField
                              control={addForm.control}
                              name="travelDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Travel Date *</FormLabel>
                                  <FormControl>
                                    <DatePicker
                                      date={field.value ? new Date(field.value) : undefined}
                                      onSelect={(date) => {
                                        if (date) {
                                          const localDate = new Date(date)
                                          localDate.setHours(0, 0, 0, 0)
                                          field.onChange(localDate.toISOString().split("T")[0])
                                        }
                                      }}
                                      placeholder="Select travel date"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={addForm.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Total Amount *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Enter total amount"
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                      min="0"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={addForm.control}
                              name="participants"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Participants *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Number of participants"
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                                      min="1"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={addForm.control}
                              name="bookedBy"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Booked By *</FormLabel>
                                  <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select booking source" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Self">Self</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                        <SelectItem value="Ravi Sir">Ravi Sir</SelectItem>
                                        <SelectItem value="Kuldeep Sir">Kuldeep Sir</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={addForm.control}
                              name="advance"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Advance Payment</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Enter advance amount (optional)"
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value)}
                                      min="0"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {isCustom && (
                            <div className="border rounded-lg p-4 space-y-4 bg-slate-50">
                              <h3 className="text-lg font-medium">Custom Package Details</h3>
                              <CustomPackageForm form={addForm} />
                            </div>
                          )}

                          <div className="flex justify-end space-x-3 pt-4 border-t">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsAddModalOpen(false)
                                addForm.reset()
                                setIsCustom(false)
                              }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700">
                              Create Booking
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Modern Table */}
            <Card className="shadow-sm border-0 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead
                        className="cursor-pointer font-semibold text-slate-700"
                        onClick={() => handleSort("bookingId")}
                      >
                        <div className="flex items-center gap-2">
                          Booking ID
                          {sortField === "bookingId" && (
                            <ArrowUpDown className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer font-semibold text-slate-700"
                        onClick={() => handleSort("customer")}
                      >
                        <div className="flex items-center gap-2">
                          Customer
                          {sortField === "customer" && (
                            <ArrowUpDown className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer font-semibold text-slate-700"
                        onClick={() => handleSort("package")}
                      >
                        <div className="flex items-center gap-2">
                          Package
                          {sortField === "package" && (
                            <ArrowUpDown className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer font-semibold text-slate-700"
                        onClick={() => handleSort("travelDate")}
                      >
                        <div className="flex items-center gap-2">
                          Travel Date
                          {sortField === "travelDate" && (
                            <ArrowUpDown className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer font-semibold text-slate-700"
                        onClick={() => handleSort("amount")}
                      >
                        <div className="flex items-center gap-2">
                          Amount
                          {sortField === "amount" && (
                            <ArrowUpDown className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer font-semibold text-slate-700"
                        onClick={() => handleSort("participants")}
                      >
                        <div className="flex items-center gap-2">
                          Participants
                          {sortField === "participants" && (
                            <ArrowUpDown className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer font-semibold text-slate-700"
                        onClick={() => handleSort("bookedBy")}
                      >
                        <div className="flex items-center gap-2">
                          Booked By
                          {sortField === "bookedBy" && (
                            <ArrowUpDown className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer font-semibold text-slate-700"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          {sortField === "status" && (
                            <ArrowUpDown className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">Advance</TableHead>
                      <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12">
                          <div className="flex items-center justify-center">
                            <RefreshCw className="mr-3 h-5 w-5 animate-spin text-blue-600" />
                            <span className="text-slate-600">Loading bookings...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredAndSortedBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12">
                          <div className="text-slate-500">
                            {searchQuery ||
                            statusFilter !== "all" ||
                            bookedByFilter !== "all" ||
                            dateRangeFilter.from ||
                            dateRangeFilter.to
                              ? "No bookings match your filters"
                              : "No bookings found"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedBookings.map((booking) => (
                        <TableRow
                          key={booking._id}
                          className={cn(
                            "hover:bg-slate-50 transition-colors",
                            booking.status === "Completed" && "bg-green-50/50",
                          )}
                        >
                          <TableCell className="font-mono text-sm font-medium text-blue-600">
                            {booking.bookingId}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                  {booking.customer?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-slate-900">{booking.customer?.name || "No Name"}</div>
                                <div className="text-sm text-slate-500 flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {booking.customer?.phone}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-slate-900">
                                {booking.package?.name || booking.customPackage?.name || "No Package"}
                              </div>
                              {booking.customPackage && (
                                <Badge
                                  variant="outline"
                                  className="text-xs mt-1 bg-purple-50 text-purple-700 border-purple-200"
                                >
                                  Custom
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span className="font-medium">
                                {format(new Date(booking.travelDate), "MMM dd, yyyy")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900">
                            ₹{booking.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-slate-400" />
                              <span>{booking.participants}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <BookedByBadge bookedBy={booking.bookedBy} />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={booking.status}
                              onValueChange={(value) => handleStatusChange(booking._id, value)}
                            >
                              <SelectTrigger className="w-[140px] border-0 bg-transparent p-0 h-auto">
                                <SelectValue>
                                  <StatusBadge status={booking.status} />
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-semibold text-green-600">
                                ₹{(booking.advance || 0).toLocaleString()}
                              </div>
                              {booking.advance && booking.advance < booking.amount && (
                                <div className="text-xs text-orange-600 font-medium">
                                  ₹{(booking.amount - (booking.advance || 0)).toLocaleString()} remaining
                                </div>
                              )}
                              {(!booking.advance || booking.advance === 0) && (
                                <div className="text-xs text-red-600 font-medium">
                                  ₹{booking.amount.toLocaleString()} due
                                </div>
                              )}
                              {booking.advance && booking.advance >= booking.amount && (
                                <div className="text-xs text-green-600 font-medium">
                                  Fully paid
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                  Actions
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleViewClick(booking)}
                                  className="flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditClick(booking)}
                                  className="flex items-center gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit Booking
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleViewExpensesClick(booking)}
                                  className="flex items-center gap-2"
                                >
                                  <Calculator className="h-4 w-4" />
                                  View Expenses
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleAddExpenseClick(booking)}
                                  className="flex items-center gap-2"
                                >
                                  <PlusCircle className="h-4 w-4" />
                                  Add Expense
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {(booking.advance || 0) < booking.amount && (
                                <DropdownMenuItem
                                  onClick={() => handleCollectPaymentClick(booking)}
                                  className="flex items-center gap-2"
                                >
                                  <DollarSign className="h-4 w-4" />
                                  Collect Payment
                                </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteBooking(booking._id)}
                                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete Booking
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {coupons.map((coupon, index) => {
                const packageData = packages.find((p) => p._id === coupon.packageId)
                return (
                  <Card
                    key={`coupon-${coupon._id}-${index}`}
                    className={cn("shadow-sm border-0 bg-white overflow-hidden", !coupon.isActive && "opacity-60")}
                  >
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">
                          {packageData ? packageData.name : "All Packages"}
                        </CardTitle>
                        <Badge
                          variant={coupon.isActive ? "secondary" : "outline"}
                          className="bg-white/20 text-white border-white/30"
                        >
                          {coupon.isActive ? "Active" : "Expired"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Tag className="h-5 w-5 text-purple-500" />
                          <span className="text-2xl font-bold text-slate-900">{coupon.code}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Percent className="h-5 w-5 text-green-500" />
                          <span className="text-2xl font-bold text-green-600">
                            {coupon.type === "percentage" ? `${coupon.discount}%` : `₹${coupon.discount}`}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(coupon.validFrom), "MMM dd")} -{" "}
                            {format(new Date(coupon.validTo), "MMM dd")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatDistanceToNow(new Date(coupon.validTo), { addSuffix: true })}</span>
                        </div>
                      </div>
                      {coupon.isActive && (
                        <Button
                          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                          onClick={() => {
                            if (selectedBooking) {
                              toast({
                                title: "Coupon Applied",
                                description: `Coupon ${coupon.code} applied successfully`,
                              })
                            } else {
                              toast({
                                title: "Select a booking",
                                description: "Please select a booking first to apply this coupon",
                              })
                            }
                          }}
                        >
                          Apply Coupon
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <ExpensesTab />
          </TabsContent>
        </Tabs>

        {/* View Booking Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Booking Details</DialogTitle>
              <DialogDescription>Complete information about this booking</DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Booking ID</Label>
                      <p className="text-lg font-mono font-semibold text-blue-600">{selectedBooking.bookingId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Customer</Label>
                      <div className="flex items-center gap-3 mt-1">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {selectedBooking.customer?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-slate-900">{selectedBooking.customer?.name}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {selectedBooking.customer?.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {selectedBooking.customer?.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Package</Label>
                      <div className="mt-1">
                        <p className="font-semibold text-slate-900">
                          {selectedBooking.package?.name || selectedBooking.customPackage?.name}
                        </p>
                        {selectedBooking.customPackage && (
                          <Badge variant="outline" className="mt-1 bg-purple-50 text-purple-700 border-purple-200">
                            Custom Package
                          </Badge>
                        )}
                        {selectedBooking.package?.location && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-slate-600">
                            <MapPin className="h-3 w-3" />
                            {selectedBooking.package.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Travel Date</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <p className="font-semibold text-slate-900">
                          {format(new Date(selectedBooking.travelDate), "EEEE, MMMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Participants</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="h-4 w-4 text-slate-400" />
                        <p className="font-semibold text-slate-900">{selectedBooking.participants} people</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Status</Label>
                      <div className="mt-1">
                        <StatusBadge status={selectedBooking.status} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Booked By</Label>
                      <div className="mt-1">
                        <BookedByBadge bookedBy={selectedBooking.bookedBy} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-600">Total Amount</p>
                      <p className="text-2xl font-bold text-slate-900">₹{selectedBooking.amount.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-600">Advance Paid</p>
                      <p className="text-2xl font-bold text-green-700">
                        ₹{(selectedBooking.advance || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium text-orange-600">Balance Due</p>
                      <p className="text-2xl font-bold text-orange-700">
                        ₹{(selectedBooking.amount - (selectedBooking.advance || 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewModalOpen(false)
                      handleEditClick(selectedBooking)
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Booking
                  </Button>
                </div>
                {selectedBooking.payments && selectedBooking.payments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Payment History</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Collected By</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedBooking.payments.map((payment) => (
                          <TableRow key={payment._id}>
                            <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                            <TableCell>{payment.method}</TableCell>
                            <TableCell>{payment.collectedBy}</TableCell>
                            <TableCell>{format(new Date(payment.date), "MMM dd, yyyy")}</TableCell>
                            <TableCell>{payment.notes || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Edit Booking</DialogTitle>
              <DialogDescription>Make changes to the booking details</DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <Form {...editForm}>
                <form
                  onSubmit={(e) => {
                    console.log("📋 Form onSubmit triggered!")
                    e.preventDefault()
                    editForm.handleSubmit(handleEditBooking)(e)
                  }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isCustomEdit"
                      checked={editForm.watch("isCustom")}
                      onChange={(e) => {
                        editForm.setValue("isCustom", e.target.checked)
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isCustomEdit" className="text-sm font-medium">
                      Edit as Custom Package
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="customer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer *</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select customer" />
                              </SelectTrigger>
                              <SelectContent>
                                {customers.length > 0 ? (
                                  customers.map((customer) => (
                                    <SelectItem key={customer._id} value={customer._id}>
                                      {customer.name} - {customer.phone}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-customers" disabled>
                                    No customers available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!editForm.watch("isCustom") && (
                      <FormField
                        control={editForm.control}
                        name="package"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Package *</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select package" />
                                </SelectTrigger>
                                <SelectContent>
                                  {packages.length > 0 ? (
                                    packages.map((pkg) => (
                                      <SelectItem key={pkg._id} value={pkg._id}>
                                        {pkg.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-packages" disabled>
                                      No packages available
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={editForm.control}
                      name="travelDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Travel Date *</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  const localDate = new Date(date)
                                  localDate.setHours(0, 0, 0, 0)
                                  field.onChange(localDate.toISOString().split("T")[0])
                                }
                              }}
                              placeholder="Select travel date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Amount *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter total amount"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                              min="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="participants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Participants *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Number of participants"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                              min="1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="bookedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Booked By *</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select booking source" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Self">Self</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Ravi Sir">Ravi Sir</SelectItem>
                                <SelectItem value="Kuldeep Sir">Kuldeep Sir</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="advance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Advance Payment</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter advance amount (optional)"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              min="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {editForm.watch("isCustom") && (
                    <div className="border rounded-lg p-4 space-y-4 bg-slate-50">
                      <h3 className="text-lg font-medium">Custom Package Details</h3>
                      <CustomPackageForm form={editForm} />
                    </div>
                  )}

                  {/* Add this right before the existing buttons for testing */}
                  <Button
                    type="button"
                    onClick={() => {
                      console.log("🧪 Test button clicked!")
                      console.log("📝 Current form values:", editForm.getValues())
                      handleEditBooking(editForm.getValues())
                    }}
                    variant="secondary"
                  >
                    Test Update (Debug)
                  </Button>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditModalOpen(false)
                        setSelectedBooking(null)
                        editForm.reset()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={editForm.formState.isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-blue-700"
                    >
                      {editForm.formState.isSubmitting ? "Updating..." : "Update Booking"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Expense Modal */}
        <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Add Expense</DialogTitle>
              <DialogDescription>
                Add expense for booking: {selectedBookingForExpense?.bookingId}
              </DialogDescription>
            </DialogHeader>
            <Form {...expenseForm}>
              <form onSubmit={expenseForm.handleSubmit(handleAddExpense)} className="space-y-4">
                <FormField
                  control={expenseForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Type *</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select expense type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hotel">Hotel</SelectItem>
                            <SelectItem value="cab">Cab/Transport</SelectItem>
                            <SelectItem value="food">Food</SelectItem>
                            <SelectItem value="guide">Guide</SelectItem>
                            <SelectItem value="entertainment">Entertainment</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={expenseForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter expense description (optional)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={expenseForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                          min="0.01"
                          step="0.01"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsExpenseModalOpen(false)
                      setSelectedBookingForExpense(null)
                      expenseForm.reset()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={expenseForm.formState.isSubmitting}
                    className="bg-gradient-to-r from-green-600 to-green-700"
                  >
                    {expenseForm.formState.isSubmitting ? "Adding..." : "Add Expense"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* View Expenses Modal */}
        <Dialog open={isExpenseViewModalOpen} onOpenChange={setIsExpenseViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Booking Expenses</DialogTitle>
              <DialogDescription>
                Expenses for booking: {selectedBookingForExpense?.bookingId}
              </DialogDescription>
            </DialogHeader>
            
            {expensesLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="mr-3 h-5 w-5 animate-spin text-blue-600" />
                <span className="text-slate-600">Loading expenses...</span>
              </div>
            ) : bookingExpenses ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Revenue</p>
                          <p className="text-2xl font-bold text-green-700">
                            ₹{(bookingExpenses.revenue || 0).toLocaleString()}
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-600">Total Expenses</p>
                          <p className="text-2xl font-bold text-red-700">
                            ₹{(bookingExpenses.totalExpenses || 0).toLocaleString()}
                          </p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Profit</p>
                          <p className="text-2xl font-bold text-blue-700">
                            ₹{(bookingExpenses.profit || 0).toLocaleString()}
                          </p>
                        </div>
                        <Calculator className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Profit Margin</p>
                          <p className="text-2xl font-bold text-purple-700">
                            {(bookingExpenses.revenue || 0) > 0 
                              ? `${(((bookingExpenses.profit || 0) / (bookingExpenses.revenue || 1)) * 100).toFixed(1)}%`
                              : "0%"
                            }
                          </p>
                        </div>
                        <Percent className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Expenses Table */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Expense Details</CardTitle>
                      <Button
                        onClick={() => {
                          setIsExpenseViewModalOpen(false)
                          handleAddExpenseClick(selectedBookingForExpense!)
                        }}
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-green-700"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Expense
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(bookingExpenses.expenses || []).length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Receipt className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <p>No expenses added yet</p>
                        <Button
                          onClick={() => {
                            setIsExpenseViewModalOpen(false)
                            handleAddExpenseClick(selectedBookingForExpense!)
                          }}
                          variant="outline"
                          className="mt-4"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add First Expense
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(bookingExpenses.expenses || []).map((expense) => {
                            const date = new Date(expense.createdAt);
                            const formattedDate = !isNaN(date.getTime()) ? format(date, "MMM dd, yyyy") : "N/A";
                            return (
                            <TableRow key={expense._id}>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {expense.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {expense.description || "No description"}
                              </TableCell>
                              <TableCell className="font-semibold text-red-600">
                                ₹{(expense.amount || 0).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                  {formattedDate}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteExpense(expense._id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <AlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p>Failed to load expenses</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Payment Collection Modal */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Collect Payment</DialogTitle>
              <DialogDescription>
                Collect remaining payment for booking: {selectedBookingForPayment?.bookingId}
              </DialogDescription>
            </DialogHeader>
            
            {selectedBookingForPayment && (
              <div className="space-y-4">
                {/* Payment Summary */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-600">Total Amount:</span>
                        <span className="font-semibold text-blue-700">₹{selectedBookingForPayment.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-600">Advance Paid:</span>
                        <span className="font-semibold text-blue-700">₹{(selectedBookingForPayment.advance || 0).toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-blue-600">Remaining Amount:</span>
                          <span className="text-lg font-bold text-blue-700">₹{remainingAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Form {...paymentForm}>
                  <form onSubmit={paymentForm.handleSubmit(handleCollectPayment)} className="space-y-4">
                    <FormField
                      control={paymentForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount to Collect *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                              min="0.01"
                              max={remainingAmount}
                              step="0.01"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method *</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="online">Online</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentForm.control}
                      name="collectedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Collected By *</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select collector" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Ravi Sir">Ravi Sir</SelectItem>
                                <SelectItem value="Kuldeep Sir">Kuldeep Sir</SelectItem>
                                <SelectItem value="Dinesh Sir">Dinesh Sir</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Add any additional notes" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsPaymentModalOpen(false)
                          setSelectedBookingForPayment(null)
                          setRemainingAmount(0)
                          paymentForm.reset()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={paymentForm.formState.isSubmitting}
                        className="bg-gradient-to-r from-green-600 to-green-700"
                      >
                        {paymentForm.formState.isSubmitting ? "Collecting..." : "Collect Payment"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
