import React, { useState } from "react";
import { ChevronLeft, ChevronRight, FileText, Eye } from "lucide-react";
import { AttachedFile } from "../types";

interface ImageCarouselProps {
  files: AttachedFile[];
  onImageClick: (index: number) => void;
}

export const isImageFile = (url: string): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".svg") ||
    lower.startsWith("data:image/") ||
    lower.includes("image")
  );
};

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ files, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!files || files.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? files.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === files.length - 1 ? 0 : prev + 1));
  };

  const currentFile = files[currentIndex];
  const isImg = isImageFile(currentFile.url);

  return (
    <div className="w-full h-32 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden mb-4 relative group/carousel transition-all duration-300 shadow-sm hover:border-sky-200">
      {/* File/Image Content Wrapper */}
      <div 
        onClick={() => onImageClick(currentIndex)}
        className="w-full h-full flex items-center justify-center cursor-pointer relative"
      >
        {isImg ? (
          <img
            src={currentFile.url}
            alt={currentFile.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/carousel:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-3 text-center w-full h-full bg-sky-50/30">
            <FileText className="w-8 h-8 text-[#64B4E6] mb-1" />
            <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[200px]" title={currentFile.name}>
              {currentFile.name}
            </span>
          </div>
        )}

        {/* Hover Eye Icon for Lightbox indication */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/carousel:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white/90 p-1.5 rounded-full shadow-md text-slate-700">
            <Eye className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Navigation Chevrons if multiple files */}
      {files.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1 bg-white/80 hover:bg-white text-slate-700 hover:text-[#64B4E6] rounded-full shadow-md transition-all opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 cursor-pointer z-10"
            type="button"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 bg-white/80 hover:bg-white text-slate-700 hover:text-[#64B4E6] rounded-full shadow-md transition-all opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 cursor-pointer z-10"
            type="button"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Indicator Dot/Pills */}
          <div className="absolute bottom-1.5 right-2 bg-black/40 text-[9px] text-white font-bold px-1.5 py-0.5 rounded-full">
            {currentIndex + 1}/{files.length}
          </div>
        </>
      )}
    </div>
  );
};
