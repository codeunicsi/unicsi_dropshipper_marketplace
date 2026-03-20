const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1/";

const parseJsonSafe = async (response: Response) => {
  return response.json().catch(() => ({}));
};

const extractErrorMessage = (data: any, fallback: string) => {
  if (!data || typeof data !== "object") return fallback;

  if (typeof data.message === "string" && data.message.trim())
    return data.message;
  if (typeof data.error === "string" && data.error.trim()) return data.error;
  if (typeof data.detail === "string" && data.detail.trim()) return data.detail;
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const firstError = data.errors[0];
    if (typeof firstError === "string") return firstError;
    if (firstError && typeof firstError.message === "string")
      return firstError.message;
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
