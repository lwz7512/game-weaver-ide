import { ChangeEvent } from 'react';

type InputProps = {
  title: string;
  name: string;
  value: string;
  suffix: string;
  onValueChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const InputField = ({
  title,
  name,
  value,
  suffix,
  onValueChange,
}: InputProps) => {
  return (
    <label
      htmlFor={title}
      className="input-field block w-36 py-1 px-0 relative mb-0 ml-0"
    >
      <span className="w-24 inline-block bg-slate-600 text-white leading-5 p-5px pl-2 text-sm select-none">
        {title}:
      </span>
      <input
        id={title}
        name={name}
        value={value}
        className="w-16 inline-block border border-gray-500 pl-2 pr-7 py-1 leading-5 focus:outline-none"
        onChange={onValueChange}
      />
      <span className="absolute right-1 top-2.5 text-gray-400 text-xs">
        {suffix}
      </span>
    </label>
  );
};
