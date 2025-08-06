import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://openbacken-production.up.railway.app/api';

export interface Coupon {
  _id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minPurchase: number;
  maxDiscount: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponData {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minPurchase: number;
  maxDiscount: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
}

export interface UpdateCouponData extends Partial<CreateCouponData> {
  status?: 'active' | 'inactive' | 'expired';
}

export interface ValidateCouponData {
  code: string;
  amount: number;
}

export interface ValidateCouponResponse {
  coupon: Coupon;
  discountAmount: number;
  finalAmount: number;
}

export const couponsApi = {
  // Get all coupons with optional status filter
  getAll: async (status?: string) => {
    const response = await axios.get(`${API_URL}/coupons`, { params: { status } });
    return response.data;
  },

  // Get coupon by ID
  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/coupons/${id}`);
    return response.data;
  },

  // Create new coupon
  create: async (data: CreateCouponData) => {
    const response = await axios.post(`${API_URL}/coupons`, data);
    return response.data;
  },

  // Update coupon
  update: async (id: string, data: UpdateCouponData) => {
    const response = await axios.put(`${API_URL}/coupons/${id}`, data);
    return response.data;
  },

  // Delete coupon
  delete: async (id: string) => {
    const response = await axios.delete(`${API_URL}/coupons/${id}`);
    return response.data;
  },

  // Validate coupon
  validate: async (data: ValidateCouponData) => {
    const response = await axios.post(`${API_URL}/coupons/validate`, data);
    return response.data;
  },

  // Calculate coupon stats
  calculateStats: (coupons: Coupon[]) => {
    const now = new Date();
    const stats = {
      total: coupons.length,
      active: 0,
      inactive: 0,
      expired: 0,
      totalUsage: 0,
      totalDiscount: 0,
      upcomingExpiry: 0,
    };

    coupons.forEach(coupon => {
      // Count status
      stats[coupon.status]++;

      // Calculate total usage
      stats.totalUsage += coupon.usedCount;

      // Calculate total discount
      if (coupon.type === 'percentage') {
        stats.totalDiscount += (coupon.discount * coupon.usedCount);
      } else {
        stats.totalDiscount += (coupon.discount * coupon.usedCount);
      }

      // Count upcoming expiry (within 7 days)
      const expiryDate = new Date(coupon.validTo);
      const daysToExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysToExpiry <= 7 && daysToExpiry > 0) {
        stats.upcomingExpiry++;
      }
    });

    return stats;
  },
}; 