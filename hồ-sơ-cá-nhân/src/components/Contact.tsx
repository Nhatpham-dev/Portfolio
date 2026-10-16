import React, { useState } from "react";
import { Phone, Mail, Linkedin, Facebook, Edit2, Check, X } from "lucide-react";
import { ContactInfo } from "../types";

interface ContactProps {
  info: ContactInfo;
  isOwner: boolean;
  onSave: (updated: ContactInfo) => Promise<void>;
}

export default function Contact({ info, isOwner, onSave }: ContactProps) {
  // Editing state for each of the 4 items
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");

  const startEdit = (key: keyof ContactInfo, currentVal: string) => {
    if (!isOwner) return;
    setEditingKey(key);
    setEditVal(currentVal);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditVal("");
  };

  const handleSave = async (key: keyof ContactInfo) => {
    try {
      const updated = {
        ...info,
        [key]: editVal.trim() || "",
      };
      await onSave(updated);
      setEditingKey(null);
    } catch (err) {
      console.error(err);
    }
  };

  const renderCard = (
    key: keyof ContactInfo,
    label: string,
    value: string,
    icon: React.ReactNode,
    hrefBuilder: (val: string) => string | null
  ) => {
    const isEditing = editingKey === key;
    const isPlaceholder = !value || value.startsWith("Add ") || value.includes("( rename )");
    const href = hrefBuilder(value);

    return (
      <div
        key={key}
        className="w-full sm:min-w-[220px] bg-white rounded-2xl p-6 border border-slate-200 shadow-md flex flex-col items-center text-center justify-between min-h-[220px] transition-all hover:shadow-lg group"
      >
        <div className="flex flex-col items-center w-full">
          {/* Circular Icon header */}
          <div className="p-4 bg-sky-50 text-[#64B4E6] rounded-full mb-4">
            {icon}
          </div>

          {isEditing ? (
            <div className="w-full px-2 space-y-2">
              <input
                type="text"
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                autoFocus
                className="w-full text-xs font-semibold p-2 border border-[#64B4E6] focus:ring-1 focus:ring-sky-100 rounded-lg outline-none text-center bg-slate-50 text-slate-800"
                placeholder={label}
              />
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => handleSave(key)}
                  className="p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                  title="Xác nhận"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-1 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-md transition-colors cursor-pointer"
                  title="Hủy"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full px-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {label}
              </h4>
              
              {isOwner ? (
                <button
                  onClick={() => startEdit(key, value)}
                  className={`text-sm font-semibold leading-relaxed tracking-wide hover:text-[#64B4E6] hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto break-all ${
                    isPlaceholder ? "text-slate-400 italic" : "text-slate-700"
                  }`}
                  title="Nhấp để chỉnh sửa"
                >
                  <span>{value || `Chưa cấu hình`}</span>
                  <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ) : (
                /* Visitor Mode */
                href && !isPlaceholder ? (
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-slate-700 hover:text-[#64B4E6] hover:underline break-all"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="text-sm font-semibold text-slate-400 italic">
                    {isPlaceholder ? "Chưa cung cấp" : value}
                  </span>
                )
              )}
            </div>
          )}
        </div>

        {/* Action helper */}
        {!isEditing && (
          <div className="mt-4">
            {isOwner ? (
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Click to edit
              </span>
            ) : href && !isPlaceholder ? (
              <span className="text-[10px] text-[#64B4E6] uppercase tracking-wider font-bold hover:underline">
                Bấm để truy cập
              </span>
            ) : (
              <span className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">
                Trống
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <section id="contact" className="py-8 px-4 md:px-12 max-w-7xl mx-auto bg-[#FFFAFA] transition-all">
      {/* Title with outlined font */}
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest outlined-title">
          Contact
        </h2>
      </div>

      {/* Main grey block wrapper */}
      <div className="bg-[#EAEAEA] border-4 border-[#D9D9D9] rounded-2xl p-6 md:p-8 shadow-inner relative">
        
        {/* Horizontal scrollbar of cards or grid */}
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar items-center">
          
          {/* Card 1: Phone Number */}
          {renderCard(
            "phoneNumber",
            "Phone Number",
            info.phoneNumber,
            <Phone className="w-6 h-6" />,
            (val) => (val && !val.startsWith("Add") ? `tel:${val}` : null)
          )}

          {/* Card 2: Email Address */}
          {renderCard(
            "emailAddress",
            "Email Address",
            info.emailAddress,
            <Mail className="w-6 h-6" />,
            (val) => (val && !val.startsWith("Add") ? `mailto:${val}` : null)
          )}

          {/* Card 3: LinkedIn */}
          {renderCard(
            "linkedinLink",
            "LinkedIn Profile",
            info.linkedinLink,
            <Linkedin className="w-6 h-6" />,
            (val) => (val && !val.startsWith("Add") ? (val.startsWith("http") ? val : `https://${val}`) : null)
          )}

          {/* Card 4: Facebook */}
          {renderCard(
            "facebookLink",
            "Facebook Profile",
            info.facebookLink,
            <Facebook className="w-6 h-6" />,
            (val) => (val && !val.startsWith("Add") ? (val.startsWith("http") ? val : `https://${val}`) : null)
          )}
          
        </div>
      </div>
    </section>
  );
}
