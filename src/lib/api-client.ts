export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1/";

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        (data && typeof data.message === "string" && data.message) ||
        (data && typeof data.error === "string" && data.error) ||
        response.statusText;
      throw new Error(message);
    }
    return data;
  },

  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Something went wrong");
    }

    return response.json();
  },

  /** Multipart POST (do not set Content-Type — browser sets boundary). */
  postForm: async (endpoint: string, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        data && typeof data.message === "string"
          ? data.message
          : response.statusText;
      throw new Error(message);
    }
    return data;
  },

  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update");
    }

    return response.json();
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        (data && typeof data.message === "string" && data.message) ||
        (data && typeof data.error === "string" && data.error) ||
        response.statusText;
      throw new Error(message);
    }

    return data;
  },

  // JSON PATCH — for regular data updates
  patch: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const resData = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        resData && typeof resData.message === "string"
          ? resData.message
          : response.statusText;
      throw new Error(message);
    }
    return resData;
  },

  // Multipart PATCH — for updates that include images/files
  patchForm: async (endpoint: string, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      credentials: "include",
      // No Content-Type header — browser sets it with the correct multipart boundary
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        data && typeof data.message === "string"
          ? data.message
          : response.statusText;
      throw new Error(message);
    }
    return data;
  },
};
