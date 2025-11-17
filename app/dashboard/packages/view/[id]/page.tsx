"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getPackageById } from "@/api/package-controller"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, MapPin, Users, IndianRupee, Clock, Mountain, Info, ImageIcon, List, FileText, FileQuestion, CheckCircle, XCircle, FileCheck } from 'lucide-react'
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

interface PackageData {
  _id: string
  name: string
  description: string
  overview: string
  duration: string
  location: string
  originalPrice: number
  offerPrice?: string
  advancePayment?: string
  maxParticipants: string
  isActive: boolean
  isFeatured: boolean
  startDate?: string
  endDate?: string
  howToReach?: { instruction: string }[]
  fitnessRequired?: string
  cancellationPolicy?: string
  whatToCarry: { item: string }[]
  trekInfo: { title: string; value: string }[]
  batchDates: { startDate: string; endDate: string; price: string; availability: boolean }[]
  additionalServices: { name: string; description?: string; price: string; isOptional: boolean }[]
  faq: { question: string; answer: string }[]
  images?: {
    cardImage?: string
    trekMap?: string
    gallery?: string[]
  }
  itinerary?: Array<{
    day: string
    activity: string
  }>
  inclusions?: Array<{
    value: string
  }>
  exclusions?: Array<{
    value: string
  }>
  category?: {
    name: string
  }
}

export default function PackageView() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [packageData, setPackageData] = useState<PackageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPackage = async () => {
      if (!params?.id) return

      try {
        console.log('Fetching package with ID:', params.id)
        const response = await getPackageById(params.id as string)
        console.log('API Response:', response)

        if (response.success && response.data) {
          // Extract the actual package data from the response
          const rawPackageData = response.data.data
          console.log('Raw Package Data from API:', rawPackageData)
          
          // Transform the data to ensure all fields are properly structured
          const transformedData = {
            ...rawPackageData,
            category: rawPackageData.category || { name: 'Uncategorized' },
            images: rawPackageData.images || {},
            whatToCarry: Array.isArray(rawPackageData.whatToCarry) ? rawPackageData.whatToCarry : [],
            trekInfo: Array.isArray(rawPackageData.trekInfo) ? rawPackageData.trekInfo : [],
            additionalServices: Array.isArray(rawPackageData.additionalServices) ? rawPackageData.additionalServices : [],
            faq: Array.isArray(rawPackageData.faq) ? rawPackageData.faq : [],
            // Transform itinerary data
            itinerary: typeof rawPackageData.itinerary === 'string' 
              ? rawPackageData.itinerary
                  .split(/\r?\n/)
                  .filter(line => line.trim())
                  .map((line, index) => {
                    console.log('Processing itinerary line:', line);
                    // Extract day and activity from the line
                    const match = line.match(/^Day\s+(\d+):\s*(.+)$/i);
                    if (match) {
                      return {
                        day: match[1],
                        activity: match[2].trim()
                      };
                    }
                    // If no match, use the line as activity and index + 1 as day
                    return {
                      day: String(index + 1),
                      activity: line.trim()
                    };
                  })
              : Array.isArray(rawPackageData.itinerary)
                ? rawPackageData.itinerary.map((item: any, itemIndex: number) => {
                    console.log('Processing itinerary item:', item);
                    if (typeof item === 'string') {
                      return {
                        day: String(itemIndex + 1),
                        activity: item
                      };
                    }
                    return {
                      day: item.day || String(item.dayNumber || (itemIndex + 1)),
                      activity: item.activity || item.description || item.value || ''
                    };
                  })
                : [],
            inclusions: Array.isArray(rawPackageData.inclusions) ? rawPackageData.inclusions : [],
            exclusions: Array.isArray(rawPackageData.exclusions) ? rawPackageData.exclusions : [],
            // Ensure numeric fields are properly typed
            originalPrice: Number(rawPackageData.originalPrice) || 0,
            maxParticipants: String(rawPackageData.maxParticipants || ''),
            // Ensure boolean fields are properly typed
            isActive: Boolean(rawPackageData.isActive),
            isFeatured: Boolean(rawPackageData.isFeatured)
          }
          
          console.log('Raw Itinerary:', rawPackageData.itinerary);
          console.log('Transformed Itinerary:', transformedData.itinerary);
          setPackageData(transformedData)
        } else {
          console.error('Failed to fetch package:', response.message)
          toast({
            title: "Error",
            description: "Failed to load package details",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching package:", error)
        toast({
          title: "Error",
          description: "Failed to load package details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPackage()
  }, [params?.id, toast])

  // Add debug logs for router and params
  useEffect(() => {
    console.log('Current Route Params:', params)
    console.log('Current Package ID:', params?.id)
  }, [params])

  // Add debug log for packageData changes
  useEffect(() => {
    if (packageData) {
      console.log('Package Data Updated:', {
        id: packageData._id,
        name: packageData.name,
        category: packageData.category,
        images: packageData.images,
        price: packageData.originalPrice,
        isActive: packageData.isActive,
        itinerary: packageData.itinerary?.length,
        inclusions: packageData.inclusions?.length,
        exclusions: packageData.exclusions?.length
      })
    }
  }, [packageData])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!packageData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold mb-4">Package not found</h2>
          <Button onClick={() => router.push("/dashboard/packages")}>
            Back to Packages
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  // Add debug log before rendering
  console.log('Rendering with packageData:', packageData)

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/packages")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Packages
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">{packageData.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={packageData.isActive ? "default" : "secondary"}>
              {packageData.isActive ? "Active" : "Inactive"}
            </Badge>
            <Button onClick={() => router.push(`/dashboard/packages/edit/${params?.id}`)}>
              Edit Package
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 lg:w-[600px]">
            <TabsTrigger value="overview">
              <Info className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="images">
              <ImageIcon className="h-4 w-4 mr-2" />
              Images
            </TabsTrigger>
            <TabsTrigger value="itinerary">
              <List className="h-4 w-4 mr-2" />
              Itinerary
            </TabsTrigger>
            <TabsTrigger value="details">
              <FileText className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="pricing">
              <IndianRupee className="h-4 w-4 mr-2" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="faq">
              <FileQuestion className="h-4 w-4 mr-2" />
              FAQ
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Main Image */}
              {packageData.images?.cardImage && (
                <Card className="col-span-2">
                  <CardContent className="p-0">
                    <div className="relative h-[400px] w-full">
                      <Image
                        src={packageData.images.cardImage || "/placeholder.svg"}
                        alt={packageData.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Duration: {packageData.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>Location: {packageData.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Max Participants: {packageData.maxParticipants}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mountain className="h-4 w-4" />
                      <span>Category: {packageData.category?.name || 'Uncategorized'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Start Date: {packageData.startDate || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>End Date: {packageData.endDate || 'Not set'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Description</h3>
                    <p className="text-muted-foreground">{packageData.description}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Overview</h3>
                    <p className="text-muted-foreground">{packageData.overview}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Trek Info */}
              {packageData.trekInfo && packageData.trekInfo.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Trek Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {packageData.trekInfo.map((info, index) => (
                        <div key={index} className="space-y-1">
                          <h4 className="font-semibold">{info.title}</h4>
                          <p className="text-muted-foreground">{info.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trek Map */}
              {packageData.images?.trekMap && (
                <Card>
                  <CardHeader>
                    <CardTitle>Trek Map</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative h-[400px] w-full">
                      <Image
                        src={packageData.images.trekMap || "/placeholder.svg"}
                        alt="Trek Map"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Gallery */}
              {packageData.images?.gallery && packageData.images.gallery.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {packageData.images.gallery.map((image, index) => (
                        <div key={index} className="relative h-[200px]">
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`Gallery image ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Itinerary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {packageData.itinerary && packageData.itinerary.length > 0 ? (
                    packageData.itinerary.map((day, index) => (
                      <div key={index} className="border-l-2 border-primary pl-4">
                        <h4 className="font-semibold">Day {day.day}</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">{day.activity}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No itinerary data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* What to Carry */}
              <Card>
                <CardHeader>
                  <CardTitle>What to Carry</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {packageData.whatToCarry?.map((item, index) => (
                      <li key={index} className="text-muted-foreground">{item.item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* How to Reach */}
              <Card>
                <CardHeader>
                  <CardTitle>How to Reach</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.isArray(packageData.howToReach) ? (
                      packageData.howToReach.map((item, index) => (
                        <p key={index} className="text-muted-foreground">
                          {typeof item === 'string' ? item : item.instruction}
                        </p>
                      ))
                    ) : (
                      <p className="text-muted-foreground">{packageData.howToReach}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Fitness Required */}
              <Card>
                <CardHeader>
                  <CardTitle>Fitness Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{packageData.fitnessRequired}</p>
                </CardContent>
              </Card>

              {/* Cancellation Policy */}
              <Card>
                <CardHeader>
                  <CardTitle>Cancellation Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{packageData.cancellationPolicy}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Price Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Original Price:</span>
                    <span className="text-lg font-bold">₹{packageData.originalPrice}</span>
                  </div>
                  {packageData.offerPrice && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Offer Price:</span>
                      <span className="text-lg font-bold text-green-600">₹{packageData.offerPrice}</span>
                    </div>
                  )}
                  {packageData.advancePayment && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Advance Payment:</span>
                      <span className="text-lg font-bold">₹{packageData.advancePayment}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Services */}
              {packageData.additionalServices && packageData.additionalServices.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {packageData.additionalServices.map((service, index) => (
                        <div key={index} className="border-b pb-2 last:border-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{service.name}</span>
                            <span className="text-lg font-bold">₹{service.price}</span>
                          </div>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                          )}
                          <Badge variant="outline" className="mt-2">
                            {service.isOptional ? "Optional" : "Mandatory"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {packageData.faq?.map((item, index) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <h4 className="font-semibold">{item.question}</h4>
                      <p className="text-muted-foreground mt-2">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
