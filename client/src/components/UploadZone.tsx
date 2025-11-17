import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  scanning?: boolean;
}

export function UploadZone({ onFileSelect, scanning }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      onFileSelect(imageFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  if (scanning) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border-2 border-dashed border-emerald-500 rounded-2xl p-8 text-center bg-emerald-900/20"
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="text-lg font-semibold text-gray-100">Analyzing your food...</p>
            <p className="text-gray-400">Our AI is identifying ingredients and allergens</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
        isDragging
          ? 'border-emerald-500 bg-emerald-900/20 scale-105'
          : 'border-gray-600 bg-gray-900/50 hover:border-emerald-500 hover:bg-emerald-900/20'
      }`}
      onDragOver={handleDrag}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
      />
      
      <label htmlFor="file-upload" className="cursor-pointer">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center justify-center space-y-4"
        >
          <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div>
            <p className="text-xl font-semibold text-gray-100">Upload Food Photo</p>
            <p className="text-gray-400 mt-2">Drag & drop or click to browse</p>
            <p className="text-sm text-gray-500 mt-1">AI-powered ingredient and allergen analysis</p>
          </div>
          
          <button 
            type="button"
            className="px-6 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 font-medium hover:bg-gray-700 hover:border-gray-500 transition-colors"
          >
            Choose File
          </button>
        </motion.div>
      </label>
    </motion.div>
  );
}