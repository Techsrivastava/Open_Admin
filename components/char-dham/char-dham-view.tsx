"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Filter, MoreHorizontal, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import CharDhamFormModal from "./char-dham-form-modal"

interface CharDhamPackage {
  id: string
  packageId: string
  title: string
  overview: string
  difficulty: "Easy" | "Moderate" | "Challenging" | "Expert"
  duration: string
  maxAltitude: string
  bestTime: string
  cardImage: string
  gallery: string[]
  trekMap: string
  pdfFiles: string[]
  trekInfo: {
    title: string
    description: string
    data: {
      distance: string
      elevation: string
      duration: string
      difficulty: string
      bestTime: string
      groupSize: string
    }
  }
  inclusions: string[]
  exclusions: string[]
  whatToCarry: string[]
  fitnessRequired: string[]
  additionalServices: string[]
  pricing: {
    offerPrice: number
    originalPrice: number
    bookingPrice: number
  }
  itinerary: string[]
  status: "Draft" | "Published" | "Archived"
}

export default function CharDhamView() {
  const [packages, setPackages] = useState<CharDhamPackage[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState<CharDhamPackage | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")

  // Fetch all packages
  const fetchPackages = async () => {
    try {
      const response = await fetch('https://openbacken-production.up.railway.app/api/char-dham')
      if (!response.ok) {
        throw new Error('Failed to fetch packages')
      }
      const data = await response.json()
      setPackages(data)
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast.error('Failed to fetch packages')
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const handleAddPackage = () => {
    setEditingPackage(null)
    setShowAddModal(true)
  }

  const handleEditPackage = (packageData: CharDhamPackage) => {
    setEditingPackage(packageData)
    setShowAddModal(true)
  }

  const handleDeletePackage = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        const response = await fetch(`https://openbacken-production.up.railway.app/api/char-dham/${id}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          throw new Error('Failed to delete package')
        }
        toast.success('Package deleted successfully')
        fetchPackages() // Refresh the list
      } catch (error) {
        console.error('Error deleting package:', error)
        toast.error('Failed to delete package')
      }
    }
  }

  const handleStatusChange = async (id: string, newStatus: "Draft" | "Published" | "Archived") => {
    try {
      const response = await fetch(`https://openbacken-production.up.railway.app/api/char-dham/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) {
        throw new Error('Failed to update package status')
      }
      toast.success(`Package status updated to ${newStatus}`)
      fetchPackages() // Refresh the list
    } catch (error) {
      console.error('Error updating package status:', error)
      toast.error('Failed to update package status')
    }
  }

  const handleSubmitPackage = async (formData: any) => {
    try {
      if (editingPackage) {
        // Update existing package
        const response = await fetch(`https://openbacken-production.up.railway.app/api/char-dham/${editingPackage.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        if (!response.ok) {
          throw new Error('Failed to update package')
        }
        toast.success('Package updated successfully')
      } else {
        // Create new package
        const response = await fetch('https://openbacken-production.up.railway.app/api/char-dham', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        if (!response.ok) {
          throw new Error('Failed to create package')
        }
        toast.success('Package created successfully')
      }
      setShowAddModal(false)
      fetchPackages() // Refresh the list
    } catch (error) {
      console.error('Error saving package:', error)
      toast.error('Failed to save package')
    }
  }

  const filteredPackages = packages.filter((packageData) => {
    const matchesSearch = 
      packageData.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      packageData.packageId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || packageData.status === statusFilter
    const matchesDifficulty = difficultyFilter === "all" || packageData.difficulty === difficultyFilter

    return matchesSearch && matchesStatus && matchesDifficulty
  })

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Char Dham Packages</h2>
        <Button onClick={handleAddPackage}>
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
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Moderate">Moderate</option>
            <option value="Challenging">Challenging</option>
            <option value="Expert">Expert</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPackages.map((packageData) => (
              <TableRow key={packageData.id}>
                <TableCell className="font-medium">{packageData.packageId}</TableCell>
                <TableCell>{packageData.title}</TableCell>
                <TableCell>{packageData.duration}</TableCell>
                <TableCell>{packageData.difficulty}</TableCell>
                <TableCell>₹{packageData.pricing.offerPrice}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      packageData.status === "Published" 
                        ? "bg-green-500 text-white" 
                        : packageData.status === "Draft"
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-500 text-white"
                    }
                  >
                    {packageData.status}
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
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuItem 
                        onClick={() => handleEditPackage(packageData)}
                        className="cursor-pointer"
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(packageData.id, 
                          packageData.status === "Draft" ? "Published" : 
                          packageData.status === "Published" ? "Archived" : "Draft"
                        )}
                        className="cursor-pointer"
                      >
                        {packageData.status === "Draft" ? "Publish" : 
                         packageData.status === "Published" ? "Archive" : "Unarchive"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeletePackage(packageData.id)}
                        className="cursor-pointer text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CharDhamFormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setEditingPackage(null)
        }}
        onSubmit={handleSubmitPackage}
        initialData={editingPackage}
      />
    </div>
  )
} 