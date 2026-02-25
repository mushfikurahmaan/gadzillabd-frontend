import Image from 'next/image';
import Link from 'next/link';
import styles from './FeaturedProducts.module.css';

import { getCategories } from '@/lib/api';
import type { Category } from '@/types/product';

export default async function FeaturedProducts() {
  let productCategories: Category[] = [];
  try {
    productCategories = await getCategories();
  } catch (error) {
    console.error('Failed to load categories:', error);
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Products</h2>
        <div className={`${styles.grid} stagger`}>
          {productCategories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className={styles.productWrapper}
            >
              <div className={styles.categoryCard}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={category.image || '/assets/logo/gadzillabd-logo.svg'}
                    alt={category.name}
                    fill
                    className={styles.categoryImage}
                  />
                </div>
                <h3 className={styles.categoryName}>{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
