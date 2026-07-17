import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { MessageCircleIcon, MailIcon, LoaderIcon, LockIcon } from "lucide-react";
import { Link } from "react-router";

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="w-full flex items-center justify-center p-4 bg-slate-900 animate-fade-in">
      <div className="relative w-full max-w-6xl md:h-[800px] h-[650px]">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row">
            {/* LEFT FORM SECTION */}
            <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30 animate-slide-right">
              <div className="w-full max-w-md">
                {/* HEADING */}
                <div className="text-center mb-8 animate-slide-down">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                    <MessageCircleIcon className="w-7 h-7 text-cyan-400" />
                  </div>
                  
                  <h2 className="text-2xl font-semibold text-slate-200 mb-2">Welcome Back</h2>
                  <h2 className="
                    text-4xl font-black
                    bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400
                    bg-clip-text text-transparent
                    animate-gradient-shift
                    mb-4
                  ">
                    yappify
                  </h2>
                  <p className="text-slate-400 text-sm">Login to access your account</p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up animation-delay-100">
                  {/* EMAIL INPUT */}
                  <div className="group">
                    <label className="
                      block text-sm font-medium text-slate-300 mb-2
                      transition-colors duration-200
                      group-focus-within:text-cyan-400
                    ">
                      Email
                    </label>
                    <div className="relative">
                      <MailIcon className="
                        absolute left-3 top-3 w-5 h-5
                        text-slate-500 transition-colors duration-200
                        group-focus-within:text-cyan-400
                      " />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="
                          w-full pl-10 pr-4 py-2.5 rounded-lg
                          bg-slate-800/50 border-2 border-slate-700/50
                          text-slate-100 placeholder-slate-500
                          transition-all duration-300
                          hover:border-slate-600/50
                          focus:outline-none focus:border-cyan-500/50 focus:bg-slate-800/80
                          focus:shadow-lg focus:shadow-cyan-500/20
                        "
                        placeholder="johndoe@gmail.com"
                      />
                    </div>
                  </div>

                  {/* PASSWORD INPUT */}
                  <div className="group">
                    <label className="
                      block text-sm font-medium text-slate-300 mb-2
                      transition-colors duration-200
                      group-focus-within:text-cyan-400
                    ">
                      Password
                    </label>
                    <div className="relative">
                      <LockIcon className="
                        absolute left-3 top-3 w-5 h-5
                        text-slate-500 transition-colors duration-200
                        group-focus-within:text-cyan-400
                      " />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="
                          w-full pl-10 pr-4 py-2.5 rounded-lg
                          bg-slate-800/50 border-2 border-slate-700/50
                          text-slate-100 placeholder-slate-500
                          transition-all duration-300
                          hover:border-slate-600/50
                          focus:outline-none focus:border-cyan-500/50 focus:bg-slate-800/80
                          focus:shadow-lg focus:shadow-cyan-500/20
                        "
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="
                      w-full py-2.5 mt-6 rounded-lg font-semibold
                      bg-gradient-to-r from-cyan-500 to-blue-600
                      text-white
                      transition-all duration-300 ease-out
                      hover:shadow-lg hover:shadow-cyan-500/40 hover:from-cyan-600 hover:to-blue-700
                      active:scale-95
                      disabled:opacity-70 disabled:cursor-not-allowed
                      focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-900
                      flex items-center justify-center gap-2
                    "
                  >
                    {isLoggingIn ? (
                      <>
                        <LoaderIcon className="w-5 h-5 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                {/* SIGNUP LINK */}
                <div className="mt-6 text-center animate-slide-up animation-delay-200">
                  <p className="text-slate-400 text-sm">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="
                        text-cyan-400 font-medium
                        transition-all duration-200
                        hover:text-cyan-300 hover:underline
                        focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded px-1
                      "
                    >
                      Sign Up
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT ILLUSTRATION SECTION */}
            <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent animate-slide-left">
              <div className="text-center animate-slide-up animation-delay-300">
                <div className="relative inline-block">
                  <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-2xl" />
                  
                  <img
                    src="/login.png"
                    alt="People using mobile devices"
                    className="
                      relative w-full max-w-xs h-auto object-contain
                      transition-transform duration-500
                      hover:scale-105
                    "
                  />
                </div>

                <div className="mt-8">
                  <h3 className="
                    text-xl font-semibold
                    bg-gradient-to-r from-cyan-400 to-blue-400
                    bg-clip-text text-transparent
                  ">
                    Connect anytime, anywhere
                  </h3>

                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
                      Free
                    </span>
                    <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
                      Easy Setup
                    </span>
                    <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
                      Private
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(-16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes gradientShift {
          0% { background-position: 0% center; }
          50% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }

        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.5s ease-out forwards; opacity: 0; }
        .animate-slide-down { animation: slideDown 0.5s ease-out forwards; opacity: 0; }
        .animate-slide-right { animation: slideRight 0.5s ease-out forwards; opacity: 0; }
        .animate-slide-left { animation: slideLeft 0.5s ease-out forwards; opacity: 0; }
        .animate-gradient-shift { background-size: 200% center; animation: gradientShift 3s ease infinite; }

        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in, .animate-slide-up, .animate-slide-down,
          .animate-slide-right, .animate-slide-left, .animate-gradient-shift {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}

export default LoginPage;