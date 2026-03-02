'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/lib/cartDB';
import styles from './Cart.module.css';

function buildCheckoutUrl(ids: string[]): string {
  const params = ids.map((id) => `product=${encodeURIComponent(id)}`).join('&');
  return `/order?${params}`;
}

interface CartCardProps {
  item: CartItem;
  removeItem: (id: string) => void;
}

function CartCard({ item, removeItem }: CartCardProps) {
  const price = typeof item.price === 'string' ? Number(item.price) : item.price;
  const originalPrice =
    item.originalPrice == null
      ? null
      : typeof item.originalPrice === 'string'
        ? Number(item.originalPrice)
        : item.originalPrice;
  const discount =
    originalPrice && Number.isFinite(originalPrice) && Number.isFinite(price)
      ? Math.round((1 - price / originalPrice) * 100)
      : 0;
  const isOnSale = item.badge === 'sale' && discount > 0;
  const imageSrc = item.image || '/assets/logo/gadzillabd-logo.svg';
  const productIdentifier = item.slug || item.id;
  const productBasePath = item.category ? `/${item.category}` : '/gadgets';
  const subCategoryPath = item.subCategory ? `/${item.subCategory}` : '';
  const productHref = `${productBasePath}${subCategoryPath}/${productIdentifier}`;

  return (
    <article className={styles.card}>
      <Link href={productHref} className={styles.imageLink}>
        <div className={styles.imageWrapper}>
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            className={styles.image}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {isOnSale && (
            <span className={styles.discountBadge}>-{discount}%</span>
          )}
          <button
            className={styles.removeBtn}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeItem(item.id); }}
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </Link>

      <div className={styles.content}>
        <Link href={productHref} className={styles.nameLink}>
          <h3 className={styles.name}>{item.name}</h3>
        </Link>

        <div className={styles.priceRow}>
          {isOnSale && originalPrice != null && Number.isFinite(originalPrice) && (
            <span className={styles.originalPrice}>৳{originalPrice.toFixed(2)}</span>
          )}
          <span className={`${styles.price} ${isOnSale ? styles.salePrice : ''}`}>
            ৳{Number.isFinite(price) ? price.toFixed(2) : String(item.price)}
          </span>
        </div>

        {typeof item.stock === 'number' && (
          <div className={styles.stockRow}>
            <span className={`${styles.stock} ${item.stock === 0 ? styles.stockOut : item.stock < 10 ? styles.stockLow : ''}`}>
              {item.stock === 0 ? 'Out of Stock' : item.stock < 10 ? 'Running Out Quickly' : 'In Stock'}
            </span>
          </div>
        )}

      </div>
    </article>
  );
}

export default function CartClient() {
  const router = useRouter();
  const { items, hydrated, totalPrice, removeItem, clearAll } = useCart();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!hydrated) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loading}>Loading your cart…</div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span className={styles.breadcrumbSeparator}>&gt;</span>
            <span className={styles.breadcrumbCurrent}>Cart</span>
          </nav>

          <div className={styles.pageHeader}>
            <h1 className={styles.title}>Cart</h1>
          </div>

          <div className={styles.empty}>
            <ShoppingCart size={64} className={styles.emptyIcon} strokeWidth={1} />
            <h2 className={styles.emptyTitle}>Your cart is empty</h2>
            <p className={styles.emptyText}>
              Add items from your wishlist or browse our collection.
            </p>
            <Link href="/gadgets" className={styles.emptyBrowseBtn}>
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleClearAll = async () => {
    await clearAll();
    setShowClearConfirm(false);
  };

  const handleCheckout = () => {
    const url = buildCheckoutUrl(items.map((p) => p.id));
    router.push(url);
  };

  const itemCount = items.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <span className={styles.breadcrumbCurrent}>Cart</span>
        </nav>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Cart</h1>
        </div>

        <div className={styles.fullWidthLayout}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <button
                className={`${styles.toolbarBtn} ${styles.toolbarBtnDanger}`}
                onClick={() => setShowClearConfirm(true)}
              >
                <SlidersHorizontal size={16} />
                <span>Clear Cart</span>
              </button>
            </div>
            <div className={styles.toolbarRight}>
              {items.length} {items.length === 1 ? 'product' : 'products'} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </div>
          </div>

          {/* Product grid */}
          <div className={styles.grid}>
            {items.map((item) => <CartCard key={item.id} item={item} removeItem={removeItem} />)}
          </div>
        </div>
      </div>

      {/* Sticky order summary bar */}
      <div className={styles.stickyBar}>
        <div className={styles.stickyBarInfo}>
          <span className={styles.stickyBarTitle}>
            ৳{totalPrice.toFixed(2)} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          <span className={styles.stickyBarSubtitle}>
            Delivery: ৳60 inside Dhaka · ৳150 outside Dhaka
          </span>
        </div>
        <div className={styles.stickyBarActions}>
          <Link href="/gadgets" className={styles.stickySecondaryBtn}>
            Continue Shopping
          </Link>
          <button className={styles.stickyCheckoutBtn} onClick={handleCheckout}>
            <ShoppingCart size={16} />
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-cart-title"
        >
          <div className={styles.modal}>
            <h2 id="clear-cart-title" className={styles.modalTitle}>Clear Cart</h2>
            <p className={styles.modalBody}>
              Are you sure you want to remove all items from your cart?
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button className={styles.modalConfirmBtn} onClick={handleClearAll}>
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
