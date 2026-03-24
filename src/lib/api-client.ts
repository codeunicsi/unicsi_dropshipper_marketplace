export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/'



export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = (data && typeof data.message === 'string') ? data.message : response.statusText
      throw new Error(message)
    }
    return data
  },

  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Something went wrong')
    }
    
    return response.json()
  },

  /** Multipart POST (do not set Content-Type — browser sets boundary). */
  postForm: async (endpoint: string, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message =
        (data && typeof data.message === 'string') ? data.message : response.statusText
      throw new Error(message)
    }
    return data
  },

  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update')
    }
    
    return response.json()
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = (data && typeof data.message === 'string') ? data.message : response.statusText
      throw new Error(message || 'Failed to delete')
    }

    return data
  },


  postImage: async (endpoint: string, data: any) => {
    const isFormData = data instanceof FormData;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: isFormData
        ? undefined // ✅ Let browser set multipart boundary
        : {
            "Content-Type": "application/json",
          },
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Something went wrong");
    }

    return response.json();
  },
}

