import { useState, useRef } from "react";
import { FolderIcon } from "./Icons";

interface DashboardFileDropProps {
  onFileDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileState?: File;
  acceptedFiles: string;
}

export default function DashboardFileDrop({
  onFileDrop,
  onFileChange,
  fileState,
  acceptedFiles,
}: DashboardFileDropProps) {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const extendedOnFileDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);
    onFileDrop(e);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={extendedOnFileDrop}
      className={`${
        isDragOver ? "bg-[#f7f8fe]" : "bg-neutral-2"
      } flex h-[300px] flex-col items-center gap-0 rounded-3xl pt-[96px]`}
    >
      <div className="mb-4 flex h-16 w-16 shrink-0 grow-0 items-center justify-center rounded-full bg-neutral-4">
        <span className="inline-block h-6 w-6 shrink-0 leading-[1em] text-dashboard-lightGray">
          <FolderIcon size={24} color="currentColor" />
        </span>
      </div>
      <p className="text-sm font-normal leading-5 text-neutral-3">
        {fileState ? fileState.name : "Drag recovery file here"}
      </p>
      <div className="visible ">
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-10 text-xs font-semibold leading-[1.125rem] text-primary-1"
        >
          Or select file
        </button>
        <label />
        <input
          id="recovery-file-input"
          onChange={onFileChange}
          ref={inputRef}
          className="hidden"
          type="file"
          accept={acceptedFiles}
        />
      </div>
    </div>
  );
}
