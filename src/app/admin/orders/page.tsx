"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import {
  useAdminShopifyOrders,
  type AdminShopifyOrdersFilters,
} from "@/hooks/useAdminShopifyOrders";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function fulfillmentSummary(
  rows: { supplierId: string; status: string }[] | undefined,
) {
  if (!rows?.length) return "—";
  return rows.map((r) => `${r.status}`).join(" · ");
}

export default function AdminOrdersPage() {
  const [draft, setDraft] = useState<AdminShopifyOrdersFilters>({
    page: 1,
    limit: 20,
  });
  const [applied, setApplied] = useState<AdminShopifyOrdersFilters>({
    page: 1,
    limit: 20,
  });

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminShopifyOrders(applied);

  const totalPages = useMemo(() => {
    if (!data?.total || !data?.limit) return 1;
    return Math.max(1, Math.ceil(data.total / data.limit));
  }, [data?.total, data?.limit]);

  const applyFilters = () => {
    setApplied({ ...draft, page: 1 });
  };

  const goPage = (p: number) => {
    setApplied((prev) => ({ ...prev, page: p }));
    setDraft((prev) => ({ ...prev, page: p }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shopify orders</h1>
          <p className="text-muted-foreground mt-1">
            Same persisted rows as partner &quot;Sync&quot; (with persist). Filter
            UNASSIGNED for orders with no supplier mapping yet.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Shop domain (contains)
            </label>
            <Input
              placeholder="store.myshopify.com"
              value={draft.shop ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, shop: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Reseller user id
            </label>
            <Input
              placeholder="UUID"
              value={draft.resellerUserId ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, resellerUserId: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Supplier id
            </label>
            <Input
              placeholder="UUID"
              value={draft.supplierId ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, supplierId: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Supplier fulfillment status
            </label>
            <Input
              placeholder="PENDING, UNASSIGNED, READY_TO_SHIP…"
              value={draft.fulfillmentStatus ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, fulfillmentStatus: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">
              Search (order #, customer, payload text)
            </label>
            <Input
              placeholder="Search…"
              value={draft.q ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              From (ISO date)
            </label>
            <Input
              type="date"
              value={draft.from ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, from: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              To (ISO date)
            </label>
            <Input
              type="date"
              value={draft.to ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
            />
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-3">
            <Button type="button" onClick={applyFilters}>
              Apply filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>Orders</CardTitle>
          {data != null && (
            <Badge variant="secondary">
              {data.total} total · page {data.page} / {totalPages}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {isError && (
            <p className="mb-4 text-sm text-destructive">
              {(error as Error)?.message ?? "Failed to load"}
            </p>
          )}
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Financial</TableHead>
                    <TableHead>Aggregate</TableHead>
                    <TableHead>Suppliers</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.orders ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-muted-foreground">
                        No orders match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (data?.orders ?? []).map((o) => (
                      <TableRow key={o.persistedOrderId}>
                        <TableCell className="font-medium">
                          {o.shopifyOrderName ?? `#${o.shopifyOrderId}`}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate text-xs">
                          {o.shopDomain}
                        </TableCell>
                        <TableCell className="max-w-[160px] truncate">
                          {o.customerName ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-[160px] truncate text-xs">
                          {o.resellerName ?? o.resellerEmail ?? o.resellerUserId ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {o.financialStatus ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              o.aggregateFulfillmentStatus === "UNASSIGNED"
                                ? "destructive"
                                : "secondary"
                            }
                            className="font-normal"
                          >
                            {o.aggregateFulfillmentStatus ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[220px] truncate text-xs">
                          {fulfillmentSummary(o.suppliers ?? o.fulfillments)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs">
                          {formatDate(o.shopifyCreatedAt ?? undefined)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {data && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={data.page <= 1 || isFetching}
                onClick={() => goPage(data.page - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={data.page >= totalPages || isFetching}
                onClick={() => goPage(data.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
