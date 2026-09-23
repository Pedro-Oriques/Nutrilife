import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  classBtn?: string;
}

export default function ButtonDash({
  classBtn,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`flex items-center justify-center gap-3 bg-secondary-400 w-fit mt-4 text-grey-100 px-5 py-2 rounded-lg font-semibold text-lg hover:bg-secondary-300 transition shadow-sm ${classBtn}`}
      {...props}
    >
      {children}
    </button>
  );
}
