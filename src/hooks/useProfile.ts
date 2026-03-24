import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const PROFILE_ENDPOINT = "dropshipper/profile/personalDetails";
const BANK_ENDPOINT = "dropshipper/stores/bankAccountDetails";
const GST_ENDPOINT = "dropshipper/stores/gstDetails";

/* ---------------- PROFILE ---------------- */

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiClient.get(PROFILE_ENDPOINT),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.put(PROFILE_ENDPOINT, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
  });
};

/* ---------------- BANK DETAILS ---------------- */

export const useBankDetails = () => {
  return useQuery({
    queryKey: ["bankDetails"],
    queryFn: () => apiClient.get(BANK_ENDPOINT),
  });
};

export const useCreateBankDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.post(BANK_ENDPOINT, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bankDetails"],
      });
    },
  });
};

export const useUpdateBankDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.put(BANK_ENDPOINT, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bankDetails"],
      });
    },
  });
};

/* ---------------- GST DETAILS ---------------- */

export const useGstDetails = () => {
  return useQuery({
    queryKey: ["gstDetails"],
    queryFn: () => apiClient.get(GST_ENDPOINT),
  });
};

export const useCreateGstDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.post(GST_ENDPOINT, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gstDetails"],
      });
    },
  });
};

export const useUpdateGstDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.put(GST_ENDPOINT, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gstDetails"],
      });
    },
  });
};
