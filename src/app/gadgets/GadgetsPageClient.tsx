'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/common/ProductCard';
import FilterModal from '@/components/common/FilterModal';
import SortModal from '@/components/common/SortModal';
import type { Product, Category, Subcategory } from '@/types/product';
import { getCategoryBySlug, buildSubcategoryMap, getBrands } from '@/lib/api';
import styles from '../products/products.module.css';

// Sort function for products
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
      return sorted; // Already sorted by newest from API
  }
}

// Fallback subcategories in case API fails
const fallbackSubcategories: Subcategory[] = [
  { id: '1', name: 'New In', slug: 'new', image: null, href: '/gadgets?type=new' },
  { id: '2', name: 'Audio', slug: 'audio', image: null, href: '/gadgets?type=audio' },
  { id: '3', name: 'Wearables', slug: 'wearables', image: null, href: '/gadgets?type=wearables' },
  { id: '4', name: 'Smart Home', slug: 'smart-home', image: null, href: '/gadgets?type=smart-home' },
  { id: '5', name: 'Gaming', slug: 'gaming', image: null, href: '/gadgets?type=gaming' },
  { id: '6', name: 'Cameras', slug: 'cameras', image: null, href: '/gadgets?type=cameras' },
  { id: '7', name: 'Drones', slug: 'drones', image: null, href: '/gadgets?type=drones' },
];

export default function GadgetsPageClient({
  products,
  searchParams: initialSearchParams,
  initialCategory,
  initialBrands = [],
}: {
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

  // Get current filter params
  const typeParam = searchParams.get('type') || undefined;
  const brandParam = searchParams.get('brand') || undefined;

  // Fetch category and brands data if not provided
  useEffect(() => {
    let mounted = true;
    
    async function fetchData() {
      try {
        const [cat, brandList] = await Promise.all([
          initialCategory ? Promise.resolve(initialCategory) : getCategoryBySlug('gadgets'),
          initialBrands.length > 0 ? Promise.resolve(initialBrands) : getBrands('gadgets'),
        ]);
        
        if (mounted) {
          setCategory(cat);
          setSubcategoryMap(buildSubcategoryMap(cat));
          setBrands(brandList);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    }
    
    fetchData();
    
    return () => {
      mounted = false;
    };
  }, [initialCategory, initialBrands]);

  // Get subcategories from category or use fallback
  const subcategories = category?.subcategories || fallbackSubcategories;

  // Get active subcategory name
  const activeSubcategory = typeParam ? subcategoryMap[typeParam] : null;

  // Sort products
  const sortedProducts = useMemo(() => {
    return sortProducts(products, selectedSort);
  }, [products, selectedSort]);

  // Handle sort change
  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
  };

  // Handle filter changes
  const handleFilterChange = (filters: { subcategory: string | null; brand: string | null }) => {
    const params = new URLSearchParams();
    if (filters.subcategory) {
      params.set('type', filters.subcategory);
    }
    if (filters.brand) {
      params.set('brand', filters.brand);
    }
    const queryString = params.toString();
    router.push(`/gadgets${queryString ? `?${queryString}` : ''}`);
  };

  // Count active filters
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
              <Link href="/gadgets">Gadgets</Link>
              <span className={styles.breadcrumbSeparator}>&gt;</span>
              <span className={styles.breadcrumbCurrent}>{activeSubcategory}</span>
            </>
          ) : (
            <span className={styles.breadcrumbCurrent}>Gadgets</span>
          )}
        </nav>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>
            {activeSubcategory || 'Gadgets'}
          </h1>
          <p className={styles.description}>
            {category?.description || 
              'Discover the latest in tech innovation with our curated gadgets collection. From audio gear to smart wearables, find the perfect device to enhance your digital lifestyle.'}
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
            <div className={styles.toolbarRight}>{sortedProducts.length} gadgets found</div>
          </div>

          {/* Products Grid */}
          <div className={styles.grid}>
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className={styles.noProducts}>
                <p>{typeParam || brandParam ? 'No gadgets found in this category' : 'No gadgets found'}</p>
                {(typeParam || brandParam) && (
                  <Link href="/gadgets" className={styles.resetLink}>
                    View all gadgets
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        itemCount={sortedProducts.length}
        subcategories={subcategories}
        brands={brands}
        activeSubcategory={typeParam || null}
        activeBrand={brandParam || null}
        onFilterChange={handleFilterChange}
        categoryPath="/gadgets"
      />

      {/* Sort Modal */}
      <SortModal
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        selectedSort={selectedSort}
        onSortChange={handleSortChange}
      />
    </div>
  );
}

