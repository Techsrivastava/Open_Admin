"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { toast } from 'sonner'
import { guidesApi, Guide, CreateGuideData, UpdateGuideData } from '@/lib/api/guides'

interface GuidesContextType {
  guides: Guide[]
  loading: boolean
  error: string | null
  fetchGuides: (filters?: { status?: string; specialization?: string; rating?: number }) => Promise<void>
  createGuide: (data: CreateGuideData) => Promise<void>
  updateGuide: (id: string, data: UpdateGuideData) => Promise<void>
  deleteGuide: (id: string) => Promise<void>
  assignPackage: (guideId: string, packageId: string) => Promise<void>
  removePackage: (guideId: string, packageId: string) => Promise<void>
}

const GuidesContext = createContext<GuidesContextType | undefined>(undefined)

export function GuidesProvider({ children }: { children: ReactNode }) {
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGuides = useCallback(async (filters?: { status?: string; specialization?: string; rating?: number }) => {
    try {
      setLoading(true)
      setError(null)
      const response = await guidesApi.getAll(filters)
      setGuides(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch guides')
      toast.error('Failed to fetch guides')
    } finally {
      setLoading(false)
    }
  }, [])

  const createGuide = useCallback(async (data: CreateGuideData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await guidesApi.create(data)
      setGuides(prev => [...prev, response.data])
      toast.success('Guide created successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create guide')
      toast.error('Failed to create guide')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateGuide = useCallback(async (id: string, data: UpdateGuideData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await guidesApi.update(id, data)
      setGuides(prev => prev.map(guide => guide.guideId === id ? response.data : guide))
      toast.success('Guide updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update guide')
      toast.error('Failed to update guide')
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteGuide = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await guidesApi.delete(id)
      setGuides(prev => prev.filter(guide => guide.guideId !== id))
      toast.success('Guide deleted successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete guide')
      toast.error('Failed to delete guide')
    } finally {
      setLoading(false)
    }
  }, [])

  const assignPackage = useCallback(async (guideId: string, packageId: string) => {
    try {
      setLoading(true)
      setError(null)
      await guidesApi.assignPackage(guideId, packageId)
      toast.success('Package assigned successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign package')
      toast.error('Failed to assign package')
    } finally {
      setLoading(false)
    }
  }, [])

  const removePackage = useCallback(async (guideId: string, packageId: string) => {
    try {
      setLoading(true)
      setError(null)
      await guidesApi.removePackage(guideId, packageId)
      toast.success('Package removed successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove package')
      toast.error('Failed to remove package')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <GuidesContext.Provider
      value={{
        guides,
        loading,
        error,
        fetchGuides,
        createGuide,
        updateGuide,
        deleteGuide,
        assignPackage,
        removePackage,
      }}
    >
      {children}
    </GuidesContext.Provider>
  )
}

export function useGuides() {
  const context = useContext(GuidesContext)
  if (context === undefined) {
    throw new Error('useGuides must be used within a GuidesProvider')
  }
  return context
} 