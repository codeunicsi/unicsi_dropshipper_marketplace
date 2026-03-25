'use client'
/* Settlement cycle uses a native <select>; do not import @/components/ui/select (not in this project). */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Loader2, Package, Save } from 'lucide-react'
import {
  defaultBulkOrderConfig,
  useBulkOrderConfig,
  type BulkOrderConfigPayload,
  type BulkOrderRole,
} from '@/hooks/useBulkOrderConfig'

const ROLES: BulkOrderRole[] = ['CUSTOMER', 'RESELLER', 'SUPPLIER']

export default function BulkOrderConfigPage() {
  const { config, loading, error, fetchConfig, saveConfig } = useBulkOrderConfig()
  const [form, setForm] = useState<BulkOrderConfigPayload>(defaultBulkOrderConfig)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveOk, setSaveOk] = useState(false)

  useEffect(() => {
    void fetchConfig()
  }, [fetchConfig])

  useEffect(() => {
    if (config) setForm(config)
  }, [config])

  const toggleRole = (role: BulkOrderRole) => {
    setForm((prev) => {
      const has = prev.allowRoles.includes(role)
      const allowRoles = has
        ? prev.allowRoles.filter((r) => r !== role)
        : [...prev.allowRoles, role]
      return { ...prev, allowRoles }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    setSaveOk(false)
    if (form.allowRoles.length === 0) {
      setSaveError('Select at least one allowed role.')
      return
    }
    setSaving(true)
    try {
      await saveConfig(form)
      setSaveOk(true)
      setTimeout(() => setSaveOk(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="border-b pb-6 mt-2 space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Package className="h-8 w-8 text-primary" />
          Bulk order configuration
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Step 1 of the manual B2B flow: who may place bulk orders, margin rules, status labels,
          settlement cycle, and the bank / UPI account buyers see when paying offline. Required
          before dropshippers can use bulk checkout APIs.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Roles & margin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Who can place bulk orders</Label>
              <div className="flex flex-wrap gap-4">
                {ROLES.map((role) => (
                  <label
                    key={role}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input"
                      checked={form.allowRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="margin">Default margin per piece (₹)</Label>
              <Input
                id="margin"
                type="number"
                min={0}
                step="0.01"
                value={form.defaultMarginPerPiece}
                onChange={(e) =>
                  setForm((p) => ({ ...p, defaultMarginPerPiece: Number(e.target.value) || 0 }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Used when a product has transfer price but no bulk price.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order status labels</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            {(
              [
                ['pendingPayment', 'Pending payment'],
                ['confirmed', 'Confirmed'],
                ['shipped', 'Shipped'],
                ['delivered', 'Delivered'],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  value={form.statusFlow[key]}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      statusFlow: { ...p.statusFlow, [key]: e.target.value },
                    }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment account (shown to buyers)</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="holder">Account holder name</Label>
              <Input
                id="holder"
                value={form.paymentAccount.accountHolderName}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    paymentAccount: { ...p.paymentAccount, accountHolderName: e.target.value },
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acct">Account number</Label>
              <Input
                id="acct"
                value={form.paymentAccount.accountNumber}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    paymentAccount: { ...p.paymentAccount, accountNumber: e.target.value },
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifsc">IFSC</Label>
              <Input
                id="ifsc"
                className="uppercase"
                value={form.paymentAccount.ifscCode}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    paymentAccount: { ...p.paymentAccount, ifscCode: e.target.value },
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank">Bank name</Label>
              <Input
                id="bank"
                value={form.paymentAccount.bankName}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    paymentAccount: { ...p.paymentAccount, bankName: e.target.value },
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch name</Label>
              <Input
                id="branch"
                value={form.paymentAccount.branchName}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    paymentAccount: { ...p.paymentAccount, branchName: e.target.value },
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upi">UPI ID (optional)</Label>
              <Input
                id="upi"
                value={form.paymentAccount.upiId ?? ''}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    paymentAccount: { ...p.paymentAccount, upiId: e.target.value },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Settlement</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cycle">Cycle</Label>
              <select
                id="cycle"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.settlement.cycle}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    settlement: {
                      ...p.settlement,
                      cycle: e.target.value as BulkOrderConfigPayload['settlement']['cycle'],
                    },
                  }))
                }
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dow">Day of week (0=Sun … 6=Sat, optional)</Label>
              <Input
                id="dow"
                type="number"
                min={0}
                max={6}
                value={form.settlement.dayOfWeek ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  setForm((p) => ({
                    ...p,
                    settlement: {
                      ...p.settlement,
                      dayOfWeek: v === '' ? undefined : Number(v),
                    },
                  }))
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {saveError && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {saveError}
            </p>
          )}
          {saveOk && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </p>
          )}
          <Button type="submit" disabled={saving || loading} className="sm:ml-auto">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save configuration
          </Button>
        </div>
      </form>
    </div>
  )
}
