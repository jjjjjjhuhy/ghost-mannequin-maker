
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center py-8 px-4 border-b border-gray-700/50 bg-gray-900/30 backdrop-blur-sm">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
          Ghost Mannequin AI
        </span>
      </h1>
      <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
        Batch process your apparel photos. Upload multiple images to automatically create stunning invisible mannequin effects for your entire product line.
      </p>
    </header>
  );
};
