import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, FileText, ExternalLink } from "lucide-react";
import { AttachedFile } from "../types";
import { isImageFile } from "./ImageCarousel";

interface ImageLightboxProps {
  files: AttachedFile[];
  initialIndex: number;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ files, initialIndex, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // Sync initial index if changed
  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  // Support escape key & navigation with arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex]);

  if (!files || files.length === 0) return null;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? files.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === files.length - 1 ? 0 : prev + 1));
  };

  const activeFile = files[activeIndex];
  const isImg = isImageFile(activeFile.url);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-between select-none animate-fade-in"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div 
        className="w-full flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent text-white z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col truncate pr-4">
          <span className="font-semibold text-sm md:text-base truncate max-w-[250px] md:max-w-md">
            {activeFile.name}
          </span>
          <span className="text-[11px] text-slate-300 font-medium">
            Mục {activeIndex + 1} / {files.length}
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* External view button */}
          <a
            href={activeFile.url}
            target="_blank"
            rel="noreferrer"
            className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
            title="Xem tab mới"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className="flex-1 flex items-center justify-between px-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev Arrow */}
        {files.length > 1 && (
          <button
            onClick={handlePrev}
            className="p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all focus:outline-none cursor-pointer border border-white/10 z-10 hidden sm:block"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Media Frame */}
        <div 
          className="flex-1 flex items-center justify-center max-h-[70vh] max-w-[90vw] mx-auto animate-zoom-in"
          onClick={onClose}
        >
          <div 
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {isImg ? (
              <img
                src={activeFile.url}
                alt={activeFile.name}
                className="max-h-[70vh] max-w-[85vw] md:max-w-[70vw] object-contain rounded shadow-2xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-[280px] md:w-[400px] h-[200px] md:h-[280px] bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-300 shadow-2xl">
                <FileText className="w-16 h-16 text-[#64B4E6] mb-4" />
                <h4 className="font-bold text-sm md:text-base text-white truncate max-w-xs mb-2">
                  {activeFile.name}
                </h4>
                <a
                  href={activeFile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 px-4 py-2 bg-[#64B4E6] hover:bg-[#52a0d1] text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Mở tệp tin này
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Next Arrow */}
        {files.length > 1 && (
          <button
            onClick={handleNext}
            className="p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all focus:outline-none cursor-pointer border border-white/10 z-10 hidden sm:block"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Swipe support instruction on mobile */}
      {files.length > 1 && (
        <div className="text-center text-[10px] text-slate-400 py-1 sm:hidden">
          Sử dụng nút ở dưới để đổi ảnh
        </div>
      )}

      {/* Bottom Thumbnail Strip */}
      <div 
        className="w-full bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col items-center gap-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation buttons for mobile */}
        {files.length > 1 && (
          <div className="flex gap-4 sm:hidden">
            <button
              onClick={handlePrev}
              className="px-4 py-1.5 bg-white/10 active:bg-white/20 hover:text-[#64B4E6] text-white text-xs font-semibold rounded-full border border-white/10"
            >
              Trở lại
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-white/10 active:bg-white/20 hover:text-[#64B4E6] text-white text-xs font-semibold rounded-full border border-white/10"
            >
              Tiếp theo
            </button>
          </div>
        )}

        {files.length > 1 && (
          <div className="flex gap-2 items-center overflow-x-auto max-w-full pb-2 px-4 custom-scrollbar">
            {files.map((file, idx) => {
              const itemIsImg = isImageFile(file.url);
              const isActive = idx === activeIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    isActive ? "border-[#64B4E6] scale-110" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {itemIsImg ? (
                    <img 
                      src={file.url} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
