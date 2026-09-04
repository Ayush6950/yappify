import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import AuthLayout from "../components/AuthLayout";
import { LoaderIcon, MailCheckIcon, ShieldAlertIcon } from "lucide-react";

/**
 * Confirms an email address from the link we mailed out.
 *
 * The token is single-use, and some mail clients pre-fetch links — which would
 * burn it before the user ever arrives. So we never verify on page load; the
 * user presses a button and we POST from there.
 */
function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const { verifyEmail, isVerifyingEmail, authUser } = useAuthStore();
  const [status, setStatus] = useState("idle"); // idle | done | failed

  const handleVerify = async () => {
    const ok = await verifyEmail(token);
    setStatus(ok ? "done" : "failed");

    if (ok) setTimeout(() => navigate("/"), 1200);
  };

  const missingToken = !token;

  return (
    <AuthLayout
      eyebrow="One last step for"
      title="Confirm your email address"
      illustration="/login.png"
      illustrationAlt="Confirming an email address"
      tagline="Verified accounts can send messages"
      footer={
        <>
          Back to{" "}
          <Link to={authUser ? "/" : "/login"} className="auth-link">
            {authUser ? "chat" : "log in"}
          </Link>
        </>
      }
    >
      <div className="space-y-5 animate-slide-up animation-delay-100">
        {missingToken ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">
            <ShieldAlertIcon className="mt-0.5 size-4 shrink-0" />
            <p>
              This link is missing its verification token. Open the most recent
              email we sent you and click the button there.
            </p>
          </div>
        ) : status === "done" ? (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            <MailCheckIcon className="mt-0.5 size-4 shrink-0" />
            <p>Your email is confirmed. Taking you to your chats…</p>
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-slate-400">
              {status === "failed"
                ? "That didn't work. The link may have expired or already been used — request a fresh one from the banner in the app."
                : "Press the button below to confirm this email address and unlock messaging."}
            </p>

            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifyingEmail}
              className="auth-btn !mt-7"
            >
              {isVerifyingEmail ? (
                <>
                  <LoaderIcon className="size-5 animate-spin-fast" />
                  <span>Verifying...</span>
                </>
              ) : (
                "Verify my email"
              )}
            </button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

export default VerifyEmailPage;
