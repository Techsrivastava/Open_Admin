"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { toast } from 'sonner'
import { getPackages } from '@/api/package-controller'

interface Package {
  _id: string
  name: string
  description: string
  isActive: boolean
}

interface PackagesContextType {
  packages: Package[]
  loading: boolean
  error: string | null
  fetchPackages: () => Promise<void>
}

const PackagesContext = createContext<PackagesContextType | undefined>(undefined)

export function PackagesProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getPackages()
      if (response.success && response.data) {
        setPackages(response.data)
      } else {
        throw new Error(response.message || 'Failed to fetch packages')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch packages')
      toast.error('Failed to fetch packages')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <PackagesContext.Provider
      value={{
        packages,
        loading,
        error,
        fetchPackages,
      }}
    >
      {children}
    </PackagesContext.Provider>
  )
}

export function usePackages() {
  const context = useContext(PackagesContext)
  if (context === undefined) {
    throw new Error('usePackages must be used within a PackagesProvider')
  }
  return context
} 