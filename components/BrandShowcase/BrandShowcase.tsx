import Image from 'next/image';
import Link from 'next/link';
import styles from './BrandShowcase.module.css';
import { getBrandShowcase } from '@/lib/api';
import type { Brand } from '@/types/product';

interface FeatureCard {
  title: string;
  bgColor: string;
  href: string;
}

const featureCards: FeatureCard[] = [
  {
    title: 'New here! Explore our latest products',
    bgColor: '#CCFF00',
    href: '/gadgets',
  },
  {
    title: 'Latest tech accessories & gadgets',
    bgColor: '#5CE1E6',
    href: '/accessories',
  },
  {
    title: 'Whole Bangladesh delivery',
    bgColor: '#FFB6C1',
    href: '/shipping',
  },
  {
    title: 'Easy returns',
    bgColor: '#00D26A',
    href: '/return-refund',
  },
];

interface BrandSectionProps {
  title: string;
  brands: Brand[];
}

function BrandSection({ title, brands }: BrandSectionProps) {
  if (brands.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>{title}</h2>
      <div className={styles.brandGrid}>
        {brands.map((brand) => (
          <a
            key={brand.id}
            href={brand.redirectUrl}
            className={styles.brandCard}
            target="_blank"
            rel="noopener noreferrer"
            title={brand.name}
          >
            <div className={styles.brandImageWrapper}>
              <Image
                src={brand.image}
                alt={brand.name}
                fill
                className={styles.brandImage}
              />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default async function BrandShowcase() {
  // Fetch brands from the backend.
  // During build/prerender the API may be unavailable; fall back gracefully.
  let accessoriesBrands: Brand[] = [];
  let gadgetsBrands: Brand[] = [];
  try {
    [accessoriesBrands, gadgetsBrands] = await Promise.all([
      getBrandShowcase('accessories'),
      getBrandShowcase('gadgets'),
    ]);
  } catch (error) {
    console.error('Failed to load brand showcase:', error);
  }

  return (
    <section className={styles.section}>
      {/* Feature Banner Cards - Full Width Rectangles */}
      <div className={styles.featureGrid}>
        {featureCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className={styles.featureCard}
            style={{ backgroundColor: card.bgColor }}
          >
            <span className={styles.featureText}>{card.title}</span>
          </Link>
        ))}
      </div>

      {/* Top Accessories Brands Section */}
      <BrandSection title="Top Accessories Brands" brands={accessoriesBrands} />

      {/* Top Gadgets Brands Section */}
      <BrandSection title="Top Gadgets Brands" brands={gadgetsBrands} />
    </section>
  );
}
