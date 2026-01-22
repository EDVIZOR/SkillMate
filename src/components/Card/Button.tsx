import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  'aria-label': ariaLabel
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-sans font-semibold border-none rounded-lg cursor-pointer transition-all duration-200 no-underline whitespace-nowrap select-none';
  const fontFamily = { fontFamily: "'Mulish', sans-serif", letterSpacing: '-0.01em', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' } as React.CSSProperties;
  
  const variantClasses = {
    primary: 'bg-gradient-primary text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md',
    secondary: 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50 hover:-translate-y-0.5 hover:shadow-md',
    tertiary: 'bg-transparent text-purple-600 hover:bg-purple-50',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  };

  const sizeClasses = {
    sm: 'px-4 py-3 text-sm min-h-[36px]',
    md: 'px-8 py-4 text-base min-h-[44px]',
    lg: 'px-6 py-6 text-lg min-h-[52px]'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
  const fullWidthClasses = fullWidth ? 'w-full' : '';

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabledClasses,
    fullWidthClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      style={fontFamily}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default Button;
