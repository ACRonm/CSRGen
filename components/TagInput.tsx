
import React, { useState } from 'react';

interface TagInputProps {
  label: string;
  values: string[];
  setValues: (values: string[]) => void;
  placeholder: string;
  type?: string;
  datalistId?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ label, values, setValues, placeholder, type = 'text', datalistId }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!values.includes(inputValue.trim())) {
        setValues([...values, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeValue = (indexToRemove: number) => {
    setValues(values.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <div className="mt-2 flex flex-wrap items-center gap-2 p-2 rounded-md border border-gray-700 bg-gray-800">
        {values.map((value, index) => (
          <span key={index} className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-300">
            {value}
            <button
              type="button"
              onClick={() => removeValue(index)}
              className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-blue-500/50"
            >
              <span className="sr-only">Remove</span>
              <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 stroke-blue-200/50 group-hover:stroke-blue-200/75">
                <path d="M4 4l6 6m0-6l-6 6" />
              </svg>
            </button>
          </span>
        ))}
        <input
          type={type}
          list={datalistId}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-grow bg-transparent text-white outline-none placeholder-gray-500 text-sm"
        />
      </div>
    </div>
  );
};
