import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getProductsPaginated, getCategoryBySlug, getBrands, PRODUCTS_PAGE_SIZE } from '@/lib/api';
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
  const pageParam = typeof resolvedParams?.page === 'string' ? resolvedParams.page : undefined;
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  // Validate that the navbar category exists; show 404 if not
  let category;
  try {
    category = await getCategoryBySlug(navCategory);
  } catch {
    notFound();
  }

  const [paginated, brands] = await Promise.all([
    getProductsPaginated({
      category: navCategory,
      subcategory: typeParam,
      brand: brandParam,
      page: currentPage,
    }),
    getBrands(navCategory).catch(() => []),
  ]);

  const totalPages = Math.max(1, Math.ceil(paginated.count / PRODUCTS_PAGE_SIZE));
  if (currentPage > totalPages && totalPages > 0) {
    const params = new URLSearchParams();
    if (typeParam) params.set('type', typeParam);
    if (brandParam) params.set('brand', brandParam);
    params.set('page', String(totalPages));
    redirect(`/${navCategory}?${params.toString()}`);
  }
  const safePage = Math.min(currentPage, totalPages);

  return (
    <CategoryPageClient
      navCategorySlug={navCategory}
      products={paginated.results}
      searchParams={resolvedParams}
      initialCategory={category}
      initialBrands={brands}
      pagination={{
        totalCount: paginated.count,
        currentPage: safePage,
        totalPages,
      }}
    />
  );
}
