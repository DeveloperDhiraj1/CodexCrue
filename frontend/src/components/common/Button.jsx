import React from 'react';

export default function Button({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) {
  const baseStyle = "font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-md flex items-center justify-center";
  const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-red-500/25"
  };

  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}