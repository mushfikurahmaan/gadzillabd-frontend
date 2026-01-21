'use client';

import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignInForm } from '@/components/SignInForm';

export default function SignInPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/account';

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace(callbackUrl);
    }
  }, [status, session, callbackUrl, router]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--color-text-muted)' }}>Loading…</span>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null; // redirecting
  }

  return (
    <SignInForm
      callbackUrl={callbackUrl}
      title="Sign in"
      subtitle="Sign in or create an account with Google."
    />
  );
}
