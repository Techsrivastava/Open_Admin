export type CustomerStatus = "Active" | "Inactive" | "Pending";

export interface Customer {
  _id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  totalBookings: number;
  totalSpent: string;
  lastBooking: string;
  status: CustomerStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  initials?: string;
  notes?: string;
  tags?: string[];
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  status: CustomerStatus;
  notes?: string;
  tags?: string[];
  avatar?: File | null;
}

export interface CustomerFilters {
  search?: string
  status?: "all_status" | "Active" | "Inactive" | "Pending"
  location?: "all_location" | string
  dateRange?: {
    from: Date
    to: Date
  }
  sortBy?: "name" | "email" | "location" | "status" | "totalBookings" | "totalSpent" | "lastBooking"
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  totalRevenue: number;
  averageBookingsPerCustomer: number;
  averageLifetimeValue: number;
  topCustomers: Array<{ id: string; ltv: number }>;
}

export interface Booking {
  _id: string;
  package: {
    _id: string;
    name: string;
    // add other fields if needed
  };
  travelDate: string;
  amount: number;
  status: string;
  // add other fields if needed
} 