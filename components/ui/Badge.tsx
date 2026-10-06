import React from "react";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "gold" | "royal" | "cream" | "danger";
  className?: string;
};

export default function Badge({
  children,
  variant = "gold",
  className = "",
}: BadgeProps) {
  const variantStyles = {
    gold: "bg-gold text-royal font-bold",
    royal: "bg-royal text-white font-medium",
    cream: "bg-cream text-royal border border-gold/30 font-medium",
    danger: "bg-red-700 text-white font-bold",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[9px] uppercase tracking-widest ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
