"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Eye, Trash2, ChevronLeft, ChevronRight, BarChart } from 'lucide-react'
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { getPackages, deletePackage } from "@/api/package-controller"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CSVImportExport from "@/components/csv-import-export"

interface Package {
  _id: string
  name: string
  city: string
  state: string
  duration: string
  originalPrice: string
  offerPrice?: string
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  description?: string
  overview?: string
  advancePayment?: string
  category?: any
  inclusions?: string[]
  exclusions?: string[]
  itinerary?: any[]
  maxParticipants?: string
  startDate?: string
  endDate?: string
  howToReach?: string
  fitnessRequired?: string
  cancellationPolicy?: string
  whatToCarry?: any[]
  trekInfo?: any[]
  batchDates?: any[]
  additionalServices?: any[]
  faq?: any[]
  documents?: any[]
}

export default function PackagesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  // Analytics state
  const [activePackages, setActivePackages] = useState(0)
  const [featuredPackages, setFeaturedPackages] = useState(0)
  const [locationStats, setLocationStats] = useState<{location: string, count: number}[]>([])
  const [priceRanges, setPriceRanges] = useState<{range: string, count: number}[]>([])

  useEffect(() => {
    fetchPackages()
  }, [currentPage, itemsPerPage])

  const fetchPackages = async () => {
    try {
      setIsLoading(true)
      const response = await getPackages()
      if (response.success) {
        // Set total items for pagination
        setTotalItems(response.data.length)
        setTotalPages(Math.ceil(response.data.length / itemsPerPage))
        
        // Paginate the data
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        const paginatedData = response.data.slice(startIndex, endIndex)
        
        setPackages(paginatedData)
        
        // Calculate analytics
        calculateAnalytics(response.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch packages",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching packages:", error)
      toast({
        title: "Error",
        description: "Failed to fetch packages",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateAnalytics = (data: Package[]) => {
    // Count active and featured packages
    const active = data.filter(pkg => pkg.isActive).length
    const featured = data.filter(pkg => pkg.isFeatured).length
    setActivePackages(active)
    setFeaturedPackages(featured)
    
    // Group by location
    const locationMap = new Map<string, number>()
    data.forEach(pkg => {
      const location = pkg.city + ", " + pkg.state
      locationMap.set(location, (locationMap.get(location) || 0) + 1)
    })
    
    const locationData = Array.from(locationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 locations
    
    setLocationStats(locationData)
    
    // Group by price range
    const ranges = [
      { min: 0, max: 10000, label: "₹0-₹10,000" },
      { min: 10001, max: 20000, label: "₹10,001-₹20,000" },
      { min: 20001, max: 30000, label: "₹20,001-₹30,000" },
      { min: 30001, max: 50000, label: "₹30,001-₹50,000" },
      { min: 50001, max: Infinity, label: "₹50,001+" }
    ]
    
    const priceRangeMap = new Map<string, number>()
    ranges.forEach(range => priceRangeMap.set(range.label, 0))
    
    data.forEach(pkg => {
      const price = parseInt(pkg.originalPrice)
      const range = ranges.find(r => price >= r.min && price <= r.max)
      if (range) {
        priceRangeMap.set(range.label, (priceRangeMap.get(range.label) || 0) + 1)
      }
    })
    
    const priceRangeData = Array.from(priceRangeMap.entries())
      .map(([range, count]) => ({ range, count }))
    
    setPriceRanges(priceRangeData)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return

    try {
      const response = await deletePackage(id)
      if (response.success) {
        toast({
          title: "Success",
          description: "Package deleted successfully",
        })
        fetchPackages() // Refresh the list
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

  const handleEditClick = (pkg: Package) => {
    if (!pkg?._id) {
      toast({
        title: "Error",
        description: "Package ID is missing",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Store the package data and packages array in localStorage
      localStorage.setItem("editPackageData", JSON.stringify(pkg));
      localStorage.setItem("packagesArray", JSON.stringify(packages));
      
      // Navigate to the edit page with the package ID
      router.push(`/dashboard/packages/edit/${pkg._id}`);
    } catch (error) {
      console.error("Error navigating to edit page:", error);
      toast({
        title: "Error",
        description: "Failed to navigate to edit page",
        variant: "destructive",
      });
    }
  }

  const handleCreateClick = () => {
    try {
      // Store the packages array in localStorage
      localStorage.setItem("packagesArray", JSON.stringify(packages));
      
      // Navigate to the create page
      router.push('/dashboard/packages/create');
    } catch (error) {
      console.error("Error navigating to create page:", error);
      toast({
        title: "Error",
        description: "Failed to navigate to create page",
        variant: "destructive",
      });
    }
  }
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Packages</h2>
          <Button onClick={() => router.push("/dashboard/packages/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Package
          </Button>
        </div>
        
        <Tabs defaultValue="packages" className="space-y-4">
          <TabsList>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="packages" className="space-y-4">
            {/* CSV Import/Export Component */}
            <CSVImportExport 
              packages={packages} 
              onImportSuccess={fetchPackages}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>All Packages</CardTitle>
                <CardDescription>Manage your travel packages here</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <p>Loading packages...</p>
                  </div>
                ) : packages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 space-y-2">
                    <p className="text-muted-foreground">No packages found</p>
                    <Button onClick={() => router.push("/dashboard/packages/create")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create your first package
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>State</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {packages.map((pkg) => (
                          <TableRow key={pkg._id}>
                            <TableCell className="font-medium">{pkg.name}</TableCell>
                            <TableCell>{pkg.city}</TableCell>
                            <TableCell>{pkg.state}</TableCell>
                            <TableCell>{pkg.duration}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div>₹{pkg.originalPrice}</div>
                                {pkg.offerPrice && <div className="text-sm text-green-600">Offer: ₹{pkg.offerPrice}</div>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Badge variant={pkg.isActive ? "default" : "secondary"}>
                                  {pkg.isActive ? "Active" : "Draft"}
                                </Badge>
                                {pkg.isFeatured && (
                                  <Badge variant="outline" className="bg-yellow-50">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{new Date(pkg.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => router.push(`/dashboard/packages/view/${pkg._id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleEditClick(pkg)}
                                  disabled={isLoading}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDelete(pkg._id)}
                                  disabled={isLoading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Items per page</p>
                  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                  </p>
                </div>
                
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      // Show first page, last page, and pages around current page
                      if (
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink 
                              isActive={page === currentPage}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      }
                      
                      // Show ellipsis for gaps
                      if (
                        (page === 2 && currentPage > 3) || 
                        (page === totalPages - 1 && currentPage < totalPages - 2)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )
                      }
                      
                      return null
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardFooter>
            </Card>
            {/* City-wise summary */}
            {packages.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold">City-wise Packages</h3>
                <ul>
                  {Object.entries(packages.reduce((acc, pkg) => {
                    acc[pkg.city] = (acc[pkg.city] || 0) + 1;
                    return acc;
                  }, {})).map(([city, count]) => (
                    <li key={city}>
                      {city}: {count} package{count > 1 ? 's' : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalItems}</div>
                  <p className="text-xs text-muted-foreground">
                    Total packages in the system
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activePackages}</div>
                  <p className="text-xs text-muted-foreground">
                    {((activePackages / totalItems) * 100).toFixed(1)}% of total packages
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Featured Packages</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{featuredPackages}</div>
                  <p className="text-xs text-muted-foreground">
                    {((featuredPackages / totalItems) * 100).toFixed(1)}% of total packages
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Price</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{packages.length > 0 
                      ? (packages.reduce((sum, pkg) => sum + parseInt(pkg.originalPrice), 0) / packages.length).toFixed(0)
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average package price
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Locations</CardTitle>
                  <CardDescription>
                    Distribution of packages by location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locationStats.map((stat, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-1/3 font-medium truncate">{stat.location}</div>
                        <div className="w-2/3 flex items-center gap-2">
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${(stat.count / totalItems) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {stat.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Price Distribution</CardTitle>
                  <CardDescription>
                    Packages by price range
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {priceRanges.map((range, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-1/3 font-medium truncate">{range.range}</div>
                        <div className="w-2/3 flex items-center gap-2">
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${(range.count / totalItems) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {range.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
