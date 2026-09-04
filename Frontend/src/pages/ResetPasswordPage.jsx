import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import AuthLayout from "../components/AuthLayout";
import AuthField from "../components/AuthField";
import { LockIcon, LoaderIcon, ShieldAlertIcon } from "lucide-react";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const { resetPassword, isResettingPassword } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    if (password !== confirm) {
      return setError("Passwords don't match");
    }
    setError("");

    // Resetting invalidates every existing session, so send them to log in.
    const ok = await resetPassword(token, password);
    if (ok) navigate("/login");
  };

  return (
    <AuthLayout
      eyebrow="Choose a new password for"
      title="Set a new password"
      illustration="/signup.png"
      illustrationAlt="Choosing a new password"
      tagline="This signs out every other device"
      footer={
        <>
          Link expired?{" "}
          <Link to="/forgot-password" className="auth-link">
            Request a new one
          </Link>
        </>
      }
    >
      {!token ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200 animate-slide-up animation-delay-100">
          <ShieldAlertIcon className="mt-0.5 size-4 shrink-0" />
          <p>
            This link is missing its reset token. Request a fresh link and open
            it directly from your email.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up animation-delay-100">
          <AuthField
            label="New password"
            icon={LockIcon}
            type="password"
            required
            autoComplete="new-password"
            placeholder="At least 6 characters"
            disabled={isResettingPassword}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <AuthField
            label="Confirm password"
            icon={LockIcon}
            type="password"
            required
            autoComplete="new-password"
            placeholder="Repeat your new password"
            disabled={isResettingPassword}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button type="submit" disabled={isResettingPassword} className="auth-btn !mt-7">
            {isResettingPassword ? (
              <>
                <LoaderIcon className="size-5 animate-spin-fast" />
                <span>Updating...</span>
              </>
            ) : (
              "Update password"
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

export default ResetPasswordPage;
