import { getProducts, getCategoryBySlug, getBrands } from '@/lib/api';
import GadgetsPageClient from './GadgetsPageClient';

export default async function GadgetsPage({
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
      category: 'gadgets',
      subcategory: typeParam,
      brand: brandParam,
    }),
    getCategoryBySlug('gadgets').catch(() => undefined),
    getBrands('gadgets').catch(() => []),
  ]);
  
  return (
    <GadgetsPageClient 
      products={products} 
      searchParams={resolvedParams}
      initialCategory={category}
      initialBrands={brands}
    />
  );
}
