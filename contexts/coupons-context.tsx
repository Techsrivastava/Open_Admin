"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { toast } from 'sonner'
import { couponsApi, Coupon, CreateCouponData, UpdateCouponData, ValidateCouponData, ValidateCouponResponse } from '@/lib/api/coupons'

interface CouponsContextType {
  coupons: Coupon[]
  loading: boolean
  error: string | null
  stats: {
    total: number
    active: number
    inactive: number
    expired: number
    totalUsage: number
    totalDiscount: number
    upcomingExpiry: number
  }
  fetchCoupons: (status?: string) => Promise<void>
  createCoupon: (data: CreateCouponData) => Promise<void>
  updateCoupon: (id: string, data: UpdateCouponData) => Promise<void>
  deleteCoupon: (id: string) => Promise<void>
  validateCoupon: (data: ValidateCouponData) => Promise<ValidateCouponResponse>
}

const CouponsContext = createContext<CouponsContextType | undefined>(undefined)

export function CouponsProvider({ children }: { children: ReactNode }) {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0,
    totalUsage: 0,
    totalDiscount: 0,
    upcomingExpiry: 0,
  })

  const fetchCoupons = useCallback(async (status?: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await couponsApi.getAll(status)
      if (response.success && response.data) {
        setCoupons(response.data)
        setStats(couponsApi.calculateStats(response.data))
      } else {
        throw new Error(response.message || 'Failed to fetch coupons')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch coupons')
      toast.error('Failed to fetch coupons')
    } finally {
      setLoading(false)
    }
  }, [])

  const createCoupon = useCallback(async (data: CreateCouponData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await couponsApi.create(data)
      if (response.success && response.data) {
        setCoupons(prev => [...prev, response.data])
        setStats(couponsApi.calculateStats([...coupons, response.data]))
        toast.success('Coupon created successfully')
      } else {
        throw new Error(response.message || 'Failed to create coupon')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create coupon')
      toast.error('Failed to create coupon')
    } finally {
      setLoading(false)
    }
  }, [coupons])

  const updateCoupon = useCallback(async (id: string, data: UpdateCouponData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await couponsApi.update(id, data)
      if (response.success && response.data) {
        setCoupons(prev => prev.map(coupon => coupon._id === id ? response.data : coupon))
        setStats(couponsApi.calculateStats(coupons.map(coupon => coupon._id === id ? response.data : coupon)))
        toast.success('Coupon updated successfully')
      } else {
        throw new Error(response.message || 'Failed to update coupon')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update coupon')
      toast.error('Failed to update coupon')
    } finally {
      setLoading(false)
    }
  }, [coupons])

  const deleteCoupon = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await couponsApi.delete(id)
      if (response.success) {
        setCoupons(prev => prev.filter(coupon => coupon._id !== id))
        setStats(couponsApi.calculateStats(coupons.filter(coupon => coupon._id !== id)))
        toast.success('Coupon deleted successfully')
      } else {
        throw new Error(response.message || 'Failed to delete coupon')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete coupon')
      toast.error('Failed to delete coupon')
    } finally {
      setLoading(false)
    }
  }, [coupons])

  const validateCoupon = useCallback(async (data: ValidateCouponData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await couponsApi.validate(data)
      if (response.success && response.data) {
        return response.data
      } else {
        throw new Error(response.message || 'Failed to validate coupon')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate coupon')
      toast.error('Failed to validate coupon')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <CouponsContext.Provider
      value={{
        coupons,
        loading,
        error,
        stats,
        fetchCoupons,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        validateCoupon,
      }}
    >
      {children}
    </CouponsContext.Provider>
  )
}

export function useCoupons() {
  const context = useContext(CouponsContext)
  if (context === undefined) {
    throw new Error('useCoupons must be used within a CouponsProvider')
  }
  return context
} 