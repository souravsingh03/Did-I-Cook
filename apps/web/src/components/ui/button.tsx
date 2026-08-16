"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  type?: "button" | "submit";
}

export function Button({ 
  children, 
  onClick, 
  variant = "primary", 
  fullWidth = false,
  type = "button"
}: ButtonProps) {
  const baseStyles = "py-3 px-4 font-semibold rounded-lg transition-colors";
  const widthStyles = fullWidth ? "w-full" : "";
  
  const variantStyles = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white",
    secondary: "bg-amber-500 hover:bg-amber-600 text-white",
  };

  return (
    <button 
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${widthStyles} ${variantStyles[variant]}`}
    >
      {children}
    </button>
  );
}
