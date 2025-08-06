import { CustomerFormData } from '@/types/customer'

export const validateCustomerData = (data: Partial<CustomerFormData>) => {
  const errors: Partial<Record<keyof CustomerFormData, string>> = {}

  // Name validation
  if (!data.name?.trim()) {
    errors.name = 'Name is required'
  } else if (data.name.length < 2) {
    errors.name = 'Name must be at least 2 characters long'
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!emailRegex.test(data.email)) {
    errors.email = 'Please enter a valid email address'
  }

  // Phone validation
  const phoneRegex = /^\+?[\d\s-]{10,}$/
  if (!data.phone?.trim()) {
    errors.phone = 'Phone number is required'
  } else if (!phoneRegex.test(data.phone)) {
    errors.phone = 'Please enter a valid phone number'
  }

  // Location validation
  if (!data.location?.trim()) {
    errors.location = 'Location is required'
  }

  // Status validation
  if (data.status && !['Active', 'Inactive', 'Pending'].includes(data.status)) {
    errors.status = 'Invalid status'
  }

  // Tags validation
  if (data.tags && !Array.isArray(data.tags)) {
    errors.tags = 'Tags must be an array'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const formatPhoneNumber = (phone: string) => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as: +91 XXXXX XXXXX
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  
  return phone
}

export const generateCustomerId = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `C-${timestamp}${random}`.toUpperCase()
}

export const calculateInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
} 