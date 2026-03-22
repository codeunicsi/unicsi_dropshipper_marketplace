'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Ban, Trash2, Loader2, CheckCircle, Upload, X } from 'lucide-react'
import {
  listCategories,
  createCategory,
  updateCategory,
  deactivateCategory,
  deleteCategoryPermanent,
  uploadCategoryImageFile,
  type Category,
} from '@/lib/api/categories'

function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activatingId, setActivatingId] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listCategories({ active: false, withCount: true })
      setCategories(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load categories')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const activeCount = categories.filter((c) => c.is_active).length

  const openAdd = () => {
    setEditingCategory(null)
    setFormOpen(true)
  }
  const openEdit = (c: Category) => {
    setEditingCategory(c)
    setFormOpen(true)
  }
  const closeForm = () => {
    setFormOpen(false)
    setEditingCategory(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Categories</h1>
          <p className="text-muted-foreground">Manage product categories and subcategories</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/30">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{categories.length}</p>
              <p className="text-sm text-muted-foreground">Total Categories</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories List</CardTitle>
          <CardDescription>
            All product categories with product counts. Deactivated categories are hidden from suppliers and marketplace.
            Categories marked Featured and Active appear in the marketplace &quot;Top Categories&quot; section (top-level only).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <p className="text-muted-foreground">No categories created yet.</p>
              <Button onClick={openAdd} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg flex-wrap gap-2"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-12 h-12 rounded bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const el = e.target as HTMLImageElement;
                            el.onerror = null;
                            el.src =
                              "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop";
                          }}
                        />
                      ) : (
                        <span className="text-muted-foreground text-xs">No img</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Slug: {cat.slug} • Display order: {cat.sort_order ?? 0} (lower = first on marketplace) • {cat.productCount != null ? `${cat.productCount} product${cat.productCount === 1 ? '' : 's'} in this category` : '—'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {cat.is_featured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                      <Badge variant={cat.is_active ? 'default' : 'outline'}>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(cat)}
                      disabled={submitting}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    {cat.is_active ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeactivateTarget(cat)}
                        disabled={deactivating}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          setActivatingId(cat.id)
                          setError(null)
                          try {
                            await updateCategory(cat.id, { is_active: true })
                            await fetchCategories()
                          } catch (e) {
                            setError(e instanceof Error ? e.message : 'Failed to activate')
                          } finally {
                            setActivatingId(null)
                          }
                        }}
                        disabled={!!activatingId}
                      >
                        {activatingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                        Activate
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(cat)}
                      disabled={deleting}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={formOpen}
        onClose={() => {
          setError(null)
          closeForm()
        }}
        category={editingCategory}
        topLevelCategories={categories.filter(
          (c) => c.is_active && !c.parent_id && c.id !== editingCategory?.id
        )}
        onSuccess={async () => {
          closeForm()
          setError(null)
          await fetchCategories()
        }}
        submitting={submitting}
        setSubmitting={setSubmitting}
        setPageError={setError}
      />

      <AlertDialog open={!!deactivateTarget} onOpenChange={(open) => !open && setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate category?</AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateTarget?.name} will be hidden from the supplier dropdown and marketplace top categories.
              Existing products will keep this category reference. You can reactivate later by editing the category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deactivateTarget) return
                setDeactivating(true)
                setError(null)
                try {
                  await deactivateCategory(deactivateTarget.id)
                  setDeactivateTarget(null)
                  await fetchCategories()
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Failed to deactivate')
                } finally {
                  setDeactivating(false)
                }
              }}
            >
              {deactivating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} will be removed forever. Products in this category will be unlinked (no category).
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteTarget) return
                setDeleting(true)
                setError(null)
                try {
                  await deleteCategoryPermanent(deleteTarget.id)
                  setDeleteTarget(null)
                  await fetchCategories()
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Failed to delete')
                } finally {
                  setDeleting(false)
                }
              }}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CategoryFormDialog({
  open,
  onClose,
  category,
  topLevelCategories,
  onSuccess,
  submitting,
  setSubmitting,
  setPageError,
}: {
  open: boolean
  onClose: () => void
  category: Category | null
  topLevelCategories: Category[]
  onSuccess: () => void
  submitting: boolean
  setSubmitting: (v: boolean) => void
  setPageError: (v: string | null) => void
}) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const categoryImageInputRef = useRef<HTMLInputElement>(null)
  const [sortOrder, setSortOrder] = useState<number | ''>(0)
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [parentId, setParentId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const isEdit = !!category

  const resetForm = useCallback(() => {
    if (category) {
      setName(category.name)
      setSlug(category.slug)
      setSlugManuallyEdited(false)
      setImageUrl(category.image_url ?? '')
      const so = category.sort_order ?? 0
      setSortOrder(typeof so === 'number' && !Number.isNaN(so) ? so : 0)
      setIsFeatured(category.is_featured ?? false)
      setIsActive(category.is_active ?? true)
      setParentId(category.parent_id ?? null)
    } else {
      setName('')
      setSlug('')
      setSlugManuallyEdited(false)
      setImageUrl('')
      setSortOrder(0)
      setIsFeatured(false)
      setIsActive(true)
      setParentId(null)
    }
    setFormError(null)
    setPageError(null)
    setImageUploading(false)
    setDragActive(false)
  }, [category, setPageError])

  /** Only reset when the dialog opens — not on every resetForm identity change (avoids wiping fields mid-edit). */
  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      resetForm()
    }
    wasOpenRef.current = open
  }, [open, resetForm])

  const restoreDialogFocus = () => {
    requestAnimationFrame(() => {
      const panel = document.querySelector('[data-slot="dialog-content"]')
      if (panel instanceof HTMLElement) {
        try {
          panel.focus({ preventScroll: true })
        } catch {
          /* ignore */
        }
      }
    })
  }

  const handleCategoryImageFile = async (file: File | null | undefined) => {
    if (!file || !file.type.startsWith('image/')) {
      if (file) setFormError('Please choose an image file (PNG, JPG, WEBP, GIF)')
      return
    }
    setFormError(null)
    setImageUploading(true)
    try {
      const url = await uploadCategoryImageFile(file)
      setImageUrl(url)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Image upload failed')
    } finally {
      setImageUploading(false)
      categoryImageInputRef.current?.blur()
      restoreDialogFocus()
    }
  }

  // Auto-fill slug from name only until user manually edits slug (create mode only)
  useEffect(() => {
    if (!isEdit && name && !slugManuallyEdited) setSlug(slugFromName(name))
  }, [name, isEdit, slugManuallyEdited])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const nameTrim = name.trim()
    const slugTrim = slug.trim()
    if (!nameTrim || !slugTrim) {
      setFormError('Name and slug are required')
      return
    }
    const sortOrderNum = typeof sortOrder === 'number' && !Number.isNaN(sortOrder) ? sortOrder : 0
    setSubmitting(true)
    try {
      if (isEdit && category) {
        await updateCategory(category.id, {
          name: nameTrim,
          slug: slugTrim.toLowerCase(),
          image_url: imageUrl.trim() || null,
          sort_order: sortOrderNum,
          is_featured: isFeatured,
          is_active: isActive,
          parent_id: parentId || null,
        })
      } else {
        await createCategory({
          name: nameTrim,
          slug: slugTrim.toLowerCase(),
          image_url: imageUrl.trim() || null,
          sort_order: sortOrderNum,
          is_featured: isFeatured,
          parent_id: parentId || null,
        })
      }
      await onSuccess()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      setFormError(msg)
      // Duplicate slug, validation, network, etc. all surface here
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="sm:max-w-md max-h-[min(90vh,720px)] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update category details.' : 'Create a new product category. Slug is used in URLs.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Electronics"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-slug">Slug</Label>
            <Input
              id="cat-slug"
              value={slug}
              onChange={(e) => {
                setSlugManuallyEdited(true)
                setSlug(e.target.value)
              }}
              placeholder="e.g. electronics"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Category image (optional)</Label>
            <p className="text-xs text-muted-foreground">
              Same storage as supplier product images. Drag and drop or choose a file (PNG, JPG, WEBP, GIF).
            </p>
            <input
              ref={categoryImageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              className="hidden"
              id="cat-image-file"
              disabled={imageUploading}
              onChange={(e) => {
                const f = e.target.files?.[0]
                void handleCategoryImageFile(f)
                e.target.value = ''
              }}
            />
            <div
              onDragEnter={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDragActive(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDragActive(false)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDragActive(false)
                const f = e.dataTransfer.files?.[0]
                void handleCategoryImageFile(f)
              }}
              className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
              } ${imageUploading ? 'opacity-60' : ''}`}
            >
              {imageUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Uploading…</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Drop image here</span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-1"
                    onClick={() => categoryImageInputRef.current?.click()}
                  >
                    Choose file
                  </Button>
                </div>
              )}
            </div>
            {imageUrl ? (
              <div className="relative mt-2 inline-block max-w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Category preview" className="max-h-36 rounded-md border object-contain" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-background shadow"
                  onClick={() => setImageUrl('')}
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-sort">Sort order</Label>
            <Input
              id="cat-sort"
              type="number"
              min={0}
              value={sortOrder === '' ? '' : sortOrder}
              onChange={(e) => {
                const v = e.target.value
                if (v === '') setSortOrder('')
                else {
                  const n = Number(v)
                  setSortOrder(Number.isNaN(n) ? 0 : Math.max(0, n))
                }
              }}
            />
          </div>
          {topLevelCategories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="cat-parent">Parent category (optional)</Label>
              <select
                id="cat-parent"
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={parentId ?? ''}
                onChange={(e) => setParentId(e.target.value ? e.target.value : null)}
              >
                <option value="">None (top-level)</option>
                {topLevelCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="cat-featured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-input"
            />
            <Label htmlFor="cat-featured">Featured on marketplace (top categories)</Label>
          </div>
          {isEdit && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cat-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="cat-active">Active (inactive categories are hidden from suppliers and marketplace)</Label>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || imageUploading}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {isEdit ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
