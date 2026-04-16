"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const REPORTS_BASE = "dropshipper/reports";

export type DropshipperReport = {
  id: string;
  user_id: string;
  report_name: string;
  type: string;
  start_date: string;
  end_date: string;
  status: "pending" | "processing" | "completed" | "failed";
  file_format: string;
  download_url: string | null;
  requested_on: string;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
  file_size?: number | null;
  row_count?: number | null;
};

type ListResponse = { success: boolean; data: DropshipperReport[] };
type CreateResponse = { success: boolean; data: DropshipperReport };
type CreateBody = {
  from: string;
  to: string;
  report_name?: string;
  type?: string;
};

export function useDropshipperReportsList() {
  return useQuery({
    queryKey: ["dropshipper-reports"],
    queryFn: async () => {
      const res = (await apiClient.get(REPORTS_BASE)) as ListResponse;
      return res.data;
    },
    refetchInterval: (query) => {
      const data = query.state.data as DropshipperReport[] | undefined;
      if (!data?.length) return false;
      const active = data.some(
        (r) => r.status === "pending" || r.status === "processing",
      );
      return active ? 5000 : false;
    },
  });
}

export function useCreateDropshipperReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateBody) => {
      const res = (await apiClient.post(REPORTS_BASE, body)) as CreateResponse;
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dropshipper-reports"] });
    },
  });
}

export function reportTypeLabel(type: string): string {
  if (type === "bulk_orders_analytics") return "Bulk orders analytics";
  return type.replace(/_/g, " ");
}

export function formatReportStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}
