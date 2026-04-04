"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { uploadsImageDisplayUrl } from "@/lib/media-url";
import { apiClient } from "@/lib/api-client";
import {
  useBulkOrdersAdmin,
  isAwaitingBulkReview,
  type AdminBulkOrderRow,
  type BulkPaymentFilter,
} from "@/hooks/useBulkOrdersAdmin";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Filter,
  Loader2,
  Search,
  XCircle,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tab config ───────────────────────────────────────────────────────────────

type TabKey = "all" | "pending" | "verified" | "rejected" | "bilti";

const TAB_TO_STATUS: Record<Exclude<TabKey, "bilti">, BulkPaymentFilter> = {
  all: "",
  pending: "PROOF_SUBMITTED",
  verified: "VERIFIED",
  rejected: "REJECTED",
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Processing" },
  { key: "verified", label: "Confirm" },
  { key: "rejected", label: "On hold" },
  { key: "bilti", label: "Bilti Approval" },
];

// ─── Bilti types (from GET /admin/bulk-orders/bilti) ─────────────────────────

interface BiltiRecord {
  biltiId: string;
  supplier_id: string;
  order_id: string;
  bilti_number: string;
  bilti_image_url: string | null;
  status: "pending" | "verified" | "rejected";
  reason: string | null;
  createdAt: string;
  updatedAt: string;
  bilti_images: string[];
}

// ─── Bilti approval status (legacy — kept for existing bulk order dialog) ─────

type BiltiApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

function getBiltiApprovalStatus(row: AdminBulkOrderRow): BiltiApprovalStatus {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = (row as any).biltiApprovalStatus as
    | BiltiApprovalStatus
    | undefined;
  return raw ?? "PENDING";
}

// ─── PATCH bilti status ───────────────────────────────────────────────────────

async function patchBiltiStatus(
  biltiId: string,
  status: "verified" | "rejected",
  reason?: string,
): Promise<void> {
  await apiClient.patch(`admin/bulk-orders/bilti/${biltiId}/status`, {
    status,
    ...(status === "rejected" && reason ? { reason } : { reason: "" }),
  });
}

// ─── Legacy bilti PATCH (used in bulk order review dialog) ────────────────────

async function patchBiltiApproval(
  orderId: string,
  action: "APPROVED" | "REJECTED",
  reason?: string,
): Promise<void> {
  await apiClient.patch(`admin/bulk-orders/${orderId}`, {
    biltiApprovalStatus: action,
    ...(action === "REJECTED" && reason ? { biltiRejectedReason: reason } : {}),
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BulkOrderReviewPage() {
  const { data, loading, error, fetchOrders, verifyPayment, rejectPayment } =
    useBulkOrdersAdmin();
  const [tab, setTab] = useState<TabKey>("all");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [selected, setSelected] = useState<AdminBulkOrderRow | null>(null);
  const [txRef, setTxRef] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<Set<string>>(new Set());

  // Legacy bilti dialog state (bulk order review)
  const [selectedBilti, setSelectedBilti] = useState<AdminBulkOrderRow | null>(
    null,
  );
  const [biltiRejectReason, setBiltiRejectReason] = useState("");
  const [biltiActionLoading, setBiltiActionLoading] = useState(false);
  const [biltiActionError, setBiltiActionError] = useState<string | null>(null);

  // ── NEW: Bilti tab — dedicated fetch from /admin/bulk-orders/bilti ──────
  const [biltiList, setBiltiList] = useState<BiltiRecord[]>([]);
  const [biltiListLoading, setBiltiListLoading] = useState(false);
  const [biltiListError, setBiltiListError] = useState<string | null>(null);

  // Per-biltiId action state for the bilti tab
  const [biltiRowAction, setBiltiRowAction] = useState<
    Record<
      string,
      {
        mode: null | "reject";
        reason: string;
        loading: boolean;
        error: string | null;
        success: string | null;
      }
    >
  >({});

  // Lightbox for bilti images
  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  // Selected bilti detail dialog
  const [selectedBiltiRecord, setSelectedBiltiRecord] =
    useState<BiltiRecord | null>(null);

  // ── Search debounce ──────────────────────────────────────────────────────
  useEffect(() => {
    const t = window.setTimeout(
      () => setSearchDebounced(searchInput.trim()),
      400,
    );
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [tab, searchDebounced]);

  // ── Fetch bulk orders (existing tabs) ───────────────────────────────────
  const load = useCallback(() => {
    if (tab === "bilti") return Promise.resolve();
    const status: BulkPaymentFilter = TAB_TO_STATUS[tab];
    return fetchOrders({
      paymentStatus: status || undefined,
      page,
      limit: 20,
      search: searchDebounced || undefined,
    });
  }, [fetchOrders, tab, page, searchDebounced]);

  useEffect(() => {
    void load();
  }, [load]);

  // ── Fetch bilti list from dedicated endpoint ─────────────────────────────
  const loadBiltiList = useCallback(async () => {
    if (tab !== "bilti") return;
    setBiltiListLoading(true);
    setBiltiListError(null);
    try {
      const res = await apiClient.get("admin/bulk-orders/bilti");
      console.log("data billti", res.data);
      setBiltiList(res.data ?? []);
    } catch (err) {
      setBiltiListError(
        err instanceof Error ? err.message : "Failed to fetch biltis.",
      );
    } finally {
      setBiltiListLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void loadBiltiList();
  }, [loadBiltiList]);

  useEffect(() => {
    setRowSelection(new Set());
  }, [data?.orders, tab, page, searchDebounced]);

  // ── Bilti row accept/reject ──────────────────────────────────────────────
  const getBiltiRowState = (biltiId: string) =>
    biltiRowAction[biltiId] ?? {
      mode: null,
      reason: "",
      loading: false,
      error: null,
      success: null,
    };

  const setBiltiRowState = (
    biltiId: string,
    patch: Partial<(typeof biltiRowAction)[string]>,
  ) =>
    setBiltiRowAction((prev) => ({
      ...prev,
      [biltiId]: { ...getBiltiRowState(biltiId), ...patch },
    }));

  const handleBiltiAccept = async (biltiId: string) => {
    setBiltiRowState(biltiId, { loading: true, error: null, success: null });
    try {
      await patchBiltiStatus(biltiId, "verified");
      setBiltiList((prev) =>
        prev.map((b) =>
          b.biltiId === biltiId
            ? { ...b, status: "verified", reason: null }
            : b,
        ),
      );
      setBiltiRowState(biltiId, {
        loading: false,
        success: "Bilti verified successfully.",
      });
    } catch (e) {
      setBiltiRowState(biltiId, {
        loading: false,
        error: e instanceof Error ? e.message : "Failed.",
      });
    }
  };

  const handleBiltiRejectClick = (biltiId: string) =>
    setBiltiRowState(biltiId, {
      mode: "reject",
      reason: "",
      error: null,
      success: null,
    });

  const handleBiltiRejectCancel = (biltiId: string) =>
    setBiltiRowState(biltiId, { mode: null, reason: "", error: null });

  const handleBiltiRejectSubmit = async (biltiId: string) => {
    const state = getBiltiRowState(biltiId);
    if (!state.reason.trim()) {
      setBiltiRowState(biltiId, { error: "Please enter a rejection reason." });
      return;
    }
    setBiltiRowState(biltiId, { loading: true, error: null, success: null });
    try {
      await patchBiltiStatus(biltiId, "rejected", state.reason.trim());
      setBiltiList((prev) =>
        prev.map((b) =>
          b.biltiId === biltiId
            ? { ...b, status: "rejected", reason: state.reason.trim() }
            : b,
        ),
      );
      setBiltiRowState(biltiId, {
        loading: false,
        success: "Bilti rejected.",
        mode: null,
        reason: "",
      });
    } catch (e) {
      setBiltiRowState(biltiId, {
        loading: false,
        error: e instanceof Error ? e.message : "Failed.",
      });
    }
  };

  // ── Bulk payment review ──────────────────────────────────────────────────
  const closeDialog = () => {
    setSelected(null);
    setTxRef("");
    setRejectReason("");
    setActionError(null);
  };

  const runReviewMutation = async (fn: () => Promise<unknown>) => {
    setActionError(null);
    setActionLoading(true);
    try {
      await fn();
      closeDialog();
      await load();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  const onVerify = () => {
    if (!selected) return;
    void runReviewMutation(() => verifyPayment(selected.orderId, txRef));
  };

  const onReject = () => {
    if (!selected) return;
    if (rejectReason.trim().length < 3) {
      setActionError("Reason must be at least 3 characters.");
      return;
    }
    void runReviewMutation(() => rejectPayment(selected.orderId, rejectReason));
  };

  // ── Legacy bilti actions (bulk order review dialog) ──────────────────────
  const closeBiltiDialog = () => {
    setSelectedBilti(null);
    setBiltiRejectReason("");
    setBiltiActionError(null);
  };

  const onBiltiApprove = async () => {
    if (!selectedBilti) return;
    setBiltiActionError(null);
    setBiltiActionLoading(true);
    try {
      await patchBiltiApproval(selectedBilti.orderId, "APPROVED");
      closeBiltiDialog();
      await load();
    } catch (e) {
      setBiltiActionError(
        e instanceof Error ? e.message : "Something went wrong",
      );
    } finally {
      setBiltiActionLoading(false);
    }
  };

  const onBiltiReject = async () => {
    if (!selectedBilti) return;
    if (biltiRejectReason.trim().length < 3) {
      setBiltiActionError("Reason must be at least 3 characters.");
      return;
    }
    setBiltiActionError(null);
    setBiltiActionLoading(true);
    try {
      await patchBiltiApproval(
        selectedBilti.orderId,
        "REJECTED",
        biltiRejectReason,
      );
      closeBiltiDialog();
      await load();
    } catch (e) {
      setBiltiActionError(
        e instanceof Error ? e.message : "Something went wrong",
      );
    } finally {
      setBiltiActionLoading(false);
    }
  };

  // ── Pagination ───────────────────────────────────────────────────────────
  const totalPages = data ? Math.max(1, Math.ceil(data.count / data.limit)) : 1;

  const allIdsOnPage = useMemo(
    () => (data?.orders ?? []).map((r) => r.orderId),
    [data?.orders],
  );
  const allSelected =
    allIdsOnPage.length > 0 && allIdsOnPage.every((id) => rowSelection.has(id));

  const toggleAll = () => {
    if (allSelected) {
      setRowSelection(new Set());
      return;
    }
    setRowSelection(new Set(allIdsOnPage));
  };
  const toggleRow = (id: string) => {
    setRowSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── CSV export ───────────────────────────────────────────────────────────
  const exportCsv = () => {
    if (tab === "bilti") {
      if (!biltiList.length) return;
      const headers = [
        "Bilti ID",
        "Order ID",
        "Bilti Number",
        "Status",
        "Reason",
        "Created At",
      ];
      const rows = biltiList.map((b) => [
        b.biltiId,
        b.order_id,
        b.bilti_number,
        b.status,
        b.reason ?? "",
        b.createdAt,
      ]);
      downloadCsv(headers, rows, `bilti-approvals.csv`);
      return;
    }
    if (!data?.orders.length) return;
    const headers = [
      "Invoice",
      "Order ID",
      "Submitted",
      "Customer",
      "Reseller",
      "Amount",
      "Payment type",
      "Fulfillment",
      "Stage",
      "Order status",
      "Payment status",
    ];
    const rows = data.orders.map((r) => [
      r.invoiceNumber ?? "",
      r.orderId,
      r.submittedAt ?? "",
      r.customerName ?? "",
      r.resellerName ?? "",
      String(r.totalPayable ?? ""),
      paymentTypeDisplay(r),
      r.fulfillmentStatus ?? "",
      r.reviewStage ?? "",
      r.orderStatus ?? "",
      r.paymentStatus ?? "",
    ]);
    downloadCsv(headers, rows, `bulk-orders-page-${data.page}.csv`);
  };

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-[1400px] space-y-5 pb-12">
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-3xl w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.images[lightbox.index]}
              alt="bilti"
              className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
            {lightbox.images.length > 1 && (
              <div className="flex justify-center gap-2 mt-3">
                {lightbox.images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      setLightbox((lb) => (lb ? { ...lb, index: i } : null))
                    }
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-colors",
                      i === lightbox.index ? "bg-white" : "bg-white/35",
                    )}
                  />
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute top-2 right-6 text-white text-2xl font-bold hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Bulk orders
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {tab === "bilti"
              ? "Review bilti documents uploaded by suppliers. Verify or reject each bilti record."
              : "Offline payment proofs for B2B bulk orders. Match invoices to screenshots, then approve or reject."}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            title="Filters"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            title="Export this page"
            onClick={exportCsv}
            disabled={
              tab === "bilti" ? !biltiList.length : !data?.orders.length
            }
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={
            tab === "bilti"
              ? "Search bilti number, order id…"
              : "Search name, invoice, order id, transaction ref…"
          }
          className="h-11 rounded-xl border-border bg-card pl-10 shadow-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab === key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:bg-muted/60",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Error (bulk orders) */}
      {error && tab !== "bilti" && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Error (bilti list) */}
      {biltiListError && tab === "bilti" && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {biltiListError}
        </div>
      )}

      {/* Table card */}
      <Card className="overflow-hidden rounded-xl border-border shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              {tab === "bilti" && (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-semibold text-foreground">
                {tab === "bilti" ? "Bilti Records" : "Orders"}
              </span>
            </div>
            {tab === "bilti" ? (
              <span className="text-xs text-muted-foreground">
                {biltiList.length} records
              </span>
            ) : data ? (
              <span className="text-xs text-muted-foreground">
                {data.count} total · page {data.page} of {totalPages}
              </span>
            ) : null}
          </div>

          {/* ── BILTI TAB ─────────────────────────────────────────────────── */}
          {tab === "bilti" ? (
            biltiListLoading ? (
              <div className="flex justify-center py-20 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : biltiList.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No bilti records found.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {biltiList
                  .filter((b) => {
                    if (!searchDebounced) return true;
                    const q = searchDebounced.toLowerCase();
                    return (
                      b.biltiId.toLowerCase().includes(q) ||
                      b.order_id.toLowerCase().includes(q) ||
                      b.bilti_number.toLowerCase().includes(q)
                    );
                  })
                  .map((bilti) => {
                    const aState = getBiltiRowState(bilti.biltiId);
                    const isSettled =
                      bilti.status === "verified" ||
                      bilti.status === "rejected";
                    const imageUrls = bilti.bilti_images.filter((u) =>
                      /\.(png|jpe?g|gif|webp)$/i.test(u),
                    );
                    const fileUrls = bilti.bilti_images.filter(
                      (u) => !/\.(png|jpe?g|gif|webp)$/i.test(u),
                    );

                    const STATUS_BADGE: Record<string, string> = {
                      pending:
                        "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100",
                      verified:
                        "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
                      rejected:
                        "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100",
                    };

                    return (
                      <div key={bilti.biltiId} className="p-4 space-y-3">
                        {/* Row header */}
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex flex-wrap gap-6 text-sm">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                                Bilti ID
                              </p>
                              <p className="font-mono font-semibold text-foreground text-xs">
                                {bilti.biltiId}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                                Order ID
                              </p>
                              <p className="font-mono text-xs text-foreground">
                                {bilti.order_id}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                                Bilti No.
                              </p>
                              <p className="font-semibold text-foreground">
                                {bilti.bilti_number}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                                Date
                              </p>
                              <p className="text-foreground text-xs">
                                {new Date(bilti.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-3 py-0.5 text-xs font-semibold capitalize",
                              STATUS_BADGE[bilti.status] ??
                                "border-border bg-muted text-foreground",
                            )}
                          >
                            {bilti.status}
                          </span>
                        </div>

                        {/* Images */}
                        {bilti.bilti_images.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {imageUrls.map((url, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                  setLightbox({ images: imageUrls, index: idx })
                                }
                                className="w-16 h-16 rounded-lg border border-border overflow-hidden shadow-sm hover:ring-2 hover:ring-primary transition-all focus:outline-none"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={url}
                                  alt={`bilti-img-${idx}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                            {fileUrls.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                              >
                                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                                Attachment {idx + 1}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                            <ImageIcon className="h-3.5 w-3.5" />
                            No images uploaded
                          </p>
                        )}

                        {/* Rejection reason display */}
                        {bilti.status === "rejected" && bilti.reason && (
                          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                            <span className="font-semibold">
                              Rejection reason:
                            </span>{" "}
                            {bilti.reason}
                          </div>
                        )}

                        {/* Success message */}
                        {aState.success && (
                          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            ✓ {aState.success}
                          </p>
                        )}

                        {/* Action area — only when pending */}
                        {!isSettled && (
                          <div className="space-y-2 pt-1">
                            {aState.mode !== "reject" ? (
                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  type="button"
                                  size="sm"
                                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-5"
                                  disabled={aState.loading}
                                  onClick={() =>
                                    handleBiltiAccept(bilti.biltiId)
                                  }
                                >
                                  {aState.loading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                      Verify
                                    </>
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="rounded-full px-5"
                                  disabled={aState.loading}
                                  onClick={() =>
                                    handleBiltiRejectClick(bilti.biltiId)
                                  }
                                >
                                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2 max-w-md">
                                <Label className="text-xs">
                                  Rejection reason{" "}
                                  <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                  rows={2}
                                  value={aState.reason}
                                  onChange={(e) =>
                                    setBiltiRowState(bilti.biltiId, {
                                      reason: e.target.value,
                                      error: null,
                                    })
                                  }
                                  placeholder="e.g. Incorrect bilti number / document unreadable"
                                  className="rounded-lg text-sm"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="rounded-full px-4"
                                    disabled={aState.loading}
                                    onClick={() =>
                                      handleBiltiRejectSubmit(bilti.biltiId)
                                    }
                                  >
                                    {aState.loading ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      "Submit Rejection"
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full px-4"
                                    disabled={aState.loading}
                                    onClick={() =>
                                      handleBiltiRejectCancel(bilti.biltiId)
                                    }
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                            {aState.error && (
                              <p className="flex items-center gap-1 text-xs text-destructive">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                {aState.error}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Settled note */}
                        {isSettled && !aState.success && (
                          <p className="text-xs text-muted-foreground italic">
                            This bilti has been{" "}
                            <span className="font-semibold capitalize">
                              {bilti.status}
                            </span>
                            .
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            )
          ) : (
            /* ── BULK ORDERS TABLE (all existing tabs) ───────────────────── */
            <>
              {loading ? (
                <div className="flex justify-center py-20 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : !data?.orders.length ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  No bulk orders in this view.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                        <TableHead className="w-10 pl-4">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border accent-primary"
                            checked={allSelected}
                            onChange={toggleAll}
                            aria-label="Select all on page"
                          />
                        </TableHead>
                        <TableHead className="min-w-[140px]">Order</TableHead>
                        <TableHead className="min-w-[120px]">Date</TableHead>
                        <TableHead className="min-w-[120px]">Name</TableHead>
                        <TableHead className="min-w-[100px]">Amount</TableHead>
                        <TableHead className="min-w-[90px]">Payment</TableHead>
                        <TableHead className="min-w-[110px]">
                          Fulfillment
                        </TableHead>
                        <TableHead className="min-w-[100px]">Stage</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[100px] pr-4 text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.orders.map((row) => (
                        <TableRow key={row.orderId} className="border-border">
                          <TableCell className="pl-4 align-top">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-border accent-primary"
                              checked={rowSelection.has(row.orderId)}
                              onChange={() => toggleRow(row.orderId)}
                              aria-label={`Select ${row.invoiceNumber ?? row.orderId}`}
                            />
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="font-mono text-xs font-semibold text-foreground">
                              {row.invoiceNumber ??
                                row.orderId.slice(0, 8) + "…"}
                            </div>
                            <PaymentSubBadge row={row} />
                          </TableCell>
                          <TableCell className="align-top text-sm text-foreground">
                            {formatSubmittedAt(row.submittedAt)}
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="max-w-[180px] truncate text-sm font-medium text-foreground">
                              {row.customerName ?? "—"}
                            </div>
                            {row.resellerName ? (
                              <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
                                <span className="h-1 w-1 rounded-full bg-amber-500" />
                                {truncate(row.resellerName, 22)}
                              </span>
                            ) : null}
                          </TableCell>
                          <TableCell className="align-top text-sm font-medium tabular-nums text-foreground">
                            {formatInr(row.totalPayable)}
                          </TableCell>
                          <TableCell className="align-top">
                            <span className="inline-flex rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                              {paymentTypeDisplay(row)}
                            </span>
                          </TableCell>
                          <TableCell className="align-top">
                            <span className="inline-flex rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
                              {row.fulfillmentStatus ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell className="align-top">
                            <span className="inline-flex rounded-full border border-primary/40 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {row.reviewStage ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell className="align-top">
                            <OrderStatusPill status={row.orderStatus} />
                          </TableCell>
                          <TableCell className="pr-4 text-right align-top">
                            {isAwaitingBulkReview(row) ? (
                              <Button
                                type="button"
                                size="sm"
                                className="rounded-full px-4"
                                onClick={() => setSelected(row)}
                              >
                                Review
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-full px-4"
                                onClick={() => setSelected(row)}
                              >
                                View
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination (bulk orders) */}
              {data && totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 border-t border-border py-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── LEGACY BILTI REVIEW DIALOG (from bulk orders table) ───────────── */}
      <Dialog
        open={!!selectedBilti}
        onOpenChange={(o) => !o && closeBiltiDialog()}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>
              Bilti Review ·{" "}
              {selectedBilti?.invoiceNumber ?? selectedBilti?.orderId}
            </DialogTitle>
          </DialogHeader>
          {selectedBilti &&
            (() => {
              const biltiStatus = getBiltiApprovalStatus(selectedBilti);
              const isPending = biltiStatus === "PENDING";
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const biltiRejectedReason = (selectedBilti as any)
                .biltiRejectedReason as string | undefined;
              return (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <Detail
                      k="Product"
                      v={selectedBilti.productTitle ?? "—"}
                      full
                    />
                    <Detail
                      k="Quantity"
                      v={String(selectedBilti.quantity ?? "—")}
                    />
                    <Detail
                      k="Customer"
                      v={selectedBilti.customerName ?? "—"}
                    />
                    <Detail k="Phone" v={selectedBilti.customerPhone ?? "—"} />
                    <Detail
                      k="Email"
                      v={selectedBilti.customerEmail ?? "—"}
                      full
                    />
                    <Detail
                      k="Reseller"
                      v={selectedBilti.resellerName ?? "—"}
                      full
                    />
                    <Detail
                      k="Amount"
                      v={formatInr(selectedBilti.totalPayable)}
                    />
                    <Detail
                      k="Txn ref"
                      v={selectedBilti.transactionReference ?? "—"}
                    />
                    <Detail
                      k="Delivery"
                      v={selectedBilti.deliveryAddress ?? "—"}
                      full
                    />
                  </div>
                  {selectedBilti.paymentProof?.screenshotUrl && (
                    <div className="space-y-2">
                      <Label>Payment screenshot</Label>
                      <a
                        href={uploadsImageDisplayUrl(
                          selectedBilti.paymentProof.screenshotUrl,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-lg border bg-muted/30"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={uploadsImageDisplayUrl(
                            selectedBilti.paymentProof.screenshotUrl,
                          )}
                          alt="Payment proof"
                          className="max-h-64 w-full object-contain"
                        />
                      </a>
                    </div>
                  )}
                  {biltiStatus === "APPROVED" && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
                      Bilti approved. Dispatch is confirmed.
                    </div>
                  )}
                  {biltiStatus === "REJECTED" && (
                    <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                      <p className="font-semibold text-destructive">
                        Bilti was rejected
                      </p>
                      {biltiRejectedReason && (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Reason:{" "}
                          </span>
                          {biltiRejectedReason}
                        </p>
                      )}
                    </div>
                  )}
                  {isPending && (
                    <div className="space-y-4 border-t pt-3">
                      <Button
                        type="button"
                        className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700"
                        disabled={biltiActionLoading}
                        onClick={onBiltiApprove}
                      >
                        {biltiActionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve bilti
                          </>
                        )}
                      </Button>
                      <div className="space-y-2">
                        <Label htmlFor="bilti-rej">
                          Reject reason{" "}
                          <span className="text-muted-foreground">
                            (required · min 3 chars)
                          </span>
                        </Label>
                        <Textarea
                          id="bilti-rej"
                          value={biltiRejectReason}
                          onChange={(e) => setBiltiRejectReason(e.target.value)}
                          rows={3}
                          placeholder="e.g. Incorrect bilti number / document unreadable"
                          className="rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          className="w-full rounded-full"
                          disabled={biltiActionLoading}
                          onClick={onBiltiReject}
                        >
                          {biltiActionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject bilti
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  {biltiActionError && (
                    <p className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {biltiActionError}
                    </p>
                  )}
                </div>
              );
            })()}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={closeBiltiDialog}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── BULK ORDER REVIEW DIALOG ───────────────────────────────────────── */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>
              Bulk order · {selected?.invoiceNumber ?? selected?.orderId}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <Detail k="Product" v={selected.productTitle ?? "—"} full />
                <Detail k="Quantity" v={String(selected.quantity ?? "—")} />
                <Detail k="Reseller" v={selected.resellerName ?? "—"} full />
                <Detail k="Payment status" v={selected.paymentStatus ?? "—"} />
                <Detail k="Order status" v={selected.orderStatus ?? "—"} />
                <Detail k="Total" v={formatInr(selected.totalPayable)} />
                <Detail k="Txn ref" v={selected.transactionReference ?? "—"} />
                <Detail
                  k="Proof amount"
                  v={
                    selected.paymentProof != null
                      ? formatInr(selected.paymentProof.amount)
                      : "—"
                  }
                />
              </div>
              <Detail k="Delivery" v={selected.deliveryAddress ?? "—"} full />
              <Detail k="Phone" v={selected.customerPhone ?? "—"} />
              <Detail k="Email" v={selected.customerEmail ?? "—"} />
              {selected.paymentProof?.screenshotUrl && (
                <div className="space-y-2">
                  <Label>Payment screenshot</Label>
                  <a
                    href={uploadsImageDisplayUrl(
                      selected.paymentProof.screenshotUrl,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden rounded-lg border bg-muted/30"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadsImageDisplayUrl(
                        selected.paymentProof.screenshotUrl,
                      )}
                      alt="Payment proof"
                      className="max-h-64 w-full object-contain"
                    />
                  </a>
                </div>
              )}
              {selected.paymentStatus === "VERIFIED" && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
                  Payment verified. This bulk order is confirmed and visible to
                  the supplier for fulfillment.
                </div>
              )}
              {selected.paymentStatus === "REJECTED" && (
                <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  <p className="font-semibold text-destructive">
                    Payment proof was rejected
                  </p>
                  {selected.paymentProof?.rejectedReason && (
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Reason:{" "}
                      </span>
                      {selected.paymentProof.rejectedReason}
                    </p>
                  )}
                </div>
              )}
              {selected.paymentStatus === "PROOF_SUBMITTED" &&
                !isAwaitingBulkReview(selected) && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:bg-amber-950/20 dark:text-amber-100">
                    No pending payment proof on this order. Refresh the list or
                    check another tab.
                  </div>
                )}
              {isAwaitingBulkReview(selected) && (
                <div className="space-y-3 border-t pt-3">
                  <div className="space-y-2">
                    <Label htmlFor="tx">
                      Adjust transaction reference (optional)
                    </Label>
                    <Input
                      id="tx"
                      value={txRef}
                      onChange={(e) => setTxRef(e.target.value)}
                      placeholder="If different from buyer entry"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      className="rounded-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={actionLoading}
                      onClick={onVerify}
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve payment
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rej">Reject reason (min 3 chars)</Label>
                    <Textarea
                      id="rej"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      placeholder="e.g. Amount mismatch / unreadable screenshot"
                      className="rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      className="rounded-full"
                      disabled={actionLoading}
                      onClick={onReject}
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject proof
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
              {actionError && (
                <p className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {actionError}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={closeDialog}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function downloadCsv(headers: string[], rows: string[][], filename: string) {
  const esc = (cell: string) => `"${String(cell).replace(/"/g, '""')}"`;
  const body = [headers, ...rows]
    .map((line) => line.map(esc).join(","))
    .join("\n");
  const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function Detail({ k, v, full }: { k: string; v: string; full?: boolean }) {
  return (
    <div className={cn(full && "col-span-2")}>
      <p className="text-xs text-muted-foreground">{k}</p>
      <p className="break-words font-medium">{v}</p>
    </div>
  );
}

function formatInr(v: string | number | null | undefined) {
  const n = Number(v);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(n);
}

function formatSubmittedAt(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${format(d, "do")} ${format(d, "MMM yyyy")} · ${format(d, "h:mm")}${format(d, "a").toLowerCase()}`;
}

function paymentTypeDisplay(row: AdminBulkOrderRow) {
  if (row.paymentType) return row.paymentType;
  const m = row.paymentProof?.paymentMode;
  if (!m) return "—";
  return m === "upi" ? "UPI" : m === "bank_transfer" ? "Bank transfer" : m;
}

function truncate(s: string, max: number) {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

function PaymentSubBadge({ row }: { row: AdminBulkOrderRow }) {
  if (isAwaitingBulkReview(row))
    return (
      <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 dark:bg-amber-950/60 dark:text-amber-100">
        Pending proof
      </span>
    );
  if (row.paymentStatus === "VERIFIED")
    return (
      <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100">
        Paid
      </span>
    );
  if (row.paymentStatus === "REJECTED")
    return (
      <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-900 dark:bg-red-950/60 dark:text-red-100">
        Rejected
      </span>
    );
  return (
    <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      {row.paymentStatus ?? "—"}
    </span>
  );
}

function OrderStatusPill({ status }: { status: string | null | undefined }) {
  const s = status ?? "—";
  const cls = /confirmed/i.test(s)
    ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
    : /pending/i.test(s)
      ? "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
      : "border-border bg-muted/40 text-foreground";
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cls,
      )}
    >
      {s}
    </span>
  );
}

function BiltiStatusPill({ status }: { status: BiltiApprovalStatus }) {
  const map: Record<BiltiApprovalStatus, { label: string; cls: string }> = {
    PENDING: {
      label: "Pending",
      cls: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100",
    },
    APPROVED: {
      label: "Approved",
      cls: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
    },
    REJECTED: {
      label: "Rejected",
      cls: "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100",
    },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cls,
      )}
    >
      {label}
    </span>
  );
}
