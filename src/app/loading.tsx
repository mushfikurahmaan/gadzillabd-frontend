import { Spinner } from '@/components/ui';
import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        <Spinner size="lg" color="#ff4444" />
        <p className={styles.loadingText}>Loading...</p>
      </div>
    </div>
  );
}