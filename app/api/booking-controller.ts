import axios from "axios";
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL = 'https://openbacken-production.up.railway.app/api';

export interface Booking {
  _id: string;
  bookingId: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  package: {
    _id: string;
    name: string;
    duration: string;
    location: string;
  };
  travelDate: string;
  amount: number;
  participants: number;
  bookedBy: "Self" | "Admin";
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  customer: string;
  package: string;
  travelDate: string;
  amount: number;
  participants: number;
  bookedBy: "Self" | "Admin";
}

export interface UpdateBookingData {
  travelDate?: string;
  amount?: number;
  participants?: number;
  status?: "Pending" | "Confirmed" | "Cancelled" | "Completed";
}

// Expense Management Interfaces
export interface Expense {
  _id: string;
  bookingId: string;
  type: string;
  description?: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  type: string;
  description?: string;
  amount: number;
}

export interface BookingExpenses {
  expenses: Expense[];
  totalExpenses: number;
  revenue: number;
  profit: number;
}

export interface OverallSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  totalBookings: number;
}

export const createBooking = async (data: CreateBookingData): Promise<Booking> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bookings/create`, data);
    toast({
      title: "Success",
      description: "Booking created successfully",
    });
    return response.data;
  } catch (error: any) {
    console.error("Error creating booking:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to create booking",
      variant: "destructive",
    });
    throw error;
  }
};

export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to fetch bookings",
      variant: "destructive",
    });
    throw error;
  }
};

export const getBookingById = async (id: string): Promise<Booking> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching booking:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to fetch booking",
      variant: "destructive",
    });
    throw error;
  }
};

export const updateBooking = async (id: string, data: UpdateBookingData): Promise<Booking> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/bookings/${id}`, data);
    toast({
      title: "Success",
      description: "Booking updated successfully",
    });
    return response.data;
  } catch (error: any) {
    console.error("Error updating booking:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to update booking",
      variant: "destructive",
    });
    throw error;
  }
};

export const deleteBooking = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/bookings/${id}`);
    toast({
      title: "Success",
      description: "Booking deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting booking:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to delete booking",
      variant: "destructive",
    });
    throw error;
  }
};

export const updateBookingStatus = async (
  id: string,
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed"
): Promise<Booking> => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/bookings/${id}/status`, { status });
    toast({
      title: "Success",
      description: "Booking status updated successfully",
    });
    return response.data;
  } catch (error: any) {
    console.error("Error updating booking status:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to update booking status",
      variant: "destructive",
    });
    throw error;
  }
};

export const getBookingsByCustomerId = async (customerId: string): Promise<Booking[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/customer/${customerId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching customer bookings:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to fetch customer bookings",
      variant: "destructive",
    });
    throw error;
  }
};

// Expense Management API Functions
export const addExpenseToBooking = async (bookingId: string, expenseData: CreateExpenseData): Promise<Expense> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bookings/${bookingId}/expenses`, expenseData);
    toast({
      title: "Success",
      description: "Expense added successfully",
    });
    return response.data;
  } catch (error: any) {
    console.error("Error adding expense:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to add expense",
      variant: "destructive",
    });
    throw error;
  }
};

export const getBookingExpenses = async (bookingId: string): Promise<BookingExpenses> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}/expenses`);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching booking expenses:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to fetch booking expenses",
      variant: "destructive",
    });
    throw error;
  }
};

export const deleteExpense = async (bookingId: string, expenseId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/bookings/${bookingId}/expenses/${expenseId}`);
    toast({
      title: "Success",
      description: "Expense deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting expense:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to delete expense",
      variant: "destructive",
    });
    throw error;
  }
};

export const getOverallSummary = async (): Promise<OverallSummary> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/summary/overall`);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching overall summary:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to fetch overall summary",
      variant: "destructive",
    });
    throw error;
  }
};

export const collectPayment = async (bookingId: string, paymentData: any): Promise<Booking> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bookings/${bookingId}/collect-payment`, paymentData);
    toast({
      title: "Success",
      description: "Payment collected successfully",
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Error collecting payment:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to collect payment",
      variant: "destructive",
    });
    throw error;
  }
}; 