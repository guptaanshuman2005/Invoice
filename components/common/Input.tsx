
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, className = '', ...props }) => {
  const errorClasses = "border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50";
  // Improved clarity: slightly off-white background to distinguish input area, better padding
  const defaultClasses = "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none text-sm px-4 py-3 transition-all duration-200 ease-in-out border hover:border-slate-300 dark:hover:border-slate-600 focus:ring-2 focus:ring-accent/20 focus:border-accent";

  return (
    <div className="w-full group">
      {label && (
        <label 
          htmlFor={id} 
          className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors ${error ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}
        >
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={`w-full ${error ? errorClasses : defaultClasses} ${props.disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1 animate-slide-in">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
