'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [animatePrice, setAnimatePrice] = useState(false);
  const priceRef = useRef(null);

  // Trigger price drop animation every 5 seconds (2s animation + 3s pause)
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatePrice(true);
    }, 5000);
    // Trigger first animation shortly after mount
    setTimeout(() => setAnimatePrice(true), 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset animation class after animation ends to allow re-triggering
  useEffect(() => {
    if (animatePrice) {
      const handleAnimationEnd = () => {
        setAnimatePrice(false);
      };
      priceRef.current?.addEventListener('animationend', handleAnimationEnd);
      return () => {
        priceRef.current?.removeEventListener('animationend', handleAnimationEnd);
      };
    }
  }, [animatePrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      // Extract source from URL query params
      const urlParams = new URLSearchParams(window.location.search);
      const source = urlParams.get('src') || 'direct';

      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowThankYou(true);
        setEmail('');
      } else {
        // Handle duplicate email or other validation errors
        if (data.error) {
          setError(data.error);
        } else {
          // For duplicate emails, show thank you state
          setShowThankYou(true);
          setEmail('');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showThankYou) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base px-6 py-12 text-center inter">
        <h1 className="fraunces text-3xl font-bold text-primary mb-4">
          Never miss an Amazon price drop again
        </h1>
        <p className="text-lg text-muted mb-8">
          Add a product, get pinged on WhatsApp the moment the price changes. Built for Indian shoppers.
        </p>
        <div className="bg-surface rounded-xl p-8 max-w-md w-full">
          <h2 className="fraunces text-2xl font-semibold text-primary mb-4">
            You're on the list — we'll email you when it's ready.
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base px-6 py-12 inter">
      <div className="max-w-xl w-full space-y-5">
        <h1 className="fraunces text-4xl font-black text-primary mb-2">
          Never miss an Amazon price drop again
        </h1>
        {/* Hairline rule under main headline */}
        <div className="hairline mb-4"></div>
        <p className="text-xl text-muted">
          Add a product, get pinged on WhatsApp the moment the price changes. Built for Indian shoppers.
        </p>

        {/* Animated price ticker card */}
        <div className="bg-surface rounded-lg p-4 flex items-center space-x-3">
          <span className="text-muted font-medium inter">Apple iPhone 15</span>
          <div className="flex flex-col items-end space-y-1">
            <span className={`jetBrainsMono text-muted line-through`}>
              $999
            </span>
            <span className={`jetBrainsMono text-signal ${animatePrice ? 'animate-price-drop' : ''}`}
                  ref={priceRef}>
              $899
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted mb-2 inter">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isSubmitting}
              className={`block w-full rounded-lg border border-muted px-4 py-3 text-primary
                focus:outline-none focus:ring-2 focus-ring-accent focus:border-accent
                ${error ? 'border-red-500 focus:ring-red-500' : ''}
                ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            />
            {error && (
              <p className="mt-2 text-sm text-red-500">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className={`w-full bg-accent hover:bg-accent/90 text-primary font-semibold py-3 px-4 rounded-lg
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              ${isSubmitting ? 'opacity-75' : ''}`}
          >
            {isSubmitting ? 'Joining...' : 'Join the waitlist'}
          </button>
        </form>
      </div>
    </div>
  );
}