'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';
import { useWishlist } from '@/context/WishlistContext';
import type { Product } from '@/types/product';
import styles from './Wishlist.module.css';

function buildCheckoutUrl(products: Product[]): string {
  const params = products.map((p) => `product=${encodeURIComponent(p.id)}`).join('&');
  return `/order?${params}`;
}

export default function WishlistClient() {
  const router = useRouter();
  const { items, removeItem, clearAll, hydrated } = useWishlist();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!hydrated) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loading}>Loading your wishlist…</div>
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
            <span className={styles.breadcrumbCurrent}>Wishlist</span>
          </nav>

          <div className={styles.pageHeader}>
            <h1 className={styles.title}>Wishlist</h1>
          </div>

          <div className={styles.empty}>
            <Heart size={64} className={styles.emptyIcon} strokeWidth={1} />
            <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
            <p className={styles.emptyText}>
              Save items you love and come back to them anytime.
            </p>
            <Link href="/gadgets" className={styles.emptyBrowseBtn}>
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const allSelected = selected.size === items.length;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelected(allSelected ? new Set() : new Set(items.map((p) => p.id)));
  };

  const handleClearAll = async () => {
    await clearAll();
    setSelected(new Set());
    setShowClearConfirm(false);
  };

  const selectedItems = items.filter((p) => selected.has(p.id));

  const selectedTotal = selectedItems.reduce((sum, p) => {
    const pr = typeof p.price === 'string' ? Number(p.price) : p.price;
    return sum + (Number.isFinite(pr) ? pr : 0);
  }, 0);

  const handleItemCheckout = (product: Product) => {
    router.push(`/order?product=${encodeURIComponent(product.id)}`);
  };

  const handleMultiCheckout = () => {
    const url = buildCheckoutUrl(selectedItems);
    setSelected(new Set());
    router.push(url);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <span className={styles.breadcrumbCurrent}>Wishlist</span>
        </nav>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Wishlist</h1>
        </div>

        {/* Main content */}
        <div className={styles.fullWidthLayout}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <button className={styles.toolbarBtn} onClick={handleSelectAll}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={allSelected}
                  onChange={handleSelectAll}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Select all items"
                />
                <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
                {selected.size > 0 && (
                  <span className={styles.selectedBadge}>{selected.size}</span>
                )}
              </button>
              <button
                className={`${styles.toolbarBtn} ${styles.toolbarBtnDanger}`}
                onClick={() => setShowClearConfirm(true)}
              >
                <SlidersHorizontal size={16} />
                <span>Clear Wishlist</span>
              </button>
            </div>
            <div className={styles.toolbarRight}>
              {items.length} {items.length === 1 ? 'product' : 'products'} saved
            </div>
          </div>

          {/* Grid */}
          <div className={styles.grid}>
            {items.map((product) => {
              const isSelected = selected.has(product.id);
              const stock = typeof product.stock === 'number' ? product.stock : null;

              return (
                <div
                  key={product.id}
                  className={`${styles.itemWrapper} ${isSelected ? styles.itemSelected : ''}`}
                >
                  {/* Checkbox overlay */}
                  <div className={styles.checkboxOverlay}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={isSelected}
                      onChange={() => toggleSelect(product.id)}
                      aria-label={`Select ${product.name}`}
                    />
                  </div>

                  {/* Product Card — uses the same component as everywhere else */}
                  <ProductCard product={product} />

                  {/* Per-item checkout CTA */}
                  <div className={styles.itemFooter}>
                    {stock === 0 ? (
                      <span className={`${styles.checkoutBtn} ${styles.checkoutBtnDisabled}`}>
                        Out of Stock
                      </span>
                    ) : (
                      <button
                        className={styles.checkoutBtn}
                        onClick={() => handleItemCheckout(product)}
                      >
                        Checkout
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clear Wishlist Confirmation Modal */}
      {showClearConfirm && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="clear-confirm-title">
          <div className={styles.modal}>
            <h2 id="clear-confirm-title" className={styles.modalTitle}>Clear Wishlist</h2>
            <p className={styles.modalBody}>
              Are you sure you want to clear all items from your wishlist?
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={styles.modalConfirmBtn}
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky multi-checkout bar */}
      {selectedItems.length > 0 && (
        <div className={styles.stickyBar}>
          <div className={styles.stickyBarInfo}>
            <span className={styles.stickyBarTitle}>
              {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
            </span>
            <span className={styles.stickyBarSubtitle}>
              Total: ৳{selectedTotal.toFixed(2)} (excl. delivery)
            </span>
          </div>
          <div className={styles.stickyBarActions}>
            <button
              className={styles.stickyDeselectBtn}
              onClick={() => setSelected(new Set())}
            >
              Deselect
            </button>
            <button
              className={styles.stickyCheckoutBtn}
              onClick={handleMultiCheckout}
            >
              <ShoppingBag size={16} />
              Checkout ({selectedItems.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
