import { useState } from "react";
import { Link } from "react-router";
import {
  MessageCircleIcon,
  LockIcon,
  MailIcon,
  UserIcon,
  LoaderIcon,
} from "lucide-react";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { useAuthStore } from "../store/useAuthStore";

function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const password = formData.password;

    if (!fullName) {
      return alert("Please enter your full name.");
    }

    if (!email) {
      return alert("Please enter your email.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return alert("Please enter a valid email address.");
    }

    if (password.length < 6) {
      return alert("Password must be at least 6 characters.");
    }

    signup({
      fullName,
      email,
      password,
    });
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

                  <h2 className="text-2xl font-semibold text-slate-200 mb-2">
                    Create Account
                  </h2>
                  <h2 className="
                    text-4xl font-black
                    bg-gradient-to-r from-indigo-400 via-violet-500 to-indigo-400
                    bg-clip-text text-transparent
                    animate-gradient-shift
                    mb-3
                  ">
                    yappify
                  </h2>
                  <p className="text-slate-400 text-sm">Sign up for a new account</p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up animation-delay-100">
                  {/* FULL NAME INPUT */}
                  <div className="group">
                    <label className="
                      block text-sm font-medium text-slate-300 mb-2
                      transition-colors duration-200
                      group-focus-within:text-indigo-400
                    ">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="
                        absolute left-3 top-3 w-5 h-5
                        text-slate-500 transition-colors duration-200
                        group-focus-within:text-indigo-400
                      " />
                      <input
                        type="text"
                        name="fullName"
                        placeholder="John Doe"
                        autoComplete="name"
                        required
                        disabled={isSigningUp}
                        value={formData.fullName}
                        onChange={handleChange}
                        className="
                          w-full pl-10 pr-4 py-2.5 rounded-lg
                          bg-slate-800/50 border-2 border-slate-700/50
                          text-slate-100 placeholder-slate-500
                          transition-all duration-300
                          hover:border-slate-600/50
                          focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800/80
                          focus:shadow-lg focus:shadow-indigo-500/20
                          disabled:opacity-60 disabled:cursor-not-allowed
                        "
                      />
                    </div>
                  </div>

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
                        name="email"
                        placeholder="example@gmail.com"
                        autoComplete="email"
                        required
                        disabled={isSigningUp}
                        value={formData.email}
                        onChange={handleChange}
                        className="
                          w-full pl-10 pr-4 py-2.5 rounded-lg
                          bg-slate-800/50 border-2 border-slate-700/50
                          text-slate-100 placeholder-slate-500
                          transition-all duration-300
                          hover:border-slate-600/50
                          focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800/80
                          focus:shadow-lg focus:shadow-indigo-500/20
                          disabled:opacity-60 disabled:cursor-not-allowed
                        "
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
                        name="password"
                        placeholder="Enter your password"
                        autoComplete="new-password"
                        required
                        minLength={6}
                        disabled={isSigningUp}
                        value={formData.password}
                        onChange={handleChange}
                        className="
                          w-full pl-10 pr-4 py-2.5 rounded-lg
                          bg-slate-800/50 border-2 border-slate-700/50
                          text-slate-100 placeholder-slate-500
                          transition-all duration-300
                          hover:border-slate-600/50
                          focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800/80
                          focus:shadow-lg focus:shadow-indigo-500/20
                          disabled:opacity-60 disabled:cursor-not-allowed
                        "
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={isSigningUp}
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
                    {isSigningUp ? (
                      <>
                        <LoaderIcon className="w-5 h-5 animate-spin-fast" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                {/* LOGIN LINK */}
                <div className="mt-6 text-center animate-slide-up animation-delay-200">
                  <p className="text-slate-400 text-sm">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="
                        text-indigo-400 font-medium
                        transition-all duration-200
                        hover:text-indigo-300 hover:underline
                        focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded px-1
                      "
                    >
                      Login
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
                    src="/signup.png"
                    alt="Signup Illustration"
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
                    Start Your Journey Today
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

export default SignUpPage;