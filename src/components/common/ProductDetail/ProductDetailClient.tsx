'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';
import type { Product, ProductDetail } from '@/types/product';
import styles from './ProductDetail.module.css';

export default function ProductDetailClient({
  product,
  relatedProducts,
  listHref,
  listLabel,
  subCategoryName,
  subCategorySlug,
}: {
  product: ProductDetail;
  relatedProducts: Product[];
  listHref: string;
  listLabel: string;
  subCategoryName?: string;
  subCategorySlug?: string;
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const stock = typeof product.stock === 'number' ? product.stock : null;
  const maxQuantity = stock !== null ? stock : Infinity;
  const [quantity, setQuantity] = useState(1);

  const images = useMemo(() => {
    const all = [product.image || null, ...(product.images || [])].filter(Boolean) as string[];
    if (all.length === 0) return ['/assets/logo/gadzilla-logo512.svg'];
    return Array.from(new Set(all));
  }, [product.image, product.images]);

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

  const isOnSale = discount > 0 && originalPrice;

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span className={styles.breadcrumbSep}>&gt;</span>
          <Link href={listHref}>{listLabel}</Link>
          {subCategoryName && subCategorySlug && (
            <>
              <span className={styles.breadcrumbSep}>&gt;</span>
              <Link href={`${listHref}?type=${subCategorySlug}`}>{subCategoryName}</Link>
            </>
          )}
          <span className={styles.breadcrumbSep}>&gt;</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </nav>

        <div className={styles.productLayout}>
          {/* Left Side - Image Gallery */}
          <div className={styles.gallerySection}>
            {/* Thumbnails */}
            <div className={styles.thumbnails}>
              {images.map((img, index) => (
                <button
                  key={`thumb-${index}`}
                  className={`${styles.thumbnail} ${selectedImage === index ? styles.thumbnailActive : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    className={styles.thumbImg}
                    sizes="60px"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className={styles.mainImageWrapper}>
              <div className={styles.mainImage}>
                <Image
                  src={images[selectedImage] || images[0]}
                  alt={product.name}
                  fill
                  className={styles.productImage}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button 
                      className={`${styles.imageNav} ${styles.imageNavPrev}`}
                      onClick={handlePrevImage}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      className={`${styles.imageNav} ${styles.imageNavNext}`}
                      onClick={handleNextImage}
                      aria-label="Next image"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

              </div>
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div className={styles.productInfo}>
            {/* Product Name */}
            <h1 className={styles.productName}>
              {product.name}
            </h1>

            {/* Price Section */}
            <div className={styles.priceSection}>
              {isOnSale ? (
                <>
                  <span className={styles.nowPrice}>
                    Now ৳{Number.isFinite(price) ? price.toFixed(2) : String(product.price)}
                  </span>
                  <span className={styles.wasPrice}>
                    Was ৳{originalPrice.toFixed(2)} <span className={styles.discountPercent}>(-{discount}%)</span>
                  </span>
                </>
              ) : (
                <span className={styles.regularPrice}>
                  ৳{Number.isFinite(price) ? price.toFixed(2) : String(product.price)}
                </span>
              )}
            </div>


            {/* Color (if applicable) */}
            <div className={styles.colorSection}>
              <span className={styles.colorLabel}>BRAND:</span>
              <span className={styles.colorValue}>{product.brand?.toUpperCase() || 'DEFAULT'}</span>
            </div>

            {/* Stock Section */}
            {stock !== null && (
              <div className={styles.stockSection}>
                <span className={styles.stockLabel}>STOCK:</span>
                <span className={`${styles.stockValue} ${stock === 0 ? styles.stockOut : stock < 10 ? styles.stockLow : ''}`}>
                  {stock === 0 ? 'Out of Stock' : stock < 10 ? `Only ${stock} left` : `${stock} in stock`}
                </span>
              </div>
            )}

            {/* Quantity Selector */}
            <div className={styles.quantitySection}>
              <span className={styles.quantityLabel}>QUANTITY:</span>
              <div className={styles.quantityControl}>
                <button
                  className={styles.quantityBtn}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className={styles.quantityValue}>{quantity}</span>
                <button 
                  className={styles.quantityBtn} 
                  onClick={() => setQuantity(Math.min(quantity + 1, maxQuantity))}
                  disabled={quantity >= maxQuantity}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Bag Section */}
            <div className={styles.addToCartSection}>
              <Link 
                href={`/order?product=${product.id}&quantity=${quantity}`} 
                className={`${styles.addToBagBtn} ${(stock === 0 || quantity > maxQuantity) ? styles.addToBagBtnDisabled : ''}`}
                onClick={(e) => {
                  if (stock === 0 || quantity > maxQuantity) {
                    e.preventDefault();
                  }
                }}
              >
                {stock === 0 ? 'OUT OF STOCK' : 'CHECKOUT'}
              </Link>
              <button 
                className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlisted : ''}`}
                onClick={() => setIsWishlisted(!isWishlisted)}
                aria-label="Add to wishlist"
                disabled
              >
                <Heart size={24} fill={isWishlisted ? '#ff4444' : 'none'} stroke={isWishlisted ? '#ff4444' : 'currentColor'} />
              </button>
            </div>

            {/* Product Details Accordion */}
            <div className={styles.accordion}>
              <button 
                className={styles.accordionHeader}
                onClick={() => setShowProductDetails(!showProductDetails)}
              >
                <span>Product Details</span>
                {showProductDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {showProductDetails && (
                <div className={styles.accordionContent}>
                  {product.description ? (
                    <p>{product.description}</p>
                  ) : (
                    <p>No additional product details available.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>You might also like</h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
