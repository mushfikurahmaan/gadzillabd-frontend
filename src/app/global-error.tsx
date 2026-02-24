'use client';

import { AlertTriangle, ChevronLeft } from 'lucide-react';
import './globals.css';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="global-error-body">
        <div className="global-error-page">
          <div className="global-error-content">
            <a href="/" className="global-error-brand">
              GADZILLA
            </a>

            <div className="global-error-icon">
              <AlertTriangle size={40} strokeWidth={1.5} aria-hidden />
            </div>

            <h1 className="heading-2 text-center">Something went wrong</h1>

            <p className="global-error-message">
              We&rsquo;re sorry — an unexpected error occurred. Please try
              again, or come back in a little while.
            </p>

            <div className="global-error-actions">
              <button className="global-error-btn" onClick={reset}>
                Try Again
              </button>

              <a href="/" className="global-error-link">
                <ChevronLeft size={18} aria-hidden />
                Back to Homepage
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
