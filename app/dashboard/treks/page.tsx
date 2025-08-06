"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Filter, Calendar, Image as ImageIcon, Map, List, Package, DollarSign, Clock, Mountain, Backpack, Dumbbell, Info, X, MoreHorizontal, Pencil, Trash2, FileText } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Trek {
  id: string
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
  itinerary: {
    day: number
    title: string
    description: string
    image: string
  }[]
  status: "Active" | "Draft" | "Scheduled" | "Completed"
  packageId: string
}

const initialTreks: Trek[] = [
  {
    id: "TRK-1001",
    title: "Kedarkantha Trek",
    overview: "A beautiful winter trek in Uttarakhand offering stunning views of snow-capped peaks.",
    difficulty: "Moderate",
    duration: "6 Days",
    maxAltitude: "12,500 ft",
    bestTime: "December to March",
    cardImage: "/treks/kedarkantha.jpg",
    gallery: ["/treks/kedarkantha-1.jpg", "/treks/kedarkantha-2.jpg"],
    trekMap: "/maps/kedarkantha-map.jpg",
    pdfFiles: ["/pdfs/kedarkantha-guide.pdf"],
    trekInfo: {
      title: "Kedarkantha Trek Information",
      description: "Essential details about the Kedarkantha trek experience",
      data: {
        distance: "20 km",
        elevation: "12,500 ft",
        duration: "6 Days",
        difficulty: "Moderate",
        bestTime: "December to March",
        groupSize: "4-12 people"
      }
    },
    inclusions: [
      "Transportation from Dehradun",
      "Accommodation in tents",
      "All meals",
      "Trekking equipment",
      "First aid kit"
    ],
    exclusions: [
      "Personal expenses",
      "Insurance",
      "Tips for guides"
    ],
    whatToCarry: [
      "Warm clothes",
      "Trekking shoes",
      "Water bottle",
      "Sunscreen",
      "Personal medicines"
    ],
    fitnessRequired: [
      "Basic fitness level",
      "Ability to walk 5-6 hours daily",
      "No major health issues"
    ],
    additionalServices: [
      "Porter service",
      "Extra day stay",
      "Equipment rental"
    ],
    pricing: {
      offerPrice: 9999,
      originalPrice: 12999,
      bookingPrice: 1999
    },
    itinerary: [
      {
        day: 1,
        title: "Dehradun to Sankri",
        description: "Drive from Dehradun to Sankri village",
        image: "/treks/kedarkantha-day1.jpg"
      },
      {
        day: 2,
        title: "Sankri to Juda Ka Talab",
        description: "Trek through dense forests to reach Juda Ka Talab",
        image: "/treks/kedarkantha-day2.jpg"
      }
    ],
    status: "Active",
    packageId: "PKG-1001"
  }
]

export default function TreksPage() {
  const [treks, setTreks] = useState<Trek[]>(initialTreks)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedTrek, setSelectedTrek] = useState<Trek | null>(null)
  const [newTrek, setNewTrek] = useState<Partial<Trek>>({})
  const [activeTab, setActiveTab] = useState("overview")
  const [filters, setFilters] = useState({
    difficulty: "all",
    status: "all",
    priceRange: "all"
  })

  const handleAddTrek = () => {
    // Generate new packageId
    const lastTrek = treks[treks.length - 1]
    const lastNumber = lastTrek ? parseInt(lastTrek.packageId.replace('PKG', '')) : 0
    const newPackageId = `PKG${String(lastNumber + 1).padStart(3, '0')}`
    
    setNewTrek({
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

  const handleEditTrek = () => {
    if (!selectedTrek) return

    setTreks(prevTreks =>
      prevTreks.map(trek =>
        trek.id === selectedTrek.id ? { ...trek, ...newTrek } : trek
      )
    )
    toast.success("Trek updated successfully")
    setShowEditModal(false)
    setSelectedTrek(null)
    setNewTrek({})
  }

  const handleDeleteTrek = (trek: Trek) => {
    setTreks(prevTreks => prevTreks.filter(t => t.id !== trek.id))
    toast.success(`Trek ${trek.title} deleted successfully`)
  }

  const handleStatusChange = (trek: Trek, newStatus: "Active" | "Draft" | "Scheduled" | "Completed") => {
    setTreks(prevTreks =>
      prevTreks.map(t =>
        t.id === trek.id ? { ...t, status: newStatus } : t
      )
    )
    toast.success(`Trek ${trek.title} status updated to ${newStatus}`)
  }

  const filteredTreks = treks.filter(trek => {
    const matchesSearch = 
      trek.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trek.difficulty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trek.duration.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDifficulty = filters.difficulty === "all" || trek.difficulty === filters.difficulty
    const matchesStatus = filters.status === "all" || trek.status === filters.status
    const matchesPrice = filters.priceRange === "all" || (
      filters.priceRange === "0-5000" && trek.pricing.offerPrice <= 5000 ||
      filters.priceRange === "5000-10000" && trek.pricing.offerPrice > 5000 && trek.pricing.offerPrice <= 10000 ||
      filters.priceRange === "10000+" && trek.pricing.offerPrice > 10000
    )

    return matchesSearch && matchesDifficulty && matchesStatus && matchesPrice
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500 text-white"
      case "Draft":
        return "bg-yellow-500 text-white"
      case "Scheduled":
        return "bg-blue-500 text-white"
      case "Completed":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Treks</h2>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Trek
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Trek</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="info">Trek Info</TabsTrigger>
                  <TabsTrigger value="inclusion">Inclusion</TabsTrigger>
                  <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newTrek.title || ""}
                        onChange={(e) => setNewTrek({ ...newTrek, title: e.target.value })}
                        placeholder="Enter trek title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="overview">Overview</Label>
                      <Textarea
                        id="overview"
                        value={newTrek.overview || ""}
                        onChange={(e) => setNewTrek({ ...newTrek, overview: e.target.value })}
                        placeholder="Enter trek overview"
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select
                          value={newTrek.difficulty || ""}
                          onValueChange={(value) => setNewTrek({ ...newTrek, difficulty: value as Trek["difficulty"] })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Moderate">Moderate</SelectItem>
                            <SelectItem value="Challenging">Challenging</SelectItem>
                            <SelectItem value="Expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          value={newTrek.duration || ""}
                          onChange={(e) => setNewTrek({ ...newTrek, duration: e.target.value })}
                          placeholder="e.g., 6 Days"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="maxAltitude">Max Altitude</Label>
                        <Input
                          id="maxAltitude"
                          value={newTrek.maxAltitude || ""}
                          onChange={(e) => setNewTrek({ ...newTrek, maxAltitude: e.target.value })}
                          placeholder="e.g., 12,500 ft"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bestTime">Best Time</Label>
                        <Input
                          id="bestTime"
                          value={newTrek.bestTime || ""}
                          onChange={(e) => setNewTrek({ ...newTrek, bestTime: e.target.value })}
                          placeholder="e.g., December to March"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cardImage">Card Image</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="cardImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const url = URL.createObjectURL(file)
                              setNewTrek({ ...newTrek, cardImage: url })
                            }
                          }}
                        />
                        <Button variant="outline" onClick={() => {
                          const input = document.getElementById('cardImage') as HTMLInputElement
                          if (input) input.click()
                        }}>
                          Browse
                        </Button>
                      </div>
                      {newTrek.cardImage && (
                        <div className="relative w-full aspect-video rounded-md overflow-hidden">
                          <img
                            src={newTrek.cardImage}
                            alt="Card preview"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => setNewTrek({ ...newTrek, cardImage: "" })}
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
                            setNewTrek({ ...newTrek, gallery: [...(newTrek.gallery || []), ...urls] })
                          }}
                        />
                        <Button variant="outline" onClick={() => {
                          const input = document.querySelector('input[type="file"]') as HTMLInputElement
                          if (input) input.click()
                        }}>
                          Browse
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {newTrek.gallery?.map((image, index) => (
                          <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                            <img
                              src={image}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                const newGallery = [...(newTrek.gallery || [])]
                                newGallery.splice(index, 1)
                                setNewTrek({ ...newTrek, gallery: newGallery })
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="trekMap">Trek Map</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="trekMap"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const url = URL.createObjectURL(file)
                              setNewTrek({ ...newTrek, trekMap: url })
                            }
                          }}
                        />
                        <Button variant="outline" onClick={() => {
                          const input = document.getElementById('trekMap') as HTMLInputElement
                          if (input) input.click()
                        }}>
                          Browse
                        </Button>
                      </div>
                      {newTrek.trekMap && (
                        <div className="relative w-full aspect-video rounded-md overflow-hidden">
                          <img
                            src={newTrek.trekMap}
                            alt="Trek map"
                            className="w-full h-full object-contain"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => setNewTrek({ ...newTrek, trekMap: "" })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
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
                            setNewTrek({ ...newTrek, pdfFiles: [...(newTrek.pdfFiles || []), ...urls] })
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
                        {newTrek.pdfFiles?.map((pdf, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">PDF Document {index + 1}</span>
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                const newPdfs = [...(newTrek.pdfFiles || [])]
                                newPdfs.splice(index, 1)
                                setNewTrek({ ...newTrek, pdfFiles: newPdfs })
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

                <TabsContent value="info" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="trekInfoTitle">Title</Label>
                      <Input
                        id="trekInfoTitle"
                        value={newTrek.trekInfo?.title || ""}
                        onChange={(e) => setNewTrek({
                          ...newTrek,
                          trekInfo: {
                            title: e.target.value,
                            description: newTrek.trekInfo?.description || "",
                            data: newTrek.trekInfo?.data || {
                              distance: "",
                              elevation: "",
                              duration: "",
                              difficulty: "",
                              bestTime: "",
                              groupSize: ""
                            }
                          }
                        })}
                        placeholder="Enter trek info title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="trekInfoDescription">Description</Label>
                      <Textarea
                        id="trekInfoDescription"
                        value={newTrek.trekInfo?.description || ""}
                        onChange={(e) => setNewTrek({
                          ...newTrek,
                          trekInfo: {
                            title: newTrek.trekInfo?.title || "",
                            description: e.target.value,
                            data: newTrek.trekInfo?.data || {
                              distance: "",
                              elevation: "",
                              duration: "",
                              difficulty: "",
                              bestTime: "",
                              groupSize: ""
                            }
                          }
                        })}
                        placeholder="Enter trek info description"
                        rows={4}
                      />
                    </div>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="distance">Distance</Label>
                          <Input
                            id="distance"
                            value={newTrek.trekInfo?.data?.distance || ""}
                            onChange={(e) => setNewTrek({
                              ...newTrek,
                              trekInfo: {
                                title: newTrek.trekInfo?.title || "",
                                description: newTrek.trekInfo?.description || "",
                                data: {
                                  distance: e.target.value,
                                  elevation: newTrek.trekInfo?.data?.elevation || "",
                                  duration: newTrek.trekInfo?.data?.duration || "",
                                  difficulty: newTrek.trekInfo?.data?.difficulty || "",
                                  bestTime: newTrek.trekInfo?.data?.bestTime || "",
                                  groupSize: newTrek.trekInfo?.data?.groupSize || ""
                                }
                              }
                            })}
                            placeholder="e.g., 20 km"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="elevation">Elevation</Label>
                          <Input
                            id="elevation"
                            value={newTrek.trekInfo?.data?.elevation || ""}
                            onChange={(e) => setNewTrek({
                              ...newTrek,
                              trekInfo: {
                                title: newTrek.trekInfo?.title || "",
                                description: newTrek.trekInfo?.description || "",
                                data: {
                                  distance: newTrek.trekInfo?.data?.distance || "",
                                  elevation: e.target.value,
                                  duration: newTrek.trekInfo?.data?.duration || "",
                                  difficulty: newTrek.trekInfo?.data?.difficulty || "",
                                  bestTime: newTrek.trekInfo?.data?.bestTime || "",
                                  groupSize: newTrek.trekInfo?.data?.groupSize || ""
                                }
                              }
                            })}
                            placeholder="e.g., 12,500 ft"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="groupSize">Group Size</Label>
                          <Input
                            id="groupSize"
                            value={newTrek.trekInfo?.data?.groupSize || ""}
                            onChange={(e) => setNewTrek({
                              ...newTrek,
                              trekInfo: {
                                title: newTrek.trekInfo?.title || "",
                                description: newTrek.trekInfo?.description || "",
                                data: {
                                  distance: newTrek.trekInfo?.data?.distance || "",
                                  elevation: newTrek.trekInfo?.data?.elevation || "",
                                  duration: newTrek.trekInfo?.data?.duration || "",
                                  difficulty: newTrek.trekInfo?.data?.difficulty || "",
                                  bestTime: newTrek.trekInfo?.data?.bestTime || "",
                                  groupSize: e.target.value
                                }
                              }
                            })}
                            placeholder="e.g., 4-12 people"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="inclusion" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Inclusions</Label>
                      <div className="space-y-2">
                        {(newTrek.inclusions || []).map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={item}
                              onChange={(e) => {
                                const newInclusions = [...(newTrek.inclusions || [])]
                                newInclusions[index] = e.target.value
                                setNewTrek({ ...newTrek, inclusions: newInclusions })
                              }}
                              placeholder="Enter inclusion item"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                const newInclusions = [...(newTrek.inclusions || [])]
                                newInclusions.splice(index, 1)
                                setNewTrek({ ...newTrek, inclusions: newInclusions })
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => setNewTrek({
                            ...newTrek,
                            inclusions: [...(newTrek.inclusions || []), ""]
                          })}
                        >
                          Add Inclusion
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Exclusions</Label>
                      <div className="space-y-2">
                        {(newTrek.exclusions || []).map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={item}
                              onChange={(e) => {
                                const newExclusions = [...(newTrek.exclusions || [])]
                                newExclusions[index] = e.target.value
                                setNewTrek({ ...newTrek, exclusions: newExclusions })
                              }}
                              placeholder="Enter exclusion item"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                const newExclusions = [...(newTrek.exclusions || [])]
                                newExclusions.splice(index, 1)
                                setNewTrek({ ...newTrek, exclusions: newExclusions })
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => setNewTrek({
                            ...newTrek,
                            exclusions: [...(newTrek.exclusions || []), ""]
                          })}
                        >
                          Add Exclusion
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>What to Carry</Label>
                      <div className="space-y-2">
                        {(newTrek.whatToCarry || []).map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={item}
                              onChange={(e) => {
                                const newItems = [...(newTrek.whatToCarry || [])]
                                newItems[index] = e.target.value
                                setNewTrek({ ...newTrek, whatToCarry: newItems })
                              }}
                              placeholder="Enter item to carry"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                const newItems = [...(newTrek.whatToCarry || [])]
                                newItems.splice(index, 1)
                                setNewTrek({ ...newTrek, whatToCarry: newItems })
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => setNewTrek({
                            ...newTrek,
                            whatToCarry: [...(newTrek.whatToCarry || []), ""]
                          })}
                        >
                          Add Item
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Fitness Required</Label>
                      <div className="space-y-2">
                        {(newTrek.fitnessRequired || []).map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={item}
                              onChange={(e) => {
                                const newItems = [...(newTrek.fitnessRequired || [])]
                                newItems[index] = e.target.value
                                setNewTrek({ ...newTrek, fitnessRequired: newItems })
                              }}
                              placeholder="Enter fitness requirement"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                const newItems = [...(newTrek.fitnessRequired || [])]
                                newItems.splice(index, 1)
                                setNewTrek({ ...newTrek, fitnessRequired: newItems })
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => setNewTrek({
                            ...newTrek,
                            fitnessRequired: [...(newTrek.fitnessRequired || []), ""]
                          })}
                        >
                          Add Requirement
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Additional Services</Label>
                      <div className="space-y-2">
                        {(newTrek.additionalServices || []).map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={item}
                              onChange={(e) => {
                                const newServices = [...(newTrek.additionalServices || [])]
                                newServices[index] = e.target.value
                                setNewTrek({ ...newTrek, additionalServices: newServices })
                              }}
                              placeholder="Enter additional service"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                const newServices = [...(newTrek.additionalServices || [])]
                                newServices.splice(index, 1)
                                setNewTrek({ ...newTrek, additionalServices: newServices })
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => setNewTrek({
                            ...newTrek,
                            additionalServices: [...(newTrek.additionalServices || []), ""]
                          })}
                        >
                          Add Service
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="itinerary" className="space-y-4">
                  <div className="grid gap-4">
                    {(newTrek.itinerary || []).map((day, index) => (
                      <div key={index} className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Day {day.day}</h3>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              const newItinerary = [...(newTrek.itinerary || [])]
                              newItinerary.splice(index, 1)
                              setNewTrek({ ...newTrek, itinerary: newItinerary })
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label>Title</Label>
                            <Input
                              value={day.title}
                              onChange={(e) => {
                                const newItinerary = [...(newTrek.itinerary || [])]
                                newItinerary[index] = { ...day, title: e.target.value }
                                setNewTrek({ ...newTrek, itinerary: newItinerary })
                              }}
                              placeholder="Enter day title"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Description</Label>
                            <Textarea
                              value={day.description}
                              onChange={(e) => {
                                const newItinerary = [...(newTrek.itinerary || [])]
                                newItinerary[index] = { ...day, description: e.target.value }
                                setNewTrek({ ...newTrek, itinerary: newItinerary })
                              }}
                              placeholder="Enter day description"
                              rows={4}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Image</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    const url = URL.createObjectURL(file)
                                    const newItinerary = [...(newTrek.itinerary || [])]
                                    newItinerary[index] = { ...day, image: url }
                                    setNewTrek({ ...newTrek, itinerary: newItinerary })
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
                              <div className="relative w-full aspect-video rounded-md overflow-hidden">
                                <img
                                  src={day.image}
                                  alt={`Day ${day.day}`}
                                  className="w-full h-full object-cover"
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2"
                                  onClick={() => {
                                    const newItinerary = [...(newTrek.itinerary || [])]
                                    newItinerary[index] = { ...day, image: "" }
                                    setNewTrek({ ...newTrek, itinerary: newItinerary })
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newItinerary = [...(newTrek.itinerary || [])]
                        newItinerary.push({
                          day: newItinerary.length + 1,
                          title: "",
                          description: "",
                          image: ""
                        })
                        setNewTrek({ ...newTrek, itinerary: newItinerary })
                      }}
                    >
                      Add Day
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="offerPrice">Offer Price</Label>
                        <Input
                          id="offerPrice"
                          type="number"
                          value={newTrek.pricing?.offerPrice || ""}
                          onChange={(e) => setNewTrek({
                            ...newTrek,
                            pricing: {
                              offerPrice: Number(e.target.value),
                              originalPrice: newTrek.pricing?.originalPrice || 0,
                              bookingPrice: newTrek.pricing?.bookingPrice || 0
                            }
                          })}
                          placeholder="Enter offer price"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="originalPrice">Original Price</Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          value={newTrek.pricing?.originalPrice || ""}
                          onChange={(e) => setNewTrek({
                            ...newTrek,
                            pricing: {
                              offerPrice: newTrek.pricing?.offerPrice || 0,
                              originalPrice: Number(e.target.value),
                              bookingPrice: newTrek.pricing?.bookingPrice || 0
                            }
                          })}
                          placeholder="Enter original price"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bookingPrice">Booking Price</Label>
                        <Input
                          id="bookingPrice"
                          type="number"
                          value={newTrek.pricing?.bookingPrice || ""}
                          onChange={(e) => setNewTrek({
                            ...newTrek,
                            pricing: {
                              offerPrice: newTrek.pricing?.offerPrice || 0,
                              originalPrice: newTrek.pricing?.originalPrice || 0,
                              bookingPrice: Number(e.target.value)
                            }
                          })}
                          placeholder="Enter booking price"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => {
                  setShowAddModal(false)
                  setNewTrek({})
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddTrek}>
                  Add Trek
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center space-x-2 md:w-2/3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search treks..."
              className="w-full"
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
                  <DialogTitle>Filter Treks</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Difficulty</Label>
                    <Select
                      value={filters.difficulty}
                      onValueChange={(value) => setFilters({ ...filters, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Challenging">Challenging</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                        <SelectItem value="0-5000">₹0 - ₹5,000</SelectItem>
                        <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                        <SelectItem value="10000+">₹10,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setFilters({ difficulty: "all", status: "all", priceRange: "all" })}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-6">
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
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTreks.map((trek) => (
                  <TableRow key={trek.id}>
                    <TableCell className="font-medium">{trek.packageId}</TableCell>
                    <TableCell>{trek.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{trek.overview}</TableCell>
                    <TableCell>{trek.duration}</TableCell>
                    <TableCell>{trek.maxAltitude}</TableCell>
                    <TableCell>{trek.bestTime}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(trek.status)}>
                        {trek.status}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{trek.pricing.offerPrice}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedTrek(trek)
                          setNewTrek(trek)
                          setShowEditModal(true)
                        }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedTrek(trek)
                          setShowViewModal(true)
                        }}>
                          <Info className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDeleteTrek(trek)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(trek, "Active")}>
                              Activate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(trek, "Draft")}>
                              Draft
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(trek, "Scheduled")}>
                              Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(trek, "Completed")}>
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
        </div>
      </div>

      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Trek Details</DialogTitle>
          </DialogHeader>
          {selectedTrek && (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Title</TableCell>
                        <TableCell>{selectedTrek.title}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Overview</TableCell>
                        <TableCell>{selectedTrek.overview}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Difficulty</TableCell>
                        <TableCell>{selectedTrek.difficulty}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Duration</TableCell>
                        <TableCell>{selectedTrek.duration}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Max Altitude</TableCell>
                        <TableCell>{selectedTrek.maxAltitude}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Best Time</TableCell>
                        <TableCell>{selectedTrek.bestTime}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Trek Details</h3>
                  <Table>
                    <TableBody>
                      {Object.entries(selectedTrek.trekInfo.data).map(([key, value]) => (
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
                        <TableCell>₹{selectedTrek.pricing.offerPrice}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Original Price</TableCell>
                        <TableCell>₹{selectedTrek.pricing.originalPrice}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Booking Price</TableCell>
                        <TableCell>₹{selectedTrek.pricing.bookingPrice}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Inclusions</h3>
                    <Table>
                      <TableBody>
                        {selectedTrek.inclusions.map((item, index) => (
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
                        {selectedTrek.exclusions.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
                      {selectedTrek.itinerary.map((day) => (
                        <TableRow key={day.day}>
                          <TableCell className="font-medium">Day {day.day}</TableCell>
                          <TableCell>{day.title}</TableCell>
                          <TableCell>{day.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {selectedTrek.pdfFiles && selectedTrek.pdfFiles.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">PDF Documents</h3>
                    <div className="grid gap-2">
                      {selectedTrek.pdfFiles.map((pdf, index) => (
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
    </DashboardLayout>
  )
}

