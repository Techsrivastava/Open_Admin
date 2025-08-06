import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://openbacken-production.up.railway.app/api'

export interface Coupon {
  _id: string
  code: string
  discount: number
  type: "percentage" | "fixed"
  minPurchase: number
  maxDiscount: number
  validFrom: string
  validTo: string
  usageLimit: number
  usedCount: number
  status: "active" | "inactive" | "expired"
  packageId?: string
  packages?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: any
}

export const createCoupon = async (couponData: Partial<Coupon>): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/coupons`, couponData)
    return {
      success: true,
      data: response.data.data,
      message: "Coupon created successfully"
    }
  } catch (error: any) {
    console.error("Error creating coupon:", error)
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create coupon",
      error: error.response?.data || error
    }
  }
}

export const getCoupons = async (status?: string): Promise<ApiResponse> => {
  try {
    const url = status ? `${API_URL}/coupons?status=${status}` : `${API_URL}/coupons`
    const response = await axios.get(url)
    return {
      success: true,
      data: response.data.data
    }
  } catch (error: any) {
    console.error("Error fetching coupons:", error)
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch coupons",
      error: error.response?.data || error
    }
  }
}

export const getCouponById = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await axios.get(`${API_URL}/coupons/${id}`)
    return {
      success: true,
      data: response.data.data
    }
  } catch (error: any) {
    console.error("Error fetching coupon:", error)
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch coupon",
      error: error.response?.data || error
    }
  }
}

export const updateCoupon = async (id: string, couponData: Partial<Coupon>): Promise<ApiResponse> => {
  try {
    const response = await axios.put(`${API_URL}/coupons/${id}`, couponData)
    return {
      success: true,
      data: response.data.data,
      message: "Coupon updated successfully"
    }
  } catch (error: any) {
    console.error("Error updating coupon:", error)
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update coupon",
      error: error.response?.data || error
    }
  }
}

export const deleteCoupon = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await axios.delete(`${API_URL}/coupons/${id}`)
    return {
      success: true,
      message: "Coupon deleted successfully"
    }
  } catch (error: any) {
    console.error("Error deleting coupon:", error)
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete coupon",
      error: error.response?.data || error
    }
  }
}

export const validateCoupon = async (code: string, amount: number): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/coupons/validate`, { code, amount })
    return {
      success: true,
      data: response.data.data
    }
  } catch (error: any) {
    console.error("Error validating coupon:", error)
    return {
      success: false,
      message: error.response?.data?.message || "Failed to validate coupon",
      error: error.response?.data || error
    }
  }
} 