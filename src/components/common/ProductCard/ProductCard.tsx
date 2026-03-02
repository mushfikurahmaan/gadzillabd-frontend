'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import styles from './ProductCard.module.css';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { toggleItem, isInWishlist } = useWishlist();
  const { addItem: addToCart, isInCart } = useCart();
  const wishlisted = isInWishlist(product.id);
  const inCart = isInCart(product.id);

  const price = typeof product.price === 'string' ? Number(product.price) : product.price;
  const originalPrice =
    product.originalPrice == null
      ? null
      : typeof product.originalPrice === 'string'
        ? Number(product.originalPrice)
        : product.originalPrice;

  const discount =
    originalPrice && Number.isFinite(originalPrice) && Number.isFinite(price)
      ? Math.round((1 - price / originalPrice) * 100)
      : 0;

  const isOnSale = product.badge === 'sale' && discount > 0;

  const imageSrc = product.image || '/assets/logo/gadzillabd-logo.svg';
  const productIdentifier = product.slug || product.id;
  const productBasePath = product.category ? `/${product.category}` : '/gadgets';
  const subCategoryPath = product.subCategory ? `/${product.subCategory}` : '';
  const productHref = `${productBasePath}${subCategoryPath}/${productIdentifier}`;

  return (
    <article className={styles.card}>
      <Link href={productHref} className={styles.imageLink}>
        <div className={styles.imageWrapper}>
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className={styles.image}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          
          {/* Discount badge - top left */}
          {isOnSale && (
            <span className={styles.discountBadge}>-{discount}%</span>
          )}
          
          {/* Wishlist button - bottom right */}
          <button
            className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlisted : ''} ${inCart ? styles.wishlistBtnDisabled : ''}`}
            aria-label={inCart ? 'In cart' : wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            disabled={inCart}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleItem(product);
            }}
          >
            <Heart
              size={20}
              fill={inCart ? '#bbb' : wishlisted ? '#ff4444' : 'none'}
              stroke={inCart ? '#bbb' : wishlisted ? '#ff4444' : 'currentColor'}
            />
          </button>
        </div>
      </Link>

      <div className={styles.content}>
        {/* Product name */}
        <Link href={productHref} className={styles.nameLink}>
          <h3 className={styles.name}>
            {product.name}
          </h3>
        </Link>
        
        {/* Price row */}
        <div className={styles.priceRow}>
          {isOnSale && originalPrice != null && Number.isFinite(originalPrice) && (
            <span className={styles.originalPrice}>
              ৳{originalPrice.toFixed(2)}
            </span>
          )}
          <span className={`${styles.price} ${isOnSale ? styles.salePrice : ''}`}>
            ৳{Number.isFinite(price) ? price.toFixed(2) : String(product.price)}
          </span>
        </div>
        
        {/* Stock indicator */}
        {typeof product.stock === 'number' && (
          <div className={styles.stockRow}>
            <span className={`${styles.stock} ${product.stock === 0 ? styles.stockOut : product.stock < 10 ? styles.stockLow : ''}`}>
              {product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Running Out Quickly' : 'In Stock'}
            </span>
          </div>
        )}

        <button
          type="button"
          className={`${styles.addToCartBtn} ${inCart ? styles.addToCartBtnInCart : ''}`}
          disabled={inCart}
          onClick={(e) => {
            e.preventDefault();
            if (onAddToCart) {
              onAddToCart(product);
            } else {
              addToCart(product);
            }
          }}
        >
          {inCart ? 'Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}
