"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import {
  Plus,
  Search,
  Percent,
  Users,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
  Download,
  Upload,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import * as React from "react"
import type { Coupon } from "@/app/api/coupon-controller"
import { createCoupon, getCoupons, updateCoupon, deleteCoupon } from "@/app/api/coupon-controller"
import { DatePicker } from "@/components/ui/date-picker"
import { Package } from "@/app/api/package-controller"
import { getPackages } from "@/app/api/package-controller"
import DashboardLayout from "@/components/dashboard-layout"

// DateRangePicker Component
interface DateRangePickerProps {
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
}

const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>(
  ({ date, onDateChange }, ref) => {
    return (
      <div ref={ref} className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={onDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)

DateRangePicker.displayName = "DateRangePicker"

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    type: "percentage",
    discount: 0,
    minPurchase: 0,
    maxDiscount: 0,
    usageLimit: 100,
    packages: [],
    validFrom: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
    validTo: format(addDays(new Date(), 30), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7)
  })
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Fetch packages on component mount
  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await getPackages()
      if (response.success && response.data) {
        setPackages(response.data)
      }
    } catch (error) {
      toast.error("Error fetching packages")
    }
  }

  // Fetch coupons on component mount
  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setIsLoading(true)
      const response = await getCoupons()
      if (response.success && response.data) {
        // Map id to _id for compatibility
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = response.data.map((c: any) => ({
          ...c,
          _id: c._id || c.id, // prefer _id, fallback to id
        }))
        setCoupons(mapped)
      } else {
        toast.error(response.message || "Failed to fetch coupons")
      }
    } catch (error) {
      toast.error("Error fetching coupons")
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate stats
  const stats = {
    totalCoupons: coupons.length || 0,
    activeCoupons: coupons.filter(c => c.status === "active").length || 0,
    totalUsage: coupons.reduce((sum, c) => sum + c.usedCount, 0),
    totalDiscount: coupons.reduce((sum, c) => {
      if (c.type === "percentage") {
        return sum + (c.usedCount * c.maxDiscount)
      }
      return sum + (c.usedCount * c.discount)
    }, 0),
    averageUsage: coupons.length > 0 ? Math.round(coupons.reduce((sum, c) => sum + c.usedCount, 0) / coupons.length) : 0
  }

  const handleAddCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount || !newCoupon.type || !newCoupon.minPurchase || !newCoupon.maxDiscount || !newCoupon.validFrom || !newCoupon.validTo || !newCoupon.usageLimit) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)
      // Prepare coupon data
      const couponData: any = {
        ...newCoupon,
        status: "active",
        usedCount: 0,
        validFrom: format(new Date(newCoupon.validFrom), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
        validTo: format(new Date(newCoupon.validTo), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
      }
      delete couponData._id
      couponData.packages = Array.isArray(newCoupon.packages) ? newCoupon.packages : []

      const response = await createCoupon(couponData)
      if (response.success) {
        toast.success("Coupon created successfully")
        setShowAddModal(false)
        setNewCoupon({
          type: "percentage",
          discount: 0,
          minPurchase: 0,
          maxDiscount: 0,
          usageLimit: 100,
          packages: [],
          validFrom: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
          validTo: format(addDays(new Date(), 30), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        })
        fetchCoupons()
      } else {
        toast.error(response.message || "Failed to create coupon")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error creating coupon")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCoupon = async () => {
    if (!selectedCoupon?._id && !selectedCoupon?.id) return

    try {
      setIsSubmitting(true)
      // Prepare update data
      const updateData: any = { ...selectedCoupon }
      // Use id for backend if present
      const couponId = selectedCoupon._id || selectedCoupon.id
      delete updateData._id
      updateData.packages = Array.isArray(selectedCoupon.packages) ? selectedCoupon.packages : []

      const response = await updateCoupon(couponId, updateData)
      if (response.success) {
        toast.success("Coupon updated successfully")
        setShowEditModal(false)
        setSelectedCoupon(null)
        fetchCoupons()
      } else {
        toast.error(response.message || "Failed to update coupon")
      }
    } catch (error) {
      toast.error("Error updating coupon")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCoupon = async (coupon: Coupon) => {
    if (!coupon._id) {
      toast.error("Invalid coupon ID")
      return
    }
    if (!confirm("Are you sure you want to delete this coupon?")) return
    
    try {
      const response = await deleteCoupon(coupon._id)
      if (response.success) {
        toast.success("Coupon deleted successfully")
        fetchCoupons() // Refresh the list
      } else {
        toast.error(response.message || "Failed to delete coupon")
      }
    } catch (error) {
      toast.error("Error deleting coupon")
    }
  }

  const handleExportCoupons = () => {
    const headers = ["ID", "Code", "Discount", "Type", "Min Purchase", "Max Discount", "Valid From", "Valid To", "Usage Limit", "Used Count", "Status", "Packages"]
    const csvContent = [
      headers.join(","),
      ...coupons.map(coupon => [
        coupon._id,
        coupon.code,
        coupon.discount,
        coupon.type,
        coupon.minPurchase,
        coupon.maxDiscount,
        coupon.validFrom,
        coupon.validTo,
        coupon.usageLimit,
        coupon.usedCount,
        coupon.status,
        coupon.packages?.join(",") || ""
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `coupons_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Coupons exported successfully")
  }

  const handleImportCoupons = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const rows = text.split("\n")
        const headers = rows[0].split(",")
        
        const importedCoupons: Coupon[] = rows.slice(1).map(row => {
          const values = row.split(",")
          return {
            _id: values[0] || `C-${Math.floor(Math.random() * 10000)}`,
            code: values[1] || "",
            discount: Number(values[2]) || 0,
            type: values[3] as "percentage" | "fixed" || "percentage",
            minPurchase: Number(values[4]) || 0,
            maxDiscount: Number(values[5]) || 0,
            validFrom: values[6] || format(new Date(), "MMM d, yyyy"),
            validTo: values[7] || format(addDays(new Date(), 30), "MMM d, yyyy"),
            usageLimit: Number(values[8]) || 100,
            usedCount: Number(values[9]) || 0,
            status: values[10] as "active" | "inactive" | "expired" || "active",
            packages: values[11]?.split(",").map((id: string) => ({ _id: id })) || []
          }
        })

        setCoupons(prevCoupons => [...prevCoupons, ...importedCoupons])
        toast.success(`${importedCoupons.length} coupons imported successfully`)
      } catch (error) {
        toast.error("Error importing coupons. Please check the file format.")
      }
    }
    reader.readAsText(file)
  }

  const handleStatusChange = async (coupon: Coupon, newStatus: "active" | "inactive" | "expired") => {
    try {
      const response = await updateCoupon(coupon._id, { status: newStatus })
      if (response.success) {
        toast.success(`Coupon status updated to ${newStatus}`)
        fetchCoupons() // Refresh the list
      } else {
        toast.error(response.message || "Failed to update coupon status")
      }
    } catch (error) {
      toast.error("Error updating coupon status")
    }
  }

  // For debugging, show all coupons
  const filteredCoupons = coupons;

  // Add maxAmount validation function
  const validateMaxAmount = (amount: number, type: "percentage" | "fixed" | undefined) => {
    if (type === "percentage") {
      return amount <= 100 ? amount : 100;
    }
    return amount <= 50000 ? amount : 50000; // Maximum fixed amount of ₹50,000
  }

  // Update the discount change handler
  const handleDiscountChange = (value: string) => {
    const numValue = Number(value);
    const validatedValue = validateMaxAmount(numValue, newCoupon.type);
    setNewCoupon({ ...newCoupon, discount: validatedValue });
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Coupons</h2>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Coupon
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCoupons}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCoupons}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsage}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalDiscount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[300px]"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportCoupons}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={() => document.getElementById('importInput')?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <input
              type="file"
              id="importInput"
              className="hidden"
              accept=".csv"
              onChange={handleImportCoupons}
            />
          </div>
        </div>

        {/* Coupons Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min Purchase</TableHead>
                  <TableHead>Max Discount</TableHead>
                  <TableHead>Usage Limit</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => (
                    <TableRow key={coupon._id}>
                      <TableCell className="font-medium">{coupon.code}</TableCell>
                      <TableCell>{coupon.type}</TableCell>
                      <TableCell>
                        {coupon.type === "percentage" ? `${coupon.discount}%` : `₹${coupon.discount}`}
                      </TableCell>
                      <TableCell>₹{coupon.minPurchase}</TableCell>
                      <TableCell>₹{coupon.maxDiscount}</TableCell>
                      <TableCell>{coupon.usageLimit}</TableCell>
                      <TableCell>{coupon.usedCount}</TableCell>
                      <TableCell>{format(new Date(coupon.validTo), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={coupon.status === "active" ? "default" : "secondary"}>
                          {coupon.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCoupon(coupon)
                              setShowEditModal(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCoupon(coupon)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Coupon Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Coupon</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4 mb-2">
              <Label htmlFor="code" className="text-right">
                Code
              </Label>
              <Input
                id="code"
                value={newCoupon.code || ""}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="flex items-center gap-4 mb-2">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={newCoupon.type}
                onValueChange={(value: "percentage" | "fixed") => setNewCoupon({ ...newCoupon, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <Label htmlFor="discount" className="text-right">
                Discount
              </Label>
              <Input
                id="discount"
                type="number"
                value={newCoupon.discount || ""}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="flex items-center gap-4 mb-2">
              <Label htmlFor="minPurchase" className="text-right">
                Min Purchase
              </Label>
              <Input
                id="minPurchase"
                type="number"
                value={newCoupon.minPurchase || ""}
                onChange={(e) => setNewCoupon({ ...newCoupon, minPurchase: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="flex items-center gap-4 mb-2">
              <Label htmlFor="maxDiscount" className="text-right">
                Max Discount
              </Label>
              <Input
                id="maxDiscount"
                type="number"
                value={newCoupon.maxDiscount || ""}
                onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="flex items-center gap-4 mb-2">
              <Label htmlFor="usageLimit" className="text-right">
                Usage Limit
              </Label>
              <Input
                id="usageLimit"
                type="number"
                value={newCoupon.usageLimit || ""}
                onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="flex items-center gap-4 mb-2">
              <Label htmlFor="packages" className="text-right">
                Packages
              </Label>
              <select
                id="packages"
                multiple
                value={newCoupon.packages as string[]}
                onChange={e => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setNewCoupon({ ...newCoupon, packages: selected });
                }}
                className="col-span-3 border rounded px-2 py-1"
              >
                {packages.map(pkg => (
                  <option key={pkg._id} value={pkg._id}>
                      {pkg.name}
                  </option>
                  ))}
              </select>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <Label htmlFor="validFrom" className="text-right">
                Valid From
              </Label>
              <DatePicker
                date={newCoupon.validFrom ? new Date(newCoupon.validFrom) : new Date()}
                onSelect={(date) => {
                  if (date) {
                    setNewCoupon({ ...newCoupon, validFrom: date.toISOString() })
                  }
                }}
                className="col-span-3"
              />
            </div>
            <div className="flex items-center gap-4 mb-2">
              <Label htmlFor="validTo" className="text-right">
                Valid To
              </Label>
              <DatePicker
                date={newCoupon.validTo ? new Date(newCoupon.validTo) : addDays(new Date(), 30)}
                onSelect={(date) => {
                  if (date) {
                    setNewCoupon({ ...newCoupon, validTo: date.toISOString() })
                  }
                }}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCoupon} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Coupon"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
          </DialogHeader>
          {selectedCoupon && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4 mb-2">
                <Label htmlFor="edit-code" className="text-right">
                  Code
                </Label>
                <Input
                  id="edit-code"
                  value={selectedCoupon.code}
                  onChange={(e) => setSelectedCoupon({ ...selectedCoupon, code: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="flex items-center gap-4 mb-2">
                <Label htmlFor="edit-type" className="text-right">
                  Type
                </Label>
                <Select
                  value={selectedCoupon.type}
                  onValueChange={(value: "percentage" | "fixed") => setSelectedCoupon({ ...selectedCoupon, type: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <Label htmlFor="edit-discount" className="text-right">
                  Discount
                </Label>
                <Input
                  id="edit-discount"
                  type="number"
                  value={selectedCoupon.discount}
                  onChange={(e) => {
                    const value = e.target.value
                    if (selectedCoupon.type === "percentage") {
                      const numValue = Number(value)
                      if (numValue > 100) {
                        toast.error("Percentage cannot exceed 100%")
                        return
                      }
                    }
                    setSelectedCoupon({ ...selectedCoupon, discount: Number(value) })
                  }}
                  className="col-span-3"
                />
              </div>
              <div className="flex items-center gap-4 mb-2">
                <Label htmlFor="edit-minPurchase" className="text-right">
                  Min Purchase
                </Label>
                <Input
                  id="edit-minPurchase"
                  type="number"
                  value={selectedCoupon.minPurchase}
                  onChange={(e) => setSelectedCoupon({ ...selectedCoupon, minPurchase: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="flex items-center gap-4 mb-2">
                <Label htmlFor="edit-maxDiscount" className="text-right">
                  Max Discount
                </Label>
                <Input
                  id="edit-maxDiscount"
                  type="number"
                  value={selectedCoupon.maxDiscount}
                  onChange={(e) => setSelectedCoupon({ ...selectedCoupon, maxDiscount: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="flex items-center gap-4 mb-2">
                <Label htmlFor="edit-usageLimit" className="text-right">
                  Usage Limit
                </Label>
                <Input
                  id="edit-usageLimit"
                  type="number"
                  value={selectedCoupon.usageLimit}
                  onChange={(e) => setSelectedCoupon({ ...selectedCoupon, usageLimit: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="flex items-center gap-4 mb-2">
                <Label htmlFor="edit-packages" className="text-right">
                  Packages
                </Label>
                <select
                  id="edit-packages"
                  multiple
                  value={selectedCoupon?.packages as string[] || []}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedCoupon({ ...selectedCoupon, packages: selected });
                  }}
                  className="col-span-3 border rounded px-2 py-1"
                >
                  {packages.map(pkg => (
                    <option key={pkg._id} value={pkg._id}>
                        {pkg.name}
                    </option>
                    ))}
                </select>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <Label htmlFor="edit-validFrom" className="text-right">
                  Valid From
                </Label>
                <DatePicker
                  date={selectedCoupon.validFrom ? new Date(selectedCoupon.validFrom) : new Date()}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedCoupon({ ...selectedCoupon, validFrom: date.toISOString() })
                    }
                  }}
                  className="col-span-3"
                />
              </div>
              <div className="flex items-center gap-4 mb-2">
                <Label htmlFor="edit-validTo" className="text-right">
                  Valid To
                </Label>
                <DatePicker
                  date={selectedCoupon.validTo ? new Date(selectedCoupon.validTo) : addDays(new Date(), 30)}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedCoupon({ ...selectedCoupon, validTo: date.toISOString() })
                    }
                  }}
                  className="col-span-3"
                />
              </div>
              <div className="flex items-center gap-4 mb-2">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select
                  value={selectedCoupon.status}
                  onValueChange={(value: "active" | "inactive" | "expired") => handleStatusChange(selectedCoupon, value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCoupon} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

