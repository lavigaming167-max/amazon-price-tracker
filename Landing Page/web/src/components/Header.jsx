import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';

const Header = () => {
  const handleJoinClick = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-black italic tracking-tighter"
          style={{ fontFamily: 'Archivo Black, sans-serif' }}
        >
          WhatsPrice
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-auto"
        >
          <Button
            onClick={handleJoinClick}
            className="w-full md:w-auto glow-lime bg-accent text-accent-foreground hover:bg-accent/90 font-bold uppercase tracking-wide transition-all duration-200 active:scale-[0.98]"
          >
            Join Waitlist
          </Button>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
