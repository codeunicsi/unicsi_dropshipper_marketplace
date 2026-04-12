"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export type AdminDropshipperRow = {
  reseller_id: string
  user_id: string | null
  status: "active" | "blocked"
  rto_score?: number
  user?: {
    user_id: string
    name: string
    email: string
    phone_number?: string | null
    role: string
    status: string
  } | null
}

type GetAllResellersResponse = {
  success?: boolean
  message?: string
  data?: AdminDropshipperRow[]
  count?: number
}

export function useAdminDropshippers() {
  return useQuery({
    queryKey: ["admin-dropshippers"],
    queryFn: async () => {
      const res = (await apiClient.get(
        "admin/get-all-resellers",
      )) as GetAllResellersResponse
      if (res.success === false) {
        throw new Error(
          typeof res.message === "string"
            ? res.message
            : "Failed to load dropshippers",
        )
      }
      if (!Array.isArray(res.data)) {
        throw new Error("Invalid response from server")
      }
      return res
    },
  })
}

export function useUpdateDropshipperStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      resellerId,
      status,
    }: {
      resellerId: string
      status: "active" | "blocked"
    }) =>
      apiClient.patch(`admin/resellers/${resellerId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dropshippers"] })
    },
  })
}
