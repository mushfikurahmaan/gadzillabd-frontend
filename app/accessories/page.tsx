import { getProducts, getCategoryBySlug, getBrands } from '@/lib/api';
import AccessoriesPageClient from './AccessoriesPageClient';

export default async function AccessoriesPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  // Get the filter params
  const resolvedParams = await Promise.resolve(searchParams);
  const typeParam = typeof resolvedParams?.type === 'string' ? resolvedParams.type : undefined;
  const brandParam = typeof resolvedParams?.brand === 'string' ? resolvedParams.brand : undefined;
  
  // Fetch products, category, and brands data in parallel
  const [products, category, brands] = await Promise.all([
    getProducts({ 
      category: 'accessories',
      subcategory: typeParam,
      brand: brandParam,
    }),
    getCategoryBySlug('accessories').catch(() => undefined),
    getBrands('accessories').catch(() => []),
  ]);
  
  return (
    <AccessoriesPageClient 
      products={products} 
      searchParams={resolvedParams}
      initialCategory={category}
      initialBrands={brands}
    />
  );
}
