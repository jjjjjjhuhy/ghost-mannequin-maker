
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (files: File[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onImageUpload(Array.from(e.target.files));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      onImageUpload(Array.from(e.dataTransfer.files));
    }
  }, [onImageUpload]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${isDragging ? 'border-indigo-500 bg-indigo-900/20 scale-105' : 'border-gray-600 hover:border-gray-500 bg-gray-900/50'}`}
    >
      <input
        type="file"
        id="file-upload"
        multiple
        className="absolute w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
      />
      <div className="text-center pointer-events-none">
        <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
        <p className="mt-5 text-lg font-semibold text-gray-300">
          Drag and drop images here
        </p>
        <p className="mt-1 text-sm text-gray-400">or click to browse</p>
        <p className="mt-4 text-xs text-gray-500">PNG, JPG, WEBP accepted</p>
      </div>
    </div>
  );
};
