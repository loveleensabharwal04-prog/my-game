import React from 'react';
import { useSound } from '../../contexts/SoundContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, onClick, ...props }) => {
  const { playSound } = useSound();
  const baseClasses = "px-6 py-3 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100";

  const variantClasses = {
    primary: "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-400",
    secondary: "bg-pink-100 text-rose-500 hover:bg-pink-200 focus:ring-rose-400",
    ghost: "bg-transparent text-rose-500 hover:bg-rose-50",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playSound('click');
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} onClick={handleClick} {...props}>
      {children}
    </button>
  );
};

export default Button;
