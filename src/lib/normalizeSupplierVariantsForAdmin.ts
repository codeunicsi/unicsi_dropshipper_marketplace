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
    return {
      ...(v as unknown as ProductVariant),
      variant_name: name != null ? String(name) : '',
      variant_price:
        price != null && price !== '' ? String(price) : '',
      variant_stock: Number(stock) || 0,
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
