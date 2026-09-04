import { useState } from "react";
import { Link } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import AuthLayout from "../components/AuthLayout";
import AuthField from "../components/AuthField";
import { MailIcon, LoaderIcon, SendIcon } from "lucide-react";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { forgotPassword, isSendingReset } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await forgotPassword(email);
    if (ok) setSent(true);
  };

  return (
    <AuthLayout
      eyebrow="Password trouble on"
      title="We'll email you a reset link"
      illustration="/login.png"
      illustrationAlt="Resetting a password"
      tagline="Back into your account in a minute"
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="space-y-5 animate-slide-up animation-delay-100">
          <div className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            <SendIcon className="mt-0.5 size-4 shrink-0" />
            <p>
              If that email is registered, a reset link is on its way. It
              expires in 30 minutes and can only be used once.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSent(false)}
            className="w-full text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up animation-delay-100">
          <AuthField
            label="Email"
            icon={MailIcon}
            type="email"
            required
            autoComplete="email"
            placeholder="johndoe@gmail.com"
            disabled={isSendingReset}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            hint="Enter the address you signed up with."
          />

          <button type="submit" disabled={isSendingReset} className="auth-btn !mt-7">
            {isSendingReset ? (
              <>
                <LoaderIcon className="size-5 animate-spin-fast" />
                <span>Sending...</span>
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
