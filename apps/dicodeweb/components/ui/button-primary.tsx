'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface ButtonPrimaryProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  asChild?: boolean;
}

const ButtonPrimary = forwardRef<HTMLButtonElement, ButtonPrimaryProps>(
  ({ className, variant = 'solid', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50';

    const variants = {
      solid: 'bg-[#8BD63F] text-[#071B3A] shadow-[0_4px_20px_rgba(7,27,58,0.08)] hover:-translate-y-0.5 hover:bg-[#7BC335] active:translate-y-0',
      gradient: 'bg-linear-to-r from-[#8BD63F] to-[#22C7E8] text-[#071B3A] hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0',
      outline: 'border border-[#071B3A] bg-white text-[#071B3A] hover:bg-[#071B3A] hover:text-[#FEF9F2] dark:border-border dark:bg-card dark:text-card-foreground dark:hover:bg-muted hover:-translate-y-0.5 active:translate-y-0',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ButtonPrimary.displayName = 'ButtonPrimary';

export { ButtonPrimary };
