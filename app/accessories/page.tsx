import type { Metadata } from 'next';
import { getProducts, getCategoryBySlug, getBrands } from '@/lib/api';
import AccessoriesPageClient from './AccessoriesPageClient';

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(searchParams);
  const typeParam = typeof resolvedParams?.type === 'string' ? resolvedParams.type : undefined;
  
  let title = 'Accessories | GADZILLA';
  let description = 'Discover premium tech accessories and smart devices. Shop the latest accessories with amazing deals.';
  
  if (typeParam) {
    try {
      const category = await getCategoryBySlug('accessories');
      const subcategory = category?.subcategories?.find(s => s.slug === typeParam);
      if (subcategory) {
        title = `${subcategory.name} | GADZILLA`;
        description = `Shop ${subcategory.name.toLowerCase()} - premium tech accessories.`;
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
