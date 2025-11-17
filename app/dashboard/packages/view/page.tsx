"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { API_ENDPOINTS } from "@/app/api/config"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface ItineraryDay {
  day: number
  title: string
  description: string
}

interface TrekInfo {
  title: string
  value: string
}

interface BatchDate {
  startDate: string
  endDate: string
  price: string
  availability: boolean
}

interface AdditionalService {
  name: string
  description?: string
  price: string
  isOptional: boolean
}

interface FAQ {
  question: string
  answer: string
}

interface PackageDetails {
  _id: string
  name: string
  description: string
  overview: string
  duration: string
  originalPrice: string
  offerPrice?: string
  advancePayment?: string
  location: string
  category: string
  inclusions: string[]
  exclusions: string[]
  itinerary: ItineraryDay[]
  maxParticipants: string
  isActive: boolean
  isFeatured: boolean
  startDate?: string
  endDate?: string
  howToReach?: { instruction: string }[]
  fitnessRequired?: string
  cancellationPolicy?: string
  whatToCarry: { item: string }[]
  trekInfo: TrekInfo[]
  batchDates: BatchDate[]
  additionalServices: AdditionalService[]
  faq: FAQ[]
  images: {
    cardImage?: string
    trekMap?: string
    gallery: string[]
  }
  pdf?: string
}

export default function ViewPackagePage() {
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(API_ENDPOINTS.packages.details(params.id as string))
        if (!response.ok) throw new Error('Failed to fetch package details')
        const data = await response.json()
        setPackageDetails(data)
      } catch (error) {
        console.error('Error fetching package details:', error)
        setError('Failed to load package details')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchPackageDetails()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-6">
          <Skeleton className="h-8 w-[200px]" />
          <div className="grid gap-6">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !packageDetails) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Error</h2>
            <p className="mt-2 text-gray-600">{error || 'Package not found'}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/packages")}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Package Details</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p>Loading package details...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        ) : packageDetails ? (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{packageDetails.name}</CardTitle>
                  <CardDescription>{packageDetails.overview}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{packageDetails.description}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Location</h3>
                      <p className="text-muted-foreground">{packageDetails.location}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Duration</h3>
                      <p className="text-muted-foreground">{packageDetails.duration}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Price</h3>
                      <p className="text-muted-foreground">₹{packageDetails.originalPrice}</p>
                      {packageDetails.offerPrice && (
                        <p className="text-green-600">Offer Price: ₹{packageDetails.offerPrice}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inclusions & Exclusions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Inclusions</h3>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {packageDetails.inclusions?.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Exclusions</h3>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {packageDetails.exclusions?.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="itinerary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Day-wise Itinerary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {packageDetails.itinerary?.map((day, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Day {day.day}</h3>
                        <h4 className="font-medium mb-2">{day.title}</h4>
                        <p className="text-muted-foreground">{day.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">How to Reach</h3>
                      <div className="space-y-2">
                        {Array.isArray(packageDetails.howToReach) ? (
                          packageDetails.howToReach.map((item, index) => (
                            <p key={index} className="text-muted-foreground">
                              {typeof item === 'string' ? item : item.instruction}
                            </p>
                          ))
                        ) : (
                          <p className="text-muted-foreground">{packageDetails.howToReach}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Fitness Required</h3>
                      <p className="text-muted-foreground">{packageDetails.fitnessRequired}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Cancellation Policy</h3>
                      <p className="text-muted-foreground">{packageDetails.cancellationPolicy}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">What to Carry</h3>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {packageDetails.whatToCarry?.map((item, index) => (
                          <li key={index}>{item.item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
      </div>
    </DashboardLayout>
  )
} 