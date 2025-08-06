"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Filter, MoreHorizontal, Plus, Search, Image, Video, Tag, Eye, Download, Upload, Pencil, Trash2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon } from "lucide-react"

interface Ad {
  id: string
  title: string
  type: "Banner" | "Popup" | "Sidebar"
  mediaType: "Image" | "Video"
  placement: string
  startDate: string
  endDate: string
  status: "Active" | "Scheduled" | "Expired"
  views: number
  clicks: number
  mediaUrl?: string
  mediaFile?: File
}

interface Offer {
  id: string
  title: string
  code: string
  discount: string
  minBooking: string
  validFor: string
  startDate: string
  endDate: string
  status: "Active" | "Scheduled" | "Expired"
  redemptions: number
}

const initialAds: Ad[] = [
  {
    id: "AD-1001",
    title: "Summer Special Offer",
    type: "Banner",
    mediaType: "Image",
    placement: "Homepage",
    startDate: "Mar 20, 2025",
    endDate: "Apr 20, 2025",
    status: "Active",
    views: 1245,
    clicks: 87,
  },
  {
    id: "AD-1002",
    title: "Char Dham Early Bird Discount",
    type: "Popup",
    mediaType: "Image",
    placement: "All Pages",
    startDate: "Mar 15, 2025",
    endDate: "Apr 15, 2025",
    status: "Active",
    views: 3456,
    clicks: 210,
  },
  {
    id: "AD-1003",
    title: "Monsoon Trek Packages",
    type: "Sidebar",
    mediaType: "Image",
    placement: "Trek Pages",
    startDate: "Apr 1, 2025",
    endDate: "May 31, 2025",
    status: "Scheduled",
    views: 0,
    clicks: 0,
  },
  {
    id: "AD-1004",
    title: "Kerala Backwaters Promotion",
    type: "Banner",
    mediaType: "Video",
    placement: "Homepage",
    startDate: "Mar 10, 2025",
    endDate: "Mar 25, 2025",
    status: "Active",
    views: 2789,
    clicks: 156,
  },
  {
    id: "AD-1005",
    title: "Rajasthan Desert Safari",
    type: "Sidebar",
    mediaType: "Image",
    placement: "Package Pages",
    startDate: "Feb 15, 2025",
    endDate: "Mar 15, 2025",
    status: "Expired",
    views: 4532,
    clicks: 321,
  },
  {
    id: "AD-1006",
    title: "Himalayan Trekking Experience",
    type: "Banner",
    mediaType: "Video",
    placement: "Trek Pages",
    startDate: "Apr 5, 2025",
    endDate: "May 5, 2025",
    status: "Scheduled",
    views: 0,
    clicks: 0,
  },
  {
    id: "AD-1007",
    title: "Beach Holiday Special",
    type: "Popup",
    mediaType: "Image",
    placement: "Beach Packages",
    startDate: "Mar 1, 2025",
    endDate: "Mar 31, 2025",
    status: "Active",
    views: 5678,
    clicks: 432,
  }
]

const initialOffers: Offer[] = [
  {
    id: "OF-1001",
    title: "Early Bird Discount",
    code: "EARLYBIRD25",
    discount: "25% off",
    minBooking: "₹20,000",
    validFor: "All Packages",
    startDate: "Mar 1, 2025",
    endDate: "Apr 30, 2025",
    status: "Active",
    redemptions: 45,
  },
  {
    id: "OF-1002",
    title: "Family Package Discount",
    code: "FAMILY15",
    discount: "15% off",
    minBooking: "₹30,000",
    validFor: "Family Packages",
    startDate: "Mar 15, 2025",
    endDate: "May 15, 2025",
    status: "Active",
    redemptions: 28,
  },
  {
    id: "OF-1003",
    title: "Adventure Seeker",
    code: "ADVENTURE20",
    discount: "20% off",
    minBooking: "₹15,000",
    validFor: "Trek Packages",
    startDate: "Apr 1, 2025",
    endDate: "Jun 30, 2025",
    status: "Scheduled",
    redemptions: 0,
  },
  {
    id: "OF-1004",
    title: "Pilgrimage Special",
    code: "PILGRIM10",
    discount: "10% off + Free Pooja",
    minBooking: "₹40,000",
    validFor: "Char Dham Packages",
    startDate: "Mar 10, 2025",
    endDate: "Apr 10, 2025",
    status: "Active",
    redemptions: 56,
  },
  {
    id: "OF-1005",
    title: "Last Minute Deal",
    code: "LASTMIN30",
    discount: "30% off",
    minBooking: "₹10,000",
    validFor: "Selected Packages",
    startDate: "Feb 15, 2025",
    endDate: "Mar 15, 2025",
    status: "Expired",
    redemptions: 72,
  },
  {
    id: "OF-1006",
    title: "Weekend Getaway",
    code: "WEEKEND15",
    discount: "15% off",
    minBooking: "₹25,000",
    validFor: "Weekend Packages",
    startDate: "Mar 20, 2025",
    endDate: "Apr 20, 2025",
    status: "Active",
    redemptions: 34,
  },
  {
    id: "OF-1007",
    title: "Honeymoon Special",
    code: "HONEY20",
    discount: "20% off + Free Upgrade",
    minBooking: "₹50,000",
    validFor: "Honeymoon Packages",
    startDate: "Apr 5, 2025",
    endDate: "May 5, 2025",
    status: "Scheduled",
    redemptions: 0,
  }
]

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>(initialAds)
  const [offers, setOffers] = useState<Offer[]>(initialOffers)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("ads")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Ad | Offer | null>(null)
  const [newAd, setNewAd] = useState<Partial<Ad>>({})
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({})
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7)
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (newAd.mediaType === "Image" && !file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }
    if (newAd.mediaType === "Video" && !file.type.startsWith("video/")) {
      toast.error("Please upload a video file")
      return
    }

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setNewAd({ ...newAd, mediaFile: file })
  }

  const handleAddItem = () => {
    if (activeTab === "ads") {
      if (!newAd.title || !newAd.type || !newAd.mediaType || !newAd.placement || !newAd.startDate || !newAd.endDate) {
        toast.error("Please fill in all required fields")
        return
      }

      if (!newAd.mediaFile) {
        toast.error("Please upload a media file")
        return
      }

      // Here you would typically upload the file to your server/storage
      // For now, we'll just use a placeholder URL
      const ad: Ad = {
        id: `AD-${Math.floor(Math.random() * 10000)}`,
        title: newAd.title,
        type: newAd.type as "Banner" | "Popup" | "Sidebar",
        mediaType: newAd.mediaType as "Image" | "Video",
        placement: newAd.placement,
        startDate: format(new Date(newAd.startDate), "MMM d, yyyy"),
        endDate: format(new Date(newAd.endDate), "MMM d, yyyy"),
        status: "Active",
        views: 0,
        clicks: 0,
        mediaUrl: previewUrl || undefined
      }
      setAds(prevAds => [...prevAds, ad])
      toast.success("Ad added successfully")
      setNewAd({})
      setPreviewUrl(null)
      setShowAddModal(false)
    } else {
      if (!newOffer.title || !newOffer.code || !newOffer.discount || !newOffer.minBooking || !newOffer.validFor || !newOffer.startDate || !newOffer.endDate) {
        toast.error("Please fill in all required fields")
        return
      }

      const offer: Offer = {
        id: `OF-${Math.floor(Math.random() * 10000)}`,
        title: newOffer.title,
        code: newOffer.code,
        discount: newOffer.discount,
        minBooking: newOffer.minBooking,
        validFor: newOffer.validFor,
        startDate: format(new Date(newOffer.startDate), "MMM d, yyyy"),
        endDate: format(new Date(newOffer.endDate), "MMM d, yyyy"),
        status: "Active",
        redemptions: 0
      }
      setOffers(prevOffers => [...prevOffers, offer])
      toast.success("Offer added successfully")
      setNewOffer({})
      setShowAddModal(false)
    }
  }

  const handleCancel = () => {
    setShowAddModal(false)
    setNewAd({})
    setNewOffer({})
    setPreviewUrl(null)
  }

  const handleEditItem = () => {
    if (!selectedItem) return

    if (activeTab === "ads") {
      setAds(prevAds =>
        prevAds.map(ad =>
          ad.id === selectedItem.id ? { ...ad, ...newAd } : ad
        )
      )
      toast.success("Ad updated successfully")
    } else {
      setOffers(prevOffers =>
        prevOffers.map(offer =>
          offer.id === selectedItem.id ? { ...offer, ...newOffer } : offer
        )
      )
      toast.success("Offer updated successfully")
    }

    setShowEditModal(false)
    setSelectedItem(null)
    setNewAd({})
    setNewOffer({})
  }

  const handleDeleteItem = (item: Ad | Offer) => {
    if (activeTab === "ads") {
      setAds(prevAds => prevAds.filter(ad => ad.id !== item.id))
      toast.success(`Ad ${item.title} deleted successfully`)
    } else {
      setOffers(prevOffers => prevOffers.filter(offer => offer.id !== item.id))
      toast.success(`Offer ${item.title} deleted successfully`)
    }
  }

  const handleStatusChange = (item: Ad | Offer, newStatus: "Active" | "Scheduled" | "Expired") => {
    if (activeTab === "ads") {
      setAds(prevAds =>
        prevAds.map(ad =>
          ad.id === item.id ? { ...ad, status: newStatus } : ad
        )
      )
      toast.success(`Ad ${item.title} status updated to ${newStatus}`)
    } else {
      setOffers(prevOffers =>
        prevOffers.map(offer =>
          offer.id === item.id ? { ...offer, status: newStatus } : offer
        )
      )
      toast.success(`Offer ${item.title} status updated to ${newStatus}`)
    }
  }

  const handleExport = () => {
    const data = activeTab === "ads" ? ads : offers
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map(item => headers.map(header => item[header as keyof typeof item]).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${activeTab}_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`${activeTab === "ads" ? "Ads" : "Offers"} exported successfully`)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const rows = text.split("\n")
        const headers = rows[0].split(",")
        
        const importedData = rows.slice(1).map(row => {
          const values = row.split(",")
          return headers.reduce((obj, header, index) => {
            obj[header as keyof typeof obj] = values[index]
            return obj
          }, {} as any)
        })

        if (activeTab === "ads") {
          setAds(prevAds => [...prevAds, ...importedData])
          toast.success(`${importedData.length} ads imported successfully`)
        } else {
          setOffers(prevOffers => [...prevOffers, ...importedData])
          toast.success(`${importedData.length} offers imported successfully`)
        }
      } catch (error) {
        toast.error("Error importing data. Please check the file format.")
      }
    }
    reader.readAsText(file)
  }

  const filteredAds = ads.filter(ad => {
    const searchMatch = 
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.placement.toLowerCase().includes(searchQuery.toLowerCase())

    let dateMatch = true
    if (dateRange?.from && dateRange?.to) {
      const adStartDate = new Date(ad.startDate)
      const adEndDate = new Date(ad.endDate)
      dateMatch = adStartDate >= dateRange.from && adEndDate <= dateRange.to
    }

    return searchMatch && dateMatch
  })

  const filteredOffers = offers.filter(offer => {
    const searchMatch = 
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.validFor.toLowerCase().includes(searchQuery.toLowerCase())

    let dateMatch = true
    if (dateRange?.from && dateRange?.to) {
      const offerStartDate = new Date(offer.startDate)
      const offerEndDate = new Date(offer.endDate)
      dateMatch = offerStartDate >= dateRange.from && offerEndDate <= dateRange.to
    }

    return searchMatch && dateMatch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500 text-white"
      case "Scheduled":
        return "bg-blue-500 text-white"
      case "Expired":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Ads & Offers</h2>
          <div className="flex items-center gap-2">
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <label htmlFor="import-file">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" /> Import
                </span>
              </Button>
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
            </label>
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === "ads" ? "Create Ad" : "Create Offer"}
          </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{activeTab === "ads" ? "Create New Ad" : "Create New Offer"}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  {activeTab === "ads" ? (
                    <>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="ad-title">Title</Label>
                          <Input
                            id="ad-title"
                            value={newAd.title || ""}
                            onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                            placeholder="Enter ad title"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="ad-type">Type</Label>
                          <Select
                            value={newAd.type || ""}
                            onValueChange={(value) => setNewAd({ ...newAd, type: value as "Banner" | "Popup" | "Sidebar" })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Banner">Banner</SelectItem>
                              <SelectItem value="Popup">Popup</SelectItem>
                              <SelectItem value="Sidebar">Sidebar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="ad-mediaType">Media Type</Label>
                          <Select
                            value={newAd.mediaType || ""}
                            onValueChange={(value) => {
                              setNewAd({ ...newAd, mediaType: value as "Image" | "Video" })
                              setPreviewUrl(null)
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select media type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Image">Image</SelectItem>
                              <SelectItem value="Video">Video</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {newAd.mediaType && (
                          <div className="grid gap-2">
                            <Label htmlFor="ad-mediaFile">Upload {newAd.mediaType}</Label>
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-2">
                                <Input
                                  id="ad-mediaFile"
                                  type="file"
                                  accept={newAd.mediaType === "Image" ? "image/*" : "video/*"}
                                  onChange={handleMediaUpload}
                                  className="flex-1"
                                />
                                <Button variant="outline" onClick={() => {
                                  const input = document.getElementById('ad-mediaFile') as HTMLInputElement;
                                  if (input) input.click();
                                }}>
                                  Browse
                                </Button>
                              </div>
                              {previewUrl && (
                                <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                                  {newAd.mediaType === "Image" ? (
                                    <img
                                      src={previewUrl}
                                      alt="Preview"
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <video
                                      src={previewUrl}
                                      controls
                                      className="w-full h-full object-contain"
                                    />
                                  )}
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                      setPreviewUrl(null);
                                      setNewAd({ ...newAd, mediaFile: undefined });
                                      const input = document.getElementById('ad-mediaFile') as HTMLInputElement;
                                      if (input) input.value = '';
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              <p className="text-sm text-muted-foreground">
                                {newAd.mediaType === "Image" 
                                  ? "Supported formats: JPG, PNG, GIF (Max size: 5MB)"
                                  : "Supported formats: MP4, WebM (Max size: 50MB)"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="ad-placement">Placement</Label>
                          <Input
                            id="ad-placement"
                            value={newAd.placement || ""}
                            onChange={(e) => setNewAd({ ...newAd, placement: e.target.value })}
                            placeholder="Enter placement"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="ad-startDate">Start Date</Label>
                          <Input
                            id="ad-startDate"
                            type="date"
                            value={newAd.startDate ? new Date(newAd.startDate).toISOString().split('T')[0] : ""}
                            onChange={(e) => {
                              const date = new Date(e.target.value)
                              setNewAd({ ...newAd, startDate: date.toISOString() })
                            }}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="ad-endDate">End Date</Label>
                          <Input
                            id="ad-endDate"
                            type="date"
                            value={newAd.endDate ? new Date(newAd.endDate).toISOString().split('T')[0] : ""}
                            onChange={(e) => {
                              const date = new Date(e.target.value)
                              setNewAd({ ...newAd, endDate: date.toISOString() })
                            }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="offer-title">Title</Label>
                          <Input
                            id="offer-title"
                            value={newOffer.title}
                            onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="offer-code">Code</Label>
                          <Input
                            id="offer-code"
                            value={newOffer.code}
                            onChange={(e) => setNewOffer({ ...newOffer, code: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="offer-discount">Discount</Label>
                          <Input
                            id="offer-discount"
                            value={newOffer.discount}
                            onChange={(e) => setNewOffer({ ...newOffer, discount: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="offer-minBooking">Minimum Booking</Label>
                          <Input
                            id="offer-minBooking"
                            value={newOffer.minBooking}
                            onChange={(e) => setNewOffer({ ...newOffer, minBooking: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="offer-validFor">Valid For</Label>
                          <Input
                            id="offer-validFor"
                            value={newOffer.validFor}
                            onChange={(e) => setNewOffer({ ...newOffer, validFor: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="offer-startDate">Start Date</Label>
                          <Input
                            id="offer-startDate"
                            type="date"
                            value={newOffer.startDate ? new Date(newOffer.startDate).toISOString().split('T')[0] : ""}
                            onChange={(e) => {
                              const date = new Date(e.target.value)
                              setNewOffer({ ...newOffer, startDate: date.toISOString() })
                            }}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="offer-endDate">End Date</Label>
                          <Input
                            id="offer-endDate"
                            type="date"
                            value={newOffer.endDate ? new Date(newOffer.endDate).toISOString().split('T')[0] : ""}
                            onChange={(e) => {
                              const date = new Date(e.target.value)
                              setNewOffer({ ...newOffer, endDate: date.toISOString() })
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem}>
                    {activeTab === "ads" ? "Add Ad" : "Add Offer"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="ads" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="ads" className="flex items-center">
              <Image className="mr-2 h-4 w-4" />
              Advertisements
            </TabsTrigger>
            <TabsTrigger value="offers" className="flex items-center">
              <Tag className="mr-2 h-4 w-4" />
              Offers & Coupons
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full items-center space-x-2 md:w-2/3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={activeTab === "ads" ? "Search ads..." : "Search offers..."}
                className="w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Pick a date range"
                    )}
              </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    initialFocus={false}
                    fromDate={new Date()}
                    toDate={addDays(new Date(), 365)}
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <TabsContent value="ads" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAds.map((ad) => (
                <Card key={ad.id}>
                <CardContent className="p-6">
                  <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                    <img
                        src={ad.mediaUrl || "/placeholder.svg?height=200&width=400"}
                        alt={ad.title}
                      className="object-cover w-full h-full"
                    />
                      <Badge className={`absolute top-2 right-2 ${getStatusColor(ad.status)}`}>
                        {ad.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{ad.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{ad.placement}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{ad.startDate} - {ad.endDate}</span>
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                        {ad.views} views
                  </div>
                    </div>
                    <div className="absolute top-2 left-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedItem(ad)
                            setNewAd(ad)
                            setShowEditModal(true)
                          }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteItem(ad)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(ad, "Active")}>
                            Activate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(ad, "Scheduled")}>
                            Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(ad, "Expired")}>
                            Expire
                          </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
                  ))}
            </div>
          </TabsContent>

          <TabsContent value="offers" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredOffers.map((offer) => (
                <Card key={offer.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold mb-1">{offer.title}</h3>
                        <p className="text-sm text-muted-foreground">{offer.code}</p>
                      </div>
                      <Badge className={getStatusColor(offer.status)}>
                          {offer.status}
                        </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Discount:</span> {offer.discount}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Min Booking:</span> {offer.minBooking}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Valid For:</span> {offer.validFor}
                      </p>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-4">
                      <span>{offer.startDate} - {offer.endDate}</span>
                      <span>{offer.redemptions} redemptions</span>
                    </div>
                    <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedItem(offer)
                            setNewOffer(offer)
                            setShowEditModal(true)
                          }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteItem(offer)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(offer, "Active")}>
                            Activate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(offer, "Scheduled")}>
                            Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(offer, "Expired")}>
                            Expire
                          </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
                  ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

