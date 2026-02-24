import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.imageWrapper}>
        <div className={styles.placeholder}>
          <span>Hero Image</span>
        </div>
        <div className={styles.overlay} />
      </div>
    </section>
  );
}
