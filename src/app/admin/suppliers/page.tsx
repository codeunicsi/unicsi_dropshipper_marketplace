'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, MoreHorizontal, Ban, Trash2 } from 'lucide-react'
import { Suspense } from 'react'
import { useSuppliers, useDeleteSupplier, useBlockSupplier } from '@/hooks/useSuppliers'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type SupplierRow = {
  supplier_id: string
  name: string
  email: string
  number?: string | null
  account_status?: string | null
}

function statusBadgeVariant(
  status: string | null | undefined,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const s = (status || 'pending').toLowerCase()
  if (s === 'active') return 'default'
  if (s === 'blocked') return 'destructive'
  return 'secondary'
}

function SuppliersTable() {
  const { data: suppliers, isLoading } = useSuppliers()
  const deleteMutation = useDeleteSupplier()
  const blockMutation = useBlockSupplier()

  const [blockTarget, setBlockTarget] = useState<SupplierRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SupplierRow | null>(null)
  const [blockError, setBlockError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const runBlock = async () => {
    if (!blockTarget) return
    setBlockError(null)
    try {
      await blockMutation.mutateAsync(blockTarget.supplier_id)
      setBlockTarget(null)
    } catch (e) {
      setBlockError(e instanceof Error ? e.message : 'Failed to block supplier')
    }
  }

  const runDelete = async () => {
    if (!deleteTarget) return
    setDeleteError(null)
    try {
      await deleteMutation.mutateAsync(deleteTarget.supplier_id)
      setDeleteTarget(null)
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Failed to delete supplier')
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

  if (!suppliers?.data || suppliers?.data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No suppliers found</p>
      </div>
    )
  }

  const rows = suppliers.data as SupplierRow[]

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((supplier) => {
            const isBlocked = supplier.account_status === 'blocked'
            return (
              <TableRow key={supplier.supplier_id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell className="max-w-[220px] [overflow-wrap:anywhere]">{supplier.email}</TableCell>
                <TableCell>{supplier.number || '—'}</TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(supplier.account_status)}>
                    {supplier.account_status || 'pending'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Open actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        disabled={isBlocked || blockMutation.isPending}
                        onClick={() => {
                          setBlockError(null)
                          setBlockTarget(supplier)
                        }}
                        className="gap-2"
                      >
                        <Ban className="h-4 w-4" />
                        Block supplier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          setDeleteError(null)
                          setDeleteTarget(supplier)
                        }}
                        variant="destructive"
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
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
            setBlockError(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block supplier?</AlertDialogTitle>
            <AlertDialogDescription>
              {blockTarget ? (
                <>
                  <span className="font-medium text-foreground">{blockTarget.name}</span> will not be able
                  to use the supplier account while blocked. You can contact support to reverse this if
                  needed.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {blockError && blockTarget ? <p className="text-sm text-destructive">{blockError}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={blockMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={blockMutation.isPending}
              onClick={(e) => {
                e.preventDefault()
                void runBlock()
              }}
            >
              {blockMutation.isPending ? 'Blocking…' : 'Block supplier'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
            setDeleteError(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete supplier permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? (
                <>
                  This will remove <span className="font-medium text-foreground">{deleteTarget.name}</span>{' '}
                  from the database. If they have products or linked records, deletion may fail — use
                  &quot;Block supplier&quot; instead.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && deleteTarget ? <p className="text-sm text-destructive">{deleteError}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault()
                void runDelete()
              }}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default function SuppliersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Suppliers</h1>
          <p className="text-muted-foreground">Manage and monitor all supplier accounts</p>
        </div>
        <Button className="my-button hover:my-button">
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1 flex items-center gap-2 bg-input px-3 py-2 rounded-lg">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search suppliers..."
              className="bg-transparent flex-1 outline-none text-sm"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suppliers List</CardTitle>
          <CardDescription>Showing your supplier accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading suppliers...</div>}>
            <SuppliersTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
