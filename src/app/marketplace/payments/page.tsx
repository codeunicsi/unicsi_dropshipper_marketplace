"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Column, DataTable } from "@/components/ui/data-table";
import { DateDropdown } from "@/components/ui/date-dropdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconDropdown } from "@/components/ui/icon-dropdown";
import { apiClient } from "@/lib/api-client";

import {
  BadgeIndianRupee,
  Download,
  IndianRupeeIcon,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

type SettlementKey = "cleared" | "outstanding";

type PaymentRow = {
  paymentDate: string;
  day: string;
  paymentCycle: string;
  transactionId: string;
  amount: number;
  id: string;
  settlementStatus: SettlementKey;
  settlementLabel: string;
};

type PaymentsListResponse = {
  success: boolean;
  data: Array<{
    id: string;
    payment_date: string | null;
    day: string | null;
    payment_cycle: string | null;
    transaction_id: string | null;
    amount: number;
    settlement_status?: string;
    settlement_label?: string;
  }>;
  pagination: { page: number; total_pages: number };
};

type PaymentsSummaryResponse = {
  success: boolean;
  total_payment: number;
  outstanding: number;
};

type PaymentDetailResponse = {
  success: boolean;
  data: {
    id: string;
    order_id?: string;
    invoice_number?: string | null;
    order_status?: string | null;
    payment_date?: string | null;
    day?: string | null;
    payment_cycle?: string | null;
    transaction_id?: string | null;
    amount: number;
    status?: string | null;
    settlement_status?: string;
    settlement_label?: string;
    method?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    payment_proof_url?: string | null;
  };
};

function statusBadgeVariant(
  key: SettlementKey,
): "default" | "secondary" | "destructive" | "outline" {
  if (key === "cleared") return "secondary";
  return "outline";
}

function normalizeSettlementKey(raw?: string | null): SettlementKey {
  const k = (raw || "").toLowerCase();
  if (k === "cleared") return "cleared";
  return "outstanding";
}

const PaymentsPage = () => {
  const [transactionQuery, setTransactionQuery] = useState("");
  const [submittedTxnQuery, setSubmittedTxnQuery] = useState("");
  const [paymentCycle, setPaymentCycle] = useState<string>("");
  const [settlementFilter, setSettlementFilter] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<Date | undefined>();

  const [statementOpen, setStatementOpen] = useState(false);
  const [statementPaymentId, setStatementPaymentId] = useState<string | null>(
    null,
  );

  const dateIso = paymentDate ? format(paymentDate, "yyyy-MM-dd") : "";

  const listQueryKey = useMemo(
    () =>
      [
        "dropshipper-payments",
        paymentCycle,
        submittedTxnQuery,
        dateIso,
        settlementFilter,
      ] as const,
    [paymentCycle, submittedTxnQuery, dateIso, settlementFilter],
  );

  const summaryQuery = useQuery({
    queryKey: ["dropshipper-payments-summary"],
    queryFn: async () =>
      (await apiClient.get(
        "dropshipper/payments/summary",
      )) as PaymentsSummaryResponse,
    retry: false,
  });

  const paymentsQuery = useQuery({
    queryKey: listQueryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "100");
      if (submittedTxnQuery) params.set("transaction_id", submittedTxnQuery);
      if (paymentCycle) params.set("payment_cycle", paymentCycle);
      if (settlementFilter)
        params.set("settlement_status", settlementFilter);
      if (dateIso) {
        params.set("start_date", dateIso);
        params.set("end_date", dateIso);
      }
      return (await apiClient.get(
        `dropshipper/payments?${params.toString()}`,
      )) as PaymentsListResponse;
    },
    retry: false,
  });

  const paymentDetailQuery = useQuery({
    queryKey: ["dropshipper-payment-detail", statementPaymentId],
    queryFn: async () =>
      (await apiClient.get(
        `dropshipper/payments/${statementPaymentId}`,
      )) as PaymentDetailResponse,
    enabled: statementOpen && Boolean(statementPaymentId),
    retry: false,
  });

  const payments: PaymentRow[] = useMemo(() => {
    const rows = paymentsQuery.data?.data ?? [];
    return rows.map((r) => {
      const settlementStatus = normalizeSettlementKey(r.settlement_status);
      return {
        id: r.id,
        paymentDate: r.payment_date ?? "—",
        day: r.day ?? "—",
        paymentCycle: r.payment_cycle ?? "—",
        transactionId: r.transaction_id ?? "—",
        amount: Number(r.amount ?? 0),
        settlementStatus,
        settlementLabel:
          settlementStatus === "cleared" ? "Cleared" : "Outstanding",
      };
    });
  }, [paymentsQuery.data]);

  const filteredSubtotal = useMemo(
    () => payments.reduce((sum, r) => sum + r.amount, 0),
    [payments],
  );

  const hasTableFilters = Boolean(
    paymentCycle || submittedTxnQuery || dateIso || settlementFilter,
  );

  const settlementFilterLabel =
    settlementFilter === "cleared"
      ? "Cleared"
      : settlementFilter
        ? "Outstanding"
        : "All statuses";

  const openStatement = useCallback((paymentId: string) => {
    setStatementPaymentId(paymentId);
    setStatementOpen(true);
  }, []);

  const handleDownloadSheet = useCallback(async (paymentId: string) => {
    try {
      const res = (await apiClient.get(
        `dropshipper/payments/${paymentId}`,
      )) as PaymentDetailResponse;
      const url = res.data?.payment_proof_url;
      if (!url) {
        window.alert(
          "No payment proof file is available for this payment yet.",
        );
        return;
      }
      const fileRes = await fetch(url, { method: "GET", credentials: "omit" });
      if (!fileRes.ok) {
        const ct = fileRes.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          try {
            const j = (await fileRes.json()) as { message?: string };
            window.alert(j.message || "File not found.");
          } catch {
            window.alert("Payment proof file could not be downloaded.");
          }
        } else {
          window.alert("Payment proof file could not be downloaded.");
        }
        return;
      }
      const blob = await fileRes.blob();
      const pathPart = url.split("?")[0] || "";
      const ext = pathPart.includes(".")
        ? pathPart.split(".").pop() || "png"
        : "png";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `payment-proof-${paymentId.slice(0, 8)}.${ext}`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : "Could not load payment details.",
      );
    }
  }, []);

  const columns: Column<PaymentRow>[] = useMemo(
    () => [
      { header: "Payment Date", accessor: "paymentDate" },
      { header: "Day", accessor: "day" },
      { header: "Payment Cycle", accessor: "paymentCycle" },
      {
        header: "Status",
        accessor: "settlementLabel",
        cell: (row) => (
          <Badge variant={statusBadgeVariant(row.settlementStatus)}>
            {row.settlementLabel}
          </Badge>
        ),
      },
      {
        header: "Transaction ID",
        accessor: "transactionId",
        cell: (row) => (
          <span className="font-medium text-xs text-blue-600">
            {row.transactionId}
          </span>
        ),
      },
      {
        header: "Amount",
        accessor: "amount",
        cell: (row) => (
          <span className="font-semibold text-green-600">₹{row.amount}</span>
        ),
      },
      {
        header: "Action",
        accessor: "transactionId",
        cell: (row) => (
          <div className="flex flex-wrap gap-1">
            <Button
              type="button"
              size="sm"
              className="text-xs h-7 px-2"
              variant="outline"
              onClick={() => openStatement(row.id)}
            >
              View
            </Button>
            <Button
              type="button"
              size="sm"
              className="text-xs h-7 px-2"
              variant="outline"
              onClick={() => void handleDownloadSheet(row.id)}
            >
              <Download className="size-3.5" />
              Download
            </Button>
          </div>
        ),
      },
    ],
    [handleDownloadSheet, openStatement],
  );

  const handleSearch = () => {
    setSubmittedTxnQuery(transactionQuery.trim());
  };

  const detail = paymentDetailQuery.data?.data;

  return (
    <>
      <div className="flex justify-between">
        <div>
          <p className="text-base text-gray-500">Payments /</p>
          <h1 className="text-2xl text-black font-bold py-1">
            Payment History
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            Summary cards show{" "}
            <span className="font-medium text-gray-700">
              all-time verified payments
            </span>{" "}
            and outstanding. The table follows your filters below.{" "}
            <span className="font-medium text-gray-700">Cleared</span> means
            payment verified;{" "}
            <span className="font-medium text-gray-700">Outstanding</span> means
            not yet cleared on the platform.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-60 h-24 flex gap-2 bg-purple-100 rounded-sm">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-3 my-2">
              <IndianRupeeIcon className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-purple-600 my-3">
              ₹{summaryQuery.data?.total_payment ?? 0}
              <p className="text-xs text-black/90 my-1">
                Total payment till date
              </p>
            </span>
          </div>
          <div className="w-60 h-24 bg-red-100 rounded-sm flex">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-3 my-2">
              <IndianRupeeIcon className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-lg font-bold text-red-600 my-3">
              ₹{summaryQuery.data?.outstanding ?? 0}
              <p className="text-xs text-black/90 my-1">Current outstanding</p>
              <p className="text-xs text-black/90 font-medium my-1">
                (As of Today)
              </p>
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-3 my-6 flex-wrap items-end">
        <div>
          <label className="text-xs">Payment Date</label>
          <div className="flex items-center gap-1">
            <DateDropdown
              label="--Select--"
              value={paymentDate}
              onChange={(d) => setPaymentDate(d)}
            />
            {paymentDate ? (
              <Button
                type="button"
                variant="ghost"
                className="h-8 text-xs px-2"
                onClick={() => setPaymentDate(undefined)}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </div>
        <div>
          <label className="text-xs">Payment Cycle</label>
          <IconDropdown
            icon={BadgeIndianRupee}
            label={paymentCycle ? paymentCycle : "--Select--"}
            className="text-xs font-semibold rounded-sm text-black/80 "
            labelClassName="text-xs bg-white"
            items={[
              { label: "Weekly", onClick: () => setPaymentCycle("weekly") },
              { label: "Monthly", onClick: () => setPaymentCycle("monthly") },
              { label: "Clear", onClick: () => setPaymentCycle("") },
            ]}
          />
        </div>
        <div>
          <label className="text-xs">Status</label>
          <IconDropdown
            icon={BadgeIndianRupee}
            label={settlementFilterLabel}
            className="text-xs font-semibold rounded-sm text-black/80 min-w-[9rem]"
            labelClassName="text-xs bg-white"
            items={[
              { label: "All statuses", onClick: () => setSettlementFilter("") },
              { label: "Cleared", onClick: () => setSettlementFilter("cleared") },
              {
                label: "Outstanding",
                onClick: () => setSettlementFilter("outstanding"),
              },
            ]}
          />
        </div>
        <div>
          <label className="text-xs">Search By Transaction ID</label>
          <div className="flex items-center w-2/3 h-8 border-y bg-white">
            <input
              type="text"
              value={transactionQuery}
              placeholder="Enter Transaction ID here"
              onChange={(e) => setTransactionQuery(e.target.value)}
              className="flex-1 h-8 px-3 text-xs outline-none border"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="h-8 px-2 bg-black text-white flex items-center rounded-xs rounded-r-sm justify-center hover:bg-black/80 transition"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {hasTableFilters ? (
        <p className="text-xs text-gray-600 mb-2">
          Filtered rows total:{" "}
          <span className="font-semibold text-gray-900">
            ₹{filteredSubtotal}
          </span>{" "}
          ({payments.length} record{payments.length === 1 ? "" : "s"})
        </p>
      ) : null}
      <div className="my-6">
        <DataTable
          columns={columns}
          data={payments}
          loading={paymentsQuery.isLoading}
          emptyMessage="You don't have any payment records to show."
        />
      </div>

      <Dialog
        open={statementOpen}
        onOpenChange={(open) => {
          setStatementOpen(open);
          if (!open) setStatementPaymentId(null);
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Payment statement</DialogTitle>
            <DialogDescription>
              Details for this payment record.
            </DialogDescription>
          </DialogHeader>
          {paymentDetailQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : paymentDetailQuery.isError ? (
            <p className="text-sm text-destructive">Could not load statement.</p>
          ) : detail ? (
            <div className="grid gap-2 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={statusBadgeVariant(
                    normalizeSettlementKey(detail.settlement_status),
                  )}
                >
                  {normalizeSettlementKey(detail.settlement_status) === "cleared"
                    ? "Cleared"
                    : "Outstanding"}
                </Badge>
              </div>
              <Row k="Invoice" v={detail.invoice_number} />
              <Row k="Order ID" v={detail.order_id} />
              <Row k="Order status" v={detail.order_status} />
              <Row k="Amount" v={`₹${detail.amount}`} />
              <Row k="Transaction ID" v={detail.transaction_id} />
              <Row k="Payment date" v={detail.payment_date} />
              <Row k="Day" v={detail.day} />
              <Row k="Payment cycle" v={detail.payment_cycle} />
              <Row k="Method" v={detail.method} />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};

function Row({ k, v }: { k: string; v?: string | null }) {
  if (v === undefined || v === null || v === "") return null;
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-1.5 last:border-0">
      <span className="text-muted-foreground shrink-0">{k}</span>
      <span className="font-medium text-right break-all">{v}</span>
    </div>
  );
}

export default PaymentsPage;
