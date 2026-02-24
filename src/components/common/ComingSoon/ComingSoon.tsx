import Link from 'next/link';
import { Construction, ChevronLeft } from 'lucide-react';
import styles from './ComingSoon.module.css';

interface ComingSoonProps {
  /** Page name shown in the title (e.g. "Account", "Wishlist") */
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.iconWrap}>
          <Construction size={40} strokeWidth={1.5} aria-hidden />
        </div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.message}>This page will be updated soon.</p>
        <Link href="/" className={styles.cta}>
          <ChevronLeft size={18} aria-hidden />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
