import type { ProductVariant } from '@/hooks/usePendingProducts'

/**
 * Supplier API returns Sequelize variant fields: price, inventory_quantity, title.
 * Admin UI expects variant_price, variant_stock, variant_name.
 */
export function normalizeSupplierVariantsForAdmin(
  variants: unknown[] | undefined | null,
): ProductVariant[] {
  if (!variants?.length) return []
  return variants.map((raw) => {
    const v = raw as Record<string, unknown>
    const price = v.variant_price ?? v.price
    const stock = v.variant_stock ?? v.inventory_quantity
    const name = v.variant_name ?? v.title
    const dimRaw = v.dimension_cm ?? v.dimensions_cm
    let dimensions_cm = { h: 0, l: 0, w: 0 }
    if (dimRaw && typeof dimRaw === 'object' && !Array.isArray(dimRaw)) {
      const o = dimRaw as Record<string, unknown>
      dimensions_cm = {
        h: Number(o.h ?? o.height ?? 0) || 0,
        l: Number(o.l ?? o.length ?? 0) || 0,
        w: Number(o.w ?? o.width ?? 0) || 0,
      }
    }
    return {
      ...(v as unknown as ProductVariant),
      variant_name: name != null ? String(name) : '',
      variant_price:
        price != null && price !== '' ? String(price) : '',
      variant_stock: Number(stock) || 0,
      dimensions_cm,
      dimension_cm: dimRaw,
    }
  })
}

export function mapProductsWithNormalizedVariants<T extends { variants?: unknown[] }>(
  products: T[] | undefined | null,
): (T & { variants: ProductVariant[]; supplierName?: string })[] {
  if (!products?.length) return []
  return products.map((p) => {
    const raw = p as Record<string, unknown>
    const supplier = raw.supplier as { name?: string } | undefined
    return {
      ...p,
      supplierName:
        (typeof raw.supplierName === 'string' ? raw.supplierName : undefined) ??
        supplier?.name ??
        '',
      variants: normalizeSupplierVariantsForAdmin(p.variants),
    }
  })
}
