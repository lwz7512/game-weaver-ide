import { ChangeEvent } from 'react';

type InputProps = {
  title: string;
  name: string;
  value: string;
  suffix: string;
  onValueChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
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
        className="w-16 inline-block border border-gray-500 pl-1 pr-7 py-1 leading-5 focus:outline-none"
        onChange={onValueChange}
      />
      <span className="absolute right-1 top-2.5 text-gray-400 text-xs">
        {suffix}
      </span>
    </label>
  );
};

export const SelectInput = ({
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
      <span className="w-24 inline-block bg-slate-600 text-white leading-5 py-1 pl-2 text-sm select-none">
        {title}:
      </span>
      <select
        name={name}
        id={title}
        value={value}
        className="w-16 inline-block border border-gray-500 pl-1 pr-0 py-1 leading-5 focus:outline-none text-sm"
        onChange={onValueChange}
      >
        <option value="16">16px</option>
        <option value="24">24px</option>
        <option value="32">32px</option>
        <option value="40">40px</option>
        <option value="48">48px</option>
        <option value="52">52px</option>
        <option value="60">60px</option>
        <option value="64">64px</option>
        <option value="70">70px</option>
        <option value="72">72px</option>
        <option value="80">80px</option>
        <option value="96">96px</option>
      </select>
      {/* <span className="absolute right-1 top-2.5 text-gray-400 text-xs">
        {suffix}
      </span> */}
    </label>
  );
};
