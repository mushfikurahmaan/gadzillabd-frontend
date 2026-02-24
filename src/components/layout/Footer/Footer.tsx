import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

const footerLinks = {
  customer: {
    title: 'CUSTOMER',
    links: [
      { name: 'Account', href: '/account' },
      { name: 'Cart', href: '/cart' },
      { name: 'Wishlist', href: '/wishlist' },
      { name: 'Blog', href: '/blog' },
    ],
  },
  information: {
    title: 'INFORMATION',
    links: [
      { name: 'About us', href: '/about' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Return & Refund', href: '/return-refund' },
      { name: 'Cancellation Policy', href: '/cancellation-policy' },
    ],
  },
  support: {
    title: 'SUPPORT',
    links: [
      { name: 'FAQs', href: '/faqs' },
      { name: 'Shipping & Delivery', href: '/shipping' },
      { name: 'Track Order', href: '/track-order' },
      { name: 'Help Center', href: '/help' },
    ],
  },
  company: {
    title: 'COMPANY',
    links: [
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Store Locator', href: '/stores' },
      { name: 'Sustainability', href: '/sustainability' },
    ],
  },
};

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M12 2C6.477 2 2 6.478 2 12c0 4.992 3.657 9.128 8.438 9.878v-6.994H7.898V12h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.463h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.884h-2.33v6.994C18.343 21.128 22 16.992 22 12c0-5.522-4.477-10-10-10z"
      />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M16.6 5.2c-1.1-1.3-1.7-2.9-1.7-4.6h-3.2v14.3c0 1.5-1.2 2.7-2.7 2.7s-2.7-1.2-2.7-2.7 1.2-2.7 2.7-2.7c.3 0 .6.1.9.2V9.1c-.3 0-.6-.1-.9-.1-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6V8.9c1.3.9 2.8 1.4 4.4 1.4V7.2c-1.5 0-2.9-.7-3.9-2z"
      />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Main Footer */}
      <div className={styles.main}>
        <div className={styles.container}>
          {/* App Download */}
          <div className={styles.appSection}>
            <div className={styles.appLogo}>
              <Image 
                src="/assets/logo/gadzilla-logo512.svg" 
                alt="Gadzilla Logo" 
                width={48} 
                height={48} 
                className={styles.logoIcon}
                draggable={false}
              />
              <div>
                <div className={styles.appName}>GADZILLA</div>
                <div className={styles.appTagline}>Gadgets & Accessories</div>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key} className={styles.linkSection}>
              <h4 className={styles.sectionTitle}>{section.title}</h4>
              <ul className={styles.linkList}>
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={styles.link}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social Links */}
          <div className={styles.linkSection}>
            <h4 className={styles.sectionTitle}>SOCIAL LINKS</h4>
            <div className={styles.socialIcons}>
              <a
                className={styles.socialLink}
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <FacebookIcon className={styles.socialIcon} />
              </a>
              <a
                className={styles.socialLink}
                href="https://www.tiktok.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
              >
                <TikTokIcon className={styles.socialIcon} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
