import React, { useState, useRef } from "react";
import { Plus, X, Upload, ExternalLink, Loader, Trash2, Heart, Pencil, Download } from "lucide-react";
import { ActivityItem, AttachedFile } from "../types";
import { ImageCarousel } from "./ImageCarousel";
import { ImageLightbox } from "./ImageLightbox";

interface ActivitiesProps {
  items: ActivityItem[];
  isOwner: boolean;
  onSave: (updatedItems: ActivityItem[]) => Promise<void>;
}

export default function Activities({ items, isOwner, onSave }: ActivitiesProps) {
  const [showForm, setShowForm] = useState(false);
  const [clubName, setClubName] = useState("");
  const [position, setPosition] = useState("");
  const [tasks, setTasks] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Lightbox state
  const [lightboxFiles, setLightboxFiles] = useState<AttachedFile[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // File upload state supporting multiple files
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      const uploadedFiles: AttachedFile[] = [];
      
      try {
        for (let i = 0; i < e.target.files.length; i++) {
          const file = e.target.files[i];
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Tải tệp thất bại");
          uploadedFiles.push({ name: data.fileName, url: data.fileUrl });
        }
        setFiles((prev) => [...prev, ...uploadedFiles]);
      } catch (err: any) {
        alert(err.message || "Không thể tải lên tệp tin.");
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName) {
      alert("Vui lòng nhập tên câu lạc bộ/hoạt động (Club Name)!");
      return;
    }

    const legacyName = files.length > 0 ? files[0].name : "";
    const legacyUrl = files.length > 0 ? files[0].url : "";

    let updated: ActivityItem[];
    if (editingId) {
      updated = items.map((item) =>
        item.id === editingId
          ? {
              ...item,
              clubName: clubName.trim(),
              position: position.trim(),
              particularTasks: tasks.trim() ? "Particular Tasks: " + tasks.trim() : "",
              extraInformations: extraInfo.trim() ? "Extra Informations: " + extraInfo.trim() : "",
              fileName: legacyName,
              fileUrl: legacyUrl,
              files: files,
            }
          : item
      );
    } else {
      const newItem: ActivityItem = {
        id: "activity-" + Date.now(),
        clubName: clubName.trim(),
        position: position.trim(),
        particularTasks: tasks.trim() ? "Particular Tasks: " + tasks.trim() : "",
        extraInformations: extraInfo.trim() ? "Extra Informations: " + extraInfo.trim() : "",
        fileName: legacyName,
        fileUrl: legacyUrl,
        files: files,
      };
      updated = [...items, newItem];
    }

    await onSave(updated);

    // Reset form
    setClubName("");
    setPosition("");
    setTasks("");
    setExtraInfo("");
    setFiles([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditItemClick = (item: ActivityItem) => {
    setEditingId(item.id);
    setClubName(item.clubName);
    setPosition(item.position || "");
    setTasks(item.particularTasks ? item.particularTasks.replace(/^Particular Tasks:\s*/, "") : "");
    setExtraInfo(item.extraInformations ? item.extraInformations.replace(/^Extra Informations:\s*/, "") : "");
    
    if (item.files && item.files.length > 0) {
      setFiles(item.files);
    } else if (item.fileUrl) {
      setFiles([{ name: item.fileName || "File", url: item.fileUrl }]);
    } else {
      setFiles([]);
    }
    
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setClubName("");
    setPosition("");
    setTasks("");
    setExtraInfo("");
    setFiles([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa mục hoạt động này?")) {
      const updated = items.filter((item) => item.id !== id);
      await onSave(updated);
    }
  };

  return (
    <section id="activities" className="py-8 px-4 md:px-12 max-w-7xl mx-auto bg-[#FFFAFA] transition-all">
      {/* Title with outlined font */}
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest outlined-title">
          Activities
        </h2>
      </div>

      {/* Main grey block wrapper */}
      <div className="bg-[#EAEAEA] border-4 border-[#D9D9D9] rounded-2xl p-6 md:p-8 shadow-inner relative">
        
        {/* Horizontal scrollbar of cards */}
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar items-center">
          
          {items.map((item) => (
            <div
              key={item.id}
              className="min-w-[280px] md:min-w-[340px] max-w-[360px] min-h-[300px] h-auto bg-white rounded-2xl p-6 border border-slate-200 shadow-md relative flex flex-col justify-start group transition-all hover:shadow-lg pb-6"
            >
              {/* Image Carousel on top */}
              {((item.files && item.files.length > 0) || item.fileUrl) && (
                <ImageCarousel
                  files={item.files && item.files.length > 0 ? item.files : [{ name: item.fileName || "File", url: item.fileUrl || "" }]}
                  onImageClick={(idx) => {
                    const filesList = item.files && item.files.length > 0 ? item.files : [{ name: item.fileName || "File", url: item.fileUrl || "" }];
                    setLightboxFiles(filesList);
                    setLightboxIndex(idx);
                  }}
                />
              )}

              <div className="relative">
                {/* Edit and Trash buttons for owner */}
                {isOwner && (
                  <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditItemClick(item)}
                      className="p-1.5 bg-sky-50 text-[#64B4E6] hover:bg-sky-100 hover:text-[#52a0d1] rounded-lg cursor-pointer"
                      title="Chỉnh sửa mục này"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 rounded-lg cursor-pointer"
                      title="Xóa mục này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-start gap-2 pr-12">
                  <div className="p-1.5 bg-sky-50 text-[#64B4E6] rounded-lg mt-0.5 shrink-0">
                    <Heart className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-800 text-base md:text-lg line-clamp-2">
                      {item.clubName}
                    </h3>
                    {item.position && (
                      <p className="text-[#64B4E6] text-xs font-semibold uppercase tracking-wider mt-0.5">
                        {item.position}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm text-slate-600 font-medium">
                  {((item.particularTasks) || (item.extraInformations)) && (
                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-1 space-y-3 mt-1.5">
                      {item.particularTasks && (
                        <div className="space-y-1">
                          <span className="block text-[11px] font-bold text-slate-800 tracking-wider uppercase">
                            Particular Tasks
                          </span>
                          <p className="whitespace-pre-line text-xs text-slate-600 leading-relaxed pl-2 border-l-2 border-[#64B4E6]">
                            {item.particularTasks}
                          </p>
                        </div>
                      )}
                      {item.extraInformations && (
                        <div className="space-y-1">
                          <span className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                            Extra Informations
                          </span>
                          <p className="whitespace-pre-line text-xs text-slate-500 leading-relaxed pl-2 border-l-2 border-slate-300">
                            {item.extraInformations}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Plus button at the end (Only for owner) */}
          {isOwner && (
            <div className="flex shrink-0 items-center justify-center pl-4 pr-6">
              <button
                onClick={() => {
                  if (showForm) {
                    handleCloseForm();
                  } else {
                    setShowForm(true);
                  }
                }}
                className={`w-14 h-14 rounded-full ${
                  showForm ? "bg-rose-500 text-white" : "bg-white text-[#64B4E6]"
                } border-4 border-[#D9D9D9] hover:border-[#64B4E6] flex items-center justify-center hover:scale-105 active:scale-95 shadow-md cursor-pointer transition-all`}
                title="Thêm mục hoạt động"
              >
                {showForm ? <X className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Centered editing modal */}
      {isOwner && showForm && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border-2 border-[#D9D9D9] rounded-2xl p-6 md:p-8 shadow-2xl relative animate-zoom-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="absolute top-4 right-4">
              <button
                onClick={handleCloseForm}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          <h3 className="font-display font-bold text-[#64B4E6] text-lg mb-6 border-b pb-2 flex items-center gap-2">
            {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {editingId ? "Chỉnh sửa thông tin Activities" : "Thêm thông tin Activities"}
          </h3>

          <form onSubmit={handleAddItem} className="space-y-4 font-medium text-slate-700">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Club/Activity Name
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: OK Club"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#64B4E6] rounded-xl text-sm outline-none transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Position
              </label>
              <input
                type="text"
                placeholder="Ví dụ: External Relations, President..."
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#64B4E6] rounded-xl text-sm outline-none transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Particular Tasks
              </label>
              <textarea
                placeholder="Ví dụ: Event planning, sponsorships, member coordination..."
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                className="w-full h-[210px] px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#64B4E6] rounded-xl text-sm outline-none transition-all text-slate-800 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Extra Informations
              </label>
              <textarea
                placeholder="Ví dụ: Raised $5000, managed 50+ participants..."
                value={extraInfo}
                onChange={(e) => setExtraInfo(e.target.value)}
                className="w-full h-[210px] px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#64B4E6] rounded-xl text-sm outline-none transition-all text-slate-800 resize-none"
              />
            </div>

            {/* File Uploader */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
                Add Files ( Can upload multiple )
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {uploading ? (
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 text-[#64B4E6] animate-spin" />
                    <span className="text-xs text-slate-500">Đang tải tệp tin...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <button
                      type="button"
                      className="px-3 py-1 bg-[#64B4E6] hover:bg-[#52a0d1] text-white text-[10px] font-bold rounded cursor-pointer transition-colors shadow-sm"
                    >
                      Browse
                    </button>
                    <span className="text-[10px] text-slate-400 font-medium mt-1">
                      drop files here (multiple supported)
                    </span>
                  </div>
                )}
              </div>

              {/* Uploaded Files list with delete option */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Uploaded Files ({files.length})
                  </p>
                  <div className="grid grid-cols-1 gap-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-sky-50/50 rounded-lg border border-sky-100"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <Download className="w-3.5 h-3.5 text-[#64B4E6] shrink-0" />
                          <span className="text-xs text-slate-700 truncate font-semibold">
                            {file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFiles((prev) => prev.filter((_, i) => i !== index));
                          }}
                          className="p-1 hover:bg-rose-100 text-rose-500 rounded transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#64B4E6] hover:bg-[#52a0d1] text-white font-semibold rounded-xl text-sm tracking-wider uppercase shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {editingId ? "Lưu thay đổi" : "Lưu Activities"}
            </button>
          </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxFiles && (
        <ImageLightbox
          files={lightboxFiles}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxFiles(null)}
        />
      )}
    </section>
  );
}
