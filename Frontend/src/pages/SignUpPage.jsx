import { useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { LockIcon, MailIcon, UserIcon, LoaderIcon } from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import AuthField from "../components/AuthField";
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

    if (!fullName) return toast.error("Please enter your full name.");
    if (!email) return toast.error("Please enter your email.");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return toast.error("Please enter a valid email address.");

    if (password.length < 6) return toast.error("Password must be at least 6 characters.");

    signup({ fullName, email, password });
  };

  return (
    <AuthLayout
      eyebrow="Create your account on"
      title="Set up your profile and start chatting"
      illustration="/signup.png"
      illustrationAlt="Person signing up on a phone"
      tagline="Start your journey today"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up animation-delay-100">
        <AuthField
          label="Full name"
          icon={UserIcon}
          name="fullName"
          placeholder="John Doe"
          autoComplete="name"
          required
          disabled={isSigningUp}
          value={formData.fullName}
          onChange={handleChange}
        />

        <AuthField
          label="Email"
          icon={MailIcon}
          type="email"
          name="email"
          placeholder="example@gmail.com"
          autoComplete="email"
          required
          disabled={isSigningUp}
          value={formData.email}
          onChange={handleChange}
        />

        <AuthField
          label="Password"
          icon={LockIcon}
          type="password"
          name="password"
          placeholder="Create a password"
          autoComplete="new-password"
          required
          minLength={6}
          hint="At least 6 characters."
          disabled={isSigningUp}
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit" disabled={isSigningUp} className="auth-btn !mt-7">
          {isSigningUp ? (
            <>
              <LoaderIcon className="size-5 animate-spin-fast" />
              <span>Creating account...</span>
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

export default SignUpPage;
