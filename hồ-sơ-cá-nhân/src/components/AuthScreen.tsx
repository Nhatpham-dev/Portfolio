import React, { useState } from "react";
import { User } from "../types";
import { Lock, User as UserIcon, Clipboard, CheckCircle, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [userName, setUserName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationNumber || !password) {
      setError("Vui lòng nhập đầy đủ Số đăng ký và Mật khẩu!");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationNumber, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Đăng nhập thất bại");
      }
      // Success! Pass user to parent
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !registrationNumber || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ tất cả các trường!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu và Xác nhận mật khẩu không giống nhau!");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, registrationNumber, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Đăng ký thất bại");
      }
      
      // Success! Show notification, clear register inputs, and toggle back to login screen
      setSuccess("Đăng ký thành công!");
      setIsRegistering(false);
      setUserName("");
      setConfirmPassword("");
      // Retain registration number and password for ease of login
      setError("");
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra trong quá trình đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 px-4 py-12 font-sans relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-200/40 blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-300/30 blur-3xl"></div>

      <div className="w-full max-w-md bg-white border border-sky-100/80 rounded-2xl shadow-xl shadow-sky-100/50 overflow-hidden relative z-10 transition-all duration-300">
        
        {/* Banner with theme color #64B4E6 */}
        <div className="bg-[#64B4E6] p-8 text-center text-white relative">
          <h2 className="text-3xl font-display font-bold tracking-tight">
            {isRegistering ? "ĐĂNG KÝ" : "ĐĂNG NHẬP"}
          </h2>
          <p className="text-sky-100 text-sm mt-2 font-medium">
            {isRegistering 
              ? "Tạo tài khoản hồ sơ cá nhân để chia sẻ và cập nhật thông tin" 
              : "Đăng nhập để cập nhật thông tin học vấn & kinh nghiệm cá nhân"
            }
          </p>
        </div>

        <div className="p-8">
          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 text-red-700 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg flex items-start gap-3 text-emerald-800 text-sm animate-fade-in">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {!isRegistering ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-sky-900/60 uppercase tracking-wider mb-2">
                  Số đăng ký
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sky-400">
                    <Clipboard className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Nhập số đăng ký của bạn..."
                    value={registrationNumber}
                    onChange={(e) => {
                      setRegistrationNumber(e.target.value);
                      setSuccess("");
                    }}
                    className="w-full pl-11 pr-4 py-3 bg-sky-50/50 border border-sky-100 focus:border-[#64B4E6] focus:bg-white rounded-xl text-sm text-slate-800 placeholder-sky-400/70 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-sky-900/60 uppercase tracking-wider mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sky-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Nhập mật khẩu..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setSuccess("");
                    }}
                    className="w-full pl-11 pr-11 py-3 bg-sky-50/50 border border-sky-100 focus:border-[#64B4E6] focus:bg-white rounded-xl text-sm text-slate-800 placeholder-sky-400/70 outline-none transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-sky-400 hover:text-sky-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#64B4E6] hover:bg-[#52a0d1] text-white font-semibold rounded-xl text-sm tracking-wide shadow-md shadow-sky-200/80 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Đang đăng nhập..." : "Xác nhận đăng nhập"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setError("");
                    setSuccess("");
                  }}
                  className="text-sm font-semibold text-[#64B4E6] hover:text-[#52a0d1] transition-colors hover:underline cursor-pointer"
                >
                  Hãy đăng ký nếu chưa có tài khoản
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sky-900/60 uppercase tracking-wider mb-1.5">
                  Tên User
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sky-400">
                    <UserIcon className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Alex Nguyễn"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-sky-50/50 border border-sky-100 focus:border-[#64B4E6] focus:bg-white rounded-xl text-sm text-slate-800 placeholder-sky-400/70 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-sky-900/60 uppercase tracking-wider mb-1.5">
                  Số đăng ký
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sky-400">
                    <Clipboard className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 20261005"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-sky-50/50 border border-sky-100 focus:border-[#64B4E6] focus:bg-white rounded-xl text-sm text-slate-800 placeholder-sky-400/70 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-sky-900/60 uppercase tracking-wider mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sky-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Nhập mật khẩu..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-2.5 bg-sky-50/50 border border-sky-100 focus:border-[#64B4E6] focus:bg-white rounded-xl text-sm text-slate-800 placeholder-sky-400/70 outline-none transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-sky-400 hover:text-sky-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-sky-900/60 uppercase tracking-wider mb-1.5">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sky-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Xác nhận lại mật khẩu..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-2.5 bg-sky-50/50 border border-sky-100 focus:border-[#64B4E6] focus:bg-white rounded-xl text-sm text-slate-800 placeholder-sky-400/70 outline-none transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-sky-400 hover:text-sky-600 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#64B4E6] hover:bg-[#52a0d1] text-white font-semibold rounded-xl text-sm tracking-wide shadow-md shadow-sky-200/80 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Đang đăng ký..." : "Xác nhận đăng ký"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
