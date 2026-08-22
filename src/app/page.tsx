'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [animatePrice, setAnimatePrice] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null); // null = none open, number = index

  const priceRef = useRef<HTMLSpanElement>(null);

  // Refs for animations
  const heroTextContainer = useRef<HTMLDivElement>(null);
  const heroImage = useRef<HTMLImageElement>(null);
  const benefitSection = useRef<HTMLDivElement>(null);
  const howItWorksSection = useRef<HTMLDivElement>(null);
  const whyWhatsAppSection = useRef<HTMLDivElement>(null);
  const planSection = useRef<HTMLDivElement>(null);
  const faqSection = useRef<HTMLDivElement>(null);

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

  // Page load animations for hero content
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Animate hero text container (headline, subhead, form)
    if (heroTextContainer.current) {
      heroTextContainer.current.classList.add('animate-fade-in-up');
    }
    // Animate hero image with slight delay
    if (heroImage.current) {
      heroImage.current.classList.add('animate-fade-in');
      heroImage.current.style.animationDelay = '150ms';
    }
  }, []);

  // Scroll-triggered reveal animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const observerOptions = {
      threshold: 0.1, // Trigger when 10% of the element is visible
      rootMargin: '0px 0px -50px 0px' // Slightly earlier trigger
    };

    const observeSection = (ref: React.RefObject<HTMLElement | null>, classNameToAdd: string): IntersectionObserver => {
      // We assume ref.current is not null because we check before calling.
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // ref.current is guaranteed non-null by the caller's check
            ref.current!.classList.add(classNameToAdd);
            observer.disconnect();
          }
        });
      }, observerOptions);

      observer.observe(ref.current!);
      return observer;
    };

    const observers: IntersectionObserver[] = [];

    // Observe Benefit section
    if (benefitSection.current) {
      observers.push(observeSection(benefitSection, 'animate-fade-in-up'));
    }
    // Observe How It Works section
    if (howItWorksSection.current) {
      observers.push(observeSection(howItWorksSection, 'how-it-works-animate'));
    }
    // Observe Why WhatsApp section
    if (whyWhatsAppSection.current) {
      observers.push(observeSection(whyWhatsAppSection, 'animate-fade-in-up'));
    }
    // Observe Choose Your Plan section
    if (planSection.current) {
      observers.push(observeSection(planSection, 'plan-cards-animate'));
    }
    // Observe FAQ section
    if (faqSection.current) {
      observers.push(observeSection(faqSection, 'animate-fade-in-up'));
    }

    // Cleanup observers
    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, []);

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

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
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
    <div className="min-h-screen flex flex-col bg-base">
      {/* Navigation Bar */}
      <nav className="nav">
        <div className="nav-content">
          <div className="nav-logo">WhatsPrice</div>
          <div className="nav-links hidden md:flex">
            <a href="#how-it-works" className="nav-link">How it Works</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </div>
          <button
            onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-muted hover:text-primary hover:underline px-2 py-1 hidden md:block transition-colors duration-200"
          >
            Join Waitlist
          </button>
          {/* Mobile menu button (optional, but we can keep simple) */}
          <button
            id="mobile-menu-button"
            className="md:hidden p-2"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18"></path>
            </svg>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="space-y-8">
            {/* Hero Section */}
            <section id="hero">
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-2 md:items-center md:gap-8">
                  {/* Image placeholder */}
                  <div className="md:row-span-2 flex items-center justify-center mb-6 md:mb-0">
                    {/*
                      TODO: Replace '/hero-person.jpg' with actual photo of a person using phone casually
                      Image should be candid, not corporate stock-photo stiff
                    */}
                    <img
                      ref={heroImage}
                      src="/hero-person.jpg"
                      alt="Casual photo of person using smartphone"
                      className="w-full h-[350px] object-cover rounded-lg shadow-soft"
                    />
                  </div>

                  {/* Text and form content */}
                  <div ref={heroTextContainer} className="space-y-6">
                    <div className="flex items-center space-x-2 text-xs font-medium uppercase text-muted mb-4">
                      <div className="hairline w-4"></div>
                      <span className="whitespace-nowrap">AMAZON INDIA · WHATSAPP ALERTS</span>
                      <div className="hairline w-4"></div>
                    </div>
                    <h1 className="fraunces text-4xl font-black text-primary mb-2">
                      Never miss an Amazon price drop again
                    </h1>
                    {/* Hairline rule under main headline */}
                    <div className="hairline mb-4"></div>
                    <p className="text-xl text-muted">
                      Add a product, <strong>get pinged on WhatsApp the moment the price changes</strong>. Built for Indian shoppers.
                    </p>

                    {/* Trust/credibility row */}
                    <p className="text-xs text-muted">
  Building this in public — follow progress on <a href="https://x.com/Lavi1212216" className="underline hover:no-underline">X</a> · <a href="https://github.com/lavigaming167-max" className="underline hover:no-underline">GitHub</a>
</p>

                    {/* Animated price ticker card */}
                    <div className="bg-surface rounded-lg p-4 flex items-center space-x-3">
                      <span className="text-muted font-medium inter">Apple iPhone 15</span>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`jetBrainsMono text-muted line-through`}>
                          ₹79,999
                        </span>
                        <span className={`jetBrainsMono text-signal ${animatePrice ? 'animate-price-drop' : ''}`}
                              ref={priceRef}>
                          ₹69,999
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
                          transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover-scale
                          ${isSubmitting ? 'opacity-75' : ''}`}
                      >
                        {isSubmitting ? 'Joining...' : 'Join the waitlist'}
                      </button>
                      <p className="text-xs text-muted whitespace-nowrap">
                        Free to join · Takes 10 seconds · No spam, ever.
                      </p>
                    </form>
                  </div>

                  {/* Floating mockup card positioned over the image */}
                  <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 w-[220px] lg:right-0 lg:top-auto lg:bottom-0 lg:-translate-x-1/2 lg:translate-y-[20%] lg:-rotate-6 float-animation">
                    <div className="bg-surface rounded-lg p-4 shadow-soft">
                      <div className="flex items-start space-x-3">
                        <svg className="h-5 w-5 text-signal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-primary">Price Drop Alert</p>
                          <p className="text-xs text-muted">Apple iPhone 15 — now ₹69,999 (was ₹79,999)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Why WhatsPrice Benefit Grid Section */}
            <section id="why-whatsprice" ref={benefitSection} className="mt-12">
              <h2 className="fraunces text-2xl font-bold text-primary mb-6 text-center">
                Why WhatsPrice
              </h2>
              <div className="benefit-grid">
                {/* Benefit Card 1 */}
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83-2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83 2.83M16.24 7.76l2.83-2.83"></path>
                    </svg>
                  </div>
                  <h3 className="benefit-headline">No App to Download</h3>
                  <p className="benefit-description">
                    Works entirely <strong>through WhatsApp</strong>, the app you already use every day.
                  </p>
                </div>

                {/* Benefit Card 2 */}
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8v4l3 3"></path>
                      <path d="M16 13H8a4 4 0 010-8h8"></path>
                    </svg>
                  </div>
                  <h3 className="benefit-headline">Instant Alerts</h3>
                  <p className="benefit-description">
                    Get notified <strong>the moment a price actually drops</strong>, not hours later.
                  </p>
                </div>

                {/* Benefit Card 3 */}
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8v4l3 3M6 6h.01M18 6h.01"></path>
                    </svg>
                  </div>
                  <h3 className="benefit-headline">Zero Manual Checking</h3>
                  <p className="benefit-description">
                    <strong>Share a link once</strong>. We handle the watching from there.
                  </p>
                </div>

                {/* Benefit Card 4 */}
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4v16a2 2 0 002 2h12a2 2 0 002-2V4"></path>
                    </svg>
                  </div>
                  <h3 className="benefit-headline">Built for Amazon.in</h3>
                  <p className="benefit-description">
                    Designed specifically around <strong>Indian pricing and product listings</strong>.
                  </p>
                </div>

                {/* Benefit Card 5 */}
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-3z"></path>
                    </svg>
                  </div>
                  <h3 className="benefit-headline">Simple Free Tier</h3>
                  <p className="benefit-description">
                    <strong>Track your first product free</strong>, no credit card required.
                  </p>
                </div>

                {/* Benefit Card 6 */}
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="benefit-headline">Unlimited on Paid</h3>
                  <p className="benefit-description">
                    Upgrade for <strong>unlimited tracked products</strong> and instant WhatsApp pings.
                  </p>
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" ref={howItWorksSection} className="mt-12">
              <h2 className="fraunces text-2xl font-bold text-primary mb-6 text-center">
                How It Works
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
                {/* Step 1 */}
                <div className="step border-r md:border-b-0 md:border-r mb-8 md:mb-0 pb-8 md:pb-0 last:border-0">
                  <div className="flex items-center justify-center mb-4">
                    {/* Icon for step 1: link */}
                    <svg className="h-8 w-8 text-signal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.72"></path>
                    </svg>
                    <div className="jetBrainsMono text-3xl font-bold text-primary mb-2 ml-3">01</div>
                  </div>
                  <h3 className="fraunces text-lg font-semibold text-primary mb-1">Share the link</h3>
                  <p className="text-sm text-muted">Paste any Amazon.in product link, or forward it to us on WhatsApp</p>
                </div>

                {/* Step 2 */}
                <div className="step border-r md:border-b-0 md:border-r mb-8 md:mb-0 pb-8 md:pb-0 last:border-0">
                  <div className="flex items-center justify-center mb-4">
                    {/* Icon for step 2: eye */}
                    <svg className="h-8 w-8 text-signal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <div className="jetBrainsMono text-3xl font-bold text-primary mb-2 ml-3">02</div>
                  </div>
                  <h3 className="fraunces text-lg font-semibold text-primary mb-1">We track it</h3>
                  <p className="text-sm text-muted">Our system checks the price automatically, no app or extension needed</p>
                </div>

                {/* Step 3 */}
                <div className="step last:border-0">
                  <div className="flex items-center justify-center mb-4">
                    {/* Icon for step 3: bell */}
                    <svg className="h-8 w-8 text-signal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <div className="jetBrainsMono text-3xl font-bold text-primary mb-2 ml-3">03</div>
                  </div>
                  <h3 className="fraunces text-lg font-semibold text-primary mb-1">Get pinged the moment it drops</h3>
                  <p className="text-sm text-muted">Free users get a push notification, paid users get an instant WhatsApp message</p>
                </div>
              </div>
            </section>

            {/* Why WhatsApp Section */}
            <section id="why-whatsapp" ref={whyWhatsAppSection} className="mt-12">
              <div className="flex items-center justify-center space-x-3">
                {/* WhatsApp icon */}
                <svg className="h-8 w-8 text-signal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12.189l-3.19.006a2 2 0 0 0-1.815.57l-.366 1.263v.001h-2.07l-.05.378A16.942 16.942 0 0 1 9.15 13c-4.002 0-7.251-2.954-7.774-6.98C1.424 3.85 3.819.787 7.826.787h2.04c1.257 0 2.473.433 3.38 1.157l.384.286v.001h1.00l.117.413c.086.302.27.594.527.855l1.506 1.506a2 2 0 0 0 .855.527l.413.117h.378v1.00l-.286.384c-.724.907-1.157 2.123-1.157 3.38v2.04c0 4.007 2.954 7.256 6.98 7.774a16.97 16.97 0 0 0 6.98-1.774l.378-.05v2.07l-1.263.366a2 2 0 0 0-.57 1.815l-.006 3.19a2 2 0 0 1-1.815.57z"></path>
                </svg>
                <div className="text-center">
                  <h2 className="fraunces text-2xl font-bold text-primary">
                    Tired of juggling multiple apps for price alerts?
                  </h2>
                  <p className="text-muted">
                    You find a great deal, add it to your cart, then forget to check <strong>if the price ever drops</strong>.
                  </p>
                  <p className="text-muted">
                    By the time you remember, the deal's <strong>gone</strong> — or you paid more than you needed to.
                  </p>
                  <p className="text-muted">
                    <strong>We send the alert straight to WhatsApp</strong> — the one app you already have open.
                  </p>
                </div>
              </div>
            </section>

            {/* Free vs Paid Preview Section */}
            <section id="pricing" ref={planSection} className="mt-12">
              <h2 className="fraunces text-2xl font-bold text-primary mb-6 text-center">
                Choose Your Plan
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Free Column */}
                <div className="plan-card p-6 bg-surface rounded-lg shadow-soft border border-muted hover:border-primary transition-all duration-200 ease-in-out cursor-pointer hover-scale">
                  <h3 className="fraunces text-lg font-semibold text-primary mb-3">Free</h3>
                  <p className="text-muted space-y-2">
                    Push notifications<br className="hidden md:inline"/>· 1 product tracked
                  </p>
                </div>

                {/* Paid Column */}
                <div className="plan-card p-6 bg-surface rounded-lg shadow-soft border border-accent/20 hover:border-accent transition-all duration-200 ease-in-out cursor-pointer hover-scale">
                  <h3 className="fraunces text-lg font-semibold text-primary mb-3">Paid</h3>
                  <p className="text-muted space-y-2">
                    WhatsApp alerts<br className="hidden md:inline"/>· Unlimited products
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ Accordion Section */}
            <section id="faq" ref={faqSection} className="faq-section">
              <h2 className="fraunces text-2xl font-bold text-primary mb-6 text-center">
                FAQ
              </h2>
              <div className="space-y-2">
                {/* FAQ Item 1 */}
                <div className="faq-item">
                  <div
                    className={`faq-question ${faqOpen === 0 ? 'open-bg' : ''}`}
                    onClick={() => toggleFaq(0)}
                  >
                    <span>Is this affiliated with Amazon or WhatsApp?</span>
                    <svg className={`h-4 w-4 text-muted transition-transform duration-200 ${faqOpen === 0 ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </div>
                  <div className={`faq-answer ${faqOpen === 0 ? 'open' : ''}`}>
                    <div className="faq-answer-content">
                      No, WhatsPrice is an <strong>independent tool</strong>. We are not affiliated with, endorsed by, or officially connected to Amazon or WhatsApp/Meta.
                    </div>
                  </div>
                </div>

                {/* FAQ Item 2 */}
                <div className="faq-item">
                  <div
                    className={`faq-question ${faqOpen === 1 ? 'open-bg' : ''}`}
                    onClick={() => toggleFaq(1)}
                  >
                    <span>Is the free tier really free?</span>
                    <svg className={`h-4 w-4 text-muted transition-transform duration-200 ${faqOpen === 1 ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </div>
                  <div className={`faq-answer ${faqOpen === 1 ? 'open' : ''}`}>
                    <div className="faq-answer-content">
                      Yes. Free users can <strong>track one product</strong> and receive push notifications at no cost.
                    </div>
                  </div>
                </div>

                {/* FAQ Item 3 */}
                <div className="faq-item">
                  <div
                    className={`faq-question ${faqOpen === 2 ? 'open-bg' : ''}`}
                    onClick={() => toggleFaq(2)}
                  >
                    <span>How fast are price-drop alerts?</span>
                    <svg className={`h-4 w-4 text-muted transition-transform duration-200 ${faqOpen === 2 ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </div>
                  <div className={`faq-answer ${faqOpen === 2 ? 'open' : ''}`}>
                    <div className="faq-answer-content">
                      We check prices on a regular schedule and notify you <strong>change is detected</strong>.
                    </div>
                  </div>
                </div>

                {/* FAQ Item 4 */}
                <div className="faq-item">
                  <div
                    className={`faq-question ${faqOpen === 3 ? 'open-bg' : ''}`}
                    onClick={() => toggleFaq(3)}
                  >
                    <span>Do I need to install anything?</span>
                    <svg className={`h-4 w-4 text-muted transition-transform duration-200 ${faqOpen === 3 ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </div>
                  <div className={`faq-answer ${faqOpen === 3 ? 'open' : ''}`}>
                    <div className="faq-answer-content">
                      <strong>No app or browser extension is required</strong>. Just share a product link to get started.
                    </div>
                  </div>
                </div>

                {/* FAQ Item 5 */}
                <div className="faq-item">
                  <div
                    className={`faq-question ${faqOpen === 4 ? 'open-bg' : ''}`}
                    onClick={() => toggleFaq(4)}
                  >
                    <span>When does this launch?</span>
                    <svg className={`h-4 w-4 text-muted transition-transform duration-200 ${faqOpen === 4 ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </div>
                  <div className={`faq-answer ${faqOpen === 4 ? 'open' : ''}`}>
                    <div className="faq-answer-content">
                      We're in early access. Join the waitlist above and we'll email you as soon as it's ready.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Final CTA Section */}
            <div className="mt-16 text-center space-y-6">
              <p className="text-muted">
                Be first to know when we launch.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4 max-w-md w-full mx-auto">
                <div>
                  <label htmlFor="email-final" className="block text-sm font-medium text-muted mb-2 inter">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email-final"
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
                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover-scale
                    ${isSubmitting ? 'opacity-75' : ''}`}
                >
                  {isSubmitting ? 'Joining...' : 'Join the waitlist'}
                </button>
                <p className="text-xs text-muted whitespace-nowrap">
                  Free to join · Takes 10 seconds · No spam, ever.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}