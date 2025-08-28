import React, { useState, useRef } from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop';
import { getCroppedImg } from '../utils/cropUtils';

// A leaner version of the ImageJob, only containing what this component needs.
interface CropJob {
  id: string;
  generatedImageUrl: string | null;
}

interface ImageCropperProps {
  job: CropJob;
  onClose: () => void;
  onSave: (jobId: string, croppedImageUrl: string) => void;
}

// Helper function to center the initial crop selection
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ job, onClose, onSave }) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isSaving, setIsSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1 / 1)); // Start with a centered crop
  }

  const handleSaveCrop = async () => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current) {
        setIsSaving(true);
        try {
            const croppedImageUrl = await getCroppedImg(
                imgRef.current,
                completedCrop,
            );
            onSave(job.id, croppedImageUrl);
        } catch (e) {
            console.error("Cropping failed: ", e);
        } finally {
            setIsSaving(false);
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-semibold">Crop Image</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        <div className="flex-grow p-4 overflow-y-auto flex items-center justify-center">
          {job.generatedImageUrl && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={job.generatedImageUrl}
                onLoad={onImageLoad}
                style={{ maxHeight: '65vh' }}
                className="object-contain"
              />
            </ReactCrop>
          )}
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-end gap-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveCrop}
            disabled={!completedCrop?.width || !completedCrop?.height || isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Crop'}
          </button>
        </div>
      </div>
    </div>
  );
};
