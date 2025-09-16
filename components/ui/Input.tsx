
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ className, ...props }) => {
  const baseClasses = "w-full px-4 py-3 bg-white/50 border-2 border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-shadow shadow-sm placeholder-rose-300";

  return (
    <input className={`${baseClasses} ${className}`} {...props} />
  );
};

export default Input;
