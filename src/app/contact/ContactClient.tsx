'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import styles from './Contact.module.css';

interface FormData {
  name: string;
  phone: string;
  email: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormData | 'general', string>>;

function stripHtml(value: string): string {
  return value.replace(/[<>]/g, '');
}

function sanitize(formData: FormData): FormData {
  return {
    name: stripHtml(formData.name.trim()),
    phone: formData.phone.replace(/[\s\-]/g, ''),
    email: formData.email.trim().toLowerCase(),
    message: stripHtml(formData.message.trim()),
  };
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name) {
    errors.name = 'Name is required';
  } else if (data.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (data.name.length > 100) {
    errors.name = 'Name must be under 100 characters';
  }

  if (!data.phone) {
    errors.phone = 'Phone number is required';
  } else if (!/^01[0-9]{9}$/.test(data.phone)) {
    errors.phone = 'Enter a valid Bangladeshi number (e.g. 01XXXXXXXXX)';
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!data.message) {
    errors.message = 'Message is required';
  } else if (data.message.length < 10) {
    errors.message = 'Message must be at least 10 characters';
  } else if (data.message.length > 1000) {
    errors.message = 'Message must be under 1000 characters';
  }

  return errors;
}

export default function ContactClient() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name as keyof FormData];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const clean = sanitize(formData);
    const validationErrors = validate(clean);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || '';

      const payload: Record<string, string> = {
        name: clean.name,
        phone: clean.phone,
        message: clean.message,
      };
      if (clean.email) {
        payload.email = clean.email;
      }

      const response = await fetch(`${apiBaseUrl}/api/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 'Something went wrong. Please try again.'
        );
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.';
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Contact Us</span>
        </nav>

        <div className={styles.layout}>
          {/* Left — info panel */}
          <aside className={styles.infoColumn}>
            <h1 className={styles.infoTitle}>Get in Touch</h1>
            <div className={styles.infoAccent} />
            <p className={styles.infoSubtitle}>
              Have a question about an order, a product, or anything else?
              Fill in the form and our team will get back to you as soon as
              possible.
            </p>

            <div className={styles.infoDetails}>
              <div className={styles.infoItem}>
                <span className={styles.infoItemLabel}>Response time</span>
                <span className={styles.infoItemValue}>
                  Within 24 hours
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoItemLabel}>Business hours</span>
                <span className={styles.infoItemValue}>
                  Sat – Thu, 9 AM – 8 PM
                </span>
              </div>
            </div>
          </aside>

          {/* Right — form or success */}
          <div className={styles.formColumn}>
            {submitted ? (
              <div className={styles.successCard}>
                <div className={styles.successIcon}>
                  <CheckCircle size={28} strokeWidth={1.5} />
                </div>
                <h2 className={styles.successTitle}>Message Sent!</h2>
                <p className={styles.successMessage}>
                  Thanks for reaching out. We&rsquo;ve received your message
                  and will get back to you shortly.
                </p>
                <div className={styles.successActions}>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        message: '',
                      });
                    }}
                  >
                    Send Another Message
                  </Button>
                  <Link href="/">
                    <Button variant="outline" size="md">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>Send a Message</h2>

                {errors.general && (
                  <div className={styles.errorBanner} role="alert">
                    {errors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className={styles.fieldRow}>
                    {/* Name */}
                    <div className={styles.fieldWrapper}>
                      <label htmlFor="name" className={styles.fieldLabel}>
                        Full Name <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <span className={styles.errorText} role="alert">
                          {errors.name}
                        </span>
                      )}
                    </div>

                    {/* Phone */}
                    <div className={styles.fieldWrapper}>
                      <label htmlFor="phone" className={styles.fieldLabel}>
                        Phone Number <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="01XXXXXXXXX"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                        disabled={isSubmitting}
                      />
                      {errors.phone && (
                        <span className={styles.errorText} role="alert">
                          {errors.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className={styles.fieldWrapper}>
                    <label htmlFor="email" className={styles.fieldLabel}>
                      Email Address{' '}
                      <span
                        style={{
                          color: 'var(--color-text-muted)',
                          fontWeight: 400,
                          fontSize: 'var(--font-size-sm)',
                        }}
                      >
                        (optional)
                      </span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <span className={styles.errorText} role="alert">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Message */}
                  <div className={styles.fieldWrapper}>
                    <label htmlFor="message" className={styles.fieldLabel}>
                      Message <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Write your message here..."
                      value={formData.message}
                      onChange={handleChange}
                      className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                      disabled={isSubmitting}
                    />
                    {errors.message && (
                      <span className={styles.errorText} role="alert">
                        {errors.message}
                      </span>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className={styles.buttonSpinner}>
                          <Spinner size="sm" variant="white" />
                        </span>
                        Sending…
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
