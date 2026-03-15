'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Loader2, Plus, Link2, Package } from 'lucide-react'
import { useAWB, type AwbRow } from '@/hooks/useAWB'
import { useCourierPartners } from '@/hooks/useCourierPartners'

export default function AWBManagementPage() {
  const { partners } = useCourierPartners(false)
  const {
    list,
    pagination,
    loading,
    error,
    totalCount,
    fetchList,
    generate,
    assign,
    track,
  } = useAWB()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCourierId, setFilterCourierId] = useState('')
  const [generateOpen, setGenerateOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [generateCourierId, setGenerateCourierId] = useState('')
  const [generateCount, setGenerateCount] = useState('5')
  const [generateLoading, setGenerateLoading] = useState(false)
  const [assignAwbNumber, setAssignAwbNumber] = useState('')
  const [assignFulfillmentId, setAssignFulfillmentId] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)
  const [trackQuery, setTrackQuery] = useState('')
  const [trackResult, setTrackResult] = useState<Record<string, unknown> | null>(null)
  const [trackLoading, setTrackLoading] = useState(false)

  useEffect(() => {
    fetchList({ page: 1, limit: 50 })
  }, [fetchList])

  const handleSearch = () => {
    fetchList({
      search: searchQuery.trim() || undefined,
      status: filterStatus || undefined,
      courier_id: filterCourierId || undefined,
      page: 1,
      limit: 50,
    })
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!generateCourierId) return
    const count = Math.min(100, Math.max(1, parseInt(generateCount, 10) || 1))
    setGenerateLoading(true)
    try {
      await generate(generateCourierId, count)
      setGenerateOpen(false)
      fetchList({ page: 1, limit: 50 })
    } finally {
      setGenerateLoading(false)
    }
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignAwbNumber.trim() || !assignFulfillmentId.trim()) return
    setAssignLoading(true)
    try {
      await assign(assignAwbNumber.trim(), assignFulfillmentId.trim())
      setAssignOpen(false)
      setAssignAwbNumber('')
      setAssignFulfillmentId('')
      fetchList({ page: 1, limit: 50 })
    } finally {
      setAssignLoading(false)
    }
  }

  const handleTrack = async () => {
    if (!trackQuery.trim()) return
    setTrackLoading(true)
    setTrackResult(null)
    try {
      const result = await track(trackQuery.trim())
      setTrackResult(result ? (result as Record<string, unknown>) : null)
    } finally {
      setTrackLoading(false)
    }
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default'
      case 'assigned':
        return 'secondary'
      case 'used':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AWB Management</h1>
          <p className="text-muted-foreground">Manage and track air waybills for shipments</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setGenerateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Generate AWB
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Track AWB</CardTitle>
          <CardDescription>Search by AWB number or tracking ID</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap items-end">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-input px-3 py-2 rounded-lg">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Input
              placeholder="AWB number or tracking ID..."
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0"
            />
          </div>
          <Button onClick={handleTrack} disabled={trackLoading || !trackQuery.trim()}>
            {trackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4 mr-2" />}
            Track
          </Button>
        </CardContent>
        {trackResult && (
          <CardContent className="pt-0">
            <div className="p-4 rounded-lg bg-muted text-sm">
              <p><strong>AWB:</strong> {String(trackResult.awb_number ?? '—')}</p>
              <p><strong>Courier:</strong> {String(trackResult.courier_name ?? '—')}</p>
              <p><strong>Status:</strong> {String(trackResult.status ?? '—')}</p>
              {trackResult.assigned_at != null ? (
                <p><strong>Assigned at:</strong> {String(trackResult.assigned_at)}</p>
              ) : null}
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{totalCount}</p>
              <p className="text-sm text-muted-foreground">Total AWBs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AWB List</CardTitle>
          <CardDescription>Filter and search. Assign AWB to a fulfillment from the table.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[180px] space-y-2">
              <Label className="sr-only">Search</Label>
              <Input
                placeholder="Search by AWB number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="sr-only">Status</Label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm min-w-[120px]"
              >
                <option value="">All status</option>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="used">Used</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="sr-only">Courier</Label>
              <select
                value={filterCourierId}
                onChange={(e) => setFilterCourierId(e.target.value)}
                className="flex h-9 min-w-[140px] rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">All couriers</option>
                {partners.map((p) => (
                  <option key={p.courier_id} value={p.courier_id}>{p.name}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleSearch} disabled={loading}>Search</Button>
          </div>

          {loading && list.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : list.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No AWBs. Generate some to get started.</p>
          ) : (
            <div className="border rounded-lg overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>AWB Number</TableHead>
                    <TableHead>Courier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fulfillment ID</TableHead>
                    <TableHead>Assigned at</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((r: AwbRow) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">{r.awb_number}</TableCell>
                      <TableCell>{r.courier?.name ?? r.courier_id}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.fulfillment_id ?? '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {r.assigned_at ? new Date(r.assigned_at).toLocaleString() : '—'}
                      </TableCell>
                      <TableCell>
                        {r.status === 'available' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAssignAwbNumber(r.awb_number)
                              setAssignOpen(true)
                            }}
                          >
                            <Link2 className="w-4 h-4 mr-1" />
                            Assign
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {pagination.total > 0 && (
            <p className="text-sm text-muted-foreground">
              Showing {list.length} of {pagination.total}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate AWB</DialogTitle>
            <DialogDescription>Create new AWB numbers for a courier (stored as available).</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <Label>Courier</Label>
              <select
                value={generateCourierId}
                onChange={(e) => setGenerateCourierId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                required
              >
                <option value="">Select courier</option>
                {partners.map((p) => (
                  <option key={p.courier_id} value={p.courier_id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Count (1–100)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={generateCount}
                onChange={(e) => setGenerateCount(e.target.value)}
              />
            </div>
            <DialogFooter showCloseButton={false}>
              <Button type="button" variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={generateLoading || !generateCourierId}>
                {generateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Generate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign AWB to Fulfillment</DialogTitle>
            <DialogDescription>Link an available AWB to a fulfillment ID.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssign} className="space-y-4">
            <div className="space-y-2">
              <Label>AWB Number</Label>
              <Input
                value={assignAwbNumber}
                onChange={(e) => setAssignAwbNumber(e.target.value)}
                placeholder="e.g. AWB-123..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Fulfillment ID (UUID)</Label>
              <Input
                value={assignFulfillmentId}
                onChange={(e) => setAssignFulfillmentId(e.target.value)}
                placeholder="Fulfillment UUID"
                required
              />
            </div>
            <DialogFooter showCloseButton={false}>
              <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={assignLoading || !assignAwbNumber.trim() || !assignFulfillmentId.trim()}>
                {assignLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Assign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
