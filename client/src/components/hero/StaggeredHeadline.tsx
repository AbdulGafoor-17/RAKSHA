import React from 'react';
import { motion } from 'framer-motion';

interface StaggeredHeadlineProps {
  prefixText?: string;
  mainHeadline: string;
  highlightWords?: string[];
  subheadline: string;
}

export const StaggeredHeadline: React.FC<StaggeredHeadlineProps> = ({
  prefixText,
  mainHeadline,
  highlightWords = ['Real-Time', 'Autonomous'],
  subheadline
}) => {
  const words = mainHeadline.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15
      }
    }
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 35, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1] as const
      }
    }
  };

  const subVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.8,
        ease: [0.22, 1, 0.36, 1] as const
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
      {prefixText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 shadow-inner mb-6 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-xs uppercase tracking-widest font-mono text-slate-300 font-semibold">
            {prefixText}
          </span>
        </motion.div>
      )}

      {/* Main Headline with Staggered Words */}
      <motion.h1
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-display leading-[1.08] mb-6"
        style={{ color: '#F5F5F5' }}
      >
        {words.map((word, idx) => {
          // Strip punctuation for comparison only
          const bare = word.replace(/[^a-zA-Z0-9-]/g, '');
          const isHighlight = highlightWords.some(
            (hw) => bare.toLowerCase() === hw.toLowerCase()
          );

          return (
            <motion.span
              key={idx}
              variants={wordVariants}
              className="inline-block mr-[0.28em]"
              style={isHighlight ? { color: '#22D3EE' } : undefined}
            >
              {word}
            </motion.span>
          );
        })}
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        variants={subVariants}
        initial="hidden"
        animate="visible"
        className="text-lg sm:text-xl text-slate-300/90 max-w-2xl mx-auto font-normal leading-relaxed"
      >
        {subheadline}
      </motion.p>
    </div>
  );
};
