import Link from 'next/link';
import styles from './Success.module.css';

export default function OrderSuccessPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <svg
              className={styles.checkIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className={styles.title}>Order Placed Successfully!</h1>
          <p className={styles.message}>
            Thank you for your order. We have received your order and will contact you shortly to confirm it.
          </p>
          <div className={styles.actions}>
            <Link href="/" className={styles.homeButton}>
              Continue Shopping
            </Link>
            <Link href="/track-order" className={styles.trackButton}>
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
