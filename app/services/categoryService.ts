import { Category, CategoryFormData } from '../types/category';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://openbacken-production.up.railway.app/api';

export const categoryService = {
  createCategory: async (data: CategoryFormData): Promise<Category> => {
    const response = await axios.post(`${API_URL}/categories`, data);
    return response.data.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await axios.get(`${API_URL}/categories/${id}`);
    return response.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/categories/${id}`);
  }
}; 