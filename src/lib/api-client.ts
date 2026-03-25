import { formatApiErrorBody } from './api-error'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/'

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    const data = await parseJsonSafe(response);
    if (!response.ok) {
      throw new Error(formatApiErrorBody(data) || response.statusText)
    }
    return data;
  },

  post: async (endpoint: string, data: any) => {
    const { body, headers } = buildBodyAndHeaders(data);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers,
      body,
    });

    const responseData = await parseJsonSafe(response);
    if (!response.ok) {
      const message = extractErrorMessage(
        responseData,
        `Request failed (${response.status})`,
      );
      throw new Error(message);
    }

    return responseData;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers,
      body,
    });

    const responseData = await parseJsonSafe(response);
    if (!response.ok) {
      const message = extractErrorMessage(
        responseData,
        `Request failed (${response.status})`,
      );
      throw new Error(message);
    }

    return responseData;
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
    const { body, headers } = buildBodyAndHeaders(data);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const resData = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(formatApiErrorBody(resData) || 'Failed to update')
    }
    return resData
  },

  patch: async (endpoint: string, data?: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data !== undefined ? JSON.stringify(data) : undefined,
    })
    const resData = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(formatApiErrorBody(resData) || 'Request failed')
    }
    return resData
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseData = await parseJsonSafe(response);
    if (!response.ok) {
      const message = extractErrorMessage(
        responseData,
        `Request failed (${response.status})`,
      );
      throw new Error(message);
    }

    return responseData;
  },
};
    })
    
    const resData = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(formatApiErrorBody(resData) || 'Failed to delete')
    }
    return resData
  },
}

