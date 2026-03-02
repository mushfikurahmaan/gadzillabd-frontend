import type { Metadata } from 'next';
import CartClient from './CartClient';

export const metadata: Metadata = {
  title: 'Cart | GADZILLA',
  description: 'Your cart — review items and proceed to checkout.',
};

export default function CartPage() {
  return <CartClient />;
}
