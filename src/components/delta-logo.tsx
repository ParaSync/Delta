import React from 'react';

interface DeltaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DeltaLogo: React.FC<DeltaLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg 
        className={`${sizeClasses[size]} text-primary`}
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M20 75 L50 25 L65 50 L50 50 Z" 
          fill="currentColor"
        />
        <path 
          d="M50 50 L65 50 L80 75 L50 75 Z" 
          fill="currentColor" 
          fillOpacity="0.7"
        />
      </svg>
      <span className={`font-bold text-foreground ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-lg'}`}>
        delta
      </span>
    </div>
  );
};