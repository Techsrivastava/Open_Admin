"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, Calendar, FileText, Plus, Trash, Upload, X, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import { getPackageById, updatePackage, getCategories } from "@/api/package-controller"
import { packageFormSchema } from "@/lib/validations/package"
import type { z } from "zod"

// Update the API response type
interface ApiResponse {
  success: boolean
  message?: string
  data?: any
}

// Add this interface at the top (after imports)
interface Package {
  _id: string
  name: string
  location: string
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
  howToReach?: { instruction: string }[]
  fitnessRequired?: string[]
  cancellationPolicy?: string[]
  whatToCarry?: any[]
  trekInfo?: any[]
  batchDates?: any[]
  additionalServices?: any[]
  faq?: any[]
  documents?: any[]
  images?: {
    cardImage?: string
    trekMap?: string
    gallery?: string[]
  }
  pdf?: string[]
  city?: string
  state?: string
  region?: string
}

type PackageFormValues = z.infer<typeof packageFormSchema>

export default function EditPackagePage() {
  const router = useRouter()
  const params = useParams()
  const packageId = params.id as string
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPackage, setIsLoadingPackage] = useState(true)
  const [cardImage, setCardImage] = useState<File | null>(null)
  const [trekMap, setTrekMap] = useState<File | null>(null)
  const [galleryImages, setGalleryImages] = useState<File[]>([])
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [removePdf, setRemovePdf] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [categories, setCategories] = useState<any[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [existingImages, setExistingImages] = useState<{
    cardImage?: string
    trekMap?: string
    gallery?: string[]
  }>({})
  const [existingPdf, setExistingPdf] = useState<string | null>(null)
  const [deletedImages, setDeletedImages] = useState<{
    cardImage?: string
    trekMap?: string
    gallery?: string[]
  }>({
    cardImage: undefined,
    trekMap: undefined,
    gallery: []
  })

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
      maxParticipants: "",
      isActive: true,
      isFeatured: false,
      startDate: "",
      endDate: "",
      inclusions: [],
      exclusions: [],
      itinerary: [{ day: 1, title: "", description: "" }],
      howToReach: [{ instruction: "" }],
      fitnessRequired: [],
      cancellationPolicy: [],
      whatToCarry: [{ item: "" }],
      trekInfo: [],
      batchDates: [],
      additionalServices: [],
      faq: [],
      images: {
        cardImage: "",
        trekMap: "",
        gallery: [],
      },
      pdf: [],
    },
  })

  // Field arrays
  const itineraryArray = useFieldArray({ name: "itinerary", control: form.control })
  const whatToCarryArray = useFieldArray({ name: "whatToCarry", control: form.control })
  const trekInfoArray = useFieldArray({ name: "trekInfo", control: form.control })
  const batchDatesArray = useFieldArray({ name: "batchDates", control: form.control })
  const additionalServicesArray = useFieldArray({ name: "additionalServices", control: form.control })
  const faqArray = useFieldArray({ name: "faq", control: form.control })
  const howToReachArray = useFieldArray({ name: "howToReach", control: form.control })

  // Watch trekInfo array for dynamic placeholders
  const trekInfoWatch = useWatch({ control: form.control, name: "trekInfo" })

  // Auto-renumber itinerary days
  useEffect(() => {
    itineraryArray.fields.forEach((field, index) => {
      if (field.day !== index + 1) {
        form.setValue(`itinerary.${index}.day`, index + 1)
      }
    })
  }, [itineraryArray.fields, form])

  // Debug environment variables
  useEffect(() => {
    console.log("🌐 Environment check:", {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "Not set",
    })
  }, [])

  // Debug form values
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log("📝 Form field changed:", { name, type, value: value[name as keyof typeof value] })
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Fetch categories
  useEffect(() => {
    setIsLoadingCategories(true)
    getCategories().then(response => {
      if (response.success) setCategories(response.data)
      else toast({ title: "Error", description: "Failed to load categories. " + response.message, variant: "destructive" })
      setIsLoadingCategories(false)
    }).catch(() => setIsLoadingCategories(false))
  }, [toast])

  // Fetch package data and initialize form
  useEffect(() => {
    if (!packageId) return
    setIsLoadingPackage(true)
    getPackageById(packageId).then(response => {
      if (response.success && response.data) {
        const pkg = response.data.data || response.data

        // Set existing images and pdf
        setExistingImages({
          cardImage: pkg.images?.cardImage,
          trekMap: pkg.images?.trekMap,
          gallery: Array.isArray(pkg.images?.gallery) ? pkg.images.gallery : [],
        })
        setExistingPdf(Array.isArray(pkg.pdf) ? pkg.pdf[0] : pkg.pdf || null)

        // Reset form with fetched data
        const formData = {
          name: pkg.name || "",
          description: pkg.description || "",
          overview: pkg.overview || "",
          duration: pkg.duration || "",
          originalPrice: pkg.originalPrice || "",
          offerPrice: pkg.offerPrice || "",
          advancePayment: pkg.advancePayment || "",
          city: pkg.city || "",
          state: pkg.state || "",
          region: pkg.region || "",
          category: pkg.category?._id || pkg.category || "",
          maxParticipants: pkg.maxParticipants || "",
          isActive: pkg.isActive !== undefined ? pkg.isActive : true,
          isFeatured: pkg.isFeatured !== undefined ? pkg.isFeatured : false,
          startDate: pkg.startDate || "",
          endDate: pkg.endDate || "",
          inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : [],
          exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions : [],
          itinerary: Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0 
            ? pkg.itinerary 
            : [{ day: 1, title: "", description: "" }],
          howToReach: Array.isArray(pkg.howToReach) && pkg.howToReach.length > 0 
            ? pkg.howToReach.map((item: any) => 
                typeof item === 'string' ? { instruction: item } : item
              ) 
            : [{ instruction: "" }],
          fitnessRequired: Array.isArray(pkg.fitnessRequired) ? pkg.fitnessRequired : [],
          cancellationPolicy: Array.isArray(pkg.cancellationPolicy) ? pkg.cancellationPolicy : [],
          whatToCarry: Array.isArray(pkg.whatToCarry) && pkg.whatToCarry.length > 0 
            ? pkg.whatToCarry 
            : [{ item: "" }],
          trekInfo: Array.isArray(pkg.trekInfo) && pkg.trekInfo.length > 0 
            ? pkg.trekInfo 
            : [
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
              ],
          batchDates: Array.isArray(pkg.batchDates) ? pkg.batchDates : [],
          additionalServices: Array.isArray(pkg.additionalServices) ? pkg.additionalServices : [],
          faq: Array.isArray(pkg.faq) ? pkg.faq : [],
          images: {
            cardImage: pkg.images?.cardImage || "",
            trekMap: pkg.images?.trekMap || "",
            gallery: Array.isArray(pkg.images?.gallery) ? pkg.images.gallery : [],
          },
          pdf: Array.isArray(pkg.pdf) ? pkg.pdf : [],
          tags: Array.isArray(pkg.tags) ? pkg.tags : [],
          labels: Array.isArray(pkg.labels) ? pkg.labels : [],
          isTrending: pkg.isTrending !== undefined ? pkg.isTrending : false,
        }
        
        console.log("🔄 Resetting form with data:", formData)
        form.reset(formData)
      } else {
        toast({ title: "Error", description: response.message || "Failed to fetch package data", variant: "destructive" })
        router.push("/dashboard/packages")
      }
      setIsLoadingPackage(false)
    }).catch(() => setIsLoadingPackage(false))
  }, [packageId, router, toast, form])

  // Set default category after categories are loaded
  useEffect(() => {
    if (categories.length > 0 && form.getValues("category") === "") {
      form.setValue("category", categories[0]._id)
    }
  }, [categories, form])

  // File handlers
  const handleCardImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setCardImage(e.target.files[0])
  }
  const handleTrekMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setTrekMap(e.target.files[0])
  }
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setGalleryImages(prev => [...prev, ...Array.from(e.target.files || [])])
    }
  }
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPdfFile(e.target.files[0])
      setRemovePdf(false)
    }
  }
  const removeGalleryImage = (index: number) => setGalleryImages(prev => prev.filter((_, i) => i !== index))
  
  const removeExistingGalleryImage = (index: number) => {
    const imageToDelete = existingImages.gallery?.[index]
    if (imageToDelete) {
      // Add to deleted images list
      setDeletedImages(prev => ({
        ...prev,
        gallery: [...(prev.gallery || []), imageToDelete]
      }))
      // Remove from existing images
      setExistingImages(prev => ({ 
        ...prev, 
        gallery: prev.gallery?.filter((_, i) => i !== index) || [] 
      }))
    }
  }

  const removeExistingCardImage = () => {
    if (existingImages.cardImage) {
      setDeletedImages(prev => ({
        ...prev,
        cardImage: existingImages.cardImage
      }))
      setExistingImages(prev => ({ ...prev, cardImage: undefined }))
    }
  }

  const removeExistingTrekMap = () => {
    if (existingImages.trekMap) {
      setDeletedImages(prev => ({
        ...prev,
        trekMap: existingImages.trekMap
      }))
      setExistingImages(prev => ({ ...prev, trekMap: undefined }))
    }
  }

  // Submit handler
  const onSubmit = async (data: PackageFormValues) => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append("_id", packageId)
      Object.keys(data).forEach((key) => {
        if (key !== "images" && key !== "pdf") {
          const value = data[key as keyof PackageFormValues]
          if (value !== undefined && value !== null) {
            if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
              formData.append(key, JSON.stringify(value))
            } else {
              formData.append(key, String(value))
            }
          }
        }
      })
      // Images
      const imagesData: any = {
        cardImage: existingImages.cardImage || "",
        trekMap: existingImages.trekMap || "",
        gallery: existingImages.gallery || []
      }
      if (cardImage) {
        formData.append("cardImage", cardImage)
        imagesData.cardImage = "pending"
      }
      if (trekMap) {
        formData.append("trekMap", trekMap)
        imagesData.trekMap = "pending"
      }
      if (galleryImages.length > 0) {
        const existingGalleryImages = existingImages.gallery || []
        for (const image of galleryImages) {
          formData.append("gallery", image)
        }
        imagesData.gallery = [
          ...existingGalleryImages,
          ...Array(galleryImages.length).fill("pending")
        ]
      }
      if (pdfFile) {
        formData.append("pdf", pdfFile)
        setRemovePdf(false)
      }
      if (removePdf) {
        formData.append("removePdf", "true")
      }
      
      // Send deleted images for backend cleanup
      if (deletedImages.cardImage || deletedImages.trekMap || (deletedImages.gallery && deletedImages.gallery.length > 0)) {
        formData.append("deletedImages", JSON.stringify(deletedImages))
      }
      
      formData.append("images", JSON.stringify(imagesData))
      const response = await updatePackage(packageId, formData)
      if (response.success) {
        toast({ title: "Success", description: "Package updated successfully" })
        router.push("/dashboard/packages")
      } else {
        throw new Error(response.message || "Failed to update package")
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Failed to update package" })
    } finally {
      setIsLoading(false)
    }
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
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Edit the basic details of the travel package</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter package name" {...field} disabled={isLoading} />
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
                            <Textarea
                              placeholder="Enter a brief overview of the package"
                              className="min-h-[100px]"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormDescription>A short summary that will appear on the package card</FormDescription>
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
                            <Textarea
                              placeholder="Enter detailed package description"
                              className="min-h-[150px]"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 5 days" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxParticipants"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Participants</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g. 20" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Manali" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Himachal Pradesh" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Kullu Valley" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingCategories ? (
                                <SelectItem value="loading" disabled>
                                  Loading categories...
                                </SelectItem>
                              ) : categories.length > 0 ? (
                                categories.map((category) => (
                                  <SelectItem key={category._id} value={category._id}>
                                    {category.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>
                                  No categories available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="originalPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Original Price (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g. 24500" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="offerPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Offer Price (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g. 19999" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormDescription>Leave empty if no special offer</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="advancePayment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Advance Payment (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g. 5000" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Season Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Season End Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Active Package</FormLabel>
                              <FormDescription>This package will be visible on the website</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Featured Package</FormLabel>
                              <FormDescription>This package will be highlighted on the homepage</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Adventure, Family, Weekend"
                              value={field.value ? field.value.join(", ") : ""}
                              onChange={e => field.onChange(e.target.value.split(",").map(tag => tag.trim()).filter(Boolean))}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormDescription>Comma separated tags</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isTrending"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Trending</FormLabel>
                            <FormDescription>Mark as trending package</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="labels"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Labels</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. All Girls Trip, Weekend Escape"
                              value={field.value ? field.value.join(", ") : ""}
                              onChange={e => field.onChange(e.target.value.split(",").map(l => l.trim()).filter(Boolean))}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormDescription>Comma separated labels</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard/packages")}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="button" onClick={() => setActiveTab("details")}>
                      Next: Package Details
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Package Details</CardTitle>
                    <CardDescription>Edit inclusions, exclusions and itinerary</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Inclusions */}
                    <FormField
                      control={form.control}
                      name="inclusions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inclusions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter what's included in the package, one per line"
                              className="min-h-[100px]"
                              disabled={isLoading}
                              value={field.value ? field.value.join("\n") : ""}
                              onChange={(e) => {
                                const lines = e.target.value.split("\n").map((item) => item.trim()).filter(Boolean)
                                field.onChange(lines)
                              }}
                            />
                          </FormControl>
                          <FormDescription>Enter each inclusion on a new line</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Exclusions */}
                    <FormField
                      control={form.control}
                      name="exclusions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exclusions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter what's not included in the package, one per line"
                              className="min-h-[100px]"
                              disabled={isLoading}
                              value={field.value ? field.value.join("\n") : ""}
                              onChange={(e) => {
                                const lines = e.target.value.split("\n").map((item) => item.trim()).filter(Boolean)
                                field.onChange(lines)
                              }}
                            />
                          </FormControl>
                          <FormDescription>Enter each exclusion on a new line</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-base">Itinerary</FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={() => itineraryArray.append({ day: itineraryArray.fields.length + 1, title: "", description: "" })} disabled={isLoading}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Day
                        </Button>
                      </div>

                      <div className="space-y-4 border rounded-lg p-4">
                        {itineraryArray.fields.map((field, index) => (
                          <div key={field.id} className="grid gap-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium min-w-[80px]">Day {field.day}</span>
                              <FormField
                                control={form.control}
                                name={`itinerary.${index}.title`}
                                render={({ field: titleField }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input
                                        placeholder={`Enter day ${field.day} title`}
                                        {...titleField}
                                        disabled={isLoading}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => itineraryArray.remove(index)}
                                disabled={itineraryArray.fields.length === 1}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <FormField
                              control={form.control}
                              name={`itinerary.${index}.description`}
                              render={({ field: descField }) => (
                                <FormItem>
                                  <FormControl>
                                    <Textarea
                                      placeholder={`Enter detailed description for day ${field.day}`}
                                      className="min-h-[100px]"
                                      {...descField}
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <FormLabel className="text-base">How to Reach</FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={() => howToReachArray.append({ instruction: "" })} disabled={isLoading}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Instruction
                        </Button>
                      </div>
                      {howToReachArray.fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2 mb-2">
                          <FormField
                            control={form.control}
                            name={`howToReach.${index}.instruction`}
                            render={({ field: fieldProps }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Textarea
                                    placeholder="Enter instruction on how to reach the destination"
                                    className="min-h-[100px]"
                                    {...fieldProps}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => howToReachArray.remove(index)}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <FormField
                      control={form.control}
                      name="fitnessRequired"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fitness Required</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter fitness requirements for the package, one per line"
                              className="min-h-[100px]"
                              disabled={isLoading}
                              value={field.value ? field.value.join("\n") : ""}
                              onChange={(e) => {
                                const lines = e.target.value.split("\n").map((item) => item.trim()).filter(Boolean)
                                field.onChange(lines)
                              }}
                            />
                          </FormControl>
                          <FormDescription>Enter each fitness requirement on a new line</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cancellationPolicy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cancellation Policy</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter cancellation policy details, one per line"
                              className="min-h-[100px]"
                              disabled={isLoading}
                              value={field.value ? field.value.join("\n") : ""}
                              onChange={(e) => {
                                const lines = e.target.value.split("\n").map((item) => item.trim()).filter(Boolean)
                                field.onChange(lines)
                              }}
                            />
                          </FormControl>
                          <FormDescription>Enter each cancellation policy point on a new line</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <FormLabel className="text-base">What to Carry</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => whatToCarryArray.append({ item: "" })}
                          disabled={isLoading}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                      {whatToCarryArray.fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2 mb-2">
                          <FormField
                            control={form.control}
                            name={`whatToCarry.${index}.item`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input placeholder="Enter item to carry" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => whatToCarryArray.remove(index)}
                            disabled={whatToCarryArray.fields.length === 1}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <FormLabel className="text-base">Frequently Asked Questions</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => faqArray.append({ question: "", answer: "" })}
                          disabled={isLoading}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add FAQ
                        </Button>
                      </div>
                      <Accordion type="multiple" className="w-full">
                        {faqArray.fields.map((field, index) => (
                          <AccordionItem key={field.id} value={`faq-${index}`}>
                            <div className="flex items-center">
                              <AccordionTrigger className="flex-1">FAQ #{index + 1}</AccordionTrigger>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  faqArray.remove(index)
                                }}
                                className="mr-2"
                                disabled={isLoading}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                            <AccordionContent>
                              <div className="space-y-2 pt-2">
                                <FormField
                                  control={form.control}
                                  name={`faq.${index}.question`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Question</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Enter question" {...field} disabled={isLoading} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`faq.${index}.answer`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Answer</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Enter answer"
                                          {...field}
                                          disabled={isLoading}
                                          className="min-h-[100px]"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                      Back
                    </Button>
                    <Button type="button" onClick={() => setActiveTab("dates")}>
                      Next: Dates & Pricing
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="dates" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Batch Dates & Pricing</CardTitle>
                    <CardDescription>Edit specific batch dates and pricing for the package</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <FormLabel className="text-base">Batch Dates</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            batchDatesArray.append({
                              startDate: "",
                              endDate: "",
                              price: "",
                              availability: true,
                            })
                          }
                          disabled={isLoading}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Add Batch
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {batchDatesArray.fields.map((field, index) => (
                          <Card key={field.id}>
                            <CardHeader className="py-4">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Batch #{index + 1}</CardTitle>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => batchDatesArray.remove(index)}
                                  disabled={batchDatesArray.fields.length === 1 || isLoading}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="py-2 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`batchDates.${index}.startDate`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Start Date</FormLabel>
                                      <FormControl>
                                        <Input type="date" {...field} disabled={isLoading} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`batchDates.${index}.endDate`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>End Date</FormLabel>
                                      <FormControl>
                                        <Input type="date" {...field} disabled={isLoading} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`batchDates.${index}.price`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Price (₹)</FormLabel>
                                      <FormControl>
                                        <Input type="number" placeholder="e.g. 24500" {...field} disabled={isLoading} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`batchDates.${index}.availability`}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-7">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                          disabled={isLoading}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>Available</FormLabel>
                                        <FormDescription>This batch is available for booking</FormDescription>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <FormLabel className="text-base">Additional Services</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            additionalServicesArray.append({
                              name: "",
                              description: "",
                              price: "",
                              isOptional: true,
                            })
                          }
                          disabled={isLoading}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Service
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {additionalServicesArray.fields.map((field, index) => (
                          <Card key={field.id}>
                            <CardHeader className="py-4">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Service #{index + 1}</CardTitle>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => additionalServicesArray.remove(index)}
                                  disabled={isLoading}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="py-2 space-y-4">
                              <FormField
                                control={form.control}
                                name={`additionalServices.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Service Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g. Airport Transfer" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`additionalServices.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Enter service description"
                                        {...field}
                                        disabled={isLoading}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`additionalServices.${index}.price`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Price (₹)</FormLabel>
                                      <FormControl>
                                        <Input type="number" placeholder="e.g. 1500" {...field} disabled={isLoading} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`additionalServices.${index}.isOptional`}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-7">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                          disabled={isLoading}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>Optional</FormLabel>
                                        <FormDescription>Customers can choose to add this service</FormDescription>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                      Back
                    </Button>
                    <Button type="button" onClick={() => setActiveTab("trek")}>
                      Next: Trek Info
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="trek" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Trek Information</CardTitle>
                    <CardDescription>
                      Edit important details about the trek like altitude, difficulty level, etc.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">Trek Information</h3>
                          <p className="text-sm text-muted-foreground">Edit key information about the trek</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => trekInfoArray.append({ title: "", value: "" })}
                          disabled={isLoading}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Trek Info
                        </Button>
                      </div>

                      {trekInfoArray.fields.map((field, index) => {
                        const currentTitle = trekInfoWatch?.[index]?.title || field.title
                        const getPlaceholder = (title: string) => {
                          switch (title) {
                            case "Rail Head":
                              return "e.g. Haridwar Railway Station"
                            case "Region":
                              return "e.g. Garhwal Himalayas"
                            case "Airport":
                              return "e.g. Jolly Grant Airport, Dehradun"
                            case "Base Camp":
                              return "e.g. Sankri Village"
                            case "Best Season":
                              return "e.g. April to June, September to November"
                            case "Service From":
                              return "e.g. Dehradun"
                            case "Grade":
                              return "e.g. Moderate"
                            case "Stay":
                              return "e.g. Tents and Guest Houses"
                            case "Trail Type":
                              return "e.g. Forest, Meadows, Snow"
                            case "Duration":
                              return "e.g. 7 Days"
                            case "Meals":
                              return "e.g. Vegetarian Meals"
                            case "Maximum Altitude":
                              return "e.g. 12,500 ft"
                            case "Approx Trekking KM":
                              return "e.g. 45 KM"
                            case "Fitness Required":
                              return "e.g. Moderate to High"
                            default:
                              return "Enter value"
                          }
                        }
                        return (
                          <div key={field.id} className="flex items-start gap-4 rounded-lg border p-4">
                            <div className="grid w-full grid-cols-12 gap-4">
                              <div className="col-span-4">
                                <FormField
                                  control={form.control}
                                  name={`trekInfo.${index}.title`}
                                  render={({ field: titleField }) => (
                                    <FormItem>
                                      <FormLabel>Title</FormLabel>
                                      <Select value={titleField.value} onValueChange={titleField.onChange} disabled={isLoading}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a title" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="Rail Head">Rail Head</SelectItem>
                                          <SelectItem value="Region">Region</SelectItem>
                                          <SelectItem value="Airport">Airport</SelectItem>
                                          <SelectItem value="Base Camp">Base Camp</SelectItem>
                                          <SelectItem value="Best Season">Best Season</SelectItem>
                                          <SelectItem value="Service From">Service From</SelectItem>
                                          <SelectItem value="Grade">Grade</SelectItem>
                                          <SelectItem value="Stay">Stay</SelectItem>
                                          <SelectItem value="Trail Type">Trail Type</SelectItem>
                                          <SelectItem value="Duration">Duration</SelectItem>
                                          <SelectItem value="Meals">Meals</SelectItem>
                                          <SelectItem value="Maximum Altitude">Maximum Altitude</SelectItem>
                                          <SelectItem value="Approx Trekking KM">Approx Trekking KM</SelectItem>
                                          <SelectItem value="Fitness Required">Fitness Required</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="col-span-7">
                                <FormField
                                  control={form.control}
                                  name={`trekInfo.${index}.value`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Value</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder={getPlaceholder(currentTitle || "")}
                                          {...field}
                                          disabled={isLoading}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="col-span-1 flex items-end">
                                <Button type="button" variant="ghost" size="icon" onClick={() => trekInfoArray.remove(index)} disabled={isLoading}>
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("dates")}>
                      Back
                    </Button>
                    <Button type="button" onClick={() => setActiveTab("media")}>
                      Next: Media & Documents
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Package Images</CardTitle>
                    <CardDescription>Edit images for the package</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Card Image */}
                      <div className="border rounded-md p-4 flex flex-col items-center justify-center min-h-[200px]">
                        <div className="mb-4">
                          {cardImage ? (
                            <img
                              src={URL.createObjectURL(cardImage)}
                              alt="Package preview"
                              className="rounded-md object-cover h-[150px] w-[250px]"
                            />
                          ) : existingImages.cardImage ? (
                            <img
                              src={existingImages.cardImage}
                              alt="Package preview"
                              className="rounded-md object-cover h-[150px] w-[250px]"
                            />
                          ) : (
                            <div className="h-[150px] w-[250px] rounded-md bg-muted flex items-center justify-center">
                              <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          ref={cardImageRef}
                          onChange={handleCardImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isLoading}
                          onClick={() => cardImageRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {existingImages.cardImage ? "Change Card Image" : "Upload Card Image"}
                        </Button>
                        {existingImages.cardImage && !cardImage && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="mt-2"
                            onClick={removeExistingCardImage}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Card Image
                          </Button>
                        )}
                      </div>

                      <div className="border rounded-md p-4 flex flex-col items-center justify-center min-h-[200px]">
                        <div className="mb-4">
                          {trekMap ? (
                            <img
                              src={URL.createObjectURL(trekMap)}
                              alt="Trek map preview"
                              className="rounded-md object-cover h-[150px] w-[250px]"
                            />
                          ) : existingImages.trekMap ? (
                            <img
                              src={existingImages.trekMap}
                              alt="Trek map preview"
                              className="rounded-md object-cover h-[150px] w-[250px]"
                            />
                          ) : (
                            <div className="h-[150px] w-[250px] rounded-md bg-muted flex items-center justify-center">
                              <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          ref={trekMapRef}
                          onChange={handleTrekMapUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isLoading}
                          onClick={() => trekMapRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {existingImages.trekMap ? "Change Trek Map" : "Upload Trek Map"}
                        </Button>
                        {existingImages.trekMap && !trekMap && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="mt-2"
                            onClick={removeExistingTrekMap}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Trek Map
                          </Button>
                        )}
                      </div>

                      {/* Gallery */}
                      <div className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center min-h-[200px]">
                        <input
                          type="file"
                          ref={galleryRef}
                          onChange={handleGalleryUpload}
                          accept="image/*"
                          multiple
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isLoading}
                          onClick={() => galleryRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Add Gallery Images
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 text-center">Select multiple images</p>
                      </div>
                    </div>

                    {/* Existing Gallery Images */}
                    {existingImages.gallery && existingImages.gallery.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2">Existing Gallery Images</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {existingImages.gallery.map((image, index) => (
                            <div key={`existing-${index}`} className="relative group">
                              <img
                                src={image}
                                alt={`Gallery image ${index + 1}`}
                                className="h-24 w-full object-cover rounded-md"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeExistingGalleryImage(index)}
                                disabled={isLoading}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Gallery Images */}
                    {galleryImages.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2">New Gallery Images</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {galleryImages.map((image, index) => (
                            <div key={`new-${index}`} className="relative group">
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Gallery image ${index + 1}`}
                                className="h-24 w-full object-cover rounded-md"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeGalleryImage(index)}
                                disabled={isLoading}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>Upload PDF documents related to the package</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {existingPdf && !removePdf && (
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="font-medium">Existing PDF Document</p>
                              <p className="text-xs text-muted-foreground">{existingPdf.split("/").pop()}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setExistingPdf(null)
                              setRemovePdf(true)
                            }}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {pdfFile && (
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="font-medium">{pdfFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => setPdfFile(null)} disabled={isLoading}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {removePdf && (
                        <div className="p-3 border rounded-md bg-destructive/10 text-destructive-foreground">
                          <p className="text-sm">PDF document has been removed.</p>
                        </div>
                      )}

                      <input type="file" ref={pdfRef} onChange={handlePdfUpload} accept=".pdf" className="hidden" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => pdfRef.current?.click()}
                        disabled={isLoading || Boolean(pdfFile && existingPdf && !removePdf)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {existingPdf && !removePdf ? "Replace PDF Document" : "Upload PDF Document"}
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Upload brochures, itineraries, terms & conditions, or any other relevant documents. Max size: 10MB.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("trek")}>
                      Back
                    </Button>
                    <Button type="submit" disabled={isLoading} className="min-w-[100px]">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Package"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}