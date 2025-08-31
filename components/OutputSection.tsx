
import React, { useCallback, useState } from 'react';

interface OutputSectionProps {
  csr: string;
  privateKey: string;
}

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [textToCopy]);
  
  return (
      <button onClick={handleCopy} className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold py-1 px-2 rounded-md">
        {copied ? 'Copied!' : 'Copy'}
      </button>
  );
}


export const OutputSection: React.FC<OutputSectionProps> = ({ csr, privateKey }) => {
  
  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-6">
       <h2 className="text-xl font-semibold leading-7 text-white">Generated Output</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Certificate Signing Request (CSR)</label>
          <div className="relative">
            <textarea readOnly value={csr} className="w-full h-64 font-mono text-xs bg-gray-900 text-gray-300 rounded-md border border-gray-700 p-2"/>
            <CopyButton textToCopy={csr} />
          </div>
          <button onClick={() => downloadFile('request.csr', csr)} className="mt-2 w-full bg-blue-600/50 hover:bg-blue-600/80 text-white text-sm font-semibold py-2 px-4 rounded-md">
            Download CSR
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Private Key</label>
           <div className="relative">
            <textarea readOnly value={privateKey} className="w-full h-64 font-mono text-xs bg-gray-900 text-gray-300 rounded-md border border-gray-700 p-2"/>
             <CopyButton textToCopy={privateKey} />
          </div>
          <button onClick={() => downloadFile('private.key', privateKey)} className="mt-2 w-full bg-blue-600/50 hover:bg-blue-600/80 text-white text-sm font-semibold py-2 px-4 rounded-md">
            Download Private Key
          </button>
        </div>
      </div>
    </div>
  );
};
