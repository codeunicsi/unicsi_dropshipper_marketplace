export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/'

const parseJsonSafe = async (response: Response) => {
  return response.json().catch(() => ({}));
};

const extractErrorMessage = (data: any, fallback: string) => {
  if (!data || typeof data !== "object") return fallback;

  if (typeof data.message === "string" && data.message.trim())
    return data.message;
  if (typeof data.message === "string" && data.message.trim()) return data.message;
  if (typeof data.error === "string" && data.error.trim()) return data.error;
  if (typeof data.detail === "string" && data.detail.trim()) return data.detail;
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const firstError = data.errors[0];
    if (typeof firstError === "string") return firstError;
    if (firstError && typeof firstError.message === "string")
      return firstError.message;
    if (firstError && typeof firstError.message === "string") return firstError.message;
  }

  return fallback;
};

const buildBodyAndHeaders = (data?: any) => {
  if (data instanceof FormData) {
    return { body: data, headers: {} as Record<string, string> };
  }

  return {
    body: data !== undefined ? JSON.stringify(data) : undefined,
    headers: { "Content-Type": "application/json" },
  };
};

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    const data = await parseJsonSafe(response);
    if (!response.ok) {
      const message = extractErrorMessage(
        data,
        `Request failed (${response.status})`,
      );
      throw new Error(message);
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
      method: "PUT",
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

