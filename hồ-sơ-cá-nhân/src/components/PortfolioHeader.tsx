import React, { useState } from "react";
import { Share2, LogOut, Check, LogIn, Trash2 } from "lucide-react";
import { User } from "../types";

interface PortfolioHeaderProps {
  profileName: string;
  profileReg: string;
  loggedInUser: User | null;
  onLogout: () => void;
  onLoginClick?: () => void;
  onDeleteAccount?: () => void;
}

export default function PortfolioHeader({
  profileName,
  profileReg,
  loggedInUser,
  onLogout,
  onLoginClick,
  onDeleteAccount,
}: PortfolioHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Generate sharing URL
    const shareUrl = `${window.location.origin}/?profile=${profileReg}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Lỗi khi sao chép liên kết:", err);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset for sticky header (around 72px)
      const offset = 72;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 h-[72px] bg-[#64B4E6] text-white shadow-md z-50 flex items-center justify-between px-6 md:px-12 transition-all">
      {/* Brand Name & Share Icon */}
      <div className="flex items-center gap-4">
        <h1 
          className="font-display font-bold text-xl md:text-2xl uppercase tracking-wider cursor-pointer hover:opacity-90 select-none truncate max-w-[180px] md:max-w-none"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          {profileName}
        </h1>
        
        {/* Share Button */}
        <div className="relative">
          <button
            onClick={handleShare}
            title="Chia sẻ liên kết"
            className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-lg border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer text-xs md:text-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span className="hidden sm:inline text-emerald-300 font-medium">Đã sao chép!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Chia sẻ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold tracking-wide uppercase">
        {["about-me", "academy", "experiences", "activities", "contact"].map((sec) => {
          // Format label matching Vietnamese requests (About me, Academy, Experiences, Activities, Contact)
          const labels: Record<string, string> = {
            "about-me": "About me",
            academy: "Academy",
            experiences: "Experiences",
            activities: "Activities",
            contact: "Contact",
          };
          return (
            <button
              key={sec}
              onClick={() => scrollToSection(sec)}
              className="hover:text-sky-100 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform duration-200 cursor-pointer"
            >
              {labels[sec]}
            </button>
          );
        })}
      </nav>

      {/* Auth / Status badges */}
      <div className="flex items-center gap-3">
        {loggedInUser ? (
          <div className="flex items-center gap-2 md:gap-3">
            {loggedInUser.registrationNumber.toLowerCase() === profileReg.toLowerCase() && onDeleteAccount && (
              <button
                onClick={onDeleteAccount}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold rounded-xl text-xs md:text-sm border border-red-500/30 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                title="Xóa tài khoản vĩnh viễn"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa tài khoản</span>
              </button>
            )}
            <div className="flex items-center gap-2 md:gap-3 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-xs md:text-sm">
              <span className="hidden md:inline font-medium text-sky-50">
                Đăng nhập: <strong className="text-white">{loggedInUser.userName}</strong>
              </span>
              <button
                onClick={onLogout}
                className="p-1.5 hover:bg-white/15 rounded-lg text-sky-100 hover:text-white transition-colors cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4 inline-block md:mr-1" />
                <span className="hidden md:inline">Đăng xuất</span>
              </button>
            </div>
          </div>
        ) : (
          onLoginClick && (
            <button
              onClick={onLoginClick}
              className="bg-white text-[#64B4E6] hover:bg-sky-50 font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Đăng nhập
            </button>
          )
        )}
      </div>
    </header>
  );
}
