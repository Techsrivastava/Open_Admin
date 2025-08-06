import axios from "axios"
import { API_URL } from "@/lib/constants"

interface Customer {
  _id: string
  name: string
  email: string
  phone: string
  address?: string
  createdAt: string
}

interface ApiResponse {
  success: boolean
  data: any
  message?: string
}

export const getCustomers = async (): Promise<ApiResponse> => {
  try {
    const response = await axios.get(`${API_URL}/api/customers`)
    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    console.error("Error fetching customers:", error)
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Failed to fetch customers",
    }
  }
}

export const getCustomerById = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await axios.get(`${API_URL}/api/customers/${id}`)
    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    console.error("Error fetching customer:", error)
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch customer",
    }
  }
}

export const createCustomer = async (formData: FormData): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/api/customers`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    console.error("Error creating customer:", error)
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to create customer",
    }
  }
}

export const updateCustomer = async (id: string, formData: FormData): Promise<ApiResponse> => {
  try {
    const response = await axios.put(`${API_URL}/api/customers/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    console.error("Error updating customer:", error)
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to update customer",
    }
  }
}

export const deleteCustomer = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await axios.delete(`${API_URL}/api/customers/${id}`)
    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    console.error("Error deleting customer:", error)
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to delete customer",
    }
  }
} 