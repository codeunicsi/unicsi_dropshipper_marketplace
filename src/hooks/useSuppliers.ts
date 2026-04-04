"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

interface Supplier {
  supplier_id: string
  name: string
  email: string
  // ... other fields
}

// Get all suppliers
export const useSuppliers = () => {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: () => apiClient.get("admin/get-all-suppliers"),
  })
}

export const useKYCVerifications = () => {
  return useQuery({
    queryKey: ["kyc-verifications"],
    queryFn: () => apiClient.get("admin/get-all-kyc-verifications"),
  })
}

// Get single supplier
export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: ["supplier", id],
    queryFn: () => apiClient.get(`/admin/get-supplier/${id}`),
    enabled: !!id, // Only run if id exists
  })
}

// Create supplier
export const useCreateSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Supplier>) =>
      apiClient.post("/admin/create-supplier", data),
    onSuccess: () => {
      // Refetch suppliers list
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
    },
  })
}

// Update supplier
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Supplier> }) =>
      apiClient.put(`/admin/update-supplier/${id}`, data),
    onSuccess: (_, variables) => {
      // Refetch both the list and the specific supplier
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
      queryClient.invalidateQueries({ queryKey: ["supplier", variables.id] })
    },
  })
}

// Delete supplier
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`admin/suppliers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
    },
  })
}

export const useBlockSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.patch(`admin/suppliers/${id}/block`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
    },
  })
}