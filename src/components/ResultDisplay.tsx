import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { CropIcon } from './icons/CropIcon';

interface ImageJob {
    id: string;
    file: { name: string };
    generatedImageUrl: string | null;
}

interface ResultDisplayProps {
  job: ImageJob;
  onCrop: (job: ImageJob) => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ job, onCrop }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
       <a
        href={job.generatedImageUrl!}
        download={`ghost_${job.file.name}.png`}
        className="flex-1 inline-flex items-center justify-center bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
        aria-label="Download generated image"
      >
        <DownloadIcon className="h-5 w-5 mr-2" />
        <span>Download</span>
      </a>
      <button
        onClick={() => onCrop(job)}
        className="flex-1 sm:flex-initial inline-flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
        aria-label="Crop generated image"
      >
        <CropIcon className="h-5 w-5 sm:mr-2" />
        <span className="hidden sm:inline">Crop</span>
      </button>
    </div>
  );
};
