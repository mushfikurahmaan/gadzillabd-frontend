import Link from 'next/link';
import styles from './FeatureBanner.module.css';

const features = [
  {
    title: 'New here?',
    subtitle: 'Explore our latest products',
    color: 'lime',
    href: '/gadgets',
  },
  {
    title: 'Mobile App',
    subtitle: 'Coming Soon - Stay tuned!',
    color: 'cyan',
    href: '/',
  },
  {
    title: 'Worldwide delivery',
    subtitle: '',
    color: 'pink',
    href: '/shipping',
  },
  {
    title: 'Easy returns',
    subtitle: '',
    color: 'green',
    href: '/return-refund',
  },
];

export default function FeatureBanner() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {features.map((feature, index) => (
          <Link
            key={index}
            href={feature.href}
            className={`${styles.card} ${styles[feature.color]}`}
          >
            <h3 className={styles.title}>{feature.title}</h3>
            {feature.subtitle && (
              <p className={styles.subtitle}>{feature.subtitle}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
