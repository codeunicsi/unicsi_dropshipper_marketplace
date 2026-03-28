'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Trash2, Eye } from 'lucide-react'
import { useLiveProducts } from '@/hooks/useLiveProducts'
import type { LiveProduct } from '@/hooks/useLiveProducts'
import { ProductReviewModal } from '@/components/dashboard/product-review-models'
import type { PendingProduct } from '@/hooks/usePendingProducts'

/** Normalize a Live product to the shape expected by ProductReviewModal (PendingProduct). */
function liveToPendingShape(p: LiveProduct): PendingProduct {
  const images = (p.images || []).map((img) =>
    typeof img === 'string' ? { id: '', product_id: p.product_id, image_url: img, sort_order: 0, createdAt: '', updatedAt: '' } : { id: '', product_id: p.product_id, image_url: (img as { image_url?: string }).image_url ?? '', sort_order: 0, createdAt: '', updatedAt: '' }
  )
  const variants = (p.variants || []).map((v: Record<string, unknown>) => ({
    variant_id: (v.variant_id ?? v.id ?? '') as string,
    product_id: (v.product_id ?? p.product_id) as string,
    sku: (v.sku ?? '') as string,
    variant_name: String(v.variant_name ?? v.title ?? ''),
    variant_price: String(v.variant_price ?? v.price ?? 0),
    variant_stock: Number(v.variant_stock ?? v.inventory_quantity ?? 0),
    attributes: (v.attributes as Record<string, string>) ?? {},
    weight_grams: Number(v.weight_grams ?? 500),
    dimensions_cm: (v.dimensions_cm as { h: number; l: number; w: number }) ?? { h: 0, l: 0, w: 0 },
    hsn_code: (v.hsn_code ?? '') as string,
    is_active: (v.is_active ?? true) as boolean,
    createdAt: (v.createdAt ?? '') as string,
    updatedAt: (v.updatedAt ?? '') as string,
  }))
  return {
    product_id: p.product_id ?? (p.id as string),
    supplier_id: p.supplier_id ?? '',
    title: p.title ?? '',
    description: p.description ?? '',
    category_id: null,
    brand: p.brand ?? '',
    approval_status: 'approved',
    lifecycle_status: (p.lifecycle_status === 'paused' ? 'inactive' : 'active') as 'active' | 'inactive',
    createdAt: (p as { created_at?: string }).created_at ?? new Date().toISOString(),
    updatedAt: (p as { updated_at?: string }).updated_at ?? new Date().toISOString(),
    imageCount: String(images.length),
    variants,
    images,
    supplierName: p.supplier?.name ?? '',
  }
}

export default function LiveProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const { products, stats, loading, error, deleteProduct, updateProductStatus, updateProduct } = useLiveProducts()
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)
  const [detailProduct, setDetailProduct] = useState<LiveProduct | null>(null)
  const modalProduct = useMemo(() => (detailProduct ? liveToPendingShape(detailProduct) : null), [detailProduct])

  console.log("product-items", products)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product?.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product?.variants?.[0]?.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !categoryFilter || product?.variants?.[0]?.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(products.map((p) => p.category)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Products</h1>
          <p className="text-muted-foreground">All active products available for sale</p>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          {stats?.total_active || 0} Live
        </Badge>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Product Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center gap-2 bg-input px-3 py-2 rounded-lg border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, supplier, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent flex-1 outline-none text-sm"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-background text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat, index) => (
              <option
                key={cat != null && cat !== '' ? String(cat) : `category-${index}`}
                value={cat ?? ''}
              >
                {cat ?? 'Uncategorized'}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats?.total_active || 0}</p>
              <p className="text-sm text-muted-foreground">Total Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">₹{stats?.total_gmv || 0}</p>
              <p className="text-sm text-muted-foreground">Total GMV</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats?.conversion_rate || 0}%</p>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats?.new_this_week || 0}</p>
              <p className="text-sm text-muted-foreground">New This Week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Products List</CardTitle>
          <CardDescription>
            {filteredProducts.length} products ({products.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {products.length === 0 ? 'No live products found' : 'No products match your filters'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product, index) => (
                    <TableRow key={product?.product_id ?? product?.id ?? `live-${index}`}>
                      <TableCell>
                        <div className="font-medium">{product?.title}</div>
                        <div className="text-xs text-muted-foreground">{product.brand}</div>
                      </TableCell>
                      <TableCell className="text-sm">{product?.supplier?.name}</TableCell>
                      <TableCell className="text-sm font-mono">{product?.variants?.[0]?.sku}</TableCell>
                      <TableCell className="text-sm">{product?.variants?.[0]?.category}</TableCell>
                      <TableCell className="text-right font-medium">₹{product?.variants?.[0]?.variant_price}</TableCell>
                      <TableCell className="text-right">
                        {product?.variants?.[0]?.variant_stock > 0 ? (
                          <Badge variant="outline">{product?.variants?.[0]?.variant_stock}</Badge>
                        ) : (
                          <Badge variant="secondary">Out of Stock</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{product.rating}</span>
                          <span className="text-xs text-muted-foreground">
                            ({product.reviews_count})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <select
                          className="rounded-md border bg-background px-2 py-1 text-sm"
                          value={
                            product?.lifecycle_status === 'paused'
                              ? 'out_of_stock'
                              : 'live'
                          }
                          disabled={statusUpdatingId === (product?.product_id ?? product?.id)}
                          onChange={async (e) => {
                            const id = product?.product_id ?? product?.id
                            if (!id) return
                            const newStatus = e.target.value as 'live' | 'out_of_stock'
                            setStatusUpdatingId(id)
                            try {
                              await updateProductStatus(id, newStatus)
                            } finally {
                              setStatusUpdatingId(null)
                            }
                          }}
                        >
                          <option value="live">Live</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            title="View product details"
                            onClick={() => setDetailProduct(product)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-red-600"
                            title="Archive product (remove from live)"
                            disabled={archivingId === (product?.product_id ?? product?.id)}
                            onClick={async () => {
                              const id = product?.product_id ?? product?.id
                              if (!id) return
                              setArchivingId(id)
                              try {
                                await deleteProduct(id)
                              } finally {
                                setArchivingId(null)
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product detail modal – same as Pending (Edit + Close only) */}
      <ProductReviewModal
        product={modalProduct}
        isOpen={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        onUpdate={async (productId, updates) => {
          await updateProduct(productId, updates as Partial<LiveProduct>)
          setDetailProduct((prev) => {
            if (!prev || (prev.product_id ?? prev.id) !== productId) return prev
            return {
              ...prev,
              ...(updates.title !== undefined && { title: updates.title }),
              ...(updates.description !== undefined && { description: updates.description }),
              ...(updates.brand !== undefined && { brand: updates.brand }),
              ...(updates.variants !== undefined && { variants: updates.variants as unknown as LiveProduct['variants'] }),
            }
          })
        }}
        liveOnly
        loading={loading}
      />
    </div>
  )
}
