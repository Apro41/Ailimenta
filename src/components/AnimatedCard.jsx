import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedCard({ children, className = '', ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(67,160,71,0.18)' }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.25 }}
      className={`bg-card rounded-xl shadow-card p-8 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
