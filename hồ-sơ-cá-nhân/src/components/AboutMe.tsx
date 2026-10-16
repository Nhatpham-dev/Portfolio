import React, { useState, useRef } from "react";
import { Upload, FileText, Image as ImageIcon, Loader, Trash2 } from "lucide-react";
import { AboutMeInfo } from "../types";

interface AboutMeProps {
  info: AboutMeInfo;
  isOwner: boolean;
  onSave: (updated: AboutMeInfo) => Promise<void>;
}

export default function AboutMe({ info, isOwner, onSave }: AboutMeProps) {
  const [text, setText] = useState(info.paragraph);
  const [uploading, setUploading] = useState(false);
  const [savingText, setSavingText] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSaveText = async () => {
    if (text === info.paragraph) return;
    setSavingText(true);
    try {
      await onSave({ ...info, paragraph: text });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingText(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tải ảnh thất bại");
      
      // Save updated imageUrl to database
      await onSave({ ...info, imageUrl: data.fileUrl });
    } catch (err: any) {
      alert(err.message || "Không thể tải lên tệp ảnh.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isOwner) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isOwner && e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        uploadFile(file);
      } else {
        alert("Vui lòng tải lên tệp hình ảnh (png, jpg, jpeg, etc.).");
      }
    }
  };

  return (
    <section id="about-me" className="py-8 px-4 md:px-12 max-w-7xl mx-auto bg-[#FFFAFA] transition-all">
      {/* Title with outlined font */}
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest outlined-title">
          About me
        </h2>
      </div>

      {/* Main section box styled like the user layout but polished */}
      <div className="bg-[#EAEAEA] border-4 border-[#D9D9D9] rounded-2xl p-6 md:p-10 relative shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* Image box (Left - Span 4) */}
          <div className="md:col-span-4 flex flex-col justify-center">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => isOwner && !info.imageUrl && fileInputRef.current?.click()}
              className={`aspect-square w-full bg-white rounded-xl border-3 border-dashed ${
                isDragOver ? "border-[#64B4E6] bg-sky-50" : "border-slate-300 bg-white"
              } ${isOwner && !info.imageUrl ? "cursor-pointer hover:border-[#64B4E6] hover:bg-slate-50" : ""} transition-all duration-200 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={!isOwner}
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader className="w-10 h-10 text-[#64B4E6] animate-spin" />
                  <span className="text-sm text-slate-500 font-medium">Đang tải ảnh...</span>
                </div>
              ) : info.imageUrl ? (
                <div className="absolute inset-0 w-full h-full group">
                  <img
                    src={info.imageUrl}
                    alt="About me"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {isOwner && !showDeleteConfirm && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-3 z-10 cursor-pointer"
                    >
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Tải ảnh mới</span>
                      <p className="text-[10px] text-slate-300 mt-1">Kéo thả hoặc click chuột</p>
                    </div>
                  )}
                  {isOwner && !showDeleteConfirm && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(true);
                      }}
                      className="absolute top-3 right-3 z-30 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all cursor-pointer shadow-md border-2 border-white flex items-center justify-center hover:scale-105 active:scale-95"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {showDeleteConfirm && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-white p-4 z-40 transition-all duration-200"
                    >
                      <Trash2 className="w-8 h-8 text-rose-500 mb-2 animate-bounce" />
                      <span className="text-xs font-bold text-center px-2 mb-3">Xóa ảnh đại diện này?</span>
                      <div className="flex gap-2 w-full max-w-[160px]">
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await onSave({ ...info, imageUrl: "" });
                              setShowDeleteConfirm(false);
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold rounded-lg text-xs transition-all cursor-pointer"
                        >
                          Xóa
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(false);
                          }}
                          className="flex-1 py-1.5 bg-slate-600 hover:bg-slate-500 active:scale-95 text-white font-semibold rounded-lg text-xs transition-all cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : isOwner ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="p-4 bg-sky-50 rounded-full text-[#64B4E6] mb-4">
                    <Upload className="w-8 h-8" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isOwner) fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-[#64B4E6] hover:bg-[#52a0d1] text-white font-medium rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    Browse
                  </button>
                  <p className="text-xs text-slate-400 mt-3 font-medium">drop a file here</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Chưa cập nhật ảnh
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Paragraph Box (Right - Span 8) */}
          <div className="md:col-span-8 flex flex-col justify-between bg-[#F5F5F5] border border-slate-300/60 rounded-xl p-6 md:p-8">
            <div className="flex-grow flex flex-col justify-center">
              {isOwner ? (
                <div className="flex flex-col h-full gap-4">
                  <div className="flex items-center gap-2 text-slate-700 font-display font-semibold border-b border-slate-300/80 pb-2">
                    <FileText className="w-5 h-5 text-[#64B4E6]" />
                    <span>Nội dung giới thiệu (Nhấp để chỉnh sửa)</span>
                  </div>
                  <textarea
                    rows={6}
                    value={text}
                    onChange={handleTextChange}
                    onBlur={handleSaveText}
                    placeholder="Hãy nhập một đoạn văn giới thiệu bản thân của bạn..."
                    className="w-full p-4 bg-white border border-slate-300/80 focus:border-[#64B4E6] focus:ring-1 focus:ring-sky-100 rounded-xl text-slate-700 leading-relaxed outline-none transition-all resize-none font-medium text-sm md:text-base flex-grow"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveText}
                      disabled={savingText || text === info.paragraph}
                      className="px-5 py-2.5 bg-[#64B4E6] hover:bg-[#52a0d1] disabled:bg-slate-300 text-white font-semibold rounded-lg text-xs tracking-wider uppercase shadow-md shadow-sky-100 transition-all cursor-pointer flex items-center gap-2"
                    >
                      {savingText ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-700 font-display font-semibold border-b border-slate-300/80 pb-2">
                    <FileText className="w-5 h-5 text-[#64B4E6]" />
                    <span>Giới thiệu bản thân</span>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed text-sm md:text-base whitespace-pre-wrap py-2">
                    {info.paragraph || "Chưa có thông tin giới thiệu."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
