'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Plus, Pencil, Loader2, Calculator, Search, Package, MapPin, Scale, Banknote } from 'lucide-react'
import { useRateCards, type RateCard, type RateCardPayload, type RateZone, type CalculateResult } from '@/hooks/useRateCards'
import { useCourierPartners } from '@/hooks/useCourierPartners'

const ZONES: RateZone[] = ['metro', 'tier1', 'regional', 'remote']

const ZONE_COLORS: Record<RateZone, string> = {
  metro: 'bg-blue-100 text-blue-700 border-blue-200',
  tier1: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  regional: 'bg-amber-100 text-amber-700 border-amber-200',
  remote: 'bg-purple-100 text-purple-700 border-purple-200',
}

const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"

function RateCardForm({
  initial,
  courierId,
  partners,
  onSubmit,
  onCancel,
  loading,
}: {
  initial: Partial<RateCardPayload> | null
  courierId?: string
  partners: { courier_id: string; name: string }[]
  onSubmit: (p: RateCardPayload) => Promise<void>
  onCancel: () => void
  loading: boolean
}) {
  const [selectedCourierId, setSelectedCourierId] = useState(initial?.courier_id ?? courierId ?? '')
  const [zone, setZone] = useState<RateZone>(initial?.zone ?? 'metro')
  const [minKg, setMinKg] = useState(initial?.weight_slab_min_kg?.toString() ?? '0')
  const [maxKg, setMaxKg] = useState(initial?.weight_slab_max_kg?.toString() ?? '1')
  const [prepaid, setPrepaid] = useState(initial?.prepaid_rate?.toString() ?? '')
  const [cod, setCod] = useState(initial?.cod_rate?.toString() ?? '')
  const [err, setErr] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    const cId = initial?.courier_id ?? selectedCourierId ?? courierId
    if (!cId) {
      setErr('Courier is required')
      return
    }
    const min = parseFloat(minKg)
    const max = parseFloat(maxKg)
    const p = parseFloat(prepaid)
    const c = parseFloat(cod)
    if (Number.isNaN(min) || min < 0 || Number.isNaN(max) || max < 0) {
      setErr('Weight slab must be non-negative numbers')
      return
    }
    if (min > max) {
      setErr('Min weight must be <= max weight')
      return
    }
    if (Number.isNaN(p) || p < 0 || Number.isNaN(c) || c < 0) {
      setErr('Rates must be non-negative numbers')
      return
    }
    try {
      await onSubmit({
        courier_id: cId,
        zone,
        weight_slab_min_kg: min,
        weight_slab_max_kg: max,
        prepaid_rate: p,
        cod_rate: c,
      })
      onCancel()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to save')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-4">
        {!initial && (
          <div className="space-y-2 col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Courier Partner</Label>
            <select
              value={selectedCourierId}
              onChange={(e) => setSelectedCourierId(e.target.value)}
              className={selectClass}
            >
              <option value="">Select courier</option>
              {partners.map((p) => (
                <option key={p.courier_id} value={p.courier_id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="space-y-2 col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Destination Zone</Label>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value as RateZone)}
            className={selectClass}
          >
            {ZONES.map((z) => (
              <option key={z} value={z}>{z.toUpperCase()}</option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Min Weight (kg)</Label>
          <Input type="number" step="0.001" value={minKg} onChange={(e) => setMinKg(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Max Weight (kg)</Label>
          <Input type="number" step="0.001" value={maxKg} onChange={(e) => setMaxKg(e.target.value)} />
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Prepaid Rate (₹)</Label>
          <div className="relative">
             <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input className="pl-9" type="number" step="0.01" value={prepaid} onChange={(e) => setPrepaid(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">COD Rate (₹)</Label>
          <div className="relative">
             <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input className="pl-9" type="number" step="0.01" value={cod} onChange={(e) => setCod(e.target.value)} />
          </div>
        </div>
      </div>

      {err && <p className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded">{err}</p>}
      
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading} className="min-w-[100px]">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : initial ? 'Update Card' : 'Create Card'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default function RateCardsPage() {
  const { partners } = useCourierPartners(false)
  const { list, loading, error, fetchList, createRateCard, updateRateCard, calculate } = useRateCards()
  const [filterCourierId, setFilterCourierId] = useState('')
  const [filterZone, setFilterZone] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<RateCard | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [calcCourierId, setCalcCourierId] = useState('')
  const [calcZone, setCalcZone] = useState<RateZone>('metro')
  const [calcWeight, setCalcWeight] = useState('')
  const [calcCod, setCalcCod] = useState(false)
  const [calcPincode, setCalcPincode] = useState('')
  const [calcResult, setCalcResult] = useState<CalculateResult | null>(null)
  const [calcError, setCalcError] = useState<string | null>(null)
  const [calcLoading, setCalcLoading] = useState(false)

  useEffect(() => {
    fetchList({ limit: 300 })
  }, [fetchList])

  const handleSearch = () => {
    fetchList({
      courier_id: filterCourierId || undefined,
      zone: filterZone || undefined,
      limit: 300,
    })
  }

  const handleAdd = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (r: RateCard) => {
    setEditing(r)
    setDialogOpen(true)
  }

  const handleSubmit = async (payload: RateCardPayload) => {
    setFormLoading(true)
    try {
      if (editing) {
        await updateRateCard(editing.id, payload)
      } else {
        await createRateCard(payload)
      }
      setDialogOpen(false)
      handleSearch()
    } finally {
      setFormLoading(false)
    }
  }

  const handleCalculate = async () => {
    if (!calcCourierId || !calcWeight.trim()) return
    const w = parseFloat(calcWeight)
    if (Number.isNaN(w) || w < 0) return
    setCalcLoading(true)
    setCalcResult(null)
    setCalcError(null)
    try {
      const result = await calculate(calcCourierId, calcZone, w, calcCod, calcPincode.trim() || undefined)
      setCalcResult(result ?? null)
    } catch (e) {
      setCalcError(e instanceof Error ? e.message : 'Failed to calculate rate')
    } finally {
      setCalcLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Rate Cards</h1>
          <p className="text-muted-foreground text-lg">Manage logistics pricing and weight slabs.</p>
        </div>
        <Button size="lg" className="shadow-lg shadow-primary/20" onClick={handleAdd}>
          <Plus className="w-5 h-5 mr-2" />
          Add New Slab
        </Button>
      </div>

      {error && <p className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm font-medium">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Calculator */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-2 border-primary/10 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Shipping Estimator
              </CardTitle>
              <CardDescription>Check rates for specific shipments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Courier</Label>
                <select value={calcCourierId} onChange={(e) => setCalcCourierId(e.target.value)} className={selectClass}>
                  <option value="">Select Partner</option>
                  {partners.map((p) => <option key={p.courier_id} value={p.courier_id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Zone</Label>
                  <select value={calcZone} onChange={(e) => setCalcZone(e.target.value as RateZone)} className={selectClass}>
                    {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input type="number" step="0.001" placeholder="0.5" value={calcWeight} onChange={(e) => setCalcWeight(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                <Label htmlFor="calc-cod" className="cursor-pointer font-medium">Cash on Delivery</Label>
                <input type="checkbox" id="calc-cod" checked={calcCod} onChange={(e) => setCalcCod(e.target.checked)} className="h-4 w-4 accent-primary" />
              </div>
              <Button className="w-full" variant="secondary" onClick={handleCalculate} disabled={calcLoading || !calcCourierId || !calcWeight.trim()}>
                {calcLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Calculate Rate"}
              </Button>

              {calcError && <p className="text-xs font-medium text-destructive mt-2 text-center p-2 bg-destructive/5 rounded italic">{calcError}</p>}
              
              {calcResult && (
                <div className="mt-4 p-4 rounded-xl bg-primary text-primary-foreground space-y-1 animate-in fade-in zoom-in duration-300">
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Estimated Cost</p>
                  <div className="text-3xl font-bold">₹{calcResult.rate} <span className="text-sm font-normal opacity-80">{calcResult.currency}</span></div>
                  <div className="my-2 h-[1px] w-full bg-primary-foreground/20" />
                  <p className="text-xs italic opacity-90">{calcResult.courier_name} • {calcResult.zone} • {calcResult.weight_kg}kg</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
              <div>
                <CardTitle>Rate Directory</CardTitle>
                <CardDescription>Filtering {list.length} active slabs</CardDescription>
              </div>
              <div className="flex gap-2">
                <select value={filterCourierId} onChange={(e) => setFilterCourierId(e.target.value)} className={`${selectClass} w-32 md:w-40 h-9 text-xs`}>
                  <option value="">All Couriers</option>
                  {partners.map((p) => <option key={p.courier_id} value={p.courier_id}>{p.name}</option>)}
                </select>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading && list.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-muted-foreground">
                  <Loader2 className="h-10 w-10 animate-spin mb-4" />
                  <p>Fetching rate data...</p>
                </div>
              ) : list.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium">No results found</h3>
                  <p className="text-muted-foreground">Adjust your filters or add a new rate card.</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-bold">Courier</TableHead>
                        <TableHead className="font-bold">Zone</TableHead>
                        <TableHead className="font-bold">Slab (kg)</TableHead>
                        <TableHead className="font-bold text-right">Prepaid</TableHead>
                        <TableHead className="font-bold text-right">COD</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.map((r) => (
                        <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium">{r.courier?.name ?? r.courier_id}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${ZONE_COLORS[r.zone] ?? ''} border-none capitalize`}>
                              {r.zone}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs tabular-nums">
                            {r.weight_slab_min_kg} – {r.weight_slab_max_kg}
                          </TableCell>
                          <TableCell className="text-right font-semibold">₹{r.prepaid_rate}</TableCell>
                          <TableCell className="text-right font-semibold text-orange-600">₹{r.cod_rate}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(r)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{editing ? 'Edit Configuration' : 'New Rate Entry'}</DialogTitle>
            <DialogDescription>
              Set price points for specific weight brackets and shipping zones.
            </DialogDescription>
          </DialogHeader>
          <RateCardForm
            initial={editing ? { courier_id: editing.courier_id, zone: editing.zone, weight_slab_min_kg: parseFloat(editing.weight_slab_min_kg), weight_slab_max_kg: parseFloat(editing.weight_slab_max_kg), prepaid_rate: parseFloat(editing.prepaid_rate), cod_rate: parseFloat(editing.cod_rate) } : null}
            courierId={filterCourierId || undefined}
            partners={partners}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}