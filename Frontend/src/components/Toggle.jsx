/** Accessible on/off switch used across settings. */
function Toggle({ checked, onChange, disabled = false, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 ${
        checked
          ? "border-indigo-400/40 bg-indigo-500"
          : "border-white/[0.1] bg-white/[0.07]"
      } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-white shadow transition-all duration-200 ${
          checked ? "left-[calc(100%-1.25rem)]" : "left-1"
        }`}
      />
    </button>
  );
}

export default Toggle;
