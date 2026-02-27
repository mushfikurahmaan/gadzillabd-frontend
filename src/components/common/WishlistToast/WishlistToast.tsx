'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Heart, X } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import styles from './WishlistToast.module.css';

const AUTO_DISMISS_MS = 4000;

export default function WishlistToast() {
  const { notification, dismissNotification } = useWishlist();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!notification) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dismissNotification();
    }, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [notification, dismissNotification]);

  if (!notification) return null;

  return (
    <div key={notification.key} className={styles.toast} role="status" aria-live="polite">
      <div className={styles.icon}>
        <Heart size={18} fill="#ff4444" stroke="#ff4444" />
      </div>
      <div className={styles.body}>
        <p className={styles.message}>
          <span className={styles.productName}>{notification.productName}</span>
          {' '}added to your wishlist
        </p>
        <Link href="/wishlist" className={styles.link} onClick={dismissNotification}>
          Go to Wishlist
        </Link>
      </div>
      <button
        className={styles.close}
        onClick={dismissNotification}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
