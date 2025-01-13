import React from 'react';

interface FormFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
}

export function FormField({
  label,
  type = 'text',
  value,
  onChange,
  readOnly = false,
  required = false,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`p-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        required={required}
        className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 ${
          readOnly
            ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
        }`}
      />
    </div>
  );
}