'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Plus, 
  Pencil, 
  Loader2, 
  Copy,
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  Globe, 
  Power,
  Search
} from 'lucide-react'
import { useCourierPartners, type CourierPartner, type CourierPartnerPayload, type CoverageType } from '@/hooks/useCourierPartners'

const COVERAGE_OPTIONS: { value: CoverageType; label: string }[] = [
  { value: null, label: 'Not Specified' },
  { value: 'metro', label: 'Metro' },
  { value: 'regional', label: 'Regional' },
  { value: 'pan_india', label: 'Pan India' },
]

const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

function PartnerForm({
  initial,
  partnerId,
  onSubmit,
  onCancel,
  loading,
}: {
  initial: Partial<CourierPartnerPayload> | null
  partnerId?: string
  onSubmit: (p: CourierPartnerPayload) => Promise<void>
  onCancel: () => void
  loading: boolean
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [code, setCode] = useState(initial?.code ?? '')
  const [supportCod, setSupportCod] = useState(initial?.support_cod ?? false)
  const [coverageType, setCoverageType] = useState<CoverageType>(initial?.coverage_type ?? null)
  const [accessToken, setAccessToken] = useState(initial?.access_token ?? '')
  const [secretKey, setSecretKey] = useState(initial?.secret_key ?? '')
  const [pickupAddressId, setPickupAddressId] = useState(initial?.pickup_address_id ?? '')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!name.trim() || !code.trim()) {
      setSubmitError('Name and code are required')
      return
    }
    try {
      await onSubmit({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        support_cod: supportCod,
        coverage_type: coverageType,
        access_token: accessToken.trim() || undefined,
        secret_key: secretKey.trim() || undefined,
        pickup_address_id: pickupAddressId.trim() || undefined,
      })
      onCancel()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Partner Name</Label>
        <div className="relative">
          <Truck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Delhivery"
            disabled={loading}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="code" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">API Identifier (Code)</Label>
        <Input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. DELHIVERY"
          disabled={!!initial || loading}
          className={initial ? 'bg-muted font-mono uppercase' : 'font-mono uppercase'}
        />
        {initial && <p className="text-[10px] text-muted-foreground italic">Code is immutable once created.</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverage" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Coverage Area</Label>
        <select
          id="coverage"
          value={coverageType ?? ''}
          onChange={(e) => setCoverageType((e.target.value || null) as CoverageType)}
          disabled={loading}
          className={selectClass}
        >
          {COVERAGE_OPTIONS.map((o) => (
            <option key={o.value ?? 'none'} value={o.value ?? ''}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">iThink Logistics Credentials</p>
        <div className="space-y-2">
          <Label htmlFor="access_token" className="text-xs font-semibold">Access Token</Label>
          <Input
            id="access_token"
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Enter iThink access token"
            disabled={loading}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secret_key" className="text-xs font-semibold">Secret Key</Label>
          <Input
            id="secret_key"
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Enter iThink secret key"
            disabled={loading}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pickup_address_id" className="text-xs font-semibold">Pickup Address ID</Label>
          <Input
            id="pickup_address_id"
            type="text"
            value={pickupAddressId}
            onChange={(e) => setPickupAddressId(e.target.value)}
            placeholder="e.g. 1293"
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => setSupportCod(!supportCod)}>
        <div className="flex-1 space-y-0.5">
          <Label htmlFor="support_cod" className="text-sm font-semibold cursor-pointer">Cash on Delivery (COD)</Label>
          <p className="text-xs text-muted-foreground">Does this partner handle cash collections?</p>
        </div>
        <input
          type="checkbox"
          id="support_cod"
          checked={supportCod}
          onChange={(e) => setSupportCod(e.target.checked)}
          disabled={loading}
          className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
        />
      </div>

      {submitError && <p className="text-sm font-medium text-destructive text-center py-2 bg-destructive/10 rounded">{submitError}</p>}
      
      <DialogFooter className="gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="min-w-[100px]">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : initial ? 'Save Changes' : 'Register Partner'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default function CourierPartnersPage() {
  const { partners, loading, error, activeCount, totalCount, createPartner, updatePartner, setPartnerStatus } =
    useCourierPartners()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CourierPartner | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const handleAdd = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (p: CourierPartner) => {
    setEditing(p)
    setDialogOpen(true)
  }

  const handleSubmit = async (payload: CourierPartnerPayload) => {
    setFormLoading(true)
    try {
      if (editing) {
        await updatePartner(editing.courier_id, payload)
      } else {
        await createPartner(payload)
      }
      setDialogOpen(false)
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleStatus = async (p: CourierPartner) => {
    try {
      await setPartnerStatus(p.courier_id, !p.is_active)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6 mt-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Logistics Partners</h1>
          <p className="text-muted-foreground text-lg">Manage your courier service integrations and coverage types.</p>
        </div>
        <Button size="lg" className="shadow-lg shadow-primary/20" onClick={handleAdd}>
          <Plus className="w-5 h-5 mr-2" />
          Add Courier
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium flex items-center gap-2">
           <Power className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-primary/10 shadow-sm overflow-hidden">
          <div className="h-1 bg-primary w-full" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active</p>
                <p className="text-4xl font-black text-primary">{activeCount}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-2 border-muted">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total</p>
                <p className="text-4xl font-black">{totalCount}</p>
              </div>
              <div className="p-3 bg-muted rounded-full text-muted-foreground">
                <Truck className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partners Management Section */}
      <Card className="border shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle>Partner Directory</CardTitle>
            <CardDescription>Configure operational status and COD availability</CardDescription>
          </div>
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search partners..." className="pl-9 h-9" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="animate-pulse">Loading logistics network...</p>
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/30">
              <Truck className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold">No partners registered</h3>
              <p className="text-muted-foreground mb-6">Start by adding your first logistics provider.</p>
              <Button variant="secondary" onClick={handleAdd}>Add First Partner</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {partners.map((p) => (
                <div
                  key={p.courier_id}
                  className="group flex flex-col md:flex-row items-start md:items-center justify-between p-5 border rounded-xl hover:border-primary/40 hover:bg-primary/[0.02] transition-all"
                >
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className={`p-3 rounded-xl ${p.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                       <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg leading-none">{p.name}</p>
                        {p.is_active ? (
                          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/10 border-green-500/20 px-1.5 h-5 text-[10px] uppercase font-black">Online</Badge>
                        ) : (
                          <Badge variant="secondary" className="px-1.5 h-5 text-[10px] uppercase font-black">Offline</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <code className="text-[11px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{p.code}</code>
                        {p.coverage_type && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Globe className="w-3 h-3" />
                            {p.coverage_type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 justify-end">
                    {p.support_cod && (
                      <Badge variant="outline" className="flex items-center gap-1.5 text-xs font-semibold py-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> COD
                      </Badge>
                    )}
                    
                    <div className="h-6 w-px bg-border mx-2 hidden md:block" />
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-primary"
                      onClick={() => {
                        navigator.clipboard.writeText(p.courier_id)
                        // Optional: trigger a small toast notification here
                      }}
                      title="Copy Partner ID"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={() => handleEdit(p)}>
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Button
                      variant={p.is_active ? "outline" : "default"}
                      size="sm"
                      className={`h-9 px-4 font-semibold transition-all ${
                        p.is_active 
                          ? 'border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground' 
                          : 'bg-primary'
                      }`}
                      onClick={() => handleToggleStatus(p)}
                    >
                      {p.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl font-black">
              {editing ? 'Modify Partner' : 'Register New Partner'}
            </DialogTitle>
            <DialogDescription>
              Configure logistics credentials and regional coverage settings.
            </DialogDescription>
          </DialogHeader>
          <PartnerForm
            initial={editing ? {
              name: editing.name,
              code: editing.code,
              support_cod: editing.support_cod,
              coverage_type: editing.coverage_type,
              access_token: editing.access_token ?? '',
              secret_key: editing.secret_key ?? '',
              pickup_address_id: editing.pickup_address_id ?? '',
            } : null}
            partnerId={editing?.courier_id}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}