// src/App.jsx
import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { useAuthStore } from "./store/useAuthStore";
import { useCallStore } from "./store/useCallStore";
import { useEffect } from "react";
import PageLoader from "./components/PageLoader";
import IncomingCallModal from "./components/call/IncomingCallModal";
import VideoCallModal from "./components/call/VideoCallModal";

import { Toaster } from "react-hot-toast";

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();
  const { incomingCall, activeCall, isCalling } = useCallStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div className="relative flex h-[100dvh] items-center justify-center overflow-hidden bg-brand-surface-deep sm:p-4 lg:p-6">
      {/* ---------- AMBIENT BACKDROP ---------- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Faint blueprint grid, faded out toward the edges */}
        <div
          className="absolute inset-0 opacity-[0.55] bg-[linear-gradient(to_right,rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.055)_1px,transparent_1px)] bg-[size:56px_56px]"
          style={{
            maskImage: "radial-gradient(ellipse 90% 70% at 50% 40%, #000 20%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 40%, #000 20%, transparent 100%)",
          }}
        />

        {/* Aurora light fields */}
        <div className="absolute -left-32 -top-40 size-[38rem] rounded-full bg-indigo-600/25 blur-[140px] animate-aurora" />
        <div className="absolute -right-32 -bottom-40 size-[38rem] rounded-full bg-violet-600/20 blur-[140px] animate-aurora animation-delay-500" />
        <div className="absolute left-1/2 top-1/2 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.07] blur-[160px]" />

        {/* Vignette to seat the app frame on the page */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(3,5,12,0.75)_100%)]" />
      </div>

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <Routes>
          <Route path="/" element={authUser ? <ChatPage /> : <Navigate to={"/login"} />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />

          {/* Reachable logged out AND logged in: a password reset happens when
              you can't log in, and a logged-in user clicking their verification
              link must not get bounced to the chat before verifying. */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </div>

      {/* Global Call Overlays */}
      {incomingCall && <IncomingCallModal />}
      {(activeCall || isCalling) && <VideoCallModal />}

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: "rgba(20, 27, 45, 0.92)",
            color: "#e6ecf7",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "14px",
            fontSize: "14px",
            padding: "10px 14px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 18px 40px -18px rgba(0,0,0,.85)",
          },
          success: { iconTheme: { primary: "#34d399", secondary: "#0d1220" } },
          error: { iconTheme: { primary: "#f87171", secondary: "#0d1220" } },
        }}
      />
    </div>
  );
}
export default App;
