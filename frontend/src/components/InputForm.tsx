import { InputHTMLAttributes } from "react";

interface InputFormProps extends InputHTMLAttributes<HTMLInputElement> {
  idName: string;
}

export default function InputForm({
  idName,
  type = "text",
  children,
  ...props
}: InputFormProps) {
  return (
    <>
      <input
        id={idName}
        name={idName}
        type={type}
        {...props}
        required
        className="w-full p-3  bg-grey-100 border border-secondary-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary-200/50 placeholder-gray-400"
      />
    </>
  );
}
