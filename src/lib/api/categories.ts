import { apiClient, API_BASE_URL } from '@/lib/api-client'

export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  image_url: string | null
  sort_order: number
  is_featured: boolean
  is_active: boolean
  productCount?: number
}

export interface CategoriesListResponse {
  success: boolean
  data: Category[]
}

const base = 'categories'
const adminBase = 'admin/categories'

/** Upload category image to same backend storage as supplier products (uploads/images). */
export async function uploadCategoryImageFile(file: File): Promise<string> {
  const form = new FormData()
  form.append('image', file)
  const res = await fetch(`${API_BASE_URL}admin/categories/upload-image`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  })
  const data = (await res.json().catch(() => ({}))) as { success?: boolean; url?: string; message?: string }
  if (!res.ok) {
    throw new Error(typeof data.message === 'string' ? data.message : 'Upload failed')
  }
  if (!data.url) throw new Error('Upload did not return a URL')
  return data.url
}

/** List categories. For admin: use active=false to include inactive, withCount=true for product counts. */
export async function listCategories(options?: {
  active?: boolean
  withCount?: boolean
}): Promise<Category[]> {
  const params = new URLSearchParams()
  if (options?.active === false) params.set('active', 'false')
  if (options?.withCount === true) params.set('withCount', 'true')
  const qs = params.toString()
  const url = qs ? `${base}?${qs}` : base
  const res = await apiClient.get(url) as CategoriesListResponse
  return res?.data ?? []
}

/** Create category (admin). */
export async function createCategory(body: {
  name: string
  slug: string
  image_url?: string | null
  sort_order?: number
  is_featured?: boolean
  parent_id?: string | null
}): Promise<Category> {
  const res = await apiClient.post(adminBase, body) as { success: boolean; data: Category }
  if (!res?.data) throw new Error('Failed to create category')
  return res.data
}

/** Update category (admin). */
export async function updateCategory(
  id: string,
  body: Partial<{
    name: string
    slug: string
    image_url: string | null
    sort_order: number
    is_featured: boolean
    is_active: boolean
    parent_id: string | null
  }>
): Promise<Category> {
  const res = await apiClient.put(`${adminBase}/${id}`, body) as { success: boolean; data: Category }
  if (!res?.data) throw new Error('Failed to update category')
  return res.data
}

/** Deactivate category (admin) – soft delete. */
export async function deactivateCategory(id: string): Promise<Category> {
  const res = await apiClient.delete(`${adminBase}/${id}`) as { success: boolean; data: Category }
  if (!res?.data) throw new Error('Failed to deactivate category')
  return res.data
}

/** Permanently delete category (admin). Products in this category are unlinked (category_id set to null). */
export async function deleteCategoryPermanent(id: string): Promise<void> {
  const res = await apiClient.delete(`${adminBase}/${id}/permanent`) as { success: boolean }
  if (!res?.success) throw new Error('Failed to delete category')
}
