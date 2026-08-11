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
    <div className="w-full h-full flex items-center justify-center p-4 sm:p-8 bg-[#0a0e1a] animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl h-auto min-h-[600px] lg:h-[800px]">
        <BorderAnimatedContainer>
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* LEFT FORM SECTION */}
            <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30 animate-slide-right">
              <div className="w-full max-w-md">
                {/* HEADING */}
                <div className="text-center mb-8 animate-slide-down">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                    <MessageCircleIcon className="w-7 h-7 text-indigo-400" />
                  </div>
                  
                  <h2 className="text-2xl font-semibold text-slate-200 mb-2">Welcome Back</h2>
                  <h2 className="
                    text-4xl font-black
                    bg-gradient-to-r from-indigo-400 via-violet-500 to-indigo-400
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
                      group-focus-within:text-indigo-400
                    ">
                      Email
                    </label>
                    <div className="relative">
                      <MailIcon className="
                        absolute left-3 top-3 w-5 h-5
                        text-slate-500 transition-colors duration-200
                        group-focus-within:text-indigo-400
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
                          focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800/80
                          focus:shadow-lg focus:shadow-indigo-500/20
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
                      group-focus-within:text-indigo-400
                    ">
                      Password
                    </label>
                    <div className="relative">
                      <LockIcon className="
                        absolute left-3 top-3 w-5 h-5
                        text-slate-500 transition-colors duration-200
                        group-focus-within:text-indigo-400
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
                          focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800/80
                          focus:shadow-lg focus:shadow-indigo-500/20
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
                      bg-gradient-to-r from-indigo-500 to-violet-600
                      text-white
                      transition-all duration-300 ease-out
                      hover:shadow-lg hover:shadow-indigo-500/40 hover:from-indigo-600 hover:to-violet-700
                      active:scale-95
                      disabled:opacity-70 disabled:cursor-not-allowed
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-900
                      flex items-center justify-center gap-2
                    "
                  >
                    {isLoggingIn ? (
                      <>
                        <LoaderIcon className="w-5 h-5 animate-spin-fast" />
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
                        text-indigo-400 font-medium
                        transition-all duration-200
                        hover:text-indigo-300 hover:underline
                        focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded px-1
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
                  <div className="absolute -inset-8 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-full blur-2xl" />
                  
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
                    bg-gradient-to-r from-indigo-400 to-violet-400
                    bg-clip-text text-transparent
                  ">
                    Connect anytime, anywhere
                  </h3>

                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                      Free
                    </span>
                    <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                      Easy Setup
                    </span>
                    <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                      Private
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default LoginPage;