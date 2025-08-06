"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Calendar, Filter, MoreHorizontal, Plus, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import { getPackages, updatePackage, deletePackage } from "@/api/package-controller"

// Define the Package type
interface Package {
  _id: string;
  name: string;
  duration: string;
  location: string;
  category: string;
  originalPrice: number;
  isActive: boolean;
  description?: string;
  overview?: string;
  images?: {
    cardImage: string;
    trekMap: string;
    gallery: string[];
  };
  offerPrice?: string;
  advancePayment?: string;
  startDate?: string;
  endDate?: string;
  maxParticipants?: string;
  isFeatured?: boolean;
}

export default function PackagesView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check for success message from package creation
  useEffect(() => {
    if (mounted && searchParams) {
      const success = searchParams.get("success")
      const packageId = searchParams.get("packageId")
      
      if (success === "true" && packageId) {
        toast({
          title: "Package Created",
          description: "New package has been added successfully!",
        })
      }
    }
  }, [searchParams, toast, mounted])

  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      if (!mounted) return

      try {
        const response = await getPackages()
        console.log('API Response:', response)

        if (response && response.success && Array.isArray(response.data)) {
          // Transform the API data to match our Package interface
          const transformedPackages = response.data.map((pkg: any) => ({
            _id: pkg._id,
            name: pkg.name,
            duration: pkg.duration,
            location: pkg.location,
            category: pkg.category?.name || 'Uncategorized', // Safely access nested category name
            originalPrice: Number(pkg.originalPrice),
            isActive: pkg.isActive,
            description: pkg.description,
            overview: pkg.overview,
            images: pkg.images,
            offerPrice: pkg.offerPrice,
            advancePayment: pkg.advancePayment,
            startDate: pkg.startDate,
            endDate: pkg.endDate,
            maxParticipants: pkg.maxParticipants,
            isFeatured: pkg.isFeatured
          }))

          console.log('Transformed packages:', transformedPackages)
          setPackages(transformedPackages)
        } else {
          console.log('Invalid API response:', response)
          setPackages([])
          toast({
            title: "Error",
            description: "Invalid response format from server",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching packages:", error)
        setPackages([])
        toast({
          title: "Error",
          description: "Failed to load packages. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPackages()
  }, [toast, mounted])

  // Don't render anything until mounted
  if (!mounted) {
    return null
  }

  // Ensure packages is an array before filtering
  const filteredPackages = Array.isArray(packages) ? packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.category.toLowerCase().includes(searchQuery.toLowerCase()),
  ) : []

  console.log('Current packages state:', packages) // Debug log
  console.log('Filtered packages:', filteredPackages) // Debug log

  const handleEdit = (id: string) => {
    router.push(`/dashboard/packages/edit/${id}`)
  }

  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/packages/view/${id}`)
  }

  const handleDuplicate = (id: string) => {
    const packageToDuplicate = packages.find((pkg) => pkg._id === id)
    if (packageToDuplicate) {
      const duplicatedPackage: Package = {
        ...packageToDuplicate,
        _id: `PKG${String(packages.length + 1).padStart(3, "0")}`,
        name: `${packageToDuplicate.name} (Copy)`,
      }
      setPackages([...packages, duplicatedPackage])
      toast({
        title: "Package duplicated",
        description: `${packageToDuplicate.name} has been duplicated successfully.`,
      })
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const packageToUpdate = packages.find((pkg) => pkg._id === id)
      if (!packageToUpdate) return

      const formData = new FormData()
      formData.append('isActive', (!packageToUpdate.isActive).toString())

      const response = await updatePackage(id, formData)
      
      if (response.success) {
        setPackages(
          packages.map((pkg) => {
            if (pkg._id === id) {
              const newStatus = pkg.isActive ? "Inactive" : "Active"
              toast({
                title: `Package ${newStatus.toLowerCase()}`,
                description: `${pkg.name} is now ${newStatus.toLowerCase()}.`,
              })
              return { ...pkg, isActive: !pkg.isActive }
            }
            return pkg
          }),
        )
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update package status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling package status:", error)
      toast({
        title: "Error",
        description: "Failed to update package status",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const packageToDelete = packages.find((pkg) => pkg._id === id)
      if (!packageToDelete) return

      const response = await deletePackage(id)
      
      if (response.success) {
        setPackages(packages.filter((pkg) => pkg._id !== id))
        toast({
          title: "Package deleted",
          description: `${packageToDelete.name} has been deleted successfully.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete package",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting package:", error)
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Travel Packages</h2>
          <Button onClick={() => router.push("/dashboard/packages/create")}>
            <Plus className="mr-2 h-4 w-4" /> Add Package
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center space-x-2 md:w-2/3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search packages..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Date Range
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Loading packages...
                  </TableCell>
                </TableRow>
              ) : filteredPackages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No packages found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPackages.map((pkg) => (
                  <TableRow key={pkg._id}>
                    <TableCell className="font-medium">{pkg._id}</TableCell>
                    <TableCell>{pkg.name}</TableCell>
                    <TableCell>{pkg.duration}</TableCell>
                    <TableCell>{pkg.location}</TableCell>
                    <TableCell>{pkg.category}</TableCell>
                    <TableCell>₹{pkg.originalPrice}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={pkg.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
                      >
                        {pkg.isActive ? "Active" : "Inactive"}
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
                          <DropdownMenuItem onClick={() => handleEdit(pkg._id)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewDetails(pkg._id)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(pkg._id)}>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(pkg._id)}>
                            {pkg.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(pkg._id)}>
                            Delete
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
      </div>
    </DashboardLayout>
  )
}

