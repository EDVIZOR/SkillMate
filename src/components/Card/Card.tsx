import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'gradient' | 'outlined';
export type CardPadding = 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default',
  padding = 'lg',
  className = '',
  onClick,
  hover = false
}) => {
  const baseClasses = 'rounded-xl transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg border-none',
    gradient: 'bg-gradient-primary-light border-none',
    outlined: 'bg-transparent border-2 border-purple-200'
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  const hoverClasses = hover ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl active:-translate-y-0.5 active:shadow-lg' : '';

  const classes = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    hoverClasses,
    className
  ].filter(Boolean).join(' ');

  const props = onClick ? { 
    onClick, 
    role: 'button' as const, 
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
    className: classes + ' focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600'
  } : { className: classes };

  return (
    <div {...props}>
      {children}
    </div>
  );
};

export default Card;
