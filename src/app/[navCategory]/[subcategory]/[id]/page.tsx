import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Button from '@/components/ui/Button';
import { getProduct, getRelatedProducts, getSubcategoryName, getCategoryBySlug } from '@/lib/api';
import ProductDetailClient from '@/components/common/ProductDetail/ProductDetailClient';
import styles from '@/components/common/ProductDetail/ProductDetail.module.css';
import type { Product } from '@/types/product';

type Params = { navCategory: string; subcategory: string; id: string };

export async function generateMetadata({
  params,
}: {
  params: Params | Promise<Params>;
}): Promise<Metadata> {
  const { id } = await Promise.resolve(params);

  try {
    const product = await getProduct(id);
    const price = typeof product.price === 'string' ? Number(product.price) : product.price;
    const priceText = Number.isFinite(price) ? `৳${price.toFixed(2)}` : '';

    return {
      title: `${product.name} | GADZILLA`,
      description: `${product.name}${product.brand ? ` by ${product.brand}` : ''}${priceText ? ` - ${priceText}` : ''}. ${product.description || 'Shop premium tech products.'}`,
    };
  } catch {
    return {
      title: 'Product | GADZILLA',
      description: 'Product details - GADZILLA',
    };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Params | Promise<Params>;
}) {
  const { navCategory, subcategory, id } = await Promise.resolve(params);

  if (!id) {
    return (
      <div className={styles.notFound}>
        <h1>Product not found</h1>
        <p>Missing route param: id</p>
        <Link href={`/${navCategory}`}>
          <Button>Back to {navCategory}</Button>
        </Link>
      </div>
    );
  }

  try {
    const product = await getProduct(id);

    let relatedProducts: Product[] = [];
    try {
      relatedProducts = await getRelatedProducts(id);
    } catch {
      relatedProducts = [];
    }

    // Resolve the navbar category display name
    let categoryLabel = navCategory;
    try {
      const cat = await getCategoryBySlug(navCategory);
      categoryLabel = cat.name;
    } catch {
      // Use slug as fallback label
    }

    // Resolve subcategory display name
    const subCategorySlug = subcategory || product.subCategory;
    let subCategoryName: string | undefined;
    if (subCategorySlug) {
      subCategoryName = await getSubcategoryName(navCategory, subCategorySlug);
    }

    return (
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
        listHref={`/${navCategory}`}
        listLabel={categoryLabel}
        subCategoryName={subCategoryName}
        subCategorySlug={subCategorySlug || undefined}
      />
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';

    // Surface a proper 404 for unknown products
    if (message.includes('404') || message.includes('Not Found')) {
      notFound();
    }

    return (
      <div className={styles.notFound}>
        <h1>Product not found</h1>
        <p>{message}</p>
        <Link href={`/${navCategory}`}>
          <Button>Back to {navCategory}</Button>
        </Link>
      </div>
    );
  }
}
