import Link from 'next/link';
import { User, Heart, ShoppingBag, MapPin, Bell, HelpCircle, ChevronRight } from 'lucide-react';
import styles from './Account.module.css';

export const metadata = {
  title: 'Account | GADZILLA',
  description: 'Manage your account preferences and view your activity.',
};

const accountLinks = [
  {
    icon: ShoppingBag,
    title: 'Orders',
    description: 'View your order history and track shipments',
    href: '/track-order',
  },
  {
    icon: Heart,
    title: 'Wishlist',
    description: 'Items you\'ve saved for later',
    href: '/wishlist',
  },
  {
    icon: MapPin,
    title: 'Addresses',
    description: 'Manage your shipping addresses',
    href: '#',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Email and push notification preferences',
    href: '#',
  },
  {
    icon: HelpCircle,
    title: 'Help & Support',
    description: 'FAQs, contact support, and more',
    href: '/help',
  },
];

export default function AccountPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.avatarWrapper}>
            <User size={32} strokeWidth={1.5} />
          </div>
          <h1 className={styles.title}>My Account</h1>
          <p className={styles.subtitle}>
            Manage your account settings and preferences
          </p>
        </div>

        {/* Account Links */}
        <div className={styles.linksGrid}>
          {accountLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.title} href={link.href} className={styles.linkCard}>
                <div className={styles.linkIcon}>
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <div className={styles.linkContent}>
                  <h3 className={styles.linkTitle}>{link.title}</h3>
                  <p className={styles.linkDescription}>{link.description}</p>
                </div>
                <ChevronRight size={20} className={styles.linkArrow} />
              </Link>
            );
          })}
        </div>

        {/* Back to Home */}
        <Link href="/" className={styles.backLink}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
