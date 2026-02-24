import styles from './Spinner.module.css';

type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerVariant = 'primary' | 'white';

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
}

export default function Spinner({
  size = 'md',
  variant = 'primary',
  className = '',
}: SpinnerProps) {
  const classes = [
    styles.spinner,
    styles[size],
    variant === 'white' ? styles.white : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      aria-label="Loading..."
      role="status"
    >
      <div className={styles.spinnerCircle}></div>
    </div>
  );
}
