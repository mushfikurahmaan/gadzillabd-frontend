'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/common/ProductCard';
import FilterModal from '@/components/common/FilterModal';
import SortModal from '@/components/common/SortModal';
import type { Product, Category } from '@/types/product';
import { getCategoryBySlug, buildSubcategoryMap, getBrands } from '@/lib/api';
import styles from './category.module.css';

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

export default function CategoryPageClient({
  navCategorySlug,
  products,
  searchParams: initialSearchParams,
  initialCategory,
  initialBrands = [],
}: {
  navCategorySlug: string;
  products: Product[];
  searchParams?: Record<string, string | string[] | undefined>;
  initialCategory?: Category;
  initialBrands?: string[];
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

  const handleSortChange = (sort: string) => setSelectedSort(sort);

  const handleFilterChange = (filters: { subcategory: string | null; brand: string | null }) => {
    const params = new URLSearchParams();
    if (filters.subcategory) params.set('type', filters.subcategory);
    if (filters.brand) params.set('brand', filters.brand);
    const queryString = params.toString();
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
        <div className={styles.fullWidthLayout}>
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
            <div className={styles.toolbarRight}>{sortedProducts.length} products found</div>
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
