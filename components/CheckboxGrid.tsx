
import React from 'react';
import { KeyUsageFlags } from '../types';

interface CheckboxGridProps<T> {
  options: { id: keyof T, label: string }[];
  selected: T;
  onChange: (selected: T) => void;
}

export const CheckboxGrid: React.FC<CheckboxGridProps<KeyUsageFlags>> = ({ options, selected, onChange }) => {
  const handleChange = (id: keyof KeyUsageFlags) => {
    onChange({ ...selected, [id]: !selected[id] });
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {options.map(({ id, label }) => (
        <div key={id} className="relative flex items-start">
          <div className="flex h-6 items-center">
            <input
              id={id}
              name={id}
              type="checkbox"
              checked={!!selected[id]}
              onChange={() => handleChange(id)}
              className="h-4 w-4 rounded bg-white/5 border-gray-600 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-900"
            />
          </div>
          <div className="ml-3 text-sm leading-6">
            <label htmlFor={id} className="font-medium text-gray-300 cursor-pointer">
              {label}
            </label>
          </div>
        </div>
      ))}
    </div>
  );
};
