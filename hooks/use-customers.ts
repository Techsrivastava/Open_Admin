import { useState, useCallback, useMemo } from 'react'
import { Customer, CustomerFilters, CustomerFormData } from '@/types/customer'
import { toast } from 'sonner'

export const useCustomers = (initialCustomers: Customer[]) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    status: 'all',
    location: 'all',
    dateRange: {
      from: undefined,
      to: undefined,
    },
  })

  // Filter customers based on all criteria
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // Search filter
      const matchesSearch = 
        customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.location.toLowerCase().includes(filters.search.toLowerCase())

      // Status filter
      const matchesStatus = filters.status === 'all' || customer.status === filters.status

      // Location filter
      const matchesLocation = filters.location === 'all' || customer.location === filters.location

      // Date range filter
      const matchesDateRange = !filters.dateRange.from || !filters.dateRange.to || 
        (new Date(customer.lastBooking) >= filters.dateRange.from &&
         new Date(customer.lastBooking) <= filters.dateRange.to)

      return matchesSearch && matchesStatus && matchesLocation && matchesDateRange
    })
  }, [customers, filters])

  // Calculate statistics
  const stats = useMemo(() => {
    const activeCustomers = customers.filter(c => c.status === 'Active')
    const totalSpent = customers.reduce((sum, c) => sum + parseInt(c.totalSpent.replace(/[^0-9]/g, '')), 0)
    const totalBookings = customers.reduce((sum, c) => sum + c.totalBookings, 0)

    return {
      totalCustomers: customers.length,
      activeCustomers: activeCustomers.length,
      avgBookingsPerCustomer: totalBookings / customers.length || 0,
      avgLifetimeValue: totalSpent / customers.length || 0,
    }
  }, [customers])

  // CRUD operations
  const addCustomer = useCallback((data: CustomerFormData) => {
    const newCustomer: Customer = {
      id: `C-${Math.random().toString(36).substr(2, 9)}`,
      avatar: '/placeholder.svg?height=40&width=40',
      initials: data.name.split(' ').map(n => n[0]).join(''),
      totalBookings: 0,
      totalSpent: '₹0',
      lastBooking: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    }

    setCustomers(prev => [...prev, newCustomer])
    toast.success('Customer added successfully!')
    return newCustomer
  }, [])

  const updateCustomer = useCallback((id: string, data: Partial<CustomerFormData>) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === id
        ? { ...customer, ...data, updatedAt: new Date().toISOString() }
        : customer
    ))
    toast.success('Customer updated successfully!')
  }, [])

  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id))
    toast.success('Customer deleted successfully!')
  }, [])

  const updateStatus = useCallback((id: string, status: Customer['status']) => {
    setCustomers(prev => prev.map(customer =>
      customer.id === id
        ? { ...customer, status, updatedAt: new Date().toISOString() }
        : customer
    ))
    toast.success(`Customer status updated to ${status}`)
  }, [])

  // Export functionality
  const exportCustomers = useCallback(() => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Location', 'Status', 'Total Bookings', 'Total Spent', 'Last Booking']
    const csvContent = [
      headers.join(','),
      ...filteredCustomers.map(c => [
        c.id,
        c.name,
        c.email,
        c.phone,
        c.location,
        c.status,
        c.totalBookings,
        c.totalSpent,
        c.lastBooking
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success('Customers exported successfully!')
  }, [filteredCustomers])

  // Import functionality
  const importCustomers = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string
        const rows = csvData.split('\n').slice(1) // Skip header row
        const newCustomers: Customer[] = rows.map(row => {
          const [id, name, email, phone, location, status, totalBookings, totalSpent, lastBooking] = row.split(',')
          return {
            id,
            name,
            email,
            phone,
            location,
            status: status as Customer['status'],
            totalBookings: parseInt(totalBookings),
            totalSpent,
            lastBooking,
            avatar: '/placeholder.svg?height=40&width=40',
            initials: name.split(' ').map(n => n[0]).join(''),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        })
        setCustomers(prev => [...prev, ...newCustomers])
        toast.success(`${newCustomers.length} customers imported successfully!`)
      } catch (error) {
        toast.error('Error importing customers. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }, [])

  return {
    customers: filteredCustomers,
    stats,
    filters,
    setFilters,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    updateStatus,
    exportCustomers,
    importCustomers,
  }
} 