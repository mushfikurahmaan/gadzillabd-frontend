import type { Metadata } from 'next';
import { getProducts, getCategoryBySlug, getBrands } from '@/lib/api';
import GadgetsPageClient from './GadgetsPageClient';

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(searchParams);
  const typeParam = typeof resolvedParams?.type === 'string' ? resolvedParams.type : undefined;
  
  let title = 'Gadgets | GADZILLA';
  let description = 'Discover the latest gadgets and tech devices. Shop premium products with amazing deals.';
  
  if (typeParam) {
    try {
      const category = await getCategoryBySlug('gadgets');
      const subcategory = category?.subcategories?.find(s => s.slug === typeParam);
      if (subcategory) {
        title = `${subcategory.name} | GADZILLA`;
        description = `Shop ${subcategory.name.toLowerCase()} - premium gadgets and tech devices.`;
      }
    } catch {
      // Fallback to default
    }
  }
  
  return {
    title,
    description,
  };
}

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
