'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className = '', hover = false }: CardProps) => {
  return (
    <motion.div
  className={`bg-white rounded-xl overflow-hidden shadow-md ${hover ? 'hover:shadow-lg' : ''} ${className}`}
  whileHover={hover ? { y: -4 } : {}}
  transition={{ duration: 0.2 }}
>
  {children}
</motion.div>
  );
};
