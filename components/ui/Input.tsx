import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({
  label,
  error,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-royal uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`h-11 px-3.5 bg-white border border-gold/30 text-royal placeholder:text-royal/35 text-sm outline-none transition-colors duration-200 focus:border-gold focus:ring-1 focus:ring-gold ${
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
  );
}
