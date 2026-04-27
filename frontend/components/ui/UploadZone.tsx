"use client";

import { AlertCircle, CloudUpload, FileCheck } from "lucide-react";
import { useDropzone } from "react-dropzone";

type Props = {
  onFileAccepted: (file: File) => void;
};

export default function UploadZone({ onFileAccepted }: Props) {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles, fileRejections } =
    useDropzone({
      maxFiles: 1,
      maxSize: 50 * 1024 * 1024,
      accept: {
        "application/pdf": [".pdf"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        "image/png": [".png"],
        "image/jpeg": [".jpg", ".jpeg"],
      },
      onDropAccepted: (files) => onFileAccepted(files[0]),
    });

  const file = acceptedFiles[0];
  const error = fileRejections[0]?.errors[0]?.message;

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
        error
          ? "border-red-400 bg-red-500/10"
          : file
            ? "border-secondary bg-secondary/10"
            : isDragActive
              ? "border-primary bg-primary/15 shadow-[0_0_20px_rgba(108,99,255,0.3)] animate-pulse"
              : "border-primary/60 bg-surface2/40 hover:bg-surface2/70"
      }`}
    >
      <input {...getInputProps()} />
      {error ? (
        <>
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <p className="text-red-300">{error}</p>
        </>
      ) : file ? (
        <>
          <FileCheck className="mx-auto mb-3 h-10 w-10 text-secondary" />
          <p className="font-semibold text-text">{file.name}</p>
          <p className="text-sm text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          <span className="mt-2 inline-block rounded-full bg-secondary/20 px-3 py-1 text-xs text-secondary">
            Upload ready
          </span>
        </>
      ) : (
        <>
          <CloudUpload className="mx-auto mb-3 h-12 w-12 text-primary" />
          <p className="text-text">{isDragActive ? "Release to upload" : "Drop your document here"}</p>
          <p className="text-sm text-muted">or click to browse</p>
          <p className="mt-2 text-xs text-muted">PDF, DOCX, PNG, JPG · Max 50MB</p>
        </>
      )}
    </div>
  );
}
