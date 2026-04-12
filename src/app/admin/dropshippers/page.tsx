"use client"

import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Ban, CheckCircle, RefreshCw } from "lucide-react"
import {
  useAdminDropshippers,
  useUpdateDropshipperStatus,
  type AdminDropshipperRow,
} from "@/hooks/useAdminDropshippers"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function DropshippersCountBadge() {
  const { data, isLoading, isError } = useAdminDropshippers()
  if (isLoading || isError) return null
  const n = data?.count ?? data?.data?.length ?? 0
  return (
    <Badge variant="secondary" className="w-fit shrink-0">
      {n} {n === 1 ? "partner" : "partners"}
    </Badge>
  )
}

function statusBadgeVariant(
  status: string | null | undefined,
): "default" | "secondary" | "destructive" | "outline" {
  const s = (status || "active").toLowerCase()
  if (s === "active") return "default"
  if (s === "blocked") return "destructive"
  return "secondary"
}

function DropshippersTable({ search }: { search: string }) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminDropshippers()
  const statusMutation = useUpdateDropshipperStatus()

  const [blockTarget, setBlockTarget] = useState<AdminDropshipperRow | null>(
    null,
  )
  const [unblockTarget, setUnblockTarget] =
    useState<AdminDropshipperRow | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const rows = useMemo(() => {
    const list = (data?.data ?? []) as AdminDropshipperRow[]
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter((r) => {
      const name = r.user?.name?.toLowerCase() ?? ""
      const email = r.user?.email?.toLowerCase() ?? ""
      const phone = (r.user?.phone_number ?? "").toLowerCase()
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        r.reseller_id.toLowerCase().includes(q)
      )
    })
  }, [data?.data, search])

  const runBlock = async () => {
    if (!blockTarget) return
    setActionError(null)
    try {
      await statusMutation.mutateAsync({
        resellerId: blockTarget.reseller_id,
        status: "blocked",
      })
      setBlockTarget(null)
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Failed to block dropshipper",
      )
    }
  }

  const runUnblock = async () => {
    if (!unblockTarget) return
    setActionError(null)
    try {
      await statusMutation.mutateAsync({
        resellerId: unblockTarget.reseller_id,
        status: "active",
      })
      setUnblockTarget(null)
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Failed to unblock dropshipper",
      )
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-6 text-center space-y-3">
        <p className="text-sm text-destructive font-medium">
          Could not load dropshippers from the server.
        </p>
        <p className="text-xs text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
          />
          Retry
        </Button>
      </div>
    )
  }

  if (!rows.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>
          {search.trim()
            ? "No dropshippers match your search"
            : "No dropshippers found"}
        </p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>RTO score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const isBlocked = row.status === "blocked"
            const name = row.user?.name ?? "—"
            const email = row.user?.email ?? "—"
            const phone = row.user?.phone_number ?? "—"
            return (
              <TableRow key={row.reseller_id}>
                <TableCell className="font-medium">{name}</TableCell>
                <TableCell className="max-w-[220px] [overflow-wrap:anywhere]">
                  {email}
                </TableCell>
                <TableCell>{phone}</TableCell>
                <TableCell>{row.rto_score ?? 0}</TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(row.status)}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Open actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        disabled={isBlocked || statusMutation.isPending}
                        onClick={() => {
                          setActionError(null)
                          setBlockTarget(row)
                        }}
                        className="gap-2"
                      >
                        <Ban className="h-4 w-4" />
                        Block
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!isBlocked || statusMutation.isPending}
                        onClick={() => {
                          setActionError(null)
                          setUnblockTarget(row)
                        }}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Unblock
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!blockTarget}
        onOpenChange={(open) => {
          if (!open) {
            setBlockTarget(null)
            setActionError(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block dropshipper?</AlertDialogTitle>
            <AlertDialogDescription>
              {blockTarget ? (
                <>
                  <span className="font-medium text-foreground">
                    {blockTarget.user?.name ?? "This account"}
                  </span>{" "}
                  will not be able to use partner features while blocked. You can
                  unblock them from this list at any time.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && blockTarget ? (
            <p className="text-sm text-destructive">{actionError}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={statusMutation.isPending}
              onClick={(e) => {
                e.preventDefault()
                void runBlock()
              }}
            >
              {statusMutation.isPending ? "Blocking…" : "Block"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!unblockTarget}
        onOpenChange={(open) => {
          if (!open) {
            setUnblockTarget(null)
            setActionError(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock dropshipper?</AlertDialogTitle>
            <AlertDialogDescription>
              {unblockTarget ? (
                <>
                  Restore access for{" "}
                  <span className="font-medium text-foreground">
                    {unblockTarget.user?.name ?? "this account"}
                  </span>
                  .
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && unblockTarget ? (
            <p className="text-sm text-destructive">{actionError}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={statusMutation.isPending}
              onClick={(e) => {
                e.preventDefault()
                void runUnblock()
              }}
            >
              {statusMutation.isPending ? "Unblocking…" : "Unblock"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default function AdminDropshippersPage() {
  const [search, setSearch] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            All Dropshippers
          </h1>
          <p className="text-muted-foreground">
            Partner accounts (resellers) — block or unblock access
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 bg-input px-3 py-2 rounded-lg max-w-xl">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search loaded dropshippers…"
              className="bg-transparent flex-1 outline-none text-sm min-w-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Dropshippers</CardTitle>
            </div>
            <DropshippersCountBadge />
          </div>
        </CardHeader>
        <CardContent>
          <DropshippersTable search={search} />
        </CardContent>
      </Card>
    </div>
  )
}
