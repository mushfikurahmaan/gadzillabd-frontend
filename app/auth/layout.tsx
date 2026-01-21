import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in | GADZILLA',
  description: 'Sign in with Google to access your GADZILLA account.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
