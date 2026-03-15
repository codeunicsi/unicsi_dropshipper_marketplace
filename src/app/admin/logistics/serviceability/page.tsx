'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Search, 
  Loader2, 
  Upload, 
  CheckCircle, 
  MapPin, 
  Database, 
  FileText, 
  Truck, 
  AlertCircle,
  FileJson
} from 'lucide-react'
import { useServiceability, type ServiceabilityRow, type ServiceabilityCheckResult, type ServiceabilityUploadRow } from '@/hooks/useServiceability'
import { useCourierPartners } from '@/hooks/useCourierPartners'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const PINCODE_REGEX = /^\d{6}$/

const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

function normalizePincode(value: unknown): string | null {
  if (value == null) return null
  const s = String(value).trim().replace(/\s/g, '')
  return PINCODE_REGEX.test(s) ? s : null
}

function toBoolean(value: unknown): boolean {
  if (value === true || value === 1) return true
  if (value === false || value === 0) return false
  if (value == null || value === '') return false
  const s = String(value).trim().toLowerCase()
  if (s === 'true' || s === '1' || s === 'yes') return true
  if (s === 'false' || s === '0' || s === 'no') return false
  return false
}

function parseCsvToRows(text: string): ServiceabilityUploadRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []
  const header = lines[0].toLowerCase().split(',').map((h) => h.trim())
  const rows: ServiceabilityUploadRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim())
    const raw: Record<string, string> = {}
    header.forEach((h, j) => {
      raw[h] = values[j] ?? ''
    })
    const courier_id = String(raw.courier_id ?? '').trim()
    const pincode = normalizePincode(raw.pincode ?? '')
    if (!courier_id || !pincode) continue
    rows.push({
      courier_id,
      pincode,
      is_serviceable: raw.is_serviceable === undefined || raw.is_serviceable === '' ? true : toBoolean(raw.is_serviceable),
      cod_available: toBoolean(raw.cod_available),
      state: raw.state ? String(raw.state).trim() : undefined,
    })
  }
  return rows
}

export default function ServiceabilityPage() {
  const { partners } = useCourierPartners(false)
  const {
    list,
    checkResult,
    loading,
    error,
    serviceableCount,
    totalCount,
    fetchList,
    check,
    upload,
  } = useServiceability()

  const [filterPincode, setFilterPincode] = useState('')
  const [filterCourierId, setFilterCourierId] = useState('')
  const [checkPincode, setCheckPincode] = useState('')
  const [checkCourierId, setCheckCourierId] = useState('')
  const [uploadJson, setUploadJson] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    fetchList({ limit: 500 })
  }, [fetchList])

  const handleSearch = () => {
    setValidationError(null)
    if (filterPincode.trim()) {
      const pin = normalizePincode(filterPincode)
      if (pin === null) {
        setValidationError('Invalid pincode. Must be exactly 6 digits.')
        return
      }
      fetchList({ pincode: pin, courier_id: filterCourierId || undefined, limit: 200 })
    } else {
      fetchList({ courier_id: filterCourierId || undefined, limit: 200 })
    }
  }

  const handleCheck = () => {
    setValidationError(null)
    const pin = normalizePincode(checkPincode)
    if (pin === null) {
      setValidationError('Invalid pincode. Must be exactly 6 digits.')
      return
    }
    check(pin, checkCourierId || undefined)
  }

  const handleUpload = async () => {
    let rows: ServiceabilityUploadRow[] = []
    if (uploadFile) {
      const text = await uploadFile.text()
      rows = parseCsvToRows(text)
    } else if (uploadJson.trim()) {
      try {
        const parsed = JSON.parse(uploadJson) as ServiceabilityUploadRow[]
        rows = Array.isArray(parsed) ? parsed : []
      } catch {
        setUploadMessage('Invalid JSON')
        return
      }
    }
    if (rows.length === 0) {
      setUploadMessage('No valid rows to upload')
      return
    }
    setUploading(true)
    setUploadMessage(null)
    try {
      const result = await upload(rows)
      const skipped = result.skipped ?? 0
      setUploadMessage(
        skipped
          ? `Processed ${result.processed} of ${result.total} rows (${skipped} skipped: invalid pincode)`
          : `Processed ${result.processed} of ${result.total} rows`
      )
      setUploadJson('')
      setUploadFile(null)
      fetchList({ limit: 500 })
    } catch {
      // error handled by hook
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6 mt-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight">Serviceability</h1>
          <p className="text-muted-foreground text-lg">Manage delivery coverage and pincode-specific logistics rules.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border">
           <MapPin className="w-4 h-4 text-primary" /> Validating 6-digit Indian Pincodes
        </div>
      </div>

      {(error || validationError) && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium text-sm">{validationError ?? error}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-primary/10 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Serviceable Pins</p>
                <p className="text-4xl font-black text-primary">{serviceableCount}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-muted shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Records</p>
                <p className="text-4xl font-black">{totalCount}</p>
              </div>
              <div className="p-3 bg-muted rounded-xl text-muted-foreground">
                <Database className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Check and Upload */}
        <div className="lg:col-span-5 space-y-8">
          <Card className="shadow-md border-primary/5">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" /> Coverage Checker
              </CardTitle>
              <CardDescription>Instant look-up for courier availability.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="check-pincode" className="text-xs font-bold uppercase text-muted-foreground">Pincode</Label>
                  <Input
                    id="check-pincode"
                    placeholder="110001"
                    value={checkPincode}
                    onChange={(e) => setCheckPincode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check-courier" className="text-xs font-bold uppercase text-muted-foreground">Courier</Label>
                  <select
                    id="check-courier"
                    value={checkCourierId}
                    onChange={(e) => setCheckCourierId(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">All couriers</option>
                    {partners.map((p) => (
                      <option key={p.courier_id} value={p.courier_id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button className="w-full" onClick={handleCheck} disabled={loading || !checkPincode.trim()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Verify Coverage
              </Button>
            </CardContent>

            {checkResult !== null && (
              <CardContent className="pt-0 border-t mt-4">
                <div className="pt-4">
                  {checkResult.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                      <Truck className="w-8 h-8 opacity-20 mb-2" />
                      <p className="text-sm font-medium">No couriers serve this area.</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="py-2 text-xs uppercase">Partner</TableHead>
                            <TableHead className="py-2 text-xs uppercase">COD</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {checkResult.map((r: ServiceabilityCheckResult) => (
                            <TableRow key={`${r.courier_id}-${r.pincode}`} className="hover:bg-accent/30">
                              <TableCell className="py-2 font-medium">
                                <div className="flex flex-col">
                                  <span>{r.courier_name ?? r.courier_id}</span>
                                  <span className="text-[10px] text-muted-foreground">{r.courier_code}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-2">
                                {r.cod_available ? 
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-1.5 h-5 text-[10px]">YES</Badge> : 
                                  <Badge variant="outline" className="px-1.5 h-5 text-[10px]">NO</Badge>
                                }
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" /> Bulk Ingestion
              </CardTitle>
              <CardDescription>
                Sync your delivery network via JSON or CSV.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                  <FileJson className="w-3 h-3" /> JSON Payload
                </Label>
                <textarea
                  placeholder='[{"courier_id":"...","pincode":"110001",...}]'
                  value={uploadJson}
                  onChange={(e) => setUploadJson(e.target.value)}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-xs font-mono"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground font-bold tracking-widest">OR</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                  <FileText className="w-3 h-3" /> CSV File Upload
                </Label>
                <Input
                  type="file"
                  accept=".csv"
                  className="cursor-pointer file:cursor-pointer file:font-semibold"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                />
              </div>

              {uploadMessage && (
                <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
                  <p className="text-xs text-primary font-medium">{uploadMessage}</p>
                </div>
              )}

              <Button className="w-full" onClick={handleUpload} disabled={uploading || (!uploadJson.trim() && !uploadFile)}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Upload Records
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Records List */}
        <div className="lg:col-span-7">
          <Card className="h-full shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Coverage Database</CardTitle>
                  <CardDescription>Filtering {list.length} records</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleSearch} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                  Search
                </Button>
              </div>
              <div className="flex flex-col md:flex-row gap-4 mt-4 bg-muted/40 p-3 rounded-lg border">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="filter-pincode" className="text-[10px] uppercase font-bold text-muted-foreground pl-1">Pincode Filter</Label>
                  <Input
                    id="filter-pincode"
                    placeholder="Search pincode..."
                    value={filterPincode}
                    className="h-8 text-sm"
                    onChange={(e) => setFilterPincode(e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="filter-courier" className="text-[10px] uppercase font-bold text-muted-foreground pl-1">Courier Filter</Label>
                  <select
                    id="filter-courier"
                    value={filterCourierId}
                    onChange={(e) => setFilterCourierId(e.target.value)}
                    className={`${selectClass} h-8 text-sm py-0`}
                  >
                    <option value="">All Partners</option>
                    {partners.map((p) => (
                      <option key={p.courier_id} value={p.courier_id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading && list.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="font-medium">Refreshing directory...</p>
                </div>
              ) : list.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed rounded-2xl bg-muted/20">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="font-medium text-muted-foreground">No records match your query.</p>
                </div>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  <div className="overflow-auto max-h-[600px]">
                    <Table>
                      <TableHeader className="bg-muted/80 sticky top-0 z-10 backdrop-blur-sm">
                        <TableRow>
                          <TableHead className="font-bold text-xs">Pincode</TableHead>
                          <TableHead className="font-bold text-xs">Partner</TableHead>
                          <TableHead className="font-bold text-xs">State</TableHead>
                          <TableHead className="font-bold text-xs">Delivery</TableHead>
                          <TableHead className="font-bold text-xs text-right">COD</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {list.map((r: ServiceabilityRow) => (
                          <TableRow key={r.id} className="hover:bg-muted/30">
                            <TableCell className="font-mono font-bold">{r.pincode}</TableCell>
                            <TableCell className="font-medium">{r.courier?.name ?? r.courier_id}</TableCell>
                            <TableCell className="text-muted-foreground text-xs uppercase">{r.state ?? '—'}</TableCell>
                            <TableCell>
                              {r.is_serviceable ? 
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold">YES</Badge> : 
                                <Badge variant="destructive" className="font-bold">NO</Badge>
                              }
                            </TableCell>
                            <TableCell className="text-right">
                              {r.cod_available ? 
                                <Badge variant="outline" className="border-green-500 text-green-700 font-bold">YES</Badge> : 
                                <Badge variant="outline" className="text-muted-foreground">NO</Badge>
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}