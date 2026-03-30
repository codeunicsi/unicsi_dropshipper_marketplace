'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { PendingProduct, ProductVariant } from '@/hooks/usePendingProducts'
import { cn } from '@/lib/utils'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'

interface ProductReviewModalProps {
  product: PendingProduct | null
  isOpen: boolean
  onClose: () => void
  onApprove?: (productId: string) => void
  onReject?: (productId: string, reason: string) => void
  onUpdate: (productId: string, updates: Partial<PendingProduct>) => void
  loading?: boolean
  /** When true, only show Edit and Close (no Approve/Reject). Use for Live products. */
  liveOnly?: boolean
}

export function ProductReviewModal({
  product,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onUpdate,
  loading,
  liveOnly = false,
}: ProductReviewModalProps) {
  const [editMode, setEditMode] = useState(false)
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [editedProduct, setEditedProduct] = useState<Partial<PendingProduct>>({})
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [variantDimensions, setVariantDimensions] = useState<Record<string, { h: number; l: number; w: number }>>({})
  const [shippingCharge, setShippingCharge] = useState('')
  const [platformPricing, setPlatformPricing] = useState({
    commission: '',
    rvp_enabled: true,
    rto_enabled: true,
  })

  const reviewDimsEditable = !liveOnly

  const normalizeDimensions = useCallback((dim: unknown): { h: number; l: number; w: number } => {
    const d = dim as Record<string, unknown> | null | undefined
    if (!d || typeof d !== 'object') return { h: 0, l: 0, w: 0 }
    const h = Number(d.h ?? d.height ?? 0) || 0
    const l = Number(d.l ?? d.length ?? 0) || 0
    const w = Number(d.w ?? d.width ?? 0) || 0
    return { h, l, w }
  }, [])

  const firstVariantPriceKey = product?.variants?.[0]?.variant_price

  useEffect(() => {
    if (!product) return
    const fromTransfer = Number(product.transfer_price)
    const fromVariant = Number(product.variants?.[0]?.variant_price)
    const supplierBase =
      Number.isFinite(fromTransfer) && fromTransfer > 0 ? fromTransfer : fromVariant
    const bulk = Number(product.bulk_price)
    let commissionStr = ''
    if (Number.isFinite(supplierBase) && supplierBase > 0 && Number.isFinite(bulk) && bulk >= supplierBase) {
      commissionStr = String(Number((bulk - supplierBase).toFixed(2)))
    }
    setPlatformPricing({
      commission: commissionStr,
      rvp_enabled: product.rvp_enabled !== false,
      rto_enabled: product.rto_enabled !== false,
    })
  }, [
    product?.product_id,
    product?.transfer_price,
    product?.bulk_price,
    product?.rvp_enabled,
    product?.rto_enabled,
    firstVariantPriceKey,
  ])

  const supplierDisplayName = useMemo(
    () =>
      product?.supplierName?.trim() ||
      product?.supplier?.name?.trim() ||
      '',
    [product?.supplierName, product?.supplier?.name],
  )

  /** Supplier-set unit amount: product transfer_price if set, else first variant list price. */
  const supplierUnitPrice = useMemo(() => {
    if (!product) return 0
    const t = Number(product.transfer_price)
    if (Number.isFinite(t) && t > 0) return t
    const vars =
      editMode && editedProduct.variants && editedProduct.variants.length > 0
        ? editedProduct.variants
        : product.variants
    const v0 = vars?.[0]
    return Number(v0?.variant_price) || 0
  }, [product, editMode, editedProduct.variants])

  const commissionAmountNum = useMemo(() => {
    const c = parseFloat(platformPricing.commission.trim())
    return Number.isFinite(c) ? c : 0
  }, [platformPricing.commission])

  /** Supplier payout + platform commission per unit (stored as `bulk_price`). Excludes shipping. */
  const resellerBulkUnitBeforeShipping =
    supplierUnitPrice > 0 ? supplierUnitPrice + commissionAmountNum : null

  const moq = useMemo(() => {
    const raw = product?.minimum_order_quantity
    const n = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw)
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 10
  }, [product?.minimum_order_quantity])

  const defaultShippingForPayload = useMemo((): number | null => {
    const t = shippingCharge.trim()
    if (t === '') return null
    const n = parseFloat(t)
    return Number.isFinite(n) && n >= 0 ? n : null
  }, [shippingCharge])

  /** Per-order shipping spread across one MOQ for “landed unit” preview (matches how bulk orders add one shipping line). */
  const shippingPerUnitAtMoq = useMemo(() => {
    if (defaultShippingForPayload == null || defaultShippingForPayload <= 0) return 0
    return defaultShippingForPayload / moq
  }, [defaultShippingForPayload, moq])

  /** What resellers effectively pay per unit at MOQ: bulk unit + (shipping ÷ MOQ). Updates when commission or shipping changes. */
  const resellerLandedUnitAtMoq = useMemo(() => {
    if (resellerBulkUnitBeforeShipping == null) return null
    return Number((resellerBulkUnitBeforeShipping + shippingPerUnitAtMoq).toFixed(2))
  }, [resellerBulkUnitBeforeShipping, shippingPerUnitAtMoq])

  const buildPricingPayload = (): Pick<
    PendingProduct,
    | 'bulk_price'
    | 'transfer_price'
    | 'rvp_enabled'
    | 'rto_enabled'
    | 'default_shipping_charge'
  > => {
    const sup = supplierUnitPrice
    if (sup <= 0) {
      return {
        transfer_price: null,
        bulk_price: null,
        rvp_enabled: platformPricing.rvp_enabled,
        rto_enabled: platformPricing.rto_enabled,
        default_shipping_charge: defaultShippingForPayload,
      }
    }
    return {
      transfer_price: sup,
      bulk_price: sup + commissionAmountNum,
      rvp_enabled: platformPricing.rvp_enabled,
      rto_enabled: platformPricing.rto_enabled,
      default_shipping_charge: defaultShippingForPayload,
    }
  }

  const reseedVariantDimensionsFromProduct = useCallback(() => {
    if (!product?.variants?.length) {
      setVariantDimensions({})
      return
    }
    const next: Record<string, { h: number; l: number; w: number }> = {}
    for (const v of product.variants) {
      const raw =
        v.dimensions_cm ??
        (v as { dimension_cm?: unknown }).dimension_cm
      next[v.variant_id] = normalizeDimensions(raw)
    }
    setVariantDimensions(next)
  }, [product, normalizeDimensions])

  useEffect(() => {
    if (!isOpen || !product) return
    reseedVariantDimensionsFromProduct()
    const s = product.default_shipping_charge
    setShippingCharge(s != null && s !== '' ? String(Number(s)) : '')
  }, [isOpen, product?.product_id, product?.default_shipping_charge, reseedVariantDimensionsFromProduct])

  const formatAttributeValue = useCallback((value: unknown): string => {
    if (value == null) return '—'
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
    if (Array.isArray(value)) {
      return value.map((v) => formatAttributeValue(v)).join(', ')
    }
    if (typeof value === 'object') {
      const o = value as Record<string, unknown>
      const hasDim =
        'width' in o || 'height' in o || 'length' in o || 'h' in o || 'l' in o || 'w' in o
      if (hasDim) {
        const { h, l, w } = normalizeDimensions(o)
        if (h === 0 && l === 0 && w === 0) return '—'
        return `${h} × ${l} × ${w} cm`
      }
      try {
        return JSON.stringify(value)
      } catch {
        return String(value)
      }
    }
    return String(value)
  }, [normalizeDimensions])

  const handleEnterEditMode = useCallback(() => {
    if (!product) return
    const variants = product.variants ?? []
    const normalizedVariants = variants.map((v) => ({
      ...v,
      dimensions_cm: normalizeDimensions(v.dimensions_cm),
    }))
    const dimensionsByVariantId: Record<string, { h: number; l: number; w: number }> = {}
    normalizedVariants.forEach((v) => {
      dimensionsByVariantId[v.variant_id] = v.dimensions_cm as { h: number; l: number; w: number }
    })
    setVariantDimensions(dimensionsByVariantId)
    setEditedProduct((prev) => ({ ...prev, variants: normalizedVariants }))
    setEditMode(true)
  }, [product, normalizeDimensions])

  const updateVariant = useCallback(
    (index: number, field: keyof ProductVariant, value: string | number | boolean | { h: number; l: number; w: number }) => {
      setEditedProduct((prev) => ({
        ...prev,
        variants:
          prev.variants?.map((v, i) =>
            i === index ? { ...v, [field]: value } : v
          ) ?? [],
      }))
    },
    []
  )

  const setDimension = useCallback(
    (variantId: string, axis: 'h' | 'l' | 'w', value: number) => {
      setVariantDimensions((prev) => ({
        ...prev,
        [variantId]: {
          h: prev[variantId]?.h ?? 0,
          l: prev[variantId]?.l ?? 0,
          w: prev[variantId]?.w ?? 0,
          [axis]: value,
        },
      }))
    },
    []
  )

  if (!product) return null

  const currentImage = product.images?.[currentImageIndex]

  const buildVariantsUpdatePayload = () => {
    const pv = product.variants ?? []
    const base =
      editMode && editedProduct.variants && editedProduct.variants.length === pv.length
        ? editedProduct.variants
        : pv
    return base.map((v) => {
      const dim =
        variantDimensions[v.variant_id] ??
        normalizeDimensions(
          v.dimensions_cm ?? (v as { dimension_cm?: unknown }).dimension_cm,
        )
      return {
        ...v,
        variant_id: v.variant_id,
        sku: v.sku,
        variant_name: v.variant_name,
        variant_price: v.variant_price,
        variant_stock: v.variant_stock,
        weight_grams: v.weight_grams,
        hsn_code: v.hsn_code,
        is_active: v.is_active,
        dimensions_cm: dim,
      }
    })
  }

  const handleSaveChanges = async () => {
    if (commissionAmountNum < 0) {
      alert('Commission cannot be negative.')
      return
    }
    try {
      const payload: Partial<PendingProduct> = {
        title: editedProduct.title ?? product.title,
        description: editedProduct.description ?? product.description,
        brand: editedProduct.brand ?? product.brand,
        ...buildPricingPayload(),
        variants: buildVariantsUpdatePayload(),
      }
      await onUpdate(product.product_id, payload)
      setEditMode(false)
      setEditedProduct({})
      reseedVariantDimensionsFromProduct()
    } catch (error) {
      console.error('[v0] Error saving changes:', error)
    }
  }

  const handleReject = async () => {
    if (!product) return
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    if (!onReject) return
    try {
      await onReject(product.product_id, rejectionReason)
      setRejectionDialogOpen(false)
      setRejectionReason('')
      onClose()
    } catch (error) {
      console.error('[v0] Error rejecting product:', error)
    }
  }

  const handleApprove = async () => {
    if (!onApprove) return
    if (supplierUnitPrice <= 0) {
      alert('Supplier unit price is missing. Set the variant price (or transfer price) before approving.')
      return
    }
    if (commissionAmountNum < 0) {
      alert('Commission cannot be negative.')
      return
    }
    try {
      await onUpdate(product.product_id, {
        ...buildPricingPayload(),
        variants: buildVariantsUpdatePayload(),
      })
      await onApprove(product.product_id)
      onClose()
    } catch (error) {
      console.error('[v0] Error approving product:', error)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Product: {product.title}</DialogTitle>
            <DialogDescription>
              Supplier: {supplierDisplayName || 'Unknown'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image Gallery */}
            <div className="space-y-2">
              <h3 className="font-semibold">Product Images</h3>
              <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
                {currentImage?.image_url ? (
                  <img
                    src={currentImage.image_url || "/placeholder.svg"}
                    alt={`Product view ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-muted-foreground">No image available</p>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : product.images!.length - 1))
                    }
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentImageIndex + 1} of {product.images.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentImageIndex((prev) => (prev < product.images!.length - 1 ? prev + 1 : 0))
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Title</Label>
                    {editMode ? (
                      <Input
                        value={editedProduct.title || product.title}
                        onChange={(e) => setEditedProduct({ ...editedProduct, title: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium mt-1">{product.title}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Brand</Label>
                    {editMode ? (
                      <Input
                        value={editedProduct.brand || product.brand}
                        onChange={(e) => setEditedProduct({ ...editedProduct, brand: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium mt-1">{product.brand}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    {editMode ? (
                      <Textarea
                        value={editedProduct.description || product.description}
                        onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                      <p className="mt-1 text-sm">{product.description || 'No description'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge
                      className={cn(
                        'mt-1 border',
                        product.approval_status === 'approved' && 'bg-green-100 text-green-800 border-green-200',
                        product.approval_status === 'rejected' && 'bg-red-100 text-red-800 border-red-200',
                        (product.approval_status === 'submitted' || product.approval_status === 'under_review') &&
                          'bg-amber-100 text-amber-800 border-amber-200'
                      )}
                    >
                      {product.approval_status.charAt(0).toUpperCase() + product.approval_status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Lifecycle</Label>
                    <Badge
                      className={cn(
                        'mt-1 border',
                        product.lifecycle_status === 'active' && 'bg-green-100 text-green-800 border-green-200',
                        product.lifecycle_status !== 'active' && 'bg-muted text-muted-foreground border-border'
                      )}
                    >
                      {product.lifecycle_status.charAt(0).toUpperCase() + product.lifecycle_status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bulk pricing & logistics</CardTitle>
                {/* <CardDescription>
                  Supplier unit price comes from the listing (variant price or saved transfer price). You set
                  platform commission per unit; reseller bulk unit price is supplier + commission (
                  <code>bulk_price</code>).
                </CardDescription> */}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Supplier price (per unit, ₹) — from supplier
                    </Label>
                    <div className="mt-1 rounded-md border bg-muted/30 px-3 py-2 text-sm tabular-nums">
                      {supplierUnitPrice > 0 ? `₹${supplierUnitPrice.toFixed(2)}` : '— (set variant price)'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Platform commission (per unit, ₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      className="mt-1"
                      placeholder="e.g. 50"
                      value={platformPricing.commission}
                      onChange={(e) =>
                        setPlatformPricing((p) => ({ ...p, commission: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Default shipping charge (₹) — added once per bulk order (not per unit)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="mt-1 max-w-xs"
                    placeholder="e.g. 49"
                    value={shippingCharge}
                    onChange={(e) => setShippingCharge(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Saved on the product. The preview below spreads this over MOQ ({moq}) so you see the per-unit effect.
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm space-y-2">
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    <span className="text-muted-foreground">Reseller bulk unit (supplier + commission,</span>
                    <code className="text-xs bg-muted px-1 rounded">bulk_price</code>
                    <span className="text-muted-foreground">):</span>
                    <span className="font-semibold tabular-nums">
                      {resellerBulkUnitBeforeShipping != null
                        ? `₹${resellerBulkUnitBeforeShipping.toFixed(2)}`
                        : '—'}
                    </span>
                  </div>
                  {defaultShippingForPayload != null && defaultShippingForPayload > 0 && (
                    <p className="text-muted-foreground">
                      Shipping per order:{' '}
                      <span className="font-medium tabular-nums text-foreground">
                        ₹{defaultShippingForPayload.toFixed(2)}
                      </span>
                      {' → '}
                      <span className="tabular-nums">
                        +₹{shippingPerUnitAtMoq.toFixed(2)} per unit at MOQ {moq}
                      </span>
                    </p>
                  )}
                  <div className="pt-1 border-t border-border/60">
                    <span className="text-muted-foreground">Reseller landed unit at MOQ (preview, ₹): </span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {resellerLandedUnitAtMoq != null ? `₹${resellerLandedUnitAtMoq.toFixed(2)}` : '—'}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Order line total before GST ≈ (bulk unit × qty) + one shipping charge; this row is the unit
                      equivalent at MOQ only.
                    </p>
                  </div>
                  {supplierUnitPrice > 0 && commissionAmountNum < 0 && (
                    <p className="text-xs text-amber-700">
                      Commission should not be negative; bulk must be ≥ supplier payout.
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input"
                      checked={platformPricing.rvp_enabled}
                      onChange={(e) =>
                        setPlatformPricing((p) => ({ ...p, rvp_enabled: e.target.checked }))
                      }
                    />
                    <span>RVP (returns / refunds policy enabled)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input"
                      checked={platformPricing.rto_enabled}
                      onChange={(e) =>
                        setPlatformPricing((p) => ({ ...p, rto_enabled: e.target.checked }))
                      }
                    />
                    <span>RTO (return-to-origin) allowed</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Variants */}
            {(() => {
              const productVariants = product.variants ?? []
              const variants = editMode
                ? editedProduct.variants?.length === productVariants.length
                  ? editedProduct.variants!
                  : productVariants.map((v) => ({ ...v, dimensions_cm: normalizeDimensions(v.dimensions_cm) }))
                : productVariants
              if (variants.length === 0) return null
              return (
                <Card>
                  <CardHeader>
                    <CardTitle>Product Variants</CardTitle>
                    <CardDescription>{variants.length} variant(s)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {variants.map((variant, index) => (
                      <div key={variant.variant_id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="min-w-0">
                            <Label className="text-xs text-muted-foreground">SKU</Label>
                            {editMode ? (
                              <Input
                                value={variant.sku}
                                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                className="mt-1 h-8 text-sm w-full min-w-0"
                              />
                            ) : (
                              <p className="font-medium text-sm mt-1 truncate">{variant.sku}</p>
                            )}
                          </div>
                          <div className="min-w-0 md:col-span-2">
                            <Label className="text-xs text-muted-foreground">Variant Name</Label>
                            {editMode ? (
                              <Input
                                value={variant.variant_name}
                                onChange={(e) => updateVariant(index, 'variant_name', e.target.value)}
                                className="mt-1 h-8 text-sm w-full min-w-0"
                              />
                            ) : (
                              <p className="font-medium text-sm mt-1 truncate">{variant.variant_name}</p>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Label className="text-xs text-muted-foreground">Price (₹)</Label>
                            {editMode ? (
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={variant.variant_price}
                                onChange={(e) => updateVariant(index, 'variant_price', e.target.value)}
                                className="mt-1 h-8 text-sm w-full min-w-0"
                              />
                            ) : (
                              <p className="font-medium text-sm mt-1">
                                {variant.variant_price ? `₹${variant.variant_price}` : '—'}
                              </p>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Label className="text-xs text-muted-foreground">Stock</Label>
                            {editMode ? (
                              <Input
                                type="number"
                                min="0"
                                value={variant.variant_stock}
                                onChange={(e) => updateVariant(index, 'variant_stock', parseInt(e.target.value, 10) || 0)}
                                className="mt-1 h-8 text-sm w-full min-w-0"
                              />
                            ) : (
                              <p className="font-medium text-sm mt-1">{variant.variant_stock} units</p>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Label className="text-xs text-muted-foreground">Weight (g)</Label>
                            {editMode ? (
                              <Input
                                type="number"
                                min="0"
                                value={variant.weight_grams}
                                onChange={(e) => updateVariant(index, 'weight_grams', parseInt(e.target.value, 10) || 0)}
                                className="mt-1 h-8 text-sm w-full min-w-0"
                              />
                            ) : (
                              <p className="font-medium text-sm mt-1">{variant.weight_grams}g</p>
                            )}
                          </div>
                          <div className="min-w-0 md:min-w-[8rem]">
                            <Label className="text-xs text-muted-foreground">HSN Code</Label>
                            {editMode ? (
                              <Input
                                value={variant.hsn_code}
                                onChange={(e) => updateVariant(index, 'hsn_code', e.target.value)}
                                className="mt-1 h-8 text-sm w-full min-w-0"
                              />
                            ) : (
                              <p className="font-medium text-sm mt-1 break-all">{variant.hsn_code}</p>
                            )}
                          </div>
                          <div className="min-w-0 md:col-span-2">
                            <Label className="text-xs text-muted-foreground">
                              Dimensions (h × l × w cm)
                              {reviewDimsEditable && !editMode && (
                                <span className="text-muted-foreground font-normal"> — editable during review</span>
                              )}
                            </Label>
                            {editMode || reviewDimsEditable ? (() => {
                              const dim = variantDimensions[variant.variant_id] ?? { h: 0, l: 0, w: 0 }
                              return (
                                <div className="flex gap-2 mt-1 items-center flex-wrap">
                                  <Input
                                    type="number"
                                    min={0}
                                    placeholder="H"
                                    value={dim.h}
                                    onChange={(e) => setDimension(variant.variant_id, 'h', Number(e.target.value) || 0)}
                                    className="h-9 w-14 text-sm text-center tabular-nums"
                                  />
                                  <span className="text-muted-foreground text-xs">×</span>
                                  <Input
                                    type="number"
                                    min={0}
                                    placeholder="L"
                                    value={dim.l}
                                    onChange={(e) => setDimension(variant.variant_id, 'l', Number(e.target.value) || 0)}
                                    className="h-9 w-14 text-sm text-center tabular-nums"
                                  />
                                  <span className="text-muted-foreground text-xs">×</span>
                                  <Input
                                    type="number"
                                    min={0}
                                    placeholder="W"
                                    value={dim.w}
                                    onChange={(e) => setDimension(variant.variant_id, 'w', Number(e.target.value) || 0)}
                                    className="h-9 w-14 text-sm text-center tabular-nums"
                                  />
                                  <span className="text-muted-foreground text-xs">cm</span>
                                </div>
                              )
                            })() : (
                              (() => {
                                const d = normalizeDimensions(
                                  variant.dimensions_cm ?? (variant as { dimension_cm?: unknown }).dimension_cm,
                                )
                                return (
                                  <p className="font-medium text-sm mt-1">
                                    {d.h} × {d.l} × {d.w} <span className="text-muted-foreground">cm</span>
                                  </p>
                                )
                              })()
                            )}
                          </div>
                          <div className="min-w-0">
                            <Label className="text-xs text-muted-foreground">Status</Label>
                            {editMode ? (
                              <div className="mt-1">
                                <select
                                  value={variant.is_active ? 'active' : 'inactive'}
                                  onChange={(e) => updateVariant(index, 'is_active', e.target.value === 'active')}
                                  className={cn(
                                    'h-8 text-sm rounded-md border px-2 w-full font-medium',
                                    variant.is_active
                                      ? 'bg-green-50 text-green-800 border-green-200'
                                      : 'bg-red-50 text-red-800 border-red-200'
                                  )}
                                >
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                </select>
                              </div>
                            ) : (
                              <Badge
                                className={cn(
                                  'text-xs mt-1 border',
                                  variant.is_active && 'bg-green-100 text-green-800 border-green-200',
                                  !variant.is_active && 'bg-red-100 text-red-800 border-red-200'
                                )}
                              >
                                {variant.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })()}

            {/* Attributes */}
            {product.variants?.[0]?.attributes &&
              typeof product.variants[0].attributes === 'object' &&
              !Array.isArray(product.variants[0].attributes) && (
              <Card>
                <CardHeader>
                  <CardTitle>Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(product.variants[0].attributes as Record<string, unknown>).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="font-medium text-sm">{formatAttributeValue(value)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Meta Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Meta Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Product ID</p>
                  <p className="font-mono text-xs">{product.product_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Supplier ID</p>
                  <p className="font-mono text-xs">{product.supplier_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-xs">{new Date(product.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Updated</p>
                  <p className="text-xs">{new Date(product.updatedAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              {!editMode ? (
                <>
                  <Button variant="outline" onClick={handleEnterEditMode}>
                    Edit
                  </Button>
                  {!liveOnly && onReject && (
                    <Button variant="destructive" onClick={() => setRejectionDialogOpen(true)} disabled={loading}>
                      Reject
                    </Button>
                  )}
                  {!liveOnly && onApprove && (
                    <Button onClick={handleApprove} disabled={loading}>
                      Approve & Publish
                    </Button>
                  )}
                  <Button variant="secondary" onClick={onClose}>
                    Close
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditMode(false)
                      setEditedProduct({})
                      reseedVariantDimensionsFromProduct()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveChanges} disabled={loading}>
                    Save Changes
                  </Button>
                  <Button variant="secondary" onClick={onClose}>
                    Close
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog (only when onReject provided) */}
      {onReject && (
      <AlertDialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Reject Product
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this product? Please provide a reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter the reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
              Reject Product
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      )}
    </>
  )
}
