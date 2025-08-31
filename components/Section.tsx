
import React from 'react';

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, description, children }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <div className="border-b border-gray-700 pb-4 mb-6">
        <h2 className="text-xl font-semibold leading-7 text-white">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-gray-400">{description}</p>}
      </div>
      {children}
    </div>
  );
};
