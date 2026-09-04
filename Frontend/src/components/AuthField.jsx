import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

/**
 * Labelled input for the auth screens. Password fields get a reveal toggle.
 */
function AuthField({ label, icon: Icon, type = "text", hint, ...inputProps }) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && revealed ? "text" : type;

  return (
    <div className="group">
      <label className="auth-input-label">{label}</label>

      <div className="relative">
        {Icon && <Icon className="auth-input-icon" />}

        <input
          type={resolvedType}
          className={`field-lg ${Icon ? "pl-10" : ""} ${isPassword ? "pr-11" : ""}`}
          {...inputProps}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-200"
            title={revealed ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {revealed ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        )}
      </div>

      {hint && <p className="mt-1.5 text-xs text-slate-600">{hint}</p>}
    </div>
  );
}

export default AuthField;
