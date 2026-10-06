import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold tracking-wider transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none uppercase";

  const sizeStyles = {
    sm: "h-9 px-4 text-[10px]",
    md: "h-11 px-6 text-[11px]",
    lg: "h-13 px-8 text-xs",
  };

  const variantStyles = {
    primary:
      "bg-gold text-royal hover:bg-gold-light shadow-sm active:scale-[0.99]",
    secondary:
      "bg-royal text-white hover:bg-royal-light shadow-sm active:scale-[0.99]",
    outline:
      "border border-gold text-royal hover:bg-gold hover:text-royal active:scale-[0.99]",
    ghost:
      "text-royal hover:text-gold hover:bg-gold/10",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
