import Link from 'next/link';
import Button from '@/components/ui/Button';
import { getProduct, getRelatedProducts, getSubcategoryName } from '@/lib/api';
import ProductDetailClient from '@/components/ProductDetail/ProductDetailClient';
import styles from '@/components/ProductDetail/ProductDetail.module.css';
import type { Product } from '@/types/product';

export default async function GadgetsProductDetailPage({
  params,
}: {
  params: { subcategory: string; id: string } | Promise<{ subcategory: string; id: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const { subcategory, id } = resolvedParams;
  
  if (!id) {
    return (
      <div className={styles.notFound}>
        <h1>Product not found</h1>
        <p style={{ maxWidth: 640, textAlign: 'center', opacity: 0.7 }}>
          Missing route param: id
        </p>
        <Link href="/gadgets">
          <Button>Back to Gadgets</Button>
        </Link>
      </div>
    );
  }

  try {
    // Fetch product first; don't fail the whole page if "related" fails.
    const product = await getProduct(id);
    let relatedProducts: Product[] = [];
    try {
      relatedProducts = await getRelatedProducts(id);
    } catch {
      relatedProducts = [];
    }
    
    // Get subcategory name from the URL param or product data
    const subCategorySlug = subcategory || product.subCategory;
    let subCategoryName: string | undefined;
    if (subCategorySlug) {
      subCategoryName = await getSubcategoryName('gadgets', subCategorySlug);
    }
    
    return (
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
        listHref="/gadgets"
        listLabel="Gadgets"
        subCategoryName={subCategoryName}
        subCategorySlug={subCategorySlug || undefined}
      />
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return (
      <div className={styles.notFound}>
        <h1>Product not found</h1>
        <p style={{ maxWidth: 640, textAlign: 'center', opacity: 0.7 }}>
          {message}
        </p>
        <Link href="/gadgets">
          <Button>Back to Gadgets</Button>
        </Link>
      </div>
    );
  }
}
