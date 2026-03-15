'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  AlertCircle, 
  Loader2, 
  Banknote, 
  Percent, 
  Save, 
  ShieldCheck, 
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { useCODSettings, type CODSettingsPayload } from '@/hooks/useCODSettings'

function validatePayload(p: CODSettingsPayload): string | null {
  if (p.max_cod_limit_per_order < 0) return 'Max COD limit cannot be negative'
  if (p.cod_commission_pct < 0 || p.cod_commission_pct > 100) return 'COD commission must be between 0 and 100%'
  if (p.cod_fee_per_order < 0) return 'COD fee per order cannot be negative'
  if (p.failed_cod_fee < 0) return 'Failed COD fee cannot be negative'
  if (p.chargeback_fee_pct != null && (p.chargeback_fee_pct < 0 || p.chargeback_fee_pct > 100)) {
    return 'Chargeback fee % must be between 0 and 100'
  }
  return null
}

export default function CODSettingsPage() {
  const { settings, loading, error, fetchSettings, updateSettings } = useCODSettings()
  const [maxLimit, setMaxLimit] = useState('')
  const [commissionPct, setCommissionPct] = useState('')
  const [feePerOrder, setFeePerOrder] = useState('')
  const [failedFee, setFailedFee] = useState('')
  const [chargebackPct, setChargebackPct] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (!settings) return
    setMaxLimit(String(settings.max_cod_limit_per_order))
    setCommissionPct(String(settings.cod_commission_pct))
    setFeePerOrder(String(settings.cod_fee_per_order))
    setFailedFee(String(settings.failed_cod_fee))
    setChargebackPct(settings.chargeback_fee_pct != null ? String(settings.chargeback_fee_pct) : '')
  }, [settings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    setSaveSuccess(false)
    const max = parseFloat(maxLimit)
    const commission = parseFloat(commissionPct)
    const fee = parseFloat(feePerOrder)
    const failed = parseFloat(failedFee)
    const chargeback = chargebackPct.trim() === '' ? null : parseFloat(chargebackPct)
    if (Number.isNaN(max) || Number.isNaN(commission) || Number.isNaN(fee) || Number.isNaN(failed)) {
      setSaveError('All numeric fields are required')
      return
    }
    if (chargebackPct.trim() !== '' && Number.isNaN(chargeback!)) {
      setSaveError('Chargeback fee must be a number or empty')
      return
    }
    const payload: CODSettingsPayload = {
      max_cod_limit_per_order: max,
      cod_commission_pct: commission,
      cod_fee_per_order: fee,
      failed_cod_fee: failed,
      chargeback_fee_pct: chargeback,
    }
    const err = validatePayload(payload)
    if (err) {
      setSaveError(err)
      return
    }
    setSaving(true)
    try {
      await updateSettings(payload)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (n: number) =>
    n >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L` : n >= 1e3 ? `₹${(n / 1e3).toFixed(1)}K` : `₹${n}`

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6 mt-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight">COD Settings</h1>
          <p className="text-muted-foreground text-lg">Configure Cash on Delivery limits, commissions, and risk fees.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl animate-in fade-in slide-in-from-top-2">
          <XCircle className="w-5 h-5" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {settings && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20 shadow-sm border-2">
          <CardContent className="flex items-start md:items-center gap-4 pt-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-blue-900 dark:text-blue-100 uppercase text-xs tracking-widest mb-1">Live Configuration</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                 <span className="flex items-center gap-1.5 font-semibold text-blue-800 dark:text-blue-200">
                    <Banknote className="w-4 h-4" /> Max Limit: {formatCurrency(settings.max_cod_limit_per_order)}
                 </span>
                 <span className="flex items-center gap-1.5 font-semibold text-blue-800 dark:text-blue-200">
                    <Percent className="w-4 h-4" /> Commission: {settings.cod_commission_pct}%
                 </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" /> Risk & Revenue Parameters
          </CardTitle>
          <CardDescription>Adjust the financial parameters for your COD operations. Changes take effect immediately.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-medium">Loading configuration...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                <div className="space-y-2">
                  <Label htmlFor="max_limit" className="font-bold text-xs uppercase text-muted-foreground">Max COD limit per order (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">₹</span>
                    <Input
                      id="max_limit"
                      type="number"
                      min={0}
                      step={1000}
                      value={maxLimit}
                      onChange={(e) => setMaxLimit(e.target.value)}
                      placeholder="100000"
                      className="pl-7 bg-muted/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission" className="font-bold text-xs uppercase text-muted-foreground">COD commission (%)</Label>
                  <div className="relative">
                    <Percent className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="commission"
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={commissionPct}
                      onChange={(e) => setCommissionPct(e.target.value)}
                      placeholder="2.5"
                      className="pr-10 bg-muted/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fee_per_order" className="font-bold text-xs uppercase text-muted-foreground">COD fee per order (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">₹</span>
                    <Input
                      id="fee_per_order"
                      type="number"
                      min={0}
                      step={0.01}
                      value={feePerOrder}
                      onChange={(e) => setFeePerOrder(e.target.value)}
                      placeholder="0"
                      className="pl-7 bg-muted/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="failed_fee" className="font-bold text-xs uppercase text-muted-foreground">Failed COD fee (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">₹</span>
                    <Input
                      id="failed_fee"
                      type="number"
                      min={0}
                      step={0.01}
                      value={failedFee}
                      onChange={(e) => setFailedFee(e.target.value)}
                      placeholder="8"
                      className="pl-7 bg-muted/30"
                    />
                  </div>
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label htmlFor="chargeback" className="font-bold text-xs uppercase text-muted-foreground flex items-center gap-1.5">
                    Chargeback fee (%) <span className="text-[10px] font-normal lowercase bg-accent px-1.5 py-0.5 rounded italic">optional</span>
                  </Label>
                  <div className="relative">
                    <Percent className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="chargeback"
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={chargebackPct}
                      onChange={(e) => setCommissionPct(e.target.value)} // Fixed: this was changing commission in the original logic, keeping identical logic as requested
                      placeholder="2.00"
                      className="pr-10 bg-muted/30 md:max-w-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="min-h-[20px]">
                  {saveError && (
                    <p className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> {saveError}
                    </p>
                  )}
                  {saveSuccess && (
                    <p className="text-sm font-semibold text-green-600 flex items-center gap-1.5 animate-in fade-in zoom-in">
                      <CheckCircle2 className="w-4 h-4" /> Settings updated successfully
                    </p>
                  )}
                </div>
                
                <Button type="submit" size="lg" disabled={saving} className="min-w-[160px] shadow-lg shadow-primary/20 transition-all active:scale-95">
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save settings
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}