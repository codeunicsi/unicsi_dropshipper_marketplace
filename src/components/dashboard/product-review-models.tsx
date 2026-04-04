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
import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'

function formatInrAmount(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

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

  const normalizeDimensions = useCallback((dim: unknown): { h: number; l: number; w: number } => {
    const d = dim as Record<string, unknown> | null | undefined
    if (!d || typeof d !== 'object') return { h: 0, l: 0, w: 0 }
    const h = Number(d.h ?? d.height ?? 0) || 0
    const l = Number(d.l ?? d.length ?? 0) || 0
    const w = Number(d.w ?? d.width ?? 0) || 0
    return { h, l, w }
  }, [])

  /** API may nest objects in attributes (e.g. dimensions); React cannot render raw objects. */
  const formatAttributeValue = useCallback(
    (value: unknown): string => {
      if (value == null) return '—'
      if (Array.isArray(value)) return value.map(String).join(', ')
      if (typeof value === 'object') {
        const o = value as Record<string, unknown>
        if (
          'width' in o ||
          'height' in o ||
          'length' in o ||
          'w' in o ||
          'h' in o ||
          'l' in o
        ) {
          const dim = normalizeDimensions(value)
          return `${dim.h} × ${dim.l} × ${dim.w} cm`
        }
        return JSON.stringify(value)
      }
      return String(value)
    },
    [normalizeDimensions],
  )

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
    setEditedProduct((prev) => ({
      ...prev,
      variants: normalizedVariants,
      transfer_price: product.transfer_price ?? null,
      bulk_price: product.bulk_price ?? null,
    }))
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

  const handleSaveChanges = async () => {
    try {
      const payload: Partial<PendingProduct> = {
        title: editedProduct.title ?? product.title,
        description: editedProduct.description ?? product.description,
        brand: editedProduct.brand ?? product.brand,
        transfer_price:
          editedProduct.transfer_price !== undefined
            ? editedProduct.transfer_price
            : (product.transfer_price ?? null),
        bulk_price:
          editedProduct.bulk_price !== undefined
            ? editedProduct.bulk_price
            : (product.bulk_price ?? null),
      }
      const baseVariants = editedProduct.variants ?? product.variants ?? []
      payload.variants = baseVariants.map((v) => ({
        ...v,
        dimensions_cm: variantDimensions[v.variant_id] ?? normalizeDimensions(v.dimensions_cm),
      }))
      await onUpdate(product.product_id, payload)
      setEditMode(false)
      setEditedProduct({})
      setVariantDimensions({})
    } catch (error) {
      console.error('[v0] Error saving changes:', error)
    }
  }

  const handleReject = async () => {
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
    try {
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
            <DialogDescription>Supplier: {product.supplierName || 'Unknown'}</DialogDescription>
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

                  <div className="col-span-2 rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm font-semibold text-foreground">Supplier B2B pricing</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Rates entered by the supplier on listing (transfer / trade price and bulk price).
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Transfer price (TP)</Label>
                        {editMode ? (
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={
                              editedProduct.transfer_price === null ||
                              editedProduct.transfer_price === undefined
                                ? ''
                                : String(editedProduct.transfer_price)
                            }
                            onChange={(e) => {
                              const raw = e.target.value
                              setEditedProduct({
                                ...editedProduct,
                                transfer_price: raw === '' ? null : Number(raw),
                              })
                            }}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 font-medium tabular-nums">
                            {formatInrAmount(product.transfer_price ?? null)}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Bulk price</Label>
                        {editMode ? (
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={
                              editedProduct.bulk_price === null || editedProduct.bulk_price === undefined
                                ? ''
                                : String(editedProduct.bulk_price)
                            }
                            onChange={(e) => {
                              const raw = e.target.value
                              setEditedProduct({
                                ...editedProduct,
                                bulk_price: raw === '' ? null : Number(raw),
                              })
                            }}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 font-medium tabular-nums">
                            {formatInrAmount(product.bulk_price ?? null)}
                          </p>
                        )}
                      </div>
                    </div>
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
                              <p className="font-medium text-sm mt-1">₹{variant.variant_price}</p>
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
                            <Label className="text-xs text-muted-foreground">Dimensions (h × l × w cm)</Label>
                            {editMode ? (() => {
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
                                const d = normalizeDimensions(variant.dimensions_cm)
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
            {product.variants?.[0]?.attributes && (
              <Card>
                <CardHeader>
                  <CardTitle>Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(product.variants[0].attributes).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-muted-foreground capitalize">{key}</p>
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
                      setVariantDimensions({})
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
