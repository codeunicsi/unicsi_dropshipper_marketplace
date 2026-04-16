"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronsUpDown,
  Download,
  Info,
  Search,
  Settings2,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderTrendsChart } from "./OrderTrendsChart";
import { MarginPctChart } from "./MarginPctChart";
import { useUser } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import {
  useDropshipperOrderAnalytics,
  resolveOrderAnalyticsRange,
  getPresetOrderAnalyticsRange,
  validateOrderAnalyticsRange,
  computeRoposoStyleKpis,
  type OrderAnalyticsByStatusRow,
  type OrderAnalyticsRangePreset,
  type OrderAnalyticsRangeState,
  type RoposoStyleKpis,
} from "@/hooks/useDropshipperOrderAnalytics";
import { cn } from "@/lib/utils";

const RANGE_OPTIONS: { value: OrderAnalyticsRangePreset; label: string }[] = [
  { value: 7, label: "7d" },
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
];

const formatInr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

function formatRangePill(from: string, to: string) {
  const fmt = (iso: string) =>
    new Date(`${iso}T12:00:00.000Z`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  return `${fmt(from)} – ${fmt(to)}`;
}

/** Display hostname from User.shopify_store (URL or bare domain) — backend OAuth value only. */
function shopifyStoreHostname(raw: string | null | undefined): string | null {
  const s = raw?.trim();
  if (!s) return null;
  try {
    const u = /^https?:\/\//i.test(s) ? new URL(s) : new URL(`https://${s}`);
    const h = u.hostname.replace(/^www\./i, "");
    return h || null;
  } catch {
    return s.length > 0 ? s : null;
  }
}

type OrderStatusFilterBucket = "all" | "confirmed" | "shipped";
type PaymentMethodFilterBucket = "all" | "cod" | "prepaid";

const PENDING_ORDER_STATUSES = new Set([
  "Pending Payment",
  "Pending_Manual_Verification",
  "PENDING",
]);

function orderStatusInBucket(
  orderStatus: string,
  bucket: OrderStatusFilterBucket,
): boolean {
  if (bucket === "all") return true;
  if (bucket === "confirmed") {
    return !PENDING_ORDER_STATUSES.has(orderStatus);
  }
  if (bucket === "shipped") {
    return (
      orderStatus === "SHIPPED" ||
      orderStatus === "Shipped" ||
      orderStatus === "OUT_FOR_DELIVERY"
    );
  }
  return true;
}

function paymentMethodInBucket(
  method: string,
  bucket: PaymentMethodFilterBucket,
): boolean {
  const m = (method || "").toUpperCase();
  if (bucket === "all") return true;
  if (bucket === "cod") {
    return m.includes("COD") || m.includes("CASH");
  }
  if (bucket === "prepaid") {
    if (!m) return true;
    return !m.includes("COD") && !m.includes("CASH");
  }
  return true;
}

function aggregateKpisForStatusSlice(
  rows: OrderAnalyticsByStatusRow[],
  marginPctOfGmvFallback: number,
): RoposoStyleKpis {
  const orderCount = rows.reduce((a, r) => a + r.count, 0);
  const gmv = rows.reduce((a, r) => a + r.gmv, 0);
  return computeRoposoStyleKpis(
    {
      orderCount,
      gmv,
      marginPctOfGmv: marginPctOfGmvFallback,
    },
    rows,
  );
}

function paidLikeCount(
  rows: { paymentStatus: string; count: number }[],
): number {
  return rows
    .filter((r) => /paid|verified|complete|proof/i.test(r.paymentStatus))
    .reduce((a, r) => a + r.count, 0);
}

function exportMasterCsv(params: {
  range: { from: string; to: string };
  byStatus: { orderStatus: string; count: number; gmv: number }[];
  topProducts: {
    title: string;
    orderCount: number;
    units: number;
    gmv: number;
  }[];
  bySupplier: {
    supplierName: string;
    orderCount: number;
    units: number;
    gmv: number;
  }[];
  byPaymentMethod: { paymentMethod: string; count: number; gmv: number }[];
}) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines: string[] = [
    esc(`Unicsi analytics ${params.range.from} to ${params.range.to}`),
    "",
    "Order status",
    ["Status", "Orders", "GMV"].map(esc).join(","),
    ...params.byStatus.map((r) =>
      [r.orderStatus, r.count, r.gmv].map(esc).join(","),
    ),
    "",
    "Payment method",
    ["Method", "Orders", "GMV"].map(esc).join(","),
    ...params.byPaymentMethod.map((r) =>
      [r.paymentMethod, r.count, r.gmv].map(esc).join(","),
    ),
    "",
    "Top products",
    ["Title", "Orders", "Units", "GMV"].map(esc).join(","),
    ...params.topProducts.map((r) =>
      [r.title, r.orderCount, r.units, r.gmv].map(esc).join(","),
    ),
    "",
    "Suppliers",
    ["Supplier", "Orders", "Units", "GMV"].map(esc).join(","),
    ...params.bySupplier.map((r) =>
      [r.supplierName, r.orderCount, r.units, r.gmv].map(esc).join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `unicsi-analytics-${params.range.from}-${params.range.to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function KpiCard({
  title,
  value,
  subPrimary,
  subPrimaryClassName,
  footnote,
  showInfo,
}: {
  title: string;
  value: string;
  subPrimary?: string;
  subPrimaryClassName?: string;
  footnote?: string;
  showInfo?: boolean;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-1 text-xs font-medium text-zinc-500">
        {title}
        {showInfo ? (
          <Info className="h-3.5 w-3.5 text-zinc-400" aria-hidden />
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
        {value}
      </p>
      {subPrimary ? (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            subPrimaryClassName ?? "text-zinc-500",
          )}
        >
          {subPrimary}
        </p>
      ) : null}
      {footnote ? (
        <p className="mt-1 text-[11px] leading-snug text-zinc-400">
          {footnote}
        </p>
      ) : null}
    </div>
  );
}

export default function PartnerDashboardContent() {
  const { data: userRes } = useUser();
  const { data: profileRes } = useProfile();

  const shopifyRaw =
    (userRes as { data?: { shopify_store?: string | null } } | undefined)?.data
      ?.shopify_store ??
    (profileRes as { data?: { shopify_store?: string | null } } | undefined)
      ?.data?.shopify_store;

  const shopHostname = shopifyStoreHostname(shopifyRaw ?? undefined);

  const [rangeState, setRangeState] = useState<OrderAnalyticsRangeState>({
    kind: "preset",
    days: 30,
  });
  const [draftFrom, setDraftFrom] = useState(
    () => getPresetOrderAnalyticsRange(30).from,
  );
  const [draftTo, setDraftTo] = useState(
    () => getPresetOrderAnalyticsRange(30).to,
  );
  const [customError, setCustomError] = useState<string | null>(null);
  const [comparePrior, setComparePrior] = useState(false);
  const [mainTab, setMainTab] = useState<"overall" | "product">("overall");
  const [orderStatusFilter, setOrderStatusFilter] =
    useState<OrderStatusFilterBucket>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] =
    useState<PaymentMethodFilterBucket>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const productSearchInputRef = useRef<HTMLInputElement>(null);

  const appliedRange = useMemo(
    () => resolveOrderAnalyticsRange(rangeState),
    [rangeState],
  );

  const selectPreset = (days: OrderAnalyticsRangePreset) => {
    setRangeState({ kind: "preset", days });
    const r = getPresetOrderAnalyticsRange(days);
    setDraftFrom(r.from);
    setDraftTo(r.to);
    setCustomError(null);
  };

  const applyCustomRange = () => {
    const err = validateOrderAnalyticsRange(draftFrom, draftTo);
    if (err) {
      setCustomError(err);
      return;
    }
    setCustomError(null);
    setRangeState({
      kind: "custom",
      from: draftFrom.trim(),
      to: draftTo.trim(),
    });
  };

  const {
    loading,
    error,
    range,
    roposoKpis,
    roposoComparisonHints,
    comparisonRangeLabel,
    chartRows,
    byStatus,
    byPaymentMethod,
    byPaymentStatus,
    topProducts,
    bySupplier,
    summary,
    alerts,
    reload,
  } = useDropshipperOrderAnalytics(appliedRange, { compare: comparePrior });

  const presetActive = rangeState.kind === "preset" ? rangeState.days : null;

  const filteredByStatus = useMemo(
    () =>
      byStatus.filter((r) =>
        orderStatusInBucket(r.orderStatus, orderStatusFilter),
      ),
    [byStatus, orderStatusFilter],
  );

  const filteredByPaymentMethod = useMemo(
    () =>
      byPaymentMethod.filter((r) =>
        paymentMethodInBucket(r.paymentMethod, paymentMethodFilter),
      ),
    [byPaymentMethod, paymentMethodFilter],
  );

  const filteredTopProducts = useMemo(() => {
    if (productFilter === "all") return topProducts;
    return topProducts.filter((p) => p.productId === productFilter);
  }, [topProducts, productFilter]);

  const productSearchNorm = productSearchQuery.trim().toLowerCase();
  const productOptionsForPicker = useMemo(() => {
    if (!productSearchNorm) return topProducts;
    return topProducts.filter((p) =>
      p.title.toLowerCase().includes(productSearchNorm),
    );
  }, [topProducts, productSearchNorm]);

  const productFilterLabel = useMemo(() => {
    if (productFilter === "all") return "All";
    const p = topProducts.find((x) => x.productId === productFilter);
    return p?.title ?? productFilter;
  }, [productFilter, topProducts]);

  const dominantPayment = useMemo(() => {
    if (!filteredByPaymentMethod.length) return { method: "—", count: 0 };
    const top = [...filteredByPaymentMethod].sort(
      (a, b) => b.count - a.count,
    )[0];
    return { method: top.paymentMethod, count: top.count };
  }, [filteredByPaymentMethod]);

  const kpi = roposoKpis as RoposoStyleKpis | null;

  const displayKpi = useMemo((): RoposoStyleKpis | null => {
    if (!kpi || !summary) return kpi;
    if (orderStatusFilter === "all") return kpi;
    const rows = byStatus.filter((r) =>
      orderStatusInBucket(r.orderStatus, orderStatusFilter),
    );
    return aggregateKpisForStatusSlice(rows, summary.marginPctOfGmv ?? 0);
  }, [kpi, summary, byStatus, orderStatusFilter]);

  const filtersNeutral =
    orderStatusFilter === "all" &&
    paymentMethodFilter === "all" &&
    productFilter === "all";

  const effectiveCompareHints =
    comparePrior && filtersNeutral ? roposoComparisonHints : undefined;

  return (
    <div className="-mx-4 -mt-6 min-h-[calc(100vh-5rem)] bg-zinc-100/90 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Analytics
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600">
              Detailed insights for your bulk orders: GMV, platform margin
              share, delivery outcomes, and RTO — for the period you select
              (UTC).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm">
              <Store className="h-4 w-4 shrink-0 text-zinc-500" />
              {shopHostname ? (
                <span
                  className="max-w-[220px] truncate font-medium text-zinc-900"
                  title={shopHostname}
                >
                  {shopHostname}
                </span>
              ) : (
                <Link
                  href="/marketplace/shopify-store-manager"
                  className="text-xs font-medium text-zinc-900 underline underline-offset-2"
                >
                  Connect Shopify store
                </Link>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="border-zinc-200 bg-white shadow-sm"
              asChild
            >
              <Link href="/marketplace/profile" aria-label="Settings">
                <Settings2 className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="border-b border-zinc-200">
          <div className="flex gap-8">
            <button
              type="button"
              onClick={() => setMainTab("overall")}
              className={cn(
                "border-b-2 pb-2 text-sm font-medium transition-colors",
                mainTab === "overall"
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-800",
              )}
            >
              Overall
            </button>
            <button
              type="button"
              onClick={() => setMainTab("product")}
              className={cn(
                "border-b-2 pb-2 text-sm font-medium transition-colors",
                mainTab === "product"
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-800",
              )}
            >
              Product
            </button>
          </div>
        </div>

        {mainTab === "overall" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-600">
                  Order Status
                </Label>
                <Select
                  value={orderStatusFilter}
                  onValueChange={(v) =>
                    setOrderStatusFilter(v as OrderStatusFilterBucket)
                  }
                >
                  <SelectTrigger className="h-10 w-full border-zinc-200 bg-white font-semibold text-zinc-900 shadow-sm">
                    <SelectValue placeholder="All synced orders" />
                  </SelectTrigger>
                  <SelectContent
                    className="border-zinc-200 bg-white shadow-md"
                    position="popper"
                  >
                    <SelectItem value="all">All synced orders</SelectItem>
                    <SelectItem value="confirmed">Confirmed orders</SelectItem>
                    <SelectItem value="shipped">Shipped orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-600">
                  Payment Method
                </Label>
                <Select
                  value={paymentMethodFilter}
                  onValueChange={(v) =>
                    setPaymentMethodFilter(v as PaymentMethodFilterBucket)
                  }
                >
                  <SelectTrigger className="h-10 w-full border-zinc-200 bg-white font-semibold text-zinc-900 shadow-sm">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent
                    className="border-zinc-200 bg-white shadow-md"
                    position="popper"
                  >
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="cod">COD</SelectItem>
                    <SelectItem value="prepaid">Prepaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-600">
                  Product Name
                </Label>
                <Popover
                  open={productPickerOpen}
                  onOpenChange={(open) => {
                    setProductPickerOpen(open);
                    if (!open) setProductSearchQuery("");
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={productPickerOpen}
                      className="h-10 w-full justify-between border-zinc-200 bg-white px-3 font-semibold text-zinc-900 shadow-sm hover:bg-white"
                    >
                      <span className="line-clamp-1 min-w-0 flex-1 truncate text-left">
                        {productFilterLabel}
                      </span>
                      <ChevronsUpDown
                        className="ml-2 h-4 w-4 shrink-0 opacity-50"
                        aria-hidden
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-[var(--radix-popover-trigger-width)] max-w-[min(100vw-2rem,28rem)] border-zinc-200 p-0 shadow-md"
                    onOpenAutoFocus={(e) => {
                      e.preventDefault();
                      requestAnimationFrame(() =>
                        productSearchInputRef.current?.focus(),
                      );
                    }}
                  >
                    <div className="flex items-center gap-2 border-b border-zinc-200 px-2 py-2">
                      <Search
                        className="h-4 w-4 shrink-0 text-zinc-400"
                        aria-hidden
                      />
                      <Input
                        ref={productSearchInputRef}
                        placeholder="Search products…"
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="h-8 border-0 bg-transparent shadow-none focus-visible:ring-0"
                        autoComplete="off"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                      <button
                        type="button"
                        className={cn(
                          "flex w-full rounded-sm px-2 py-1.5 text-left text-sm text-zinc-900",
                          productFilter === "all"
                            ? "bg-zinc-100 font-medium"
                            : "hover:bg-zinc-50",
                        )}
                        onClick={() => {
                          setProductFilter("all");
                          setProductPickerOpen(false);
                        }}
                      >
                        All
                      </button>
                      {productOptionsForPicker.length === 0 ? (
                        <p className="px-2 py-3 text-center text-xs text-zinc-500">
                          No products match your search
                        </p>
                      ) : (
                        productOptionsForPicker.map((p) => (
                          <button
                            key={p.productId}
                            type="button"
                            className={cn(
                              "flex w-full rounded-sm px-2 py-1.5 text-left text-sm text-zinc-900",
                              productFilter === p.productId
                                ? "bg-zinc-100 font-medium"
                                : "hover:bg-zinc-50",
                            )}
                            onClick={() => {
                              setProductFilter(p.productId);
                              setProductPickerOpen(false);
                            }}
                          >
                            <span className="line-clamp-2">{p.title}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <p className="text-xs italic leading-relaxed text-zinc-500">
              Note: All metrics are based on platform bulk orders only. Date
              range denotes the order creation period (UTC).
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {RANGE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={presetActive === opt.value ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-8 border-zinc-200 bg-white text-xs",
                      presetActive === opt.value &&
                        "border-zinc-900 bg-zinc-900 text-white",
                    )}
                    onClick={() => selectPreset(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
                <div className="flex flex-wrap items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1 shadow-sm">
                  <CalendarDays className="h-4 w-4 text-zinc-500" />
                  <input
                    type="date"
                    className="h-8 border-0 bg-transparent text-xs text-zinc-800 outline-none min-w-0 w-[120px]"
                    value={draftFrom}
                    onChange={(e) => setDraftFrom(e.target.value)}
                  />
                  <span className="text-zinc-400">–</span>
                  <input
                    type="date"
                    className="h-8 border-0 bg-transparent text-xs text-zinc-800 outline-none min-w-0 w-[120px]"
                    value={draftTo}
                    onChange={(e) => setDraftTo(e.target.value)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs"
                    onClick={applyCustomRange}
                  >
                    Apply
                  </Button>
                </div>
                <span className="text-xs text-zinc-500">
                  {formatRangePill(range.from, range.to)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-zinc-300"
                    checked={comparePrior}
                    onChange={(e) => setComparePrior(e.target.checked)}
                  />
                  Compare prior
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 border-zinc-200 bg-white text-xs"
                  disabled={!summary}
                  onClick={() =>
                    summary &&
                    exportMasterCsv({
                      range,
                      byStatus,
                      topProducts,
                      bySupplier,
                      byPaymentMethod,
                    })
                  }
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Export master data
                </Button>
              </div>
            </div>
            {customError ? (
              <p className="text-xs text-red-600">{customError}</p>
            ) : null}
            {comparePrior && comparisonRangeLabel ? (
              <p className="text-xs italic text-zinc-500">
                Prior window (comparison): {comparisonRangeLabel} UTC
              </p>
            ) : null}

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-sm text-red-800">{error}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => void reload()}
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            )}

            {alerts.length > 0 ? (
              <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-950">
                {alerts.map((a, i) => (
                  <p key={i}>
                    <span className="font-medium">{a.title}:</span>{" "}
                    {a.description}
                  </p>
                ))}
              </div>
            ) : null}

            {displayKpi ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <KpiCard
                  title="Synced orders"
                  value={String(displayKpi.bulkOrders)}
                  subPrimary={
                    displayKpi.inProgress > 0
                      ? `In progress ${displayKpi.inProgress}`
                      : "All caught up"
                  }
                  subPrimaryClassName={
                    displayKpi.inProgress > 0
                      ? "text-amber-600"
                      : "text-zinc-500"
                  }
                  footnote={effectiveCompareHints?.[0]}
                />
                <KpiCard
                  title="GMV"
                  value={formatInr(displayKpi.gmv)}
                  subPrimary={`Margin applied: ${displayKpi.marginPctOfGmv.toFixed(1)}%`}
                  footnote={effectiveCompareHints?.[1]}
                />
                <KpiCard
                  title="Delivered %"
                  value={`${displayKpi.deliveredPct.toFixed(1)}%`}
                  subPrimary={`${displayKpi.deliveredCount} order${displayKpi.deliveredCount === 1 ? "" : "s"} delivered`}
                  showInfo
                  footnote={effectiveCompareHints?.[2]}
                />
                <KpiCard
                  title="RTO %"
                  value={`${displayKpi.rtoPct.toFixed(1)}%`}
                  subPrimary={`${displayKpi.rtoCount} order${displayKpi.rtoCount === 1 ? "" : "s"} RTO`}
                  showInfo
                  footnote={effectiveCompareHints?.[3]}
                />
                <KpiCard
                  title="Cancelled %"
                  value={`${displayKpi.cancelledPct.toFixed(1)}%`}
                  subPrimary={`${displayKpi.cancelledCount} order${displayKpi.cancelledCount === 1 ? "" : "s"} cancelled`}
                  showInfo
                  footnote={effectiveCompareHints?.[4]}
                />
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="border-zinc-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold text-zinc-900">
                      Orders & GMV
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Daily trend in this range
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading && !chartRows.length ? (
                    <p className="py-20 text-center text-sm text-zinc-500">
                      Loading chart…
                    </p>
                  ) : (
                    <OrderTrendsChart
                      data={chartRows}
                      legendOrderCount={summary?.orderCount}
                      legendGmv={summary?.gmv}
                    />
                  )}
                </CardContent>
              </Card>
              <Card className="border-zinc-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-zinc-900">
                    Platform margin %
                  </CardTitle>
                  <CardDescription className="text-xs">
                    As a share of GMV by day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading && !chartRows.length ? (
                    <p className="py-20 text-center text-sm text-zinc-500">
                      Loading chart…
                    </p>
                  ) : (
                    <MarginPctChart
                      data={chartRows}
                      periodMarginPct={summary?.marginPctOfGmv ?? 0}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="border-zinc-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-zinc-900">
                    Orders by payment mode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold text-zinc-900">
                    {filteredByPaymentMethod.reduce((a, r) => a + r.count, 0)}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Top: {dominantPayment.method} ({dominantPayment.count})
                  </p>
                </CardContent>
              </Card>
              <Card className="border-zinc-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-zinc-900">
                    Orders by payment status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold text-zinc-900">
                    {paidLikeCount(byPaymentStatus)}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Paid / proof / verified-like statuses
                  </p>
                </CardContent>
              </Card>
              <Card className="border-zinc-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-zinc-900">
                    Delivered orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold text-zinc-900">
                    {displayKpi?.deliveredCount ?? 0}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    In selected date range
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-zinc-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-zinc-900">
                  Orders by status
                </CardTitle>
                <CardDescription className="text-xs">
                  Filtered view (order status filter above)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredByStatus.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    No rows for this filter.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-md border border-zinc-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium text-zinc-600">
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2 text-right">Orders</th>
                          <th className="px-3 py-2 text-right">GMV</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredByStatus.map((row) => (
                          <tr
                            key={row.orderStatus}
                            className="border-b border-zinc-100"
                          >
                            <td className="px-3 py-2 text-zinc-900">
                              {row.orderStatus}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums text-zinc-800">
                              {row.count}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums text-zinc-800">
                              {formatInr(row.gmv)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600">
              Product-level performance for the same date range. Choose a
              product under <span className="font-medium">Product Name</span> on
              the Overall tab to focus one SKU.
            </p>
            <Card className="border-zinc-200 bg-white shadow-sm">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold text-zinc-900">
                    Product analysis
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Showing {filteredTopProducts.length} of {topProducts.length}{" "}
                    products
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={!summary}
                  onClick={() =>
                    summary &&
                    exportMasterCsv({
                      range,
                      byStatus,
                      topProducts,
                      bySupplier,
                      byPaymentMethod,
                    })
                  }
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {filteredTopProducts.length === 0 ? (
                  <p className="py-12 text-center text-sm text-zinc-500">
                    No records found.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-md border border-zinc-200">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium text-zinc-600">
                          <th className="px-3 py-2">Product</th>
                          <th className="px-3 py-2 text-right">Orders</th>
                          <th className="px-3 py-2 text-right">Units</th>
                          <th className="px-3 py-2 text-right">GMV</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTopProducts.map((row) => (
                          <tr
                            key={row.productId}
                            className="border-b border-zinc-100"
                          >
                            <td
                              className="max-w-[240px] truncate px-3 py-2 text-zinc-900"
                              title={row.title}
                            >
                              {row.title}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {row.orderCount}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {row.units}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {formatInr(row.gmv)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-zinc-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-zinc-900">
                  By supplier
                </CardTitle>
                <CardDescription className="text-xs">
                  Share of GMV by supplier
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bySupplier.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    No supplier breakdown.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-md border border-zinc-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium text-zinc-600">
                          <th className="px-3 py-2">Supplier</th>
                          <th className="px-3 py-2 text-right">Orders</th>
                          <th className="px-3 py-2 text-right">Units</th>
                          <th className="px-3 py-2 text-right">GMV</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bySupplier.map((row) => (
                          <tr
                            key={row.supplierId}
                            className="border-b border-zinc-100"
                          >
                            <td className="px-3 py-2 text-zinc-900">
                              {row.supplierName}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {row.orderCount}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {row.units}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {formatInr(row.gmv)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {loading ? (
          <p className="text-center text-xs text-zinc-500">
            Refreshing analytics…
          </p>
        ) : null}
      </div>
    </div>
  );
}
