import { ButtonHTMLAttributes } from "react";

interface ButtonFormProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  classBtn?: string;
}

export default function ButtonForm({
  children,
  classBtn,
  type = "button",
  ...props
}: ButtonFormProps) {
  return (
    <>
      <button
        type={type}
        className={`bg-secondary-400 w-fit mt-4 text-grey-100 px-5 py-2 rounded-lg font-semibold text-lg hover:bg-secondary-300 transition shadow-sm ${classBtn}`}
      >
        {children}
      </button>
    </>
  );
}
