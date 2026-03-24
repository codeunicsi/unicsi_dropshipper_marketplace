import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const ADMIN_BANK_ENDPOINT = "dropshipper/admin/bank-details";

export const useAdminBankDetails = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["adminBankDetails"],
    enabled,
    queryFn: () => apiClient.get(ADMIN_BANK_ENDPOINT),
  });
};
