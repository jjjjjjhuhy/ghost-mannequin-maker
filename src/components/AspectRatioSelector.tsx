import React from 'react';

const ASPECT_RATIOS = ['1:1', '3:4', '4:3', '9:16', '16:9'] as const;
export type AspectRatio = typeof ASPECT_RATIOS[number];

interface AspectRatioSelectorProps {
  selectedRatio: AspectRatio;
  onRatioChange: (ratio: AspectRatio) => void;
  disabled: boolean;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedRatio, onRatioChange, disabled }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Aspect Ratio</h3>
      <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-900/50 p-1 shadow-inner" role="group" aria-label="Aspect Ratio">
        {ASPECT_RATIOS.map((ratio) => (
          <button
            key={ratio}
            onClick={() => onRatioChange(ratio)}
            disabled={disabled}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
              ${selectedRatio === ratio
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-300 hover:bg-gray-700/50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            aria-pressed={selectedRatio === ratio}
          >
            {ratio}
          </button>
        ))}
      </div>
    </div>
  );
};
