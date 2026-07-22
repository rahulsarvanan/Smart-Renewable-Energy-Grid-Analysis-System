import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils'; // Assuming shadcn cn utility exists or I'll create it

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  intensity = 'medium',
  hoverEffect = false,
  ...props 
}) => {
  const intensityClasses = {
    low: 'bg-white/5 backdrop-blur-sm border-white/10',
    medium: 'bg-[#0a192f]/60 backdrop-blur-md border border-[#1e293b]/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]',
    high: 'bg-[#000f1f]/80 backdrop-blur-lg border border-[#0ea5e9]/20 shadow-[0_8px_32px_0_rgba(14,165,233,0.1)]',
  };

  const hoverClasses = hoverEffect ? 'hover:border-[#0ea5e9]/50 transition-colors duration-300' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'rounded-xl overflow-hidden',
        intensityClasses[intensity],
        hoverClasses,
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
