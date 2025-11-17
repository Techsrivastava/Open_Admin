import axios from "axios"
import { PackageFormValues } from "@/lib/validations/package"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://openbacken-production.up.railway.app/api'

export interface Package extends PackageFormValues {
  _id: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: any
}

// CSV Export function
export const exportPackagesToCSV = async (): Promise<ApiResponse<string>> => {
  try {
    const response = await axios.get(`${API_URL}/packages/export/csv`, {
      responseType: 'text'
    })
    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    console.error("Error exporting packages to CSV:", error)
    return {
      success: false,
      message: error.response?.data?.message || "Failed to export packages to CSV",
      error: error.response?.data || error,
    }
  }
}

// CSV Import function
export const importPackagesFromCSV = async (csvFile: File): Promise<ApiResponse<any>> => {
  try {
    const formData = new FormData()
    formData.append('csvFile', csvFile)

    const response = await axios.post(`${API_URL}/packages/import/csv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    console.error("Error importing packages from CSV:", error)
    return {
      success: false,
      message: error.response?.data?.message || "Failed to import packages from CSV",
      error: error.response?.data || error,
    }
  }
}

export const createPackage = async (formData: FormData): Promise<ApiResponse> => {
  try {
    console.log("📤 Creating package...")
    
    const response = await axios.post(`${API_URL}/packages/create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 second timeout
    })
    
    console.log("✅ Package created successfully:", response.data)
    
    return {
      success: true,
      data: response.data,
      message: "Package created successfully",
    }
  } catch (error: any) {
    console.error("❌ Error Creating Package:", error)
    let errorMessage = "Failed to create package"

    if (error.response) {
      console.error("🚨 API Error Status:", error.response.status)
      console.error("🚨 API Error Data:", error.response.data)
      
      // More specific error messages
      if (error.response.status === 400) {
        errorMessage = error.response.data?.message || "Invalid package data. Please check all required fields."
      } else if (error.response.status === 413) {
        errorMessage = "Files are too large. Please reduce image sizes."
      } else if (error.response.status === 500) {
        errorMessage = "Server error. Please try again later."
      } else {
        errorMessage = error.response.data?.message || `Error ${error.response.status}: API request failed`
      }
    } else if (error.request) {
      console.error("❌ No Response Received from Server")
      errorMessage = "No response from server. Please check your internet connection."
    } else {
      console.error("⚠️ Error Message:", error.message)
      errorMessage = error.message
    }

    return {
      success: false,
      message: errorMessage,
      error: error.response?.data || error,
    }
  }
}

export const getPackages = async (): Promise<ApiResponse<Package[]>> => {
  try {
    const response = await axios.get(`${API_URL}/packages`)
    return {
      success: true,
      data: response.data.data,
    }
  } catch (error: any) {
    console.error("Error fetching packages:", error)
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch packages",
      error: error.response?.data || error,
    }
  }
}

export const getPackageById = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await axios.get(`${API_URL}/packages/${id}`)
    console.log("Raw API response:", response.data)
    
    // Extract the actual package data from the nested response
    const rawData = response.data.data || response.data
    
    // Transform the response data
    const packageData = {
      name: rawData.name || "",
      description: rawData.description || "",
      overview: rawData.overview || "",
      duration: rawData.duration || "",
      originalPrice: rawData.originalPrice || "",
      offerPrice: rawData.offerPrice || "",
      advancePayment: rawData.advancePayment || "",
      location: rawData.location || "",
      city: rawData.city || "",
      state: rawData.state || "",
      region: rawData.region || "",
      category: rawData.category || "",
      inclusions: Array.isArray(rawData.inclusions) ? rawData.inclusions : [],
      exclusions: Array.isArray(rawData.exclusions) ? rawData.exclusions : [],
      itinerary: Array.isArray(rawData.itinerary) ? rawData.itinerary.map((item: any) => ({
        day: Number(item.day) || 1,
        title: item.title || "",
        description: item.description || ""
      })) : [],
      maxParticipants: String(rawData.maxParticipants || ""),
      isActive: Boolean(rawData.isActive),
      isFeatured: Boolean(rawData.isFeatured),
      startDate: rawData.startDate || "",
      endDate: rawData.endDate || "",
      howToReach: Array.isArray(rawData.howToReach) ? rawData.howToReach : [],
      fitnessRequired: rawData.fitnessRequired || "",
      cancellationPolicy: rawData.cancellationPolicy || "",
      whatToCarry: Array.isArray(rawData.whatToCarry) ? rawData.whatToCarry : [],
      trekInfo: Array.isArray(rawData.trekInfo) ? rawData.trekInfo : [],
      batchDates: Array.isArray(rawData.batchDates) ? rawData.batchDates : [],
      additionalServices: Array.isArray(rawData.additionalServices) ? rawData.additionalServices : [],
      faq: Array.isArray(rawData.faq) ? rawData.faq : [],
      images: {
        cardImage: rawData.images?.cardImage || "",
        trekMap: rawData.images?.trekMap || "",
        gallery: Array.isArray(rawData.images?.gallery) ? rawData.images.gallery : []
      },
      pdf: rawData.pdf || ""
    }
    
    console.log("Transformed package data:", packageData)
    
    return {
      success: true,
      data: packageData,
    }
  } catch (error: any) {
    console.error(`Error fetching package with ID ${id}:`, error)
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch package",
      error: error.response?.data || error,
    }
  }
}

export const updatePackage = async (id: string, formData: FormData): Promise<ApiResponse> => {
  try {
    console.log(`📤 Updating package ${id}...`)
    
    const response = await axios.put(`${API_URL}/packages/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 second timeout
    })
    
    console.log("✅ Package updated successfully:", response.data)
    
    return {
      success: true,
      data: response.data,
      message: "Package updated successfully",
    }
  } catch (error: any) {
    console.error(`❌ Error updating package with ID ${id}:`, error)
    
    let errorMessage = "Failed to update package"
    
    if (error.response) {
      if (error.response.status === 400) {
        errorMessage = error.response.data?.message || "Invalid package data. Please check all required fields."
      } else if (error.response.status === 404) {
        errorMessage = "Package not found. It may have been deleted."
      } else if (error.response.status === 413) {
        errorMessage = "Files are too large. Please reduce image sizes."
      } else {
        errorMessage = error.response.data?.message || "Failed to update package"
      }
    }
    
    return {
      success: false,
      message: errorMessage,
      error: error.response?.data || error,
    }
  }
}

export const deletePackage = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await axios.delete(`${API_URL}/packages/${id}`)
    return {
      success: true,
      data: response.data,
      message: "Package deleted successfully",
    }
  } catch (error: any) {
    console.error(`Error deleting package with ID ${id}:`, error)
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete package",
      error: error.response?.data || error,
    }
  }
}

export const prepareFormData = (
  data: PackageFormValues,
  files: {
    cardImage: File | null
    trekMap: File | null
    gallery: File[]
    pdf: File | null
  },
) => {
  const formData = new FormData()

  // Append all text fields
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "images" && key !== "pdf") {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value))
      } else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value.toString())
      }
    }
  })

  // Append files
  if (files.cardImage) {
    formData.append("cardImage", files.cardImage)
  }

  if (files.trekMap) {
    formData.append("trekMap", files.trekMap)
  }

  if (files.gallery.length > 0) {
    files.gallery.forEach((file, index) => {
      formData.append(`gallery`, file)
    })
  }

  if (files.pdf) {
    formData.append("pdf", files.pdf)
  }

  return formData
}

export const getCategories = async (): Promise<ApiResponse> => {
  try {
    console.log("Fetching categories from:", `${API_URL}/categories`)
    const response = await axios.get(`${API_URL}/categories`)
    console.log(response.data.data)
    return {
      success: true,
      data: response.data.data,
    }
  } catch (error: any) {
    console.error("Error fetching categories:", error)
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch categories",
      error: error.response?.data || error,
    }
  }
}

export interface Category {
  _id: string
  name: string
  description?: string
  isActive?: boolean
}

