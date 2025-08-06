  import { Customer, CustomerFormData, CustomerStats, Booking } from "../app/types/customer";

  const API_URL = "https://openbacken-production.up.railway.app/";

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken");
    }
    return null;
  };

  const handleResponse = async (response: Response) => {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Something went wrong");
    }
    return response.json();
  };

  export const CustomerService = {
    getAllCustomers: async (): Promise<Customer[]> => {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },

    getCustomer: async (id: string): Promise<Customer> => {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/customers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },

    createCustomer: async (formData: FormData): Promise<Customer> => {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/customers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      return handleResponse(response);
    },

    updateCustomer: async (id: string, formData: FormData): Promise<Customer> => {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/customers/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      return handleResponse(response);
    },

    deleteCustomer: async (id: string): Promise<void> => {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/customers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },

    getCustomerBookings: async (id: string): Promise<Booking[]> => {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/customers/${id}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },

    sendEmail: async (id: string, subject: string, message: string): Promise<void> => {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/customers/${id}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, message }),
      });
      return handleResponse(response);
    },

    getCustomerStats: async (): Promise<CustomerStats> => {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/customers/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },

    searchCustomers: async (query: string): Promise<Customer[]> => {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/customers/search?q=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },

    filterCustomers: async (filters: {
      status?: string;
      location?: string;
      dateRange?: { from: Date; to: Date };
    }): Promise<Customer[]> => {
      const token = getAuthToken();
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.location) queryParams.append("location", filters.location);
      if (filters.dateRange) {
        queryParams.append("from", filters.dateRange.from.toISOString());
        queryParams.append("to", filters.dateRange.to.toISOString());
      }

      const response = await fetch(`${API_URL}/api/customers/filter?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },
  }; 