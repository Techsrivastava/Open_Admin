export const API_BASE_URL = 'https://openbacken-production.up.railway.app/'

export const API_ENDPOINTS = {
  packages: {
    list: `${API_BASE_URL}/api/packages`,
    details: (id: string) => `${API_BASE_URL}/api/packages/${id}`,
    create: `${API_BASE_URL}/api/packages`,
    update: (id: string) => `${API_BASE_URL}/api/packages/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/packages/${id}`,
  }
} 