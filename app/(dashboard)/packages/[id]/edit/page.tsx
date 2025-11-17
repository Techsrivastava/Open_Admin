"use client"

import type React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { packageFormSchema } from "@/lib/validations/package"
import { useEffect, useState, useRef } from "react"
import { getPackageById, updatePackage, getCategories } from "@/api/package-controller"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, Calendar, FileText, Plus, Trash, Upload, X, Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import type { z } from "zod"

// Add interface for ItineraryDay
interface ItineraryDay {
  day: number
  title: string
  description: string
}

// Update the API response type
interface ApiResponse {
  success: boolean
  message?: string
  data?: any
}

type PackageFormValues = z.infer<typeof packageFormSchema>

export default function EditPackagePage() {
  const router = useRouter()
  const params = useParams()
  const packageId = params.id as string
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPackage, setIsLoadingPackage] = useState(true)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [cardImage, setCardImage] = useState<File | null>(null)
  const [trekMap, setTrekMap] = useState<File | null>(null)
  const [galleryImages, setGalleryImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<{
    cardImage?: string
    trekMap?: string
    gallery?: string[]
  }>({})
  const [activeTab, setActiveTab] = useState("basic")
  const [categories, setCategories] = useState<any[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([{ day: 1, title: "", description: "" }])
  const [packageData, setPackageData] = useState<any>(null)

  // Refs for file inputs
  const cardImageRef = useRef<HTMLInputElement>(null)
  const trekMapRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const pdfRef = useRef<HTMLInputElement>(null)

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      name: "",
      description: "",
      overview: "",
      duration: "",
      originalPrice: "",
      offerPrice: "",
      advancePayment: "",
      city: "",
      state: "",
      region: "",
      category: "",
      coupons: [],
      inclusions: [],
      exclusions: [],
      itinerary: [{ day: 1, title: "", description: "" }],
      maxParticipants: "",
      isActive: true,
      isFeatured: false,
      startDate: "",
      endDate: "",
      howToReach: [""],
      fitnessRequired: [],
      cancellationPolicy: [],
      whatToCarry: [{ item: "" }],
      trekInfo: [
        { title: "Rail Head", value: "" },
        { title: "Region", value: "" },
        { title: "Airport", value: "" },
        { title: "Base Camp", value: "" },
        { title: "Best Season", value: "" },
        { title: "Service From", value: "" },
        { title: "Grade", value: "" },
        { title: "Stay", value: "" },
        { title: "Trail Type", value: "" },
        { title: "Duration", value: "" },
        { title: "Meals", value: "" },
        { title: "Maximum Altitude", value: "" },
        { title: "Approx Trekking KM", value: "" }
      ],
      batchDates: [],
      additionalServices: [],
      faq: [],
      images: {
        cardImage: "",
        trekMap: "",
        gallery: []
      },
      pdf: [],
      assignedGuides: [],
      views: 0,
      bookingsCount: 0,
      rating: 0,
      tags: [],
      isNew: false,
      standoutReason: "",
      isTrending: false,
      trendingScore: 0,
      moreLikeThis: [],
      season: "",
      labels: [],
    },
    mode: "onChange"
  })

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const response = await getCategories()
        if (response.success) {
          setCategories(response.data)
        } else {
          toast({
            title: "Error",
            description: "Failed to load categories. " + response.message,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [toast])

  // Fetch package data when component mounts
  useEffect(() => {
    const fetchPackageData = async () => {
      setIsLoadingPackage(true)
      try {
        const response = await getPackageById(packageId)
        if (response.success) {
          setPackageData(response.data)
          populateFormWithData(response.data)
        } else {
          throw new Error(response.message || "Failed to fetch package data")
        }
      } catch (error) {
        console.error("Error fetching package data:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch package data",
          variant: "destructive",
        })
        router.push("/dashboard/packages")
      } finally {
        setIsLoadingPackage(false)
      }
    }

    if (packageId) {
      fetchPackageData()
    }
  }, [packageId, router, toast])

  const populateFormWithData = (data: any) => {
    console.log("Populating form with data:", data)

    // Set existing images
    if (data.images) {
      setExistingImages({
        cardImage: data.images.cardImage,
        trekMap: data.images.trekMap,
        gallery: data.images.gallery || [],
      })
    }

    // Set itinerary
    if (data.itinerary && data.itinerary.length > 0) {
      setItinerary(data.itinerary)
    }

    // Format dates if they exist
    const formattedData = { ...data }

    if (formattedData.startDate) {
      formattedData.startDate = new Date(formattedData.startDate).toISOString().split("T")[0]
    }

    if (formattedData.endDate) {
      formattedData.endDate = new Date(formattedData.endDate).toISOString().split("T")[0]
    }

    // Format batch dates if they exist
    if (formattedData.batchDates && formattedData.batchDates.length > 0) {
      formattedData.batchDates = formattedData.batchDates.map((batch: any) => ({
        ...batch,
        startDate: batch.startDate ? new Date(batch.startDate).toISOString().split("T")[0] : "",
        endDate: batch.endDate ? new Date(batch.endDate).toISOString().split("T")[0] : "",
        price: batch.price || "",
        availability: Boolean(batch.availability),
        seatsAvailable: batch.seatsAvailable || batch.maxParticipants || ""
      }))
    }

    // Ensure arrays are properly initialized
    if (!formattedData.whatToCarry || !Array.isArray(formattedData.whatToCarry)) {
      formattedData.whatToCarry = []
    }

    if (!formattedData.trekInfo || !Array.isArray(formattedData.trekInfo)) {
      formattedData.trekInfo = [
        { title: "Rail Head", value: "" },
        { title: "Region", value: "" },
        { title: "Airport", value: "" },
        { title: "Base Camp", value: "" },
        { title: "Best Season", value: "" },
        { title: "Service From", value: "" },
        { title: "Grade", value: "" },
        { title: "Stay", value: "" },
        { title: "Trail Type", value: "" },
        { title: "Duration", value: "" },
        { title: "Meals", value: "" },
        { title: "Maximum Altitude", value: "" },
        { title: "Approx Trekking KM", value: "" },
      ]
    }

    if (!formattedData.batchDates || !Array.isArray(formattedData.batchDates)) {
      formattedData.batchDates = []
    }

    if (!formattedData.additionalServices || !Array.isArray(formattedData.additionalServices)) {
      formattedData.additionalServices = []
    }

    if (!formattedData.faq || !Array.isArray(formattedData.faq)) {
      formattedData.faq = []
    }

    if (!formattedData.howToReach || !Array.isArray(formattedData.howToReach)) {
      formattedData.howToReach = []
    }

    if (!formattedData.fitnessRequired || !Array.isArray(formattedData.fitnessRequired)) {
      formattedData.fitnessRequired = []
    }

    if (!formattedData.cancellationPolicy || !Array.isArray(formattedData.cancellationPolicy)) {
      formattedData.cancellationPolicy = []
    }

    if (!formattedData.inclusions || !Array.isArray(formattedData.inclusions)) {
      formattedData.inclusions = []
    }

    if (!formattedData.exclusions || !Array.isArray(formattedData.exclusions)) {
      formattedData.exclusions = []
    }

    if (!formattedData.itinerary || !Array.isArray(formattedData.itinerary)) {
      formattedData.itinerary = []
    }

    // Reset form with the formatted data
    form.reset(formattedData)
  }

  const {
    fields: whatToCarryFields,
    append: appendWhatToCarry,
    remove: removeWhatToCarry,
  } = useFieldArray({
    name: "whatToCarry",
    control: form.control,
  })

  const {
    fields: trekInfoFields,
    append: appendTrekInfo,
    remove: removeTrekInfo,
  } = useFieldArray({
    name: "trekInfo",
    control: form.control,
  })

  const {
    fields: batchDatesFields,
    append: appendBatchDates,
    remove: removeBatchDates,
  } = useFieldArray({
    name: "batchDates",
    control: form.control,
  })

  const {
    fields: additionalServicesFields,
    append: appendAdditionalServices,
    remove: removeAdditionalServices,
  } = useFieldArray({
    name: "additionalServices",
    control: form.control,
  })

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    name: "faq",
    control: form.control,
  })

  // Handle file uploads
  const handleCardImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCardImage(e.target.files[0])
    }
  }

  const handleTrekMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTrekMap(e.target.files[0])
    }
  }

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setGalleryImages((prev) => [...prev, ...newFiles])
    }
  }

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0])
    }
  }

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingGalleryImage = (index: number) => {
    setExistingImages((prev) => ({
      ...prev,
      gallery: prev.gallery?.filter((_, i) => i !== index),
    }))
  }

  // Update form values when itinerary changes
  useEffect(() => {
    if (itinerary.length > 0) {
      const formattedItinerary = itinerary.map((day, index) => ({
        day: index + 1,
        title: day.title || "",
        description: day.description || "",
      }))

      form.setValue("itinerary", formattedItinerary, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      })
    }
  }, [itinerary, form])

  const onSubmit = async (data: PackageFormValues) => {
    try {
      setIsLoading(true)
      console.log("Form Data:", data)

      // Prepare form data
      const formData = new FormData()

      // Add package ID
      formData.append("_id", packageId)

      // Convert arrays back to strings for specific fields that backend expects as strings
      const preparedData = { ...data }
      
      // Convert fitnessRequired array to string
      if (Array.isArray(preparedData.fitnessRequired) && preparedData.fitnessRequired.length > 0) {
        preparedData.fitnessRequired = preparedData.fitnessRequired.join("\n") as any
      }
      
      // Convert cancellationPolicy array to string
      if (Array.isArray(preparedData.cancellationPolicy) && preparedData.cancellationPolicy.length > 0) {
        preparedData.cancellationPolicy = preparedData.cancellationPolicy.join("\n") as any
      }

      // Add all form fields with proper validation
      Object.keys(preparedData).forEach((key) => {
        if (key !== "images" && key !== "pdf") {
          const value = preparedData[key as keyof PackageFormValues]
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              // Use JSON.stringify for arrays to maintain structure
              formData.append(key, JSON.stringify(value))
            } else if (typeof value === "object") {
              // Use JSON.stringify for objects
              formData.append(key, JSON.stringify(value))
            } else {
              formData.append(key, value.toString())
            }
          }
        }
      })

      // Add files with validation
      if (cardImage) {
        if (cardImage.size > 5 * 1024 * 1024) {
          // 5MB limit
          toast({
            variant: "destructive",
            title: "Error",
            description: "Card image size should be less than 5MB",
          })
          return
        }
        formData.append("cardImage", cardImage)
      }

      if (trekMap) {
        if (trekMap.size > 5 * 1024 * 1024) {
          // 5MB limit
          toast({
            variant: "destructive",
            title: "Error",
            description: "Trek map size should be less than 5MB",
          })
          return
        }
        formData.append("trekMap", trekMap)
      }

      if (galleryImages.length > 0) {
        for (const image of galleryImages) {
          if (image.size > 5 * 1024 * 1024) {
            // 5MB limit
            toast({
              variant: "destructive",
              title: "Error",
              description: "Gallery image size should be less than 5MB",
            })
            return
          }
          formData.append("gallery", image)
        }
      }

      if (pdfFile) {
        if (pdfFile.size > 10 * 1024 * 1024) {
          // 10MB limit
          toast({
            variant: "destructive",
            title: "Error",
            description: "PDF file size should be less than 10MB",
          })
          return
        }
        formData.append("pdf", pdfFile)
      }

      // Add existing images that should be kept
      const imagesData = {
        cardImage: cardImage ? "pending" : existingImages.cardImage || "",
        trekMap: trekMap ? "pending" : existingImages.trekMap || "",
        gallery: galleryImages.length > 0 ? ["pending"] : existingImages.gallery || [],
      }
      formData.append("images", JSON.stringify(imagesData))

      // Submit the form
      const response = await updatePackage(packageId, formData)

      if (response.success) {
        toast({
          title: "Success",
          description: "Package updated successfully",
        })
        router.push("/dashboard/packages")
      } else {
        throw new Error(response.message || "Failed to update package")
      }
    } catch (error) {
      console.error("Error updating package:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update package",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fix the updateDay function to properly update the itinerary state
  const updateDay = (index: number, field: keyof ItineraryDay, value: string) => {
    setItinerary((prev) => {
      const updatedItinerary = [...prev]
      updatedItinerary[index] = {
        ...updatedItinerary[index],
        [field]: value,
      }
      return updatedItinerary
    })
  }

  // Fix the addDay function to add a blank day instead of one with default values
  const addDay = () => {
    setItinerary((prev) => [...prev, { day: prev.length + 1, title: "", description: "" }])
  }

  const removeDay = (index: number) => {
    const newItinerary = itinerary.filter((_, i) => i !== index)
    // Renumber remaining days
    const updatedItinerary = newItinerary.map((day, i) => ({
      ...day,
      day: i + 1,
    }))
    setItinerary(updatedItinerary)

    // Update form value immediately after removing a day
    form.setValue("itinerary", updatedItinerary, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  if (isLoadingPackage) {
    return (
      <DashboardLayout>
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/packages")}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">Edit Package</h2>
            </div>
          </div>
          <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading package data...</p>
            </div>
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
            <h2 className="text-3xl font-bold tracking-tight">Edit Package</h2>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="dates">Dates & Pricing</TabsTrigger>
            <TabsTrigger value="trek">Trek Info</TabsTrigger>
            <TabsTrigger value="media">Media & Documents</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-8">
              <div className="grid gap-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="overview"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overview</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Itinerary - Handled by separate state below */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Itinerary</h3>
                  <p className="text-sm text-muted-foreground">Itinerary is managed in the dedicated Itinerary tab below</p>
                </div>

                {/* Inclusions and Exclusions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Inclusions</h3>
                    <FormField
                      control={form.control}
                      name="inclusions"
                      render={({ field }) => {
                        const handleInclusionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          field.onChange(e.target.value.split("\n").filter(item => item.trim()))
                        }
                        return (
                          <FormItem>
                            <FormLabel>Included Items (one per line)</FormLabel>
                            <FormControl>
                              <Textarea 
                                value={Array.isArray(field.value) ? field.value.join("\n") : ""}
                                onChange={handleInclusionsChange}
                                className="min-h-[150px]"
                                placeholder="Enter inclusions, one per line"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Exclusions</h3>
                    <FormField
                      control={form.control}
                      name="exclusions"
                      render={({ field }) => {
                        const handleExclusionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          field.onChange(e.target.value.split("\n").filter(item => item.trim()))
                        }
                        return (
                          <FormItem>
                            <FormLabel>Excluded Items (one per line)</FormLabel>
                            <FormControl>
                              <Textarea 
                                value={Array.isArray(field.value) ? field.value.join("\n") : ""}
                                onChange={handleExclusionsChange}
                                className="min-h-[150px]"
                                placeholder="Enter exclusions, one per line"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
