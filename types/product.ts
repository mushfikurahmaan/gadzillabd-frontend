export type ProductBadge = 'sale' | 'new' | 'hot';

export type BrandType = 'accessories' | 'gadgets';

/**
 * Brand item for homepage showcase.
 * Represents a brand card with image and redirect URL.
 */
export interface Brand {
  id: number | string;
  name: string;
  slug: string;
  image: string;
  redirectUrl: string;
  brandType: BrandType;
  order?: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number | string;
  originalPrice?: number | string | null;
  image: string | null;
  badge?: ProductBadge | null;
  category?: string | null;  // Category slug
  subCategory?: string | null;  // Subcategory slug
  slug?: string;
}

export interface ProductDetail extends Product {
  images?: string[];
  description?: string;
  subCategory?: string | null;  // Subcategory slug
  availableSizes?: string[];
  is_featured?: boolean;
  created_at?: string;
}

/**
 * Subcategory item returned from the API.
 * Represents a child category under a main category.
 */
export interface Subcategory {
  id: number | string;
  name: string;
  slug: string;
  image: string | null;
  href: string;
  order?: number;
}

/**
 * Main category with nested subcategories.
 * Used for navigation and category pages.
 */
export interface Category {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  image: string | null;
  href: string;
  order?: number;
  subcategories: Subcategory[];
}

/**
 * Navigation item derived from Category for the Header component.
 */
export interface NavigationItem {
  name: string;
  href: string;
  path: string;
  subcategories: {
    name: string;
    href: string;
  }[];
}

/**
 * @deprecated Use Category instead
 */
export interface ProductCategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  href: string;
  order?: number;
}

