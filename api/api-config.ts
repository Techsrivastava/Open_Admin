// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://openbacken-production.up.railway.app/api"

export const getApiUrl = () => {
  return API_URL
}

export default API_URL
