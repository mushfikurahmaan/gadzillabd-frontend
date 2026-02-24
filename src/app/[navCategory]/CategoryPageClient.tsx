'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowUpDown, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/common/ProductCard';
import FilterModal from '@/components/common/FilterModal';
import SortModal from '@/components/common/SortModal';
import type { Product, Category } from '@/types/product';
import { getCategoryBySlug, buildSubcategoryMap, getBrands } from '@/lib/api';
import styles from './category.module.css';

export type PaginationInfo = {
  totalCount: number;
  currentPage: number;
  totalPages: number;
};

function sortProducts(products: Product[], sortBy: string): Product[] {
  const sorted = [...products];
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => Number(a.price) - Number(b.price));
    case 'price-high':
      return sorted.sort((a, b) => Number(b.price) - Number(a.price));
    case 'name-az':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-za':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'newest':
    default:
      return sorted;
  }
}

function buildPaginationUrl(
  basePath: string,
  page: number,
  typeParam?: string,
  brandParam?: string
): string {
  const params = new URLSearchParams();
  if (typeParam) params.set('type', typeParam);
  if (brandParam) params.set('brand', brandParam);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return `${basePath}${qs ? `?${qs}` : ''}`;
}

export default function CategoryPageClient({
  navCategorySlug,
  products,
  searchParams: initialSearchParams,
  initialCategory,
  initialBrands = [],
  pagination,
}: {
  navCategorySlug: string;
  products: Product[];
  searchParams?: Record<string, string | string[] | undefined>;
  initialCategory?: Category;
  initialBrands?: string[];
  pagination?: PaginationInfo;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('');
  const [category, setCategory] = useState<Category | undefined>(initialCategory);
  const [brands, setBrands] = useState<string[]>(initialBrands);
  const [subcategoryMap, setSubcategoryMap] = useState<Record<string, string>>(
    initialCategory ? buildSubcategoryMap(initialCategory) : {}
  );
  const contentTopRef = useRef<HTMLDivElement>(null);
  const prevPageRef = useRef<number | null>(null);

  const typeParam = searchParams.get('type') || undefined;
  const brandParam = searchParams.get('brand') || undefined;

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const [cat, brandList] = await Promise.all([
          initialCategory ? Promise.resolve(initialCategory) : getCategoryBySlug(navCategorySlug),
          initialBrands.length > 0 ? Promise.resolve(initialBrands) : getBrands(navCategorySlug),
        ]);

        if (mounted) {
          setCategory(cat);
          setSubcategoryMap(buildSubcategoryMap(cat));
          setBrands(brandList);
        }
      } catch (error) {
        console.error('Failed to fetch category data:', error);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [navCategorySlug, initialCategory, initialBrands]);

  const subcategories = category?.subcategories ?? [];
  const activeSubcategory = typeParam ? subcategoryMap[typeParam] : null;
  const categoryDisplayName = category?.name ?? navCategorySlug;

  const sortedProducts = useMemo(() => sortProducts(products, selectedSort), [products, selectedSort]);

  // Scroll to top of product list when user navigates to a different page (not on initial load)
  useEffect(() => {
    const currentPage = pagination?.currentPage;
    if (currentPage == null) return;
    if (prevPageRef.current != null && prevPageRef.current !== currentPage && contentTopRef.current) {
      contentTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    prevPageRef.current = currentPage;
  }, [pagination?.currentPage]);

  const handleSortChange = (sort: string) => setSelectedSort(sort);

  const handleFilterChange = (filters: { subcategory: string | null; brand: string | null }) => {
    const params = new URLSearchParams();
    if (filters.subcategory) params.set('type', filters.subcategory);
    if (filters.brand) params.set('brand', filters.brand);
    const queryString = params.toString();
    // Omit page so server defaults to page 1 when filters change
    router.push(`/${navCategorySlug}${queryString ? `?${queryString}` : ''}`);
  };

  const activeFilterCount = (typeParam ? 1 : 0) + (brandParam ? 1 : 0);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          {activeSubcategory ? (
            <>
              <Link href={`/${navCategorySlug}`}>{categoryDisplayName}</Link>
              <span className={styles.breadcrumbSeparator}>&gt;</span>
              <span className={styles.breadcrumbCurrent}>{activeSubcategory}</span>
            </>
          ) : (
            <span className={styles.breadcrumbCurrent}>{categoryDisplayName}</span>
          )}
        </nav>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>
            {activeSubcategory || categoryDisplayName}
          </h1>
          <p className={styles.description}>
            {category?.description || ''}
          </p>
        </div>

        {/* Main Content */}
        <div className={styles.fullWidthLayout} ref={contentTopRef}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <button className={styles.toolbarBtn} onClick={() => setIsSortOpen(true)}>
                <ArrowUpDown size={16} />
                <span>Sort{selectedSort ? ': Active' : ''}</span>
              </button>
              <button className={styles.toolbarBtn} onClick={() => setIsFilterOpen(true)}>
                <SlidersHorizontal size={16} />
                <span>Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
              </button>
            </div>
            <div className={styles.toolbarRight}>
              {pagination && pagination.totalCount > sortedProducts.length
                ? `Showing ${sortedProducts.length} of ${pagination.totalCount} products`
                : `${sortedProducts.length} products found`}
            </div>
          </div>

          {/* Products Grid */}
          <div className={styles.grid}>
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className={styles.noProducts}>
                <p>
                  {typeParam || brandParam
                    ? `No products found in this category`
                    : `No products found`}
                </p>
                {(typeParam || brandParam) && (
                  <Link href={`/${navCategorySlug}`} className={styles.resetLink}>
                    View all {categoryDisplayName}
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <nav
              className={styles.pagination}
              aria-label="Product list pagination"
            >
              <div className={styles.paginationInfo}>
                Page {pagination.currentPage} of {pagination.totalPages}
                <span className={styles.paginationCount}>
                  ({pagination.totalCount} products)
                </span>
              </div>
              <ul className={styles.paginationList}>
                <li>
                  {pagination.currentPage <= 1 ? (
                    <span
                      className={styles.paginationBtnDisabled}
                      aria-disabled="true"
                    >
                      <ChevronLeft size={18} aria-hidden />
                      Previous
                    </span>
                  ) : (
                    <Link
                      href={buildPaginationUrl(
                        `/${navCategorySlug}`,
                        pagination.currentPage - 1,
                        typeParam,
                        brandParam
                      )}
                      className={styles.paginationBtn}
                      rel="prev"
                    >
                      <ChevronLeft size={18} aria-hidden />
                      Previous
                    </Link>
                  )}
                </li>
                <li>
                  {pagination.currentPage >= pagination.totalPages ? (
                    <span
                      className={styles.paginationBtnDisabled}
                      aria-disabled="true"
                    >
                      Next
                      <ChevronRight size={18} aria-hidden />
                    </span>
                  ) : (
                    <Link
                      href={buildPaginationUrl(
                        `/${navCategorySlug}`,
                        pagination.currentPage + 1,
                        typeParam,
                        brandParam
                      )}
                      className={styles.paginationBtn}
                      rel="next"
                    >
                      Next
                      <ChevronRight size={18} aria-hidden />
                    </Link>
                  )}
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        itemCount={sortedProducts.length}
        subcategories={subcategories}
        brands={brands}
        activeSubcategory={typeParam || null}
        activeBrand={brandParam || null}
        onFilterChange={handleFilterChange}
        categoryPath={`/${navCategorySlug}`}
      />

      <SortModal
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        selectedSort={selectedSort}
        onSortChange={handleSortChange}
      />
    </div>
  );
}
