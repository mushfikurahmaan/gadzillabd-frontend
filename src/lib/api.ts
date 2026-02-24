import type { Brand, BrandType, Product, ProductCategoryItem, ProductDetail, Category, NavigationItem } from '@/types/product';

function getApiBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is required');
  }
  return apiUrl;
}

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function isPaginated<T>(data: unknown): data is Paginated<T> {
  return !!data && typeof data === 'object' && 'results' in data && Array.isArray((data as any).results);
}

/** Page size for product list; must match backend REST_FRAMEWORK.PAGE_SIZE */
export const PRODUCTS_PAGE_SIZE = 24;

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl().replace(/\/+$/, '');
  const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${res.statusText}: ${text || url}`);
  }

  return (await res.json()) as T;
}

/**
 * Fetch all navbar (main) categories with their subcategories.
 * Used for navigation, category pages, and dynamic content.
 */
export async function getCategories(): Promise<Category[]> {
  const data = await apiGet<Paginated<Category> | Category[]>('/api/navbar-categories/', {
    // Navbar categories rarely change; ok to cache briefly on server.
    next: { revalidate: 60 },
  } as any);
  return isPaginated<Category>(data) ? data.results : data;
}

/**
 * Fetch a single navbar category by slug with its subcategories.
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  return await apiGet<Category>(`/api/navbar-categories/${slug}/`, {
    next: { revalidate: 60 },
  } as any);
}

/**
 * Transform categories from API into navigation items for the Header.
 */
export function categoriesToNavigation(categories: Category[]): NavigationItem[] {
  return categories.map((cat) => ({
    name: cat.name.toUpperCase(),
    href: cat.href,
    path: cat.href,
    subcategories: cat.subcategories.map((sub) => ({
      name: sub.name,
      href: sub.href,
    })),
  }));
}

/**
 * Build a subcategory map from a category for use in page components.
 * Maps slug to display name.
 */
export function buildSubcategoryMap(category: Category): Record<string, string> {
  const map: Record<string, string> = {};
  for (const sub of category.subcategories) {
    map[sub.slug] = sub.name;
  }
  return map;
}

/**
 * @deprecated Use getCategories() instead
 */
export async function getLegacyCategories(): Promise<ProductCategoryItem[]> {
  const categories = await getCategories();
  return categories.map((cat) => ({
    id: String(cat.id),
    name: cat.name,
    slug: cat.slug,
    image: cat.image,
    href: cat.href,
    order: cat.order,
  }));
}

export async function getProducts(params?: {
  category?: string;
  subcategory?: string;
  brand?: string;
  featured?: boolean;
  hot_deals?: boolean;
  page?: number;
}): Promise<Product[]> {
  const sp = new URLSearchParams();
  if (params?.category) sp.set('category', params.category);
  if (params?.subcategory) sp.set('subcategory', params.subcategory);
  if (params?.brand) sp.set('brand', params.brand);
  if (typeof params?.featured === 'boolean') sp.set('featured', String(params.featured));
  if (typeof params?.hot_deals === 'boolean') sp.set('hot_deals', String(params.hot_deals));
  if (params?.page) sp.set('page', String(params.page));

  const qs = sp.toString();
  const data = await apiGet<Paginated<Product> | Product[]>(`/api/products/${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });
  return isPaginated<Product>(data) ? data.results : data;
}

/**
 * Fetch products with pagination metadata (for category pages with page navigation).
 * Uses same filters as getProducts; returns count and results for building pagination UI.
 */
export async function getProductsPaginated(params?: {
  category?: string;
  subcategory?: string;
  brand?: string;
  featured?: boolean;
  hot_deals?: boolean;
  page?: number;
}): Promise<Paginated<Product>> {
  const sp = new URLSearchParams();
  if (params?.category) sp.set('category', params.category);
  if (params?.subcategory) sp.set('subcategory', params.subcategory);
  if (params?.brand) sp.set('brand', params.brand);
  if (typeof params?.featured === 'boolean') sp.set('featured', String(params.featured));
  if (typeof params?.hot_deals === 'boolean') sp.set('hot_deals', String(params.hot_deals));
  const page = Math.max(1, params?.page ?? 1);
  sp.set('page', String(page));

  const qs = sp.toString();
  const data = await apiGet<Paginated<Product> | Product[]>(`/api/products/${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });
  if (!isPaginated<Product>(data)) {
    const list = data as Product[];
    return { count: list.length, next: null, previous: null, results: list };
  }
  return data;
}

/**
 * Fetch all unique brands, optionally filtered by category.
 */
export async function getBrands(category?: string): Promise<string[]> {
  const params = category ? `?category=${category}` : '';
  return await apiGet<string[]>(`/api/brands/${params}`, {
    next: { revalidate: 60 },
  } as any);
}

/**
 * Fetch brands for homepage showcase, optionally filtered by type.
 * Returns empty array if the API is unreachable (e.g. during build or when backend is down).
 * @param type - 'accessories' or 'gadgets' to filter by brand type
 */
export async function getBrandShowcase(type?: BrandType): Promise<Brand[]> {
  try {
    const params = type ? `?type=${type}` : '';
    return await apiGet<Brand[]>(`/api/brand-showcase/${params}`, {
      next: { revalidate: 60 },
    } as any);
  } catch {
    return [];
  }
}

export async function getProduct(id: string): Promise<ProductDetail> {
  return await apiGet<ProductDetail>(`/api/products/${id}/`, { cache: 'no-store' });
}

/**
 * Get subcategory name from slug using category data.
 */
export async function getSubcategoryName(categorySlug: string, subcategorySlug: string): Promise<string | undefined> {
  try {
    const category = await getCategoryBySlug(categorySlug);
    const subcat = category.subcategories.find(s => s.slug === subcategorySlug);
    return subcat?.name;
  } catch {
    return undefined;
  }
}

export async function getRelatedProducts(id: string): Promise<Product[]> {
  const data = await apiGet<Paginated<Product> | Product[]>(`/api/products/${id}/related/`, {
    cache: 'no-store',
  });
  return isPaginated<Product>(data) ? data.results : data;
}

/**
 * Search products by keyword.
 * Returns matching products based on name, brand, and description.
 * Minimum query length is 2 characters.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }
  const data = await apiGet<Paginated<Product> | Product[]>(
    `/api/products/search/?q=${encodeURIComponent(query.trim())}`,
    { cache: 'no-store' }
  );
  return isPaginated<Product>(data) ? data.results : data;
}

export type NotificationItem = {
  id: string | number;
  text: string;
  notificationType?: string;
  isCurrentlyActive?: boolean;
  link?: string | null;
  link_text?: string | null;
  order?: number;
  created_at?: string;
};

/**
 * Fetch active notifications. Returns empty array if the API is unreachable
 * (e.g. during build or when backend is down).
 */
export async function getActiveNotifications(): Promise<NotificationItem[]> {
  try {
    const data = await apiGet<Paginated<NotificationItem> | NotificationItem[]>(
      '/api/notifications/active/',
      { cache: 'no-store' }
    );
    return isPaginated<NotificationItem>(data) ? data.results : data;
  } catch {
    return [];
  }
}

