import type { Metadata } from 'next';
import WishlistClient from './WishlistClient';

export const metadata: Metadata = {
  title: 'Wishlist | GADZILLA',
  description: 'Your saved items — view, manage and checkout your wishlist.',
};

export default function WishlistPage() {
  return <WishlistClient />;
}
