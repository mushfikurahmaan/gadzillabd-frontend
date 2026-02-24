import styles from './NotificationBanner.module.css';
import { getActiveNotifications, type NotificationItem } from '@/lib/api';

const REPETITIONS = 10;

export default async function NotificationBanner() {
  const items = await getActiveNotifications();

  const text =
    items.length > 0
      ? items
          .slice()
          .sort((a, b) => (Number(a.order ?? 0) || 0) - (Number(b.order ?? 0) || 0))
          .map((n) => n.text)
          .filter(Boolean)
          .join(' • ')
      : '';

  if (!text) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.marquee}>
        <div className={styles.marqueeContent}>
          {Array.from({ length: REPETITIONS }).map((_, index) => (
            <span key={index} className={styles.text}>
              {text}
            </span>
          ))}
        </div>
        <div className={styles.marqueeContent} aria-hidden="true">
          {Array.from({ length: REPETITIONS }).map((_, index) => (
            <span key={`duplicate-${index}`} className={styles.text}>
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
