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
  Power,
  Search,
  KeyRound,
} from 'lucide-react'
import { useCourierPartners, type CourierPartner, type CourierPartnerPayload } from '@/hooks/useCourierPartners'

function PartnerForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial: Partial<CourierPartnerPayload> | null
  onSubmit: (p: CourierPartnerPayload) => Promise<void>
  onCancel: () => void
  loading: boolean
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [code, setCode] = useState(initial?.code ?? '')
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
        access_token: accessToken.trim() || null,
        secret_key: secretKey.trim() || null,
        pickup_address_id: pickupAddressId.trim() || null,
      })
      onCancel()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Partner name
          </Label>
          <div className="relative">
            <Truck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Delhivery"
              disabled={loading}
              className="h-9 pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="code" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            API identifier (code)
          </Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. DELHIVERY"
            disabled={!!initial || loading}
            className={`h-9 font-mono text-sm uppercase ${initial ? 'bg-muted' : ''}`}
          />
          {initial && (
            <p className="text-xs text-muted-foreground">Code cannot be changed after the partner is created.</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <KeyRound className="h-4 w-4 text-primary" />
          Carrier API credentials
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="accessToken" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Access token
            </Label>
            <Input
              id="accessToken"
              name="accessToken"
              type="password"
              autoComplete="new-password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="h-9 font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secretKey" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Secret key
            </Label>
            <Input
              id="secretKey"
              name="secretKey"
              type="password"
              autoComplete="new-password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="h-9 font-mono text-sm"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pickupAddressId" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pickup address ID
            </Label>
            <Input
              id="pickupAddressId"
              name="pickupAddressId"
              type="text"
              value={pickupAddressId}
              onChange={(e) => setPickupAddressId(e.target.value)}
              placeholder="e.g. 1293"
              disabled={loading}
              className="h-9 max-w-xs font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {submitError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm font-medium text-destructive">
          {submitError}
        </p>
      )}
      
      <DialogFooter className="gap-2 border-t pt-4 sm:justify-end">
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
          <p className="text-muted-foreground text-lg">Manage courier integrations and API credentials.</p>
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
            <CardDescription>Activate partners and manage credentials from the edit dialog</CardDescription>
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
                      <div className="mt-1.5">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                          {p.code}
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-wrap items-center justify-end gap-2 border-t pt-4 md:w-auto md:border-t-0 md:pt-0">
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
        <DialogContent className="flex max-h-[min(90vh,640px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="shrink-0 space-y-1 border-b px-6 py-4 text-left">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {editing ? 'Modify partner' : 'Register new partner'}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Set the display name, API code, and carrier credentials used for bookings.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <PartnerForm
            key={editing?.courier_id ?? 'new'}
            initial={
              editing
                ? {
                    name: editing.name,
                    code: editing.code,
                    access_token: editing.access_token ?? '',
                    secret_key: editing.secret_key ?? '',
                    pickup_address_id: editing.pickup_address_id ?? '',
                  }
                : null
            }
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            loading={formLoading}
          />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}