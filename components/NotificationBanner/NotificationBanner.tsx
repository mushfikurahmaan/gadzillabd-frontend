'use client';

import { useEffect, useState } from 'react';
import styles from './NotificationBanner.module.css';
import { getActiveNotifications, type NotificationItem } from '@/lib/api';

export default function NotificationBanner() {
  const [items, setItems] = useState<NotificationItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getActiveNotifications()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Repeat the text multiple times for seamless scrolling
  const text =
    items && items.length > 0
      ? items
          .slice()
          .sort((a, b) => (Number(a.order ?? 0) || 0) - (Number(b.order ?? 0) || 0))
          .map((n) => n.text)
          .filter(Boolean)
          .join(' • ')
      : '';
  const repetitions = 10; // Enough repetitions for smooth infinite scroll

  if (!text) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.marquee}>
        <div className={styles.marqueeContent}>
          {Array.from({ length: repetitions }).map((_, index) => (
            <span key={index} className={styles.text}>
              {text}
            </span>
          ))}
        </div>
        <div className={styles.marqueeContent} aria-hidden="true">
          {Array.from({ length: repetitions }).map((_, index) => (
            <span key={`duplicate-${index}`} className={styles.text}>
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
