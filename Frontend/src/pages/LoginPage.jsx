import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthLayout from "../components/AuthLayout";
import AuthField from "../components/AuthField";
import { MailIcon, LoaderIcon, LockIcon } from "lucide-react";
import { Link } from "react-router";

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <AuthLayout
      eyebrow="Welcome back to"
      title="Log in to pick up your conversations"
      illustration="/login.png"
      illustrationAlt="People chatting on their phones"
      tagline="Connect anytime, anywhere"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="auth-link">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up animation-delay-100">
        <AuthField
          label="Email"
          icon={MailIcon}
          type="email"
          required
          autoComplete="email"
          placeholder="johndoe@gmail.com"
          disabled={isLoggingIn}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <AuthField
          label="Password"
          icon={LockIcon}
          type="password"
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          disabled={isLoggingIn}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="auth-link text-sm">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={isLoggingIn} className="auth-btn !mt-7">
          {isLoggingIn ? (
            <>
              <LoaderIcon className="size-5 animate-spin-fast" />
              <span>Signing in...</span>
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
