'use client';

import Link from 'next/link';
import { AlertTriangle, ChevronLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './error.module.css';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.iconWrap}>
          <AlertTriangle size={40} strokeWidth={1.5} aria-hidden />
        </div>

        <h1 className={styles.title}>Something went wrong</h1>

        <p className={styles.message}>
          We&rsquo;re having trouble loading this page. Please try again in a
          moment, or{' '}
          <Link href="/contact">contact our support team</Link> if the issue
          persists.
        </p>

        <div className={styles.actions}>
          <Button variant="primary" size="md" onClick={reset}>
            Try Again
          </Button>

          <Link href="/" className={styles.link}>
            <ChevronLeft size={18} aria-hidden />
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
