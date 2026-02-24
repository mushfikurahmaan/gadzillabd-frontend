import Hero from '@/components/common/Hero';
import BrandShowcase from '@/components/common/BrandShowcase';
import NotificationBanner from '@/components/common/NotificationBanner';

export default function HomePage() {
  return (
    <>
      <NotificationBanner />
      <Hero />
      <BrandShowcase />
    </>
  );
}
