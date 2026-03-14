'use client'

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
import { Search, Filter, Eye, CheckCircle, XCircle } from 'lucide-react'
import { usePendingProducts } from '@/hooks/usePendingProducts'
import { ProductReviewModal } from '@/components/dashboard/product-review-models'
import { useState, useMemo } from 'react'
import type { PendingProduct } from '@/hooks/usePendingProducts'

export default function PendingApprovalsPage() {
  const { products, stats, loading, error, approveProduct, rejectProduct, updateProduct } =
    usePendingProducts()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<PendingProduct | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.product_id.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = !statusFilter || product.approval_status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [products, searchQuery, statusFilter])

  const handleViewProduct = (product: PendingProduct) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleApprove = async (productId: string) => {
    try {
      await approveProduct(productId)
      setIsModalOpen(false)
    } catch (error) {
      console.error('[v0] Error approving product:', error)
    }
  }

  const handleReject = async (productId: string, reason: string) => {
    try {
      await rejectProduct(productId, reason)
      setIsModalOpen(false)
    } catch (error) {
      console.error('[v0] Error rejecting product:', error)
    }
  }

  const handleUpdate = async (productId: string, updates: Partial<PendingProduct>) => {
    try {
      await updateProduct(productId, updates)
      setSelectedProduct((prev) =>
        prev && prev.product_id === productId ? { ...prev, ...updates } : prev
      )
    } catch (error) {
      console.error('[v0] Error updating product:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <div className="w-4 h-4 rounded-full bg-yellow-600" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pending Approvals</h1>
          <p className="text-muted-foreground">Review and approve products pending verification</p>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          {stats.awaiting_review} Pending
        </Badge>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 flex items-center gap-2 bg-input px-3 py-2 rounded-lg border">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by product name, brand, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent flex-1 outline-none text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === null ? 'default' : 'outline'}
                onClick={() => setStatusFilter(null)}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'submitted' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('submitted')}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'approved' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('approved')}
              >
                Approved
              </Button>
              <Button
                variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('rejected')}
              >
                Rejected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.awaiting_review}</p>
              <p className="text-sm text-muted-foreground">Awaiting Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.needs_revision}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {stats.approved ?? products.filter((p) => p.approval_status === 'approved').length}
              </p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats.avg_review_time.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Avg Review Time (hrs)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products Pending Approval</CardTitle>
          <CardDescription>
            {filteredProducts.length} of {products.length} products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.product_id}>
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell className="text-sm">{product.supplierName || 'N/A'}</TableCell>
                      <TableCell className="text-sm">
                        {product.variants?.[0] ? `₹${product.variants[0].variant_price}` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {product.variants?.[0] ? `${product.variants[0].variant_stock} units` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(product.approval_status)}
                          <Badge variant={getStatusBadgeVariant(product.approval_status)}>
                            {product.approval_status.charAt(0).toUpperCase() +
                              product.approval_status.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProduct(product)}
                          disabled={loading}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Product Review Modal */}
      <ProductReviewModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProduct(null)
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        onUpdate={handleUpdate}
        loading={loading}
      />
    </div>
  )
}
