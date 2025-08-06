export type CustomerStatus = 'Active' | 'Inactive' | 'Pending'

export interface Customer {
  _id: string;              // MongoDB ObjectId
  customerId: string;       // Display ID (C-XXXX)
  name: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
  status: CustomerStatus;
  totalBookings: number;
  totalSpent: string;
  lastBooking: string;
  isVerified: boolean;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerStats {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
}

export interface CustomerFilters {
  search: string
  status: string
  location: string
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  sortBy?: string
}

export interface CustomerFormData {
  name: string
  email: string
  phone: string
  location: string
  status: CustomerStatus
  notes?: string
  tags?: string[]
  avatar?: File | null
} 