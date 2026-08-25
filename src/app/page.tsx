'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [animatePrice, setAnimatePrice] = useState(false);

  const priceRef = useRef<HTMLSpanElement>(null);

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

  // Scroll-based animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, {
      threshold: 0.1
    });

    // Observe all elements with scroll-animate class
    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
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

      const { data: supabaseData, error } = await supabase
        .from('waitlist')
        .insert([{ email, source }]);

      if (error) {
        console.error("Supabase Error:", error);
        // Handle duplicate email gracefully
        if (error.code === '23505') { // Unique violation
          setShowThankYou(true);
          setEmail('');
        } else {
          setError(error.message || 'Something went wrong. Please try again.');
        }
      } else {
        setShowThankYou(true);
        setEmail('');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showThankYou) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-6 py-12 text-center font-sans">
        <h1 className="font-black text-3xl text-white mb-4">
          NEVER MISS A PRICE DROP
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          We track Amazon prices and notify you when they drop — free via push, instantly via WhatsApp on paid.
        </p>
        <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full">
          <h2 className="font-black text-2xl text-white mb-4">
            You're on the list — we'll email you when it's ready.
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Navigation Bar */}
      <nav className="nav">
        <div className="nav-content">
          <div className="nav-logo font-black text-3xl text-white">
            WhatsPRICE
          </div>
          <button
            onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-accent hover:bg-accent/90 text-black font-semibold py-2 px-4 rounded-lg transition-colors duration-200 hover-scale hidden md:block"
          >
            Join Waitlist
          </button>
          {/* Mobile menu button (optional) */}
          <button
            id="mobile-menu-button"
            className="md:hidden p-2"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18"></path>
            </svg>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="space-y-16">
            {/* Hero Section */}
            <section id="hero" className="relative scroll-animate">
              <div className="grid grid-cols-1 md:grid-cols-2 md:items-center md:gap-8">
                {/* Left side: text and form */}
                <div className="space-y-6 text-center scroll-animate">
                  {/* Two-line headline */}
                  <div className="space-y-2">
                    <span className="font-black text-3xl text-gray-400">
                      NEVER MISS{' '}
                    </span>
                    <span className="font-black text-3xl text-accent">
                      A PRICE DROP
                    </span>
                  </div>

                  {/* Subheadline */}
                  <p className="text-lg text-gray-400 max-w-xl mx-auto">
                    Share any Amazon product link with us, we will track it for you and notify you
                  </p>

                  {/* Stat cards */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-6 scroll-animate">
                    {/* Stat 1: Save up to ₹12,400 */}
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <span className="font-black text-2xl text-accent">₹12,400</span>
                      </div>
                      <p className="text-sm text-gray-400">Save up to</p>
                      {/* Circular progress ring */}
                      <div className="relative w-12 h-12 mx-auto mt-2">
                        <svg className="absolute inset-0" viewBox="0 0 36 36">
                          <circle className="stroke-gray-600 stroke-4" cx="18" cy="18" r="15.91549430918954" fill="none" />
                          <circle className={`stroke-accent stroke-4 ${animatePrice ? 'animate-price-drop' : ''}`} cx="18" cy="18" r="15.91549430918954" fill="none" strokeDasharray="75,100" />
                        </svg>
                                              </div>
                    </div>

                    {/* Stat 2: Zero Apps Needed / Just WhatsApp */}
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <svg className="h-6 w-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        </svg>
                        <span className="ml-2 font-black text-lg">Just WhatsApp</span>
                      </div>
                      <p className="text-sm text-gray-400">ZERO EXTENSION NEEDED JUST ONE APP</p>
                    </div>
                  </div>

                  {/* Email form */}
                  <form onSubmit={handleSubmit} className="space-y-4 mt-6 scroll-animate">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2 font-sans">
                        Email address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        disabled={isSubmitting}
                        className={`block w-full rounded-lg border border-gray-600 px-4 py-3 text-white
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
                      className={`w-full bg-accent hover:bg-accent/90 text-black font-semibold py-3 px-4 rounded-lg
                        transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover-scale
                        ${isSubmitting ? 'opacity-75' : ''}`}
                    >
                      {isSubmitting ? 'Joining...' : 'Join the waitlist'}
                    </button>
                    <p className="text-xs text-gray-400 whitespace-nowrap">
                      Free to join · Takes 10 seconds · No spam, ever.
                    </p>
                  </form>
                </div>

                {/* Right side: dummy phone screens */}
                <div className="hidden md:block scroll-animate">
                  <div className="flex flex-row items-start gap-6">
                    {/* Dummy Phone Screen 1: Price Drop Feature */}
                    <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl h-[520px] w-[290px]">
                      {/* Phone frame */}
                      <div className="absolute inset-0 bg-gray-800 border-4 border-gray-700 rounded-xl">
                        {/* Screen content */}
                        <div className="relative h-full w-full bg-gray-900 p-4">
                          {/* Status bar */}
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex space-x-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <div className="w-0.5 h-2 bg-gray-400 rounded"></div>
                              <div className="w-0.5 h-2 bg-gray-400 rounded"></div>
                              <span className="whitespace-nowrap">9:41 AM</span>
                              <div className="flex space-x-1">
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              </div>
                            </div>
                          </div>

                          {/* Main content */}
                          <div className="flex-1">
                            <div className="space-y-4">
                              {/* App header */}
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-white">WhatsPRICE</h3>
                                <button className="px-3 py-1 bg-accent/20 text-accent rounded hover:bg-accent/30">
                                  Alerts
                                </button>
                              </div>

                              {/* Price drop notification */}
                              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                                      <span className="text-accent font-medium">🔔</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="font-medium text-white mb-1">Price Drop Alert!</p>
                                    <p className="text-sm text-gray-300">Apple iPhone 15 Pro dropped to ₹99,999</p>
                                    <div className="mt-2 flex items-baseline space-x-2 flex-wrap w-full">
                                      <span className="font-mono text-[10px] line-through text-gray-400">₹1,29,999</span>
                                      <span className="font-mono text-base text-accent">₹99,999</span>
                                      <br />
                                      <span className="mt-0.5 inline-block px-2 py-0.5 bg-accent/20 rounded text-xs text-accent">↓23%</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3 flex justify-end">
                                  <button className="px-3 py-1 bg-accent hover:bg-accent/90 text-black rounded text-sm">
                                    View Deal
                                  </button>
                                </div>
                              </div>

                              {/* Tracked products list */}
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3 bg-gray-800/50 p-3 rounded-lg">
                                  <div className="flex-shrink-0">
                                    <div className="w-6 h-6 bg-accent/20 rounded flex items-center justify-center">
                                      <span className="text-accent">📱</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">Samsung Galaxy S24</p>
                                    <p className="text-xs text-gray-300">Tracking price...</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3 bg-gray-800/50 p-3 rounded-lg">
                                  <div className="flex-shrink-0">
                                    <div className="w-6 h-6 bg-accent/20 rounded flex items-center justify-center">
                                      <span className="text-accent">👟</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">Nike Air Max 270</p>
                                    <p className="text-xs text-gray-300">Tracking price...</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3 bg-gray-800/50 p-3 rounded-lg">
                                  <div className="flex-shrink-0">
                                    <div className="w-6 h-6 bg-accent/20 rounded flex items-center justify-center">
                                      <span className="text-accent">🔊</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">Sony WH-1000XM5</p>
                                    <p className="text-xs text-gray-300">Tracking price...</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bottom navigation */}
                          <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                            <button className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white">
                              <span className="w-3 h-3 bg-accent/20 rounded flex items-center justify-center">
                                <span className="text-accent">🏠</span>
                              </span>
                              <span>Home</span>
                            </button>
                            <button className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white">
                              <span className="w-3 h-3 bg-accent/20 rounded flex items-center justify-center">
                                <span className="text-accent">🔍</span>
                              </span>
                              <span>Search</span>
                            </button>
                            <button className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white">
                              <span className="w-3 h-3 bg-accent/20 rounded flex items-center justify-center">
                                <span className="text-accent">📊</span>
                              </span>
                              <span>Analytics</span>
                            </button>
                            <button className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white">
                              <span className="w-3 h-3 bg-accent/20 rounded flex items-center justify-center">
                                <span className="text-accent">⚙️</span>
                              </span>
                              <span>Settings</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Phone corners */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-2 left-2 w-2 h-2 bg-gray-600 rounded"></div>
                        <div className="absolute top-2 right-2 w-2 h-2 bg-gray-600 rounded"></div>
                        <div className="absolute bottom-2 left-2 w-2 h-2 bg-gray-600 rounded"></div>
                        <div className="absolute bottom-2 right-2 w-2 h-2 bg-gray-600 rounded"></div>
                      </div>
                    </div>

                    {/* Dummy Phone Screen 2: Products Tracked Box */}
                    <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl h-[520px] w-[290px]">
                      {/* Phone frame */}
                      <div className="absolute inset-0 bg-gray-800 border-4 border-gray-700 rounded-xl">
                        {/* Screen content */}
                        <div className="relative h-full w-full bg-gray-900 p-4">
                          {/* Status bar */}
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex space-x-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <div className="w-0.5 h-2 bg-gray-400 rounded"></div>
                              <div className="w-0.5 h-2 bg-gray-400 rounded"></div>
                              <span className="whitespace-nowrap">9:41 AM</span>
                              <div className="flex space-x-1">
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              </div>
                            </div>
                          </div>

                          {/* Main content */}
                          <div className="flex-1">
                            <div className="space-y-4">
                              {/* App header */}
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-white">WhatsPRICE</h3>
                                <button className="px-3 py-1 bg-accent/20 text-accent rounded hover:bg-accent/30">
                                  Edit
                                </button>
                              </div>

                              {/* Tracked products box */}
                              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="space-y-4">
                                  {/* Box header */}
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-white">Tracked Products (3)</h4>
                                    <button className="px-3 py-1 bg-accent hover:bg-accent/90 text-black rounded text-sm">
                                      Add Product
                                    </button>
                                  </div>

                                  {/* Products list */}
                                  <div className="space-y-3">
                                    {/* Product 1 */}
                                    <div className="flex items-start space-x-3 bg-gray-700/50 p-3 rounded-lg">
                                      <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-gray-600/50 rounded flex items-center justify-center">
                                          <span className="text-white">📱</span>
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-white mb-1">Apple iPhone 15 Pro</p>
                                        <p className="flex items-baseline space-x-2 text-[10px] text-gray-300">
                                          <span className="font-mono">Current: ₹1,09,999</span>
                                          <span className="text-accent">•</span>
                                          <span className="font-mono text-accent">Low: ₹99,999</span>
                                        </p>
                                      </div>
                                      <div className="flex-shrink-0">
                                        <button className="w-2 h-2 bg-accent/20 rounded flex items-center justify-center text-accent hover:bg-accent/30">
                                          ⋮
                                        </button>
                                      </div>
                                    </div>

                                    {/* Product 2 */}
                                    <div className="flex items-start space-x-3 bg-gray-700/50 p-3 rounded-lg">
                                      <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-gray-600/50 rounded flex items-center justify-center">
                                          <span className="text-white">👟</span>
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-white mb-1">Adidas Ultraboost 22</p>
                                        <p className="flex items-baseline space-x-2 text-[10px] text-gray-300">
                                          <span className="font-mono">Current: ₹12,999</span>
                                          <span className="text-accent">•</span>
                                          <span className="font-mono text-accent">Low: ₹10,999</span>
                                        </p>
                                      </div>
                                      <div className="flex-shrink-0">
                                        <button className="w-2 h-2 bg-accent/20 rounded flex items-center justify-center text-accent hover:bg-accent/30">
                                          ⋮
                                        </button>
                                      </div>
                                    </div>

                                    {/* Product 3 */}
                                    <div className="flex items-start space-x-3 bg-gray-700/50 p-3 rounded-lg">
                                      <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-gray-600/50 rounded flex items-center justify-center">
                                          <span className="text-white">🔊</span>
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-white mb-1">Bose QuietComfort 45</p>
                                        <p className="flex items-baseline space-x-2 text-[10px] text-gray-300">
                                          <span className="font-mono">Current: ₹24,999</span>
                                          <span className="text-accent">•</span>
                                          <span className="font-mono text-accent">Low: ₹21,999</span>
                                        </p>
                                      </div>
                                      <div className="flex-shrink-0">
                                        <button className="w-2 h-2 bg-accent/20 rounded flex items-center justify-center text-accent hover:bg-accent/30">
                                          ⋮
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Price history chart placeholder */}
                              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="space-y-3">
                                  <p className="font-medium text-white mb-2">Price History (30 days)</p>
                                  <div className="h-20 bg-gray-700/50 rounded-lg">
                                    {/* Simple line chart representation */}
                                    <div className="relative h-full w-full">
                                      <div className="absolute bottom-0 left-0 h-[80%] w-[80%] bg-accent/50"></div>
                                    </div>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                                    <span className="text-[10px]">₹1,29,999</span>
                                    <span className="text-[10px]">₹99,999</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bottom navigation */}
                          <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                            <button className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white">
                              <span className="w-3 h-3 bg-accent/20 rounded flex items-center justify-center">
                                <span className="text-accent">🏠</span>
                              </span>
                              <span>Home</span>
                            </button>
                            <button className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white">
                              <span className="w-3 h-3 bg-accent/20 rounded flex items-center justify-center">
                                <span className="text-accent">📊</span>
                              </span>
                              <span>Analytics</span>
                            </button>
                            <button className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white">
                              <span className="w-3 h-3 bg-accent/20 rounded flex items-center justify-center">
                                <span className="text-accent">⚙️</span>
                              </span>
                              <span>Settings</span>
                            </button>
                            <button className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white">
                              <span className="w-3 h-3 bg-accent/20 rounded flex items-center justify-center">
                                <span className="text-accent">👤</span>
                              </span>
                              <span>Profile</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Phone corners */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-2 left-2 w-2 h-2 bg-gray-600 rounded"></div>
                        <div className="absolute top-2 right-2 w-2 h-2 bg-gray-600 rounded"></div>
                        <div className="absolute bottom-2 left-2 w-2 h-2 bg-gray-600 rounded"></div>
                        <div className="absolute bottom-2 right-2 w-2 h-2 bg-gray-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Price Tracking. Zero Effort. Section */}
            <section id="how-it-works" className="text-center scroll-animate">
              <h2 className="font-black text-3xl font-bold text-white mb-6">
                PRICE TRACKING. ZERO EFFORT.
              </h2>

              {/* Latest Alert notification example */}
              <div className="bg-gray-800 rounded-lg p-6 max-w-xl mx-auto mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  </svg>
                  <div>
                    <p className="font-black text-lg text-white mb-1">Price Drop Alert</p>
                    <p className="text-gray-400">iPhone 15 just dropped to ₹69,999 — 12% off!</p>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <p className="text-lg text-gray-400 max-w-xl mx-auto mb-8">
                Send us a product link. We track the price. You get notified — free via push, instantly via WhatsApp if you upgrade.
              </p>

              {/* Second email capture form */}
              <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
                <div>
                  <label htmlFor="email2" className="block text-sm font-medium text-gray-400 mb-2 font-sans">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                    className={`block w-full rounded-lg border border-gray-600 px-4 py-3 text-white
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
                  className={`w-full bg-accent hover:bg-accent/90 text-black font-semibold py-3 px-4 rounded-lg
                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover-scale
                    ${isSubmitting ? 'opacity-75' : ''}`}
                >
                  {isSubmitting ? 'Joining...' : 'Join the waitlist'}
                </button>
                <p className="text-xs text-gray-400 whitespace-nowrap">
                  Free to join · Takes 10 seconds · No spam, ever.
                </p>
              </form>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="text-center scroll-animate">
              <h2 className="font-black text-3xl font-bold text-white mb-6">
                CHOOSE YOUR PLAN
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Free Card */}
                <div className="bg-gray-800 rounded-lg p-6 shadow-soft border border-gray-600 hover:border-accent transition-all duration-200 hover-scale">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center mb-3">
                      <span className="font-black text-2xl text-white">Free</span>
                    </div>
                    <p className="text-gray-400">Perfect for trying it out</p>

                    <ul className="space-y-4 text-left mt-4">
                      <li className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent mt-0.5">
                          ✓
                        </div>
                        <span className="text-gray-400">Push notifications</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent mt-0.5">
                          ✓
                        </div>
                        <span className="text-gray-400">Track 1 product</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent mt-0.5">
                          ✓
                        </div>
                        <span className="text-gray-400">Price history</span>
                      </li>
                    </ul>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full mt-6 bg-accent hover:bg-accent/90 text-black font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover-scale"
                    >
                      Join Free
                    </button>
                  </div>
                </div>

                {/* Pro Card */}
                <div className="bg-gray-800 rounded-lg p-6 shadow-soft border border-accent hover:border-accent transition-all duration-200 hover-scale scale-[1.02]">
                  <div className="relative">
                    <span className="absolute -top-2 -right-2 bg-accent/20 text-xs font-medium px-2 py-0.5 rounded">
                      Most Popular
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center mb-3">
                      <span className="font-black text-2xl text-white">Pro</span>
                    </div>
                    <p className="text-gray-400">Coming Soon</p>
                    <p className="text-gray-400">For serious deal hunters</p>

                    <ul className="space-y-4 text-left mt-4">
                      <li className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent mt-0.5">
                          ✓
                        </div>
                        <span className="text-gray-400">WhatsApp instant alerts</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent mt-0.5">
                          ✓
                        </div>
                        <span className="text-gray-400">Unlimited products tracked</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent mt-0.5">
                          ✓
                        </div>
                        <span className="text-gray-400">Priority support</span>
                      </li>
                    </ul>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full mt-6 border border-accent/20 hover:border-accent text-accent font-semibold py-3 px-4 rounded-lg transition-colors hover-scale"
                    >
                      Notify Me
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="mt-16 text-center text-gray-400 text-sm font-sans scroll-animate">
              <p className="font-black text-lg text-white">
                WhatsPRICE
              </p>
              <p className="mb-2">
                Not affiliated with Amazon or WhatsApp/Meta
              </p>
              <div className="space-y-1">
                <a href="https://x.com/Lavi1212216" className="underline hover:no-underline">
                  X
                </a>
                <a href="https://github.com/lavigaming167-max" className="underline hover:no-underline">
                  GitHub
                </a>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}