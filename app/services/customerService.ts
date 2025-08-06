import type { Customer, CustomerFilters, CustomerStats } from "@/types/customer";

const API_URL = "https://openbacken-production.up.railway.app/";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("adminToken");
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || "Something went wrong");
    } catch {
      throw new Error("Something went wrong");
    }
  }

  // If DELETE request, return success message
  if (response.status === 204) {
    return true; // No content, successful deletion
  }

  try {
    const jsonResponse = await response.json();
    if (jsonResponse?.success === true) {
      // Patch: unwrap data.data if present
      if (jsonResponse.data && jsonResponse.data.data) {
        return jsonResponse.data.data;
      }
      return jsonResponse.data;
    }
    throw new Error(jsonResponse?.message || "API returned an error");
  } catch {
    return response;
  }
};

export const CustomerService = {
  // Get all customers (Admin Only)
  getAllCustomers: async (): Promise<Customer[]> => {
    const response = await fetch(`${API_URL}/api/customers`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  // Get single customer
  getCustomer: async (id: string): Promise<Customer> => {
    const response = await fetch(`${API_URL}/api/customers/${id}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  // Create new customer (Admin Only)
  createCustomer: async (formData: FormData): Promise<Customer> => {
    const response = await fetch(`${API_URL}/api/customers`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      body: formData,
    });
    return handleResponse(response);
  },

  // Update customer (Admin Only)
  updateCustomer: async (id: string, formData: FormData): Promise<Customer> => {
    const response = await fetch(`${API_URL}/api/customers/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      body: formData,
    });
    return handleResponse(response);
  },

  // Delete customer (Admin Only)
  deleteCustomer: async (id: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/api/customers/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  // Update customer status (Admin Only)
  updateStatus: async (id: string, status: string): Promise<Customer> => {
    const response = await fetch(`${API_URL}/api/customers/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },



  


  // Send email to customer (Admin Only)
  sendEmail: async (id: string, content: { subject: string; message: string } | string): Promise<void> => {
    let emailContent = typeof content === "string" ? { subject: "Message from Admin", message: content } : content;

    const response = await fetch(`${API_URL}/api/customers/${id}/email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailContent),
    });
    return handleResponse(response);
  },

 



  // Filter customers (Admin Only)
  filterCustomers: async (filters: Partial<CustomerFilters>): Promise<Customer[]> => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.location) queryParams.append("location", filters.location);
    if (filters.dateRange?.from) queryParams.append("from", filters.dateRange.from.toISOString());
    if (filters.dateRange?.to) queryParams.append("to", filters.dateRange.to.toISOString());

    const response = await fetch(`${API_URL}/api/customers/filter?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },
};
