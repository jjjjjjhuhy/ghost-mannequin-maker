import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { createGhostMannequin } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { AspectRatioSelector, AspectRatio } from './components/AspectRatioSelector';
import { ImageCropper } from './components/ImageCropper';

type JobStatus = 'queued' | 'processing' | 'completed' | 'error';

interface ImageJob {
  id: string;
  file: File;
  originalPreviewUrl: string;
  generatedImageUrl: string | null;
  status: JobStatus;
  error: string | null;
}

const getAspectRatioClass = (ratio: AspectRatio): string => {
  const mapping: Record<AspectRatio, string> = {
    '1:1': 'aspect-square',
    '3:4': 'aspect-[3/4]',
    '4:3': 'aspect-[4/3]',
    '9:16': 'aspect-[9/16]',
    '16:9': 'aspect-[16/9]',
  };
  return mapping[ratio] || 'aspect-square';
};


const App: React.FC = () => {
  const [jobs, setJobs] = useState<ImageJob[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [croppingJob, setCroppingJob] = useState<ImageJob | null>(null);

  const handleImageUpload = (files: File[]) => {
    const newJobs: ImageJob[] = files.map((file, index) => ({
      id: `${file.name}-${Date.now()}-${index}`,
      file,
      originalPreviewUrl: URL.createObjectURL(file),
      generatedImageUrl: null,
      status: 'queued',
      error: null,
    }));
    setJobs(prevJobs => [...prevJobs, ...newJobs]);
  };

  const processQueue = useCallback(async () => {
    setIsProcessing(true);
    const queuedJobs = jobs.filter(j => j.status === 'queued');

    for (const job of queuedJobs) {
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'processing' } : j));
      try {
        const { base64, mimeType } = await fileToBase64(job.file);
        const resultImage = await createGhostMannequin(base64, mimeType, aspectRatio);
        if (resultImage) {
          const imageUrl = `data:image/png;base64,${resultImage}`;
          setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'completed', generatedImageUrl: imageUrl } : j));
        } else {
          throw new Error("AI failed to generate an image.");
        }
      } catch (err: any) {
        console.error("Job failed:", err);
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'error', error: err.message || 'An unknown error occurred.' } : j));
      }
    }
    setIsProcessing(false);
  }, [jobs, aspectRatio]);

  const handleReset = () => {
    jobs.forEach(job => URL.revokeObjectURL(job.originalPreviewUrl));
    setJobs([]);
    setIsProcessing(false);
  };
  
  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      jobs.forEach(job => URL.revokeObjectURL(job.originalPreviewUrl));
    };
  }, [jobs]);

  const handleOpenCropper = (job: ImageJob) => {
    if (job.status === 'completed' && job.generatedImageUrl) {
        setCroppingJob(job);
    }
  };

  const handleCloseCropper = () => {
    setCroppingJob(null);
  };

  const handleSaveCrop = (jobId: string, croppedImageUrl: string) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId
          ? { ...job, generatedImageUrl: croppedImageUrl }
          : job,
      ),
    );
    setCroppingJob(null);
  };
  
  const queuedJobsCount = jobs.filter(j => j.status === 'queued').length;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {jobs.length === 0 ? (
            <div className="max-w-4xl mx-auto bg-gray-800/50 rounded-2xl shadow-2xl shadow-indigo-900/20 backdrop-blur-sm border border-gray-700/50 p-8">
              <ImageUploader onImageUpload={handleImageUpload} />
            </div>
          ) : (
            <div>
              <div className="bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700/50 p-4 md:p-6 mb-8 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap justify-center items-center gap-4">
                  <button
                    onClick={processQueue}
                    disabled={isProcessing || queuedJobsCount === 0}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center min-w-[240px]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    {isProcessing ? 'Processing...' : `Process ${queuedJobsCount} Queued Image${queuedJobsCount !== 1 ? 's' : ''}`}
                  </button>
                  <label htmlFor="file-upload-more" className="bg-gray-700 hover:bg-gray-600 cursor-pointer text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                      Add More Images
                  </label>
                  <input type="file" id="file-upload-more" className="hidden" multiple accept="image/png, image/jpeg, image/webp" onChange={(e) => e.target.files && handleImageUpload(Array.from(e.target.files))} />

                  <button
                    onClick={handleReset}
                    disabled={isProcessing}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    Clear All
                  </button>
                </div>
                <AspectRatioSelector
                  selectedRatio={aspectRatio}
                  onRatioChange={setAspectRatio}
                  disabled={isProcessing}
                />
              </div>


              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {jobs.map(job => (
                  <div key={job.id} className="bg-gray-800/50 rounded-xl shadow-lg overflow-hidden border border-gray-700/50 flex flex-col">
                    <div className={`relative w-full ${getAspectRatioClass(aspectRatio)}`}>
                        <img
                            src={job.generatedImageUrl || job.originalPreviewUrl}
                            alt={job.status === 'completed' ? 'Generated' : 'Original'}
                            className="w-full h-full object-cover"
                        />
                        {job.status === 'processing' && <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><Loader /></div>}
                    </div>
                    <div className="p-4 text-center flex flex-col flex-grow justify-between">
                        <p className="text-xs text-gray-400 truncate mb-2" title={job.file.name}>{job.file.name}</p>
                        {job.status === 'queued' && <span className="text-sm font-semibold text-blue-400">Queued</span>}
                        {job.status === 'processing' && <span className="text-sm font-semibold text-indigo-400">Processing...</span>}
                        {job.status === 'completed' && job.generatedImageUrl &&
                            <ResultDisplay job={job} onCrop={handleOpenCropper} />
                        }
                        {job.status === 'error' && <span className="text-sm font-semibold text-red-400 bg-red-900/50 px-2 py-1 rounded" title={job.error || ''}>Error</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      {croppingJob && (
        <ImageCropper
          job={croppingJob}
          onClose={handleCloseCropper}
          onSave={handleSaveCrop}
        />
      )}
    </div>
  );
};

export default App;