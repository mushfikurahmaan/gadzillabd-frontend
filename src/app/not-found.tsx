import Link from 'next/link';
import { SearchX, ChevronLeft } from 'lucide-react';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.iconWrap}>
          <SearchX size={40} strokeWidth={1.5} aria-hidden />
        </div>

        <p className={styles.statusCode}>404</p>

        <h1 className={styles.title}>Page Not Found</h1>

        <p className={styles.message}>
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have
          been moved. Head back to our homepage to continue shopping.
        </p>

        <Link href="/" className={styles.cta}>
          <ChevronLeft size={18} aria-hidden />
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
