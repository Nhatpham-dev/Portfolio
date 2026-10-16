import React, { useState, useEffect } from "react";
import { User, UserProfile } from "./types";
import AuthScreen from "./components/AuthScreen";
import PortfolioHeader from "./components/PortfolioHeader";
import AboutMe from "./components/AboutMe";
import Academy from "./components/Academy";
import Experiences from "./components/Experiences";
import Activities from "./components/Activities";
import Contact from "./components/Contact";
import { Loader, AlertCircle, ArrowLeft, LogIn, Trash2, ShieldAlert } from "lucide-react";

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Parse URL query parameters
  const getQueryParam = (name: string): string | null => {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  };

  // Check login state and load profile on initial load
  useEffect(() => {
    const checkUserAndLoad = async () => {
      setLoading(true);
      setError(null);
 
      // Check for user in sessionStorage
      const cachedUserJson = sessionStorage.getItem("portfolio_user");
      let currentUser: User | null = null;
      if (cachedUserJson) {
        try {
          currentUser = JSON.parse(cachedUserJson);
          setLoggedInUser(currentUser);
        } catch (e) {
          sessionStorage.removeItem("portfolio_user");
        }
      }
 
      // Check if viewing a specific profile via query string (?profile=XYZ)
      const profileReg = getQueryParam("profile");
 
      if (profileReg) {
        // Load the shared profile
        try {
          const res = await fetch(`/api/profile/${profileReg}`);
          if (!res.ok) {
            throw new Error("Không tìm thấy hồ sơ cá nhân cho số đăng ký này.");
          }
          const data = await res.json();
          setViewingProfile(data);
          setShowAuthScreen(false);
        } catch (err: any) {
          setError(err.message || "Không thể tải hồ sơ.");
        } finally {
          setLoading(false);
        }
      } else if (currentUser) {
        // No explicit profile in URL, but user is logged in: load their own profile
        try {
          const res = await fetch(`/api/profile/${currentUser.registrationNumber}`);
          if (!res.ok) {
            throw new Error("Không tìm thấy hồ sơ của bạn.");
          }
          const data = await res.json();
          setViewingProfile(data);
          setShowAuthScreen(false);
        } catch (err: any) {
          setError(err.message || "Không thể tải hồ sơ.");
        } finally {
          setLoading(false);
        }
      } else {
        // No profile parameter, no logged-in user: Show Auth Screen to let users sign up
        setShowAuthScreen(true);
        setLoading(false);
      }
    };
 
    checkUserAndLoad();
  }, []);
 
  const handleLoginSuccess = async (user: User) => {
    setLoading(true);
    setError(null);
    setLoggedInUser(user);
    sessionStorage.setItem("portfolio_user", JSON.stringify(user));
 
    // Redirect the URL to clear past profile parameter if they login, OR show their profile
    // This allows them to see their own portfolio in edit mode
    window.history.replaceState({}, "", window.location.pathname);
 
    try {
      const res = await fetch(`/api/profile/${user.registrationNumber}`);
      if (!res.ok) {
        throw new Error("Không tìm thấy hồ sơ cá nhân.");
      }
      const data = await res.json();
      setViewingProfile(data);
      setShowAuthScreen(false);
    } catch (err: any) {
      setError(err.message || "Đăng nhập thành công nhưng không thể tải hồ sơ.");
    } finally {
      setLoading(false);
    }
  };
 
  const handleLogout = () => {
    sessionStorage.removeItem("portfolio_user");
    setLoggedInUser(null);
    setViewingProfile(null);
    setShowAuthScreen(true);
    // Clear the address bar query
    window.history.replaceState({}, "", window.location.pathname);
  };

  const handleDeleteAccount = () => {
    setDeleteError(null);
    setShowDeleteAccountConfirm(true);
  };

  const executeDeleteAccount = async () => {
    if (!loggedInUser || !viewingProfile) return;

    try {
      setDeleting(true);
      setDeleteError(null);
      const res = await fetch(`/api/account/${loggedInUser.registrationNumber}`, {
        method: "DELETE",
        headers: {
          "x-user-reg": loggedInUser.registrationNumber,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể xóa tài khoản.");
      }

      // Success: clean up state and redirect to login screen
      sessionStorage.removeItem("portfolio_user");
      setLoggedInUser(null);
      setViewingProfile(null);
      setShowDeleteAccountConfirm(false);
      setShowAuthScreen(true);
      window.history.replaceState({}, "", window.location.pathname);
    } catch (err: any) {
      setDeleteError(err.message || "Có lỗi xảy ra khi xóa tài khoản.");
    } finally {
      setDeleting(false);
    }
  };

  // Saves a updated section/object to the profile
  const saveProfileField = async (field: keyof UserProfile, updatedValue: any) => {
    if (!viewingProfile || !loggedInUser) return;

    // Permissions guard: Ensure logged in user owns this profile
    if (loggedInUser.registrationNumber.toLowerCase() !== viewingProfile.registrationNumber.toLowerCase()) {
      alert("Bạn không có quyền chỉnh sửa hồ sơ này!");
      return;
    }

    try {
      const updatedProfile = {
        ...viewingProfile,
        [field]: updatedValue,
      };

      const res = await fetch(`/api/profile/${viewingProfile.registrationNumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-reg": loggedInUser.registrationNumber,
        },
        body: JSON.stringify(updatedProfile),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể cập nhật hồ sơ.");
      }

      // Update local state
      setViewingProfile(updatedProfile);
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi lưu thay đổi.");
    }
  };

  // Determine if current visitor is the actual owner of the profile being displayed
  const isOwner =
    !!loggedInUser &&
    !!viewingProfile &&
    loggedInUser.registrationNumber.toLowerCase() === viewingProfile.registrationNumber.toLowerCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center gap-4">
        <Loader className="w-12 h-12 text-[#64B4E6] animate-spin" />
        <p className="text-slate-500 font-semibold text-sm">Vui lòng đợi giây lát...</p>
      </div>
    );
  }

  if (showAuthScreen) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (error || !viewingProfile) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-sky-100 p-8 shadow-xl text-center space-y-6">
          <div className="p-4 bg-rose-50 text-rose-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-bold text-slate-800">
              Có lỗi xảy ra!
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {error || "Hồ sơ không tồn tại hoặc đã bị gỡ bỏ."}
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => {
                // Clear state, URL and go back to login screen
                window.history.replaceState({}, "", window.location.pathname);
                setError(null);
                setShowAuthScreen(true);
              }}
              className="w-full py-3 bg-[#64B4E6] hover:bg-[#52a0d1] text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập / đăng ký
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFAFA] text-slate-700 selection:bg-sky-100">
      
      {/* Fixed Sticky Header */}
      <PortfolioHeader
        profileName={viewingProfile.userName}
        profileReg={viewingProfile.registrationNumber}
        loggedInUser={loggedInUser}
        onLogout={handleLogout}
        onLoginClick={() => setShowAuthScreen(true)}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* Main Sections */}
      <main className="space-y-4">
        {/* Banner telling read-only visitors they are viewing a portfolio */}
        {!isOwner && (
          <div className="bg-sky-50 border-b border-sky-100/50 py-3 px-6 text-center text-xs md:text-sm text-slate-500 font-semibold flex items-center justify-center gap-2">
            <span>Bạn đang xem hồ sơ của <strong>{viewingProfile.userName}</strong> ở chế độ Chỉ đọc.</span>
            {!loggedInUser && (
              <button
                onClick={() => setShowAuthScreen(true)}
                className="text-[#64B4E6] hover:underline hover:text-[#52a0d1] inline-flex items-center gap-1 ml-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                Đăng nhập của bạn
              </button>
            )}
          </div>
        )}

        {/* 1. About me section */}
        <AboutMe
          info={viewingProfile.aboutMe}
          isOwner={isOwner}
          onSave={(updated) => saveProfileField("aboutMe", updated)}
        />

        {/* 2. Academy section */}
        <Academy
          items={viewingProfile.academy}
          isOwner={isOwner}
          onSave={(updated) => saveProfileField("academy", updated)}
        />

        {/* 3. Experiences section */}
        <Experiences
          items={viewingProfile.experiences}
          isOwner={isOwner}
          onSave={(updated) => saveProfileField("experiences", updated)}
        />

        {/* 4. Activities section */}
        <Activities
          items={viewingProfile.activities}
          isOwner={isOwner}
          onSave={(updated) => saveProfileField("activities", updated)}
        />

        {/* 5. Contact section */}
        <Contact
          info={viewingProfile.contact}
          isOwner={isOwner}
          onSave={(updated) => saveProfileField("contact", updated)}
        />
      </main>

      {/* Footer credit */}
      <footer className="py-12 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
        <p>© 2026 {viewingProfile.userName}. Tất cả các quyền được bảo lưu.</p>
        <p className="mt-1">Giao diện tối ưu bởi AI Studio Build.</p>
      </footer>

      {/* Custom Account Deletion Modal */}
      {showDeleteAccountConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full border border-rose-100 shadow-2xl p-6 text-center space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
              <ShieldAlert className="w-10 h-10 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-display font-bold text-slate-900">
                Xác nhận xóa tài khoản?
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Hành động này sẽ <strong className="text-rose-600 font-bold">xóa vĩnh viễn</strong> tài khoản và toàn bộ thông tin hồ sơ cá nhân của bạn khỏi hệ thống. Thao tác này không thể hoàn tác!
              </p>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold text-left border border-rose-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={executeDeleteAccount}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-xl text-sm shadow-md cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Xóa vĩnh viễn
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setShowDeleteAccountConfirm(false);
                  setDeleteError(null);
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm cursor-pointer transition-all disabled:opacity-50"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
