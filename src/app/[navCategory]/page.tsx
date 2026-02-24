import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProducts, getCategoryBySlug, getBrands } from '@/lib/api';
import CategoryPageClient from './CategoryPageClient';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { navCategory: string } | Promise<{ navCategory: string }>;
  searchParams?: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const { navCategory } = await Promise.resolve(params);
  const resolvedParams = await Promise.resolve(searchParams);
  const typeParam = typeof resolvedParams?.type === 'string' ? resolvedParams.type : undefined;

  try {
    const category = await getCategoryBySlug(navCategory);
    let title = `${category.name} | GADZILLA`;
    let description = category.description || `Discover the latest ${category.name.toLowerCase()} and tech products.`;

    if (typeParam) {
      const subcategory = category.subcategories?.find((s) => s.slug === typeParam);
      if (subcategory) {
        title = `${subcategory.name} | GADZILLA`;
        description = `Shop ${subcategory.name.toLowerCase()} - premium ${category.name.toLowerCase()} products.`;
      }
    }

    return { title, description };
  } catch {
    return {
      title: 'GADZILLA',
      description: 'Discover the latest gadgets and tech products.',
    };
  }
}

export default async function NavCategoryPage({
  params,
  searchParams,
}: {
  params: { navCategory: string } | Promise<{ navCategory: string }>;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { navCategory } = await Promise.resolve(params);
  const resolvedParams = await Promise.resolve(searchParams);
  const typeParam = typeof resolvedParams?.type === 'string' ? resolvedParams.type : undefined;
  const brandParam = typeof resolvedParams?.brand === 'string' ? resolvedParams.brand : undefined;

  // Validate that the navbar category exists; show 404 if not
  let category;
  try {
    category = await getCategoryBySlug(navCategory);
  } catch {
    notFound();
  }

  const [products, brands] = await Promise.all([
    getProducts({
      category: navCategory,
      subcategory: typeParam,
      brand: brandParam,
    }),
    getBrands(navCategory).catch(() => []),
  ]);

  return (
    <CategoryPageClient
      navCategorySlug={navCategory}
      products={products}
      searchParams={resolvedParams}
      initialCategory={category}
      initialBrands={brands}
    />
  );
}
