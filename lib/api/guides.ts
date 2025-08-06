import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://openbacken-production.up.railway.app/api';

export interface Guide {
  guideId: string;
  name: string;
  avatar: string;
  initials: string;
  specialization: string[];
  experience: string;
  languages: string[];
  status: string;
  rating: number;
  totalRatings: number;
  totalBookings: number;
  isVerified: boolean;
  notes: string;
  tags: string[];
  assignedPackages: string[];
}

export interface CreateGuideData {
  name: string;
  initials?: string;
  specialization: string[];
  experience: string;
  languages: string[];
  status: string;
  rating?: number;
  notes?: string;
  tags?: string[];
  avatar?: File;
}

export interface UpdateGuideData extends Partial<CreateGuideData> {}

export const guidesApi = {
  // Get all guides with optional filters
  getAll: async (filters?: {
    status?: string;
    specialization?: string;
    rating?: number;
  }) => {
    const response = await axios.get(`${API_URL}/guides`, { params: filters });
    return response.data;
  },

  // Get guide by ID
  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/guides/${id}`);
    return response.data;
  },

  // Create new guide
  create: async (data: CreateGuideData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await axios.post(`${API_URL}/guides`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update guide
  update: async (id: string, data: UpdateGuideData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await axios.put(`${API_URL}/guides/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete guide
  delete: async (id: string) => {
    const response = await axios.delete(`${API_URL}/guides/${id}`);
    return response.data;
  },

  // Assign package to guide
  assignPackage: async (guideId: string, packageId: string) => {
    const response = await axios.post(`${API_URL}/guides/${guideId}/assign`, {
      packageId,
    });
    return response.data;
  },

  // Remove package from guide
  removePackage: async (guideId: string, packageId: string) => {
    const response = await axios.post(`${API_URL}/guides/${guideId}/remove`, {
      packageId,
    });
    return response.data;
  },

  // Get guide's packages
  getPackages: async (id: string) => {
    const response = await axios.get(`${API_URL}/guides/${id}/packages`);
    return response.data;
  },
}; 