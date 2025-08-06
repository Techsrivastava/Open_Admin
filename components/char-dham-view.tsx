"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Filter, Calendar, Image as ImageIcon, Map, List, Package, DollarSign, Clock, Mountain, Backpack, Dumbbell, Info, X, MoreHorizontal, Pencil, Trash2, FileText, Check, FileEdit, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"

interface CharDham {
  id: string
  packageId: string
  title: string
  overview: string
  cardImage: string
  gallery: string[]
  pdfFiles: string[]
  duration: string
  maxAltitude: string
  bestTime: string
  status: "Active" | "Draft" | "Scheduled" | "Completed"
  pricing: {
    offerPrice: number
    originalPrice: number
    bookingPrice: number
  }
  packageInfo: {
    title: string
    data: {
      [key: string]: string
    }
  }
  inclusions: string[]
  exclusions: string[]
  whatToCarry: string[]
  fitnessRequired: string[]
  additionalServices: string[]
  itinerary: {
    day: number
    title: string
    description: string
    image?: string
  }[]
  templeInfo: {
    name: string
    altitude: string
    deity: string
    significance: string
    timings: string
    specialInstructions: string
  }[]
  availableBatches: {
    startDate: string
    endDate: string
    price: number
    availability: boolean
  }[]
  extraInfo: {
    title: string
    description: string
  }[]
}

const initialCharDham: CharDham[] = [
  {
    id: "1",
    packageId: "PKG001",
    title: "Complete Char Dham Yatra",
    overview: "Embark on a spiritual journey to the four sacred temples of Uttarakhand",
    cardImage: "/char-dham/char-dham-main.jpg",
    gallery: ["/char-dham/kedarnath.jpg", "/char-dham/badrinath.jpg", "/char-dham/gangotri.jpg", "/char-dham/yamunotri.jpg"],
    pdfFiles: ["/pdfs/char-dham-guide.pdf"],
    duration: "10 Days",
    maxAltitude: "3,583m",
    bestTime: "May to October",
    status: "Active",
    pricing: {
      offerPrice: 25000,
      originalPrice: 30000,
      bookingPrice: 5000
    },
    packageInfo: {
      title: "Char Dham Package Information",
      data: {
        startingPoint: "Haridwar",
        endingPoint: "Haridwar",
        totalDistance: "1,200 km",
        groupSize: "2-12 people",
        accommodation: "Hotel & Guest House",
        meals: "All meals included",
        transport: "AC Vehicle",
        guide: "Experienced guide"
      }
    },
    inclusions: [
      "Accommodation in hotels and guest houses",
      "All meals (breakfast, lunch, dinner)",
      "AC vehicle for transportation",
      "Experienced guide",
      "First aid kit",
      "Oxygen cylinder",
      "Temple entry tickets"
    ],
    exclusions: [
      "Personal expenses",
      "Travel insurance",
      "Any additional services",
      "Tips for guide and driver"
    ],
    whatToCarry: [
      "Warm clothes",
      "Rain gear",
      "Comfortable shoes",
      "Personal medicines",
      "Water bottle",
      "Camera"
    ],
    fitnessRequired: [
      "Basic fitness level",
      "Ability to walk 5-6 km daily",
      "No severe health conditions",
      "Acclimatization to high altitude"
    ],
    additionalServices: [
      "Helicopter service to Kedarnath",
      "VIP darshan tickets",
      "Porter service",
      "Medical assistance"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Haridwar",
        description: "Arrive in Haridwar, check-in to hotel, evening Ganga aarti",
        image: "/char-dham/day1.jpg"
      },
      {
        day: 2,
        title: "Haridwar to Barkot",
        description: "Drive to Barkot, visit Yamunotri Temple"
      },
      {
        day: 3,
        title: "Barkot to Uttarkashi",
        description: "Drive to Uttarkashi, visit Gangotri Temple"
      },
      {
        day: 4,
        title: "Uttarkashi to Guptkashi",
        description: "Drive to Guptkashi, rest and acclimatization"
      },
      {
        day: 5,
        title: "Kedarnath Darshan",
        description: "Visit Kedarnath Temple, evening return to Guptkashi"
      },
      {
        day: 6,
        title: "Guptkashi to Badrinath",
        description: "Drive to Badrinath, visit temple"
      },
      {
        day: 7,
        title: "Badrinath to Joshimath",
        description: "Morning darshan, drive to Joshimath"
      },
      {
        day: 8,
        title: "Joshimath to Rishikesh",
        description: "Drive to Rishikesh, evening Ganga aarti"
      },
      {
        day: 9,
        title: "Rishikesh to Haridwar",
        description: "Morning yoga, drive to Haridwar"
      },
      {
        day: 10,
        title: "Departure",
        description: "Breakfast and departure"
      }
    ],
    templeInfo: [
  {
    name: "Kedarnath",
        altitude: "3,583m",
    deity: "Lord Shiva",
        significance: "The most sacred of the four temples",
        timings: "6:00 AM to 6:00 PM",
        specialInstructions: "No women allowed during menstruation"
  },
  {
    name: "Badrinath",
        altitude: "3,130m",
    deity: "Lord Vishnu",
        significance: "The highest of the four temples",
        timings: "6:00 AM to 6:00 PM",
        specialInstructions: "No women allowed during menstruation"
      },
      {
        name: "Gangotri",
        altitude: "3,050m",
        deity: "Lord Shiva",
        significance: "The source of the Ganga",
        timings: "6:00 AM to 6:00 PM",
        specialInstructions: "No women allowed during menstruation"
      },
      {
        name: "Yamunotri",
        altitude: "3,180m",
        deity: "Lord Shiva",
        significance: "The first of the four temples",
        timings: "6:00 AM to 6:00 PM",
        specialInstructions: "No women allowed during menstruation"
      }
    ],
    availableBatches: [
      {
        startDate: "2024-05-01",
        endDate: "2024-05-10",
        price: 25000,
        availability: true
      }
    ],
    extraInfo: [
      {
        title: "Rail Head",
        description: "Pathankot is the nearest rail head to the base camp"
      },
      {
        title: "Region",
        description: "Himachal Pradesh"
      },
      {
        title: "Airport",
        description: "Bhuntar, which is 52km away from Manali"
      },
      {
        title: "Base Camp",
        description: "Manali"
      },
      {
        title: "Best Season",
        description: "July, August and September"
      },
      {
        title: "Service From",
        description: "Manali to Manali"
      },
      {
        title: "Grade",
        description: "Easy"
      },
      {
        title: "Stay",
        description: "Camping"
      },
      {
        title: "Trail Type",
        description: "Round trail. The trek starts and ends at Manali"
      },
      {
        title: "Duration",
        description: "4 Days"
      },
      {
        title: "Meals",
        description: "Meals while on trek (Veg, Egg)"
      },
      {
        title: "Maximum Altitude",
        description: "14000 Ft"
      },
      {
        title: "Approx Trekking KM",
        description: "25 Km"
      }
    ]
  }
]

export default function CharDhamView() {
  const [charDhams, setCharDhams] = useState<CharDham[]>(initialCharDham)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCharDham, setSelectedCharDham] = useState<CharDham | null>(null)
  const [newCharDham, setNewCharDham] = useState<Partial<CharDham>>({
    pricing: {
      offerPrice: 0,
      originalPrice: 0,
      bookingPrice: 0
    },
    packageInfo: {
      title: "",
      data: {
        startingPoint: "",
        endingPoint: "",
        totalDistance: "",
        groupSize: "",
        accommodation: "",
        meals: "",
        transport: "",
        guide: ""
      }
    },
    templeInfo: [],
    availableBatches: [],
    extraInfo: []
  })
  const [activeTab, setActiveTab] = useState("overview")
  const [filters, setFilters] = useState({
    status: "all",
    priceRange: "all"
  })
  const [showViewModal, setShowViewModal] = useState(false)

  const handleAddCharDham = () => {
    // Generate new packageId
    const lastPackage = charDhams[charDhams.length - 1]
    const lastNumber = lastPackage ? parseInt(lastPackage.packageId.replace('PKG', '')) : 0
    const newPackageId = `PKG${String(lastNumber + 1).padStart(3, '0')}`
    
    setNewCharDham({
      packageId: newPackageId,
      pricing: {
        offerPrice: 0,
        originalPrice: 0,
        bookingPrice: 0
      },
      packageInfo: {
        title: "",
        data: {
          startingPoint: "",
          endingPoint: "",
          totalDistance: "",
          groupSize: "",
          accommodation: "",
          meals: "",
          transport: "",
          guide: ""
        }
      },
      templeInfo: [],
      availableBatches: [],
      extraInfo: []
    })
    setShowAddModal(true)
  }

  const handleEditCharDham = (charDham: CharDham) => {
    setSelectedCharDham(charDham)
    setNewCharDham(charDham)
    setShowEditModal(true)
  }

  const handleDeleteCharDham = (charDham: CharDham) => {
    setCharDhams(charDhams.filter(c => c.id !== charDham.id))
    toast.success("Char Dham package deleted successfully")
  }

  const handleStatusChange = (charDham: CharDham, newStatus: CharDham["status"]) => {
    setCharDhams(charDhams.map(c => 
      c.id === charDham.id ? { ...c, status: newStatus } : c
    ))
    toast.success(`Status updated to ${newStatus}`)
  }

  const filteredCharDhams = charDhams.filter(charDham => {
    const matchesSearch = 
      charDham.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      charDham.duration.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filters.status === "all" || charDham.status === filters.status
    const matchesPrice = filters.priceRange === "all" || (
      filters.priceRange === "0-20000" && charDham.pricing.offerPrice <= 20000 ||
      filters.priceRange === "20000-30000" && charDham.pricing.offerPrice > 20000 && charDham.pricing.offerPrice <= 30000 ||
      filters.priceRange === "30000+" && charDham.pricing.offerPrice > 30000
    )

    return matchesSearch && matchesStatus && matchesPrice
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/10 text-green-500"
      case "Draft":
        return "bg-yellow-500/10 text-yellow-500"
      case "Scheduled":
        return "bg-blue-500/10 text-blue-500"
      case "Completed":
        return "bg-gray-500/10 text-gray-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  // Add helper functions for state updates
  const updatePricing = (field: keyof CharDham['pricing'], value: number) => {
    const currentPricing = newCharDham.pricing || {
      offerPrice: 0,
      originalPrice: 0,
      bookingPrice: 0
    }
    setNewCharDham({
      ...newCharDham,
      pricing: {
        ...currentPricing,
        [field]: value
      }
    })
  }

  const updatePackageInfo = (field: keyof CharDham['packageInfo']['data'], value: string) => {
    const currentPackageInfo = newCharDham.packageInfo || {
      title: "",
      data: {
        startingPoint: "",
        endingPoint: "",
        totalDistance: "",
        groupSize: "",
        accommodation: "",
        meals: "",
        transport: "",
        guide: ""
      }
    }
    setNewCharDham({
      ...newCharDham,
      packageInfo: {
        ...currentPackageInfo,
        data: {
          ...currentPackageInfo.data,
          [field]: value
        }
      }
    })
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Char Dham Packages</h1>
        <Button onClick={handleAddCharDham}>
          <Plus className="mr-2 h-4 w-4" />
          Add Package
          </Button>
        </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
            <Input
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Packages</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Price Range</Label>
                  <Select
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="0-20000">₹0 - ₹20,000</SelectItem>
                      <SelectItem value="20000-30000">₹20,000 - ₹30,000</SelectItem>
                      <SelectItem value="30000+">₹30,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ status: "all", priceRange: "all" })}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Overview</TableHead>
                <TableHead>Duration</TableHead>
              <TableHead>Max Altitude</TableHead>
              <TableHead>Best Time</TableHead>
                <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredCharDhams.map((charDham) => (
              <TableRow key={charDham.id}>
                <TableCell className="font-medium">{charDham.packageId}</TableCell>
                <TableCell>{charDham.title}</TableCell>
                <TableCell className="max-w-[200px] truncate">{charDham.overview}</TableCell>
                <TableCell>{charDham.duration}</TableCell>
                <TableCell>{charDham.maxAltitude}</TableCell>
                <TableCell>{charDham.bestTime}</TableCell>
                  <TableCell>
                  <Badge className={getStatusColor(charDham.status)}>
                    {charDham.status}
                  </Badge>
                  </TableCell>
                <TableCell>₹{charDham.pricing.offerPrice}</TableCell>
                  <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditCharDham(charDham)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={() => {
                        setSelectedCharDham(charDham)
                        setShowViewModal(true)
                      }}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteCharDham(charDham)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(charDham, "Active")}>
                          Activate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(charDham, "Draft")}>
                          Draft
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(charDham, "Scheduled")}>
                          Schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(charDham, "Completed")}>
                          Complete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => {
        setShowAddModal(open)
        setShowEditModal(open)
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showAddModal ? "Add New Package" : "Edit Package"}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="package">Package Info</TabsTrigger>
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              <TabsTrigger value="templeInfo">Temple Info</TabsTrigger>
              <TabsTrigger value="batches">Batches</TabsTrigger>
              <TabsTrigger value="extraInfo">Extra Info</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input
                    value={newCharDham.title || ""}
                    onChange={(e) => setNewCharDham({ ...newCharDham, title: e.target.value })}
                    placeholder="Enter package title"
                  />
      </div>
                <div className="grid gap-2">
                  <Label>Overview</Label>
                  <Textarea
                    value={newCharDham.overview || ""}
                    onChange={(e) => setNewCharDham({ ...newCharDham, overview: e.target.value })}
                    placeholder="Enter package overview"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Duration</Label>
                    <Input
                      value={newCharDham.duration || ""}
                      onChange={(e) => setNewCharDham({ ...newCharDham, duration: e.target.value })}
                      placeholder="e.g., 10 Days"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Max Altitude</Label>
                    <Input
                      value={newCharDham.maxAltitude || ""}
                      onChange={(e) => setNewCharDham({ ...newCharDham, maxAltitude: e.target.value })}
                      placeholder="e.g., 3,583m"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Best Time</Label>
                    <Input
                      value={newCharDham.bestTime || ""}
                      onChange={(e) => setNewCharDham({ ...newCharDham, bestTime: e.target.value })}
                      placeholder="e.g., May to October"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select
                      value={newCharDham.status || "Draft"}
                      onValueChange={(value: CharDham["status"]) => setNewCharDham({ ...newCharDham, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Offer Price</Label>
                    <Input
                      type="number"
                      value={newCharDham.pricing?.offerPrice || 0}
                      onChange={(e) => updatePricing('offerPrice', Number(e.target.value))}
                      placeholder="Enter offer price"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Original Price</Label>
                    <Input
                      type="number"
                      value={newCharDham.pricing?.originalPrice || 0}
                      onChange={(e) => updatePricing('originalPrice', Number(e.target.value))}
                      placeholder="Enter original price"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Booking Price</Label>
                    <Input
                      type="number"
                      value={newCharDham.pricing?.bookingPrice || 0}
                      onChange={(e) => updatePricing('bookingPrice', Number(e.target.value))}
                      placeholder="Enter booking price"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="images" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Card Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setNewCharDham({ ...newCharDham, cardImage: URL.createObjectURL(file) })
                        }
                      }}
                    />
                    <Button variant="outline" onClick={() => {
                      const input = document.querySelector('input[type="file"]') as HTMLInputElement
                      if (input) input.click()
                    }}>
                      Browse
                    </Button>
                  </div>
                  {newCharDham.cardImage && (
                    <div className="relative w-40 h-40">
                      <img
                        src={newCharDham.cardImage}
                        alt="Card preview"
                        className="rounded-md object-cover w-full h-full"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setNewCharDham({ ...newCharDham, cardImage: "" })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Gallery Images</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        const urls = files.map(file => URL.createObjectURL(file))
                        setNewCharDham({ ...newCharDham, gallery: [...(newCharDham.gallery || []), ...urls] })
                      }}
                    />
                    <Button variant="outline" onClick={() => {
                      const input = document.querySelector('input[type="file"]') as HTMLInputElement
                      if (input) input.click()
                    }}>
                      Browse
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {newCharDham.gallery?.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="rounded-md object-cover w-full h-32"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            const newGallery = [...(newCharDham.gallery || [])]
                            newGallery.splice(index, 1)
                            setNewCharDham({ ...newCharDham, gallery: newGallery })
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>PDF Documents</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        const urls = files.map(file => URL.createObjectURL(file))
                        setNewCharDham({ ...newCharDham, pdfFiles: [...(newCharDham.pdfFiles || []), ...urls] })
                      }}
                    />
                    <Button variant="outline" onClick={() => {
                      const input = document.querySelector('input[type="file"]') as HTMLInputElement
                      if (input) input.click()
                    }}>
                      Browse
                    </Button>
                  </div>
                  <div className="grid gap-2">
                    {newCharDham.pdfFiles?.map((pdf, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">PDF Document {index + 1}</span>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            const newPdfs = [...(newCharDham.pdfFiles || [])]
                            newPdfs.splice(index, 1)
                            setNewCharDham({ ...newCharDham, pdfFiles: newPdfs })
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="package" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Package Title</Label>
                  <Input
                    value={newCharDham.packageInfo?.title || ""}
                    onChange={(e) => {
                      const currentPackageInfo = newCharDham.packageInfo || {
                        title: "",
                        data: {
                          startingPoint: "",
                          endingPoint: "",
                          totalDistance: "",
                          groupSize: "",
                          accommodation: "",
                          meals: "",
                          transport: "",
                          guide: ""
                        }
                      }
                      setNewCharDham({
                        ...newCharDham,
                        packageInfo: {
                          ...currentPackageInfo,
                          title: e.target.value
                        }
                      })
                    }}
                    placeholder="Enter package title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Starting Point</Label>
                  <Input
                    value={newCharDham.packageInfo?.data?.startingPoint || ""}
                    onChange={(e) => updatePackageInfo('startingPoint', e.target.value)}
                    placeholder="Enter starting point"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Ending Point</Label>
                  <Input
                    value={newCharDham.packageInfo?.data?.endingPoint || ""}
                    onChange={(e) => updatePackageInfo('endingPoint', e.target.value)}
                    placeholder="Enter ending point"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Total Distance</Label>
                  <Input
                    value={newCharDham.packageInfo?.data?.totalDistance || ""}
                    onChange={(e) => updatePackageInfo('totalDistance', e.target.value)}
                    placeholder="Enter total distance"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Group Size</Label>
                  <Input
                    value={newCharDham.packageInfo?.data?.groupSize || ""}
                    onChange={(e) => updatePackageInfo('groupSize', e.target.value)}
                    placeholder="Enter group size"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Accommodation</Label>
                  <Input
                    value={newCharDham.packageInfo?.data?.accommodation || ""}
                    onChange={(e) => updatePackageInfo('accommodation', e.target.value)}
                    placeholder="Enter accommodation details"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Meals</Label>
                  <Input
                    value={newCharDham.packageInfo?.data?.meals || ""}
                    onChange={(e) => updatePackageInfo('meals', e.target.value)}
                    placeholder="Enter meals details"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Transport</Label>
                  <Input
                    value={newCharDham.packageInfo?.data?.transport || ""}
                    onChange={(e) => updatePackageInfo('transport', e.target.value)}
                    placeholder="Enter transport details"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Guide</Label>
                  <Input
                    value={newCharDham.packageInfo?.data?.guide || ""}
                    onChange={(e) => updatePackageInfo('guide', e.target.value)}
                    placeholder="Enter guide details"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="itinerary" className="space-y-4">
              <div className="grid gap-4">
                {(newCharDham.itinerary || []).map((day, index) => (
                  <div key={index} className="grid gap-4 p-4 border rounded-md">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Day {day.day}</h3>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newItinerary = [...(newCharDham.itinerary || [])]
                          newItinerary.splice(index, 1)
                          setNewCharDham({ ...newCharDham, itinerary: newItinerary })
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      <Label>Title</Label>
                      <Input
                        value={day.title}
                        onChange={(e) => {
                          const newItinerary = [...(newCharDham.itinerary || [])]
                          newItinerary[index] = { ...day, title: e.target.value }
                          setNewCharDham({ ...newCharDham, itinerary: newItinerary })
                        }}
                        placeholder="Enter day title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea
                        value={day.description}
                        onChange={(e) => {
                          const newItinerary = [...(newCharDham.itinerary || [])]
                          newItinerary[index] = { ...day, description: e.target.value }
                          setNewCharDham({ ...newCharDham, itinerary: newItinerary })
                        }}
                        placeholder="Enter day description"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Day Image</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const newItinerary = [...(newCharDham.itinerary || [])]
                              newItinerary[index] = { ...day, image: URL.createObjectURL(file) }
                              setNewCharDham({ ...newCharDham, itinerary: newItinerary })
                            }
                          }}
                        />
                        <Button variant="outline" onClick={() => {
                          const input = document.querySelector('input[type="file"]') as HTMLInputElement
                          if (input) input.click()
                        }}>
                          Browse
                        </Button>
                      </div>
                      {day.image && (
                        <div className="relative w-40 h-40">
                          <img
                            src={day.image}
                            alt={`Day ${day.day} preview`}
                            className="rounded-md object-cover w-full h-full"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              const newItinerary = [...(newCharDham.itinerary || [])]
                              newItinerary[index] = { ...day, image: "" }
                              setNewCharDham({ ...newCharDham, itinerary: newItinerary })
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newItinerary = [...(newCharDham.itinerary || [])]
                    newItinerary.push({
                      day: newItinerary.length + 1,
                      title: "",
                      description: "",
                      image: ""
                    })
                    setNewCharDham({ ...newCharDham, itinerary: newItinerary })
                  }}
                >
                  Add Day
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="templeInfo" className="space-y-4">
              <div className="grid gap-4">
                {(newCharDham.templeInfo || []).map((temple, index) => (
                  <div key={index} className="grid gap-4 p-4 border rounded-md">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Temple {index + 1}</h3>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newTempleInfo = [...(newCharDham.templeInfo || [])]
                          newTempleInfo.splice(index, 1)
                          setNewCharDham({ ...newCharDham, templeInfo: newTempleInfo })
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      <Label>Temple Name</Label>
                      <Input
                        value={temple.name}
                        onChange={(e) => {
                          const newTempleInfo = [...(newCharDham.templeInfo || [])]
                          newTempleInfo[index] = { ...temple, name: e.target.value }
                          setNewCharDham({ ...newCharDham, templeInfo: newTempleInfo })
                        }}
                        placeholder="Enter temple name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Altitude</Label>
                      <Input
                        value={temple.altitude}
                        onChange={(e) => {
                          const newTempleInfo = [...(newCharDham.templeInfo || [])]
                          newTempleInfo[index] = { ...temple, altitude: e.target.value }
                          setNewCharDham({ ...newCharDham, templeInfo: newTempleInfo })
                        }}
                        placeholder="Enter altitude"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Deity</Label>
                      <Input
                        value={temple.deity}
                        onChange={(e) => {
                          const newTempleInfo = [...(newCharDham.templeInfo || [])]
                          newTempleInfo[index] = { ...temple, deity: e.target.value }
                          setNewCharDham({ ...newCharDham, templeInfo: newTempleInfo })
                        }}
                        placeholder="Enter deity name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Significance</Label>
                      <Textarea
                        value={temple.significance}
                        onChange={(e) => {
                          const newTempleInfo = [...(newCharDham.templeInfo || [])]
                          newTempleInfo[index] = { ...temple, significance: e.target.value }
                          setNewCharDham({ ...newCharDham, templeInfo: newTempleInfo })
                        }}
                        placeholder="Enter temple significance"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Timings</Label>
                      <Input
                        value={temple.timings}
                        onChange={(e) => {
                          const newTempleInfo = [...(newCharDham.templeInfo || [])]
                          newTempleInfo[index] = { ...temple, timings: e.target.value }
                          setNewCharDham({ ...newCharDham, templeInfo: newTempleInfo })
                        }}
                        placeholder="Enter temple timings"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Special Instructions</Label>
                      <Textarea
                        value={temple.specialInstructions}
                        onChange={(e) => {
                          const newTempleInfo = [...(newCharDham.templeInfo || [])]
                          newTempleInfo[index] = { ...temple, specialInstructions: e.target.value }
                          setNewCharDham({ ...newCharDham, templeInfo: newTempleInfo })
                        }}
                        placeholder="Enter special instructions"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newTempleInfo = [...(newCharDham.templeInfo || [])]
                    newTempleInfo.push({
                      name: "",
                      altitude: "",
                      deity: "",
                      significance: "",
                      timings: "",
                      specialInstructions: ""
                    })
                    setNewCharDham({ ...newCharDham, templeInfo: newTempleInfo })
                  }}
                >
                  Add Temple
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="batches" className="space-y-4">
              <div className="grid gap-4">
                {(newCharDham.availableBatches || []).map((batch, index) => (
                  <div key={index} className="grid gap-4 p-4 border rounded-md">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Batch {index + 1}</h3>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newBatches = [...(newCharDham.availableBatches || [])]
                          newBatches.splice(index, 1)
                          setNewCharDham({ ...newCharDham, availableBatches: newBatches })
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={batch.startDate}
                          onChange={(e) => {
                            const newBatches = [...(newCharDham.availableBatches || [])]
                            newBatches[index] = { ...batch, startDate: e.target.value }
                            setNewCharDham({ ...newCharDham, availableBatches: newBatches })
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={batch.endDate}
                          onChange={(e) => {
                            const newBatches = [...(newCharDham.availableBatches || [])]
                            newBatches[index] = { ...batch, endDate: e.target.value }
                            setNewCharDham({ ...newCharDham, availableBatches: newBatches })
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Price</Label>
                      <Input
                        type="number"
                        value={batch.price}
                        onChange={(e) => {
                          const newBatches = [...(newCharDham.availableBatches || [])]
                          newBatches[index] = { ...batch, price: Number(e.target.value) }
                          setNewCharDham({ ...newCharDham, availableBatches: newBatches })
                        }}
                        placeholder="Enter batch price"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label>Availability</Label>
                      <input
                        type="checkbox"
                        checked={batch.availability}
                        onChange={(e) => {
                          const newBatches = [...(newCharDham.availableBatches || [])]
                          newBatches[index] = { ...batch, availability: e.target.checked }
                          setNewCharDham({ ...newCharDham, availableBatches: newBatches })
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newBatches = [...(newCharDham.availableBatches || [])]
                    newBatches.push({
                      startDate: "",
                      endDate: "",
                      price: 0,
                      availability: true
                    })
                    setNewCharDham({ ...newCharDham, availableBatches: newBatches })
                  }}
                >
                  Add Batch
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="extraInfo" className="space-y-4">
              <div className="grid gap-4">
                {(newCharDham.extraInfo || []).map((info, index) => (
                  <div key={index} className="grid gap-4 p-4 border rounded-md">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Info {index + 1}</h3>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newExtraInfo = [...(newCharDham.extraInfo || [])]
                          newExtraInfo.splice(index, 1)
                          setNewCharDham({ ...newCharDham, extraInfo: newExtraInfo })
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      <Label>Title</Label>
                      <Input
                        value={info.title}
                        onChange={(e) => {
                          const newExtraInfo = [...(newCharDham.extraInfo || [])]
                          newExtraInfo[index] = { ...info, title: e.target.value }
                          setNewCharDham({ ...newCharDham, extraInfo: newExtraInfo })
                        }}
                        placeholder="Enter title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea
                        value={info.description}
                        onChange={(e) => {
                          const newExtraInfo = [...(newCharDham.extraInfo || [])]
                          newExtraInfo[index] = { ...info, description: e.target.value }
                          setNewCharDham({ ...newCharDham, extraInfo: newExtraInfo })
                        }}
                        placeholder="Enter description"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newExtraInfo = [...(newCharDham.extraInfo || [])]
                    newExtraInfo.push({
                      title: "",
                      description: ""
                    })
                    setNewCharDham({ ...newCharDham, extraInfo: newExtraInfo })
                  }}
                >
                  Add Extra Info
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => {
              setShowAddModal(false)
              setShowEditModal(false)
            }}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (showAddModal) {
                setCharDhams([...charDhams, { ...newCharDham as CharDham, id: Date.now().toString() }])
                toast.success("Package added successfully")
              } else {
                setCharDhams(charDhams.map(c => 
                  c.id === selectedCharDham?.id ? { ...newCharDham as CharDham, id: c.id } : c
                ))
                toast.success("Package updated successfully")
              }
              setShowAddModal(false)
              setShowEditModal(false)
            }}>
              {showAddModal ? "Add Package" : "Update Package"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Package Details</DialogTitle>
          </DialogHeader>
          {selectedCharDham && (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Title</TableCell>
                        <TableCell>{selectedCharDham.title}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Overview</TableCell>
                        <TableCell>{selectedCharDham.overview}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Duration</TableCell>
                        <TableCell>{selectedCharDham.duration}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Max Altitude</TableCell>
                        <TableCell>{selectedCharDham.maxAltitude}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Best Time</TableCell>
                        <TableCell>{selectedCharDham.bestTime}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Status</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(selectedCharDham.status)}>
                            {selectedCharDham.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Package Information</h3>
                  <Table>
                    <TableBody>
                      {Object.entries(selectedCharDham.packageInfo.data).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</TableCell>
                          <TableCell>{value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Pricing</h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Offer Price</TableCell>
                        <TableCell>₹{selectedCharDham.pricing.offerPrice}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Original Price</TableCell>
                        <TableCell>₹{selectedCharDham.pricing.originalPrice}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Booking Price</TableCell>
                        <TableCell>₹{selectedCharDham.pricing.bookingPrice}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Inclusions</h3>
                    <Table>
                      <TableBody>
                        {selectedCharDham.inclusions.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Exclusions</h3>
                    <Table>
                      <TableBody>
                        {selectedCharDham.exclusions.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">What to Carry</h3>
                  <Table>
                    <TableBody>
                      {selectedCharDham.whatToCarry.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Fitness Required</h3>
                  <Table>
                    <TableBody>
                      {selectedCharDham.fitnessRequired.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Additional Services</h3>
                  <Table>
                    <TableBody>
                      {selectedCharDham.additionalServices.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Itinerary</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCharDham.itinerary.map((day) => (
                        <TableRow key={day.day}>
                          <TableCell className="font-medium">Day {day.day}</TableCell>
                          <TableCell>{day.title}</TableCell>
                          <TableCell>{day.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {selectedCharDham.pdfFiles && selectedCharDham.pdfFiles.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">PDF Documents</h3>
                    <div className="grid gap-2">
                      {selectedCharDham.pdfFiles.map((pdf, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <a 
                            href={pdf} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            View PDF Document {index + 1}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

