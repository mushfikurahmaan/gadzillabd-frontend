import { getProduct, getSubcategoryName, getCategoryBySlug, getProducts } from '@/lib/api';
import OrderClient from './OrderClient';
import type { ProductDetail, Product } from '@/types/product';

interface OrderItem extends ProductDetail {
  quantity: number;
  categoryName?: string;
  subCategoryName?: string;
}

interface SearchParams {
  product?: string | string[];
  quantity?: string | string[];
}

export default async function OrderPage({
  searchParams,
}: {
  searchParams: SearchParams | Promise<SearchParams>;
}) {
  // Resolve searchParams if it's a Promise (Next.js 15+)
  const resolvedParams = await Promise.resolve(searchParams);
  
  // Get product IDs from query params
  const productIds = Array.isArray(resolvedParams.product)
    ? resolvedParams.product
    : resolvedParams.product
      ? [resolvedParams.product]
      : [];

  // Get quantities from query params (default to 1 if not provided)
  const quantities = Array.isArray(resolvedParams.quantity)
    ? resolvedParams.quantity.map(q => parseInt(String(q)) || 1)
    : resolvedParams.quantity
      ? [parseInt(String(resolvedParams.quantity)) || 1]
      : productIds.map(() => 1);

  // Fetch all products
  const orderItems: (OrderItem | null)[] = await Promise.all(
    productIds.map(async (productId, index): Promise<OrderItem | null> => {
      try {
        const product = await getProduct(productId);
        const quantity = quantities[index] || 1;

        // Get category name
        let categoryName: string | undefined;
        if (product.category) {
          try {
            const category = await getCategoryBySlug(product.category);
            categoryName = category.name;
          } catch {
            // Category not found, skip
          }
        }

        // Get subcategory name
        let subCategoryName: string | undefined;
        if (product.subCategory && product.category) {
          try {
            subCategoryName = await getSubcategoryName(product.category, product.subCategory);
          } catch {
            // Subcategory not found, skip
          }
        }

        return {
          ...product,
          quantity,
          categoryName,
          subCategoryName,
        };
      } catch (error) {
        // If product fetch fails, return a placeholder
        console.error(`Failed to fetch product ${productId}:`, error);
        return null;
      }
    })
  );

  // Filter out any failed product fetches
  const validOrderItems = orderItems.filter((item): item is OrderItem => item !== null);

  // Fetch available products for the product picker with category/subcategory info
  let availableProducts: Product[] = [];
  try {
    const products = await getProducts();
    // Enrich products with category/subcategory names
    availableProducts = await Promise.all(
      products.slice(0, 20).map(async (product) => {
        try {
          const productDetail = await getProduct(product.id);
          let categoryName: string | undefined;
          let subCategoryName: string | undefined;

          if (productDetail.category) {
            try {
              const category = await getCategoryBySlug(productDetail.category);
              categoryName = category.name;
              if (productDetail.subCategory) {
                subCategoryName = await getSubcategoryName(productDetail.category, productDetail.subCategory);
              }
            } catch {
              // Category fetch failed
            }
          }

          return {
            ...product,
            categoryName,
            subCategoryName,
          };
        } catch {
          return product;
        }
      })
    );
  } catch {
    // If fetch fails, use empty array
  }

  // If no valid products, show empty state or redirect
  if (validOrderItems.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>No products selected</h1>
        <p>Please select a product to place an order.</p>
      </div>
    );
  }

  return <OrderClient initialProducts={validOrderItems} availableProducts={availableProducts} />;
}
