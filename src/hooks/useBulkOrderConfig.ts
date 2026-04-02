"use client";

import { useCallback, useState } from "react";
import { apiClient } from "@/lib/api-client";

const CONFIG_PATH = "admin/config/bulk-order";

export type BulkOrderRole = "CUSTOMER" | "RESELLER" | "SUPPLIER";

export interface BulkOrderConfigPayload {
  defaultMarginPerPiece: number;
  allowRoles: BulkOrderRole[];
  statusFlow: {
    pendingPayment: string;
    confirmed: string;
    shipped: string;
    delivered: string;
  };
  paymentAccount: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName: string;
    upiId?: string;
  };
  settlement: {
    cycle: "daily" | "weekly" | "biweekly" | "monthly";
    dayOfWeek?: number;
  };
}

export const defaultBulkOrderConfig = (): BulkOrderConfigPayload => ({
  defaultMarginPerPiece: 0,
  allowRoles: ["RESELLER", "CUSTOMER"],
  statusFlow: {
    pendingPayment: "Pending Payment",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
  },
  paymentAccount: {
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    upiId: "",
  },
  settlement: {
    cycle: "weekly",
  },
});

export function useBulkOrderConfig() {
  const [config, setConfig] = useState<BulkOrderConfigPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(CONFIG_PATH);
      const raw = res?.data;
      if (raw && typeof raw === "object") {
        setConfig(raw as BulkOrderConfigPayload);
      } else {
        setConfig(null);
      }
      return raw;
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to load bulk order config";
      setError(msg);
      setConfig(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConfig = useCallback(async (payload: BulkOrderConfigPayload) => {
    setError(null);
    const body = {
      ...payload,
      paymentAccount: {
        ...payload.paymentAccount,
        upiId: payload.paymentAccount.upiId?.trim() || undefined,
      },
      settlement: {
        cycle: payload.settlement.cycle,
        ...(typeof payload.settlement.dayOfWeek === "number" &&
        !Number.isNaN(payload.settlement.dayOfWeek)
          ? { dayOfWeek: payload.settlement.dayOfWeek }
          : {}),
      },
    };
    const res = await apiClient.put(CONFIG_PATH, body);
    const next = res?.data;
    if (next && typeof next === "object") {
      setConfig(next as BulkOrderConfigPayload);
    }
    return next;
  }, []);

  const createConfig = useCallback(async (payload: BulkOrderConfigPayload) => {
    setError(null);

    const body = {
      ...payload,
      paymentAccount: {
        ...payload.paymentAccount,
        upiId: payload.paymentAccount.upiId?.trim() || undefined,
      },
      settlement: {
        cycle: payload.settlement.cycle,
        ...(typeof payload.settlement.dayOfWeek === "number" &&
        !Number.isNaN(payload.settlement.dayOfWeek)
          ? { dayOfWeek: payload.settlement.dayOfWeek }
          : {}),
      },
    };

    try {
      const res = await apiClient.post(CONFIG_PATH, body);
      const next = res?.data;

      if (next && typeof next === "object") {
        setConfig(next as BulkOrderConfigPayload);
      }

      return next;
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to create bulk order config";
      setError(msg);
      return null;
    }
  }, []);

  return { config, loading, error, fetchConfig, saveConfig, createConfig };
}
