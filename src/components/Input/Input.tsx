import React from 'react';

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  maxLength?: number;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  id,
  name,
  autoComplete,
  maxLength
}) => {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="text-sm font-semibold text-gray-300"
          style={{ fontFamily: "'Mulish', sans-serif", letterSpacing: '-0.005em', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
        >
          {label}
          {required && <span className="text-purple-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        maxLength={maxLength}
        style={{ fontFamily: "'Mulish', sans-serif", letterSpacing: '-0.005em', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
        className={`
          w-full px-4 py-3 bg-gray-800/50 border rounded-lg
          text-white placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-700'}
        `}
      />
      {error && (
        <p 
          className="text-sm text-red-400"
          style={{ fontFamily: "'Mulish', sans-serif", letterSpacing: '-0.005em', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;

