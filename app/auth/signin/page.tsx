import { SignInForm } from '@/components/SignInForm';

export default function SignInPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string };
}) {
  const callbackUrl = searchParams?.callbackUrl || '/account';
  return (
    <SignInForm
      callbackUrl={callbackUrl}
      title="Sign in"
      subtitle="Sign in or create an account with Google."
    />
  );
}
