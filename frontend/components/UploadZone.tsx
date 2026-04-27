'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  disabled?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, disabled }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onUpload(acceptedFiles);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/msword': ['.doc', '.docx'],
      'text/*': ['.txt'],
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      {...getRootProps()}
      className={`
        p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all
        ${isDragActive
          ? 'border-secondary bg-secondary/20'
          : 'border-border hover:border-primary hover:bg-primary/10'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <div className="text-5xl mb-3">📄</div>
        <p className="text-foreground font-semibold mb-1">
          {isDragActive ? 'Drop files here' : 'Drag files here or click to select'}
        </p>
        <p className="text-muted-foreground text-sm">
          Supported: PDF, Images, Word, Text (Max 10MB)
        </p>
      </div>
    </motion.div>
  );
};
