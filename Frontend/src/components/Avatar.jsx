/**
 * Presence-aware avatar.
 *
 * Replaces the daisyUI `avatar online` pattern so the online dot renders
 * identically everywhere (sidebar, chat header, contact rows) instead of
 * depending on a plugin theme.
 */
function Avatar({
  src,
  alt = "",
  size = 48,
  online = false,
  showPresence = true,
  ring = false,
  className = "",
}) {
  const dot = Math.max(9, Math.round(size * 0.26));

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <div
        className={`size-full overflow-hidden rounded-full bg-brand-surface-card ring-1 transition-all duration-300 ${
          ring
            ? online
              ? "ring-2 ring-emerald-400/60"
              : "ring-2 ring-white/10"
            : "ring-white/10"
        }`}
      >
        <img
          src={src || "/avatar.png"}
          alt={alt}
          loading="lazy"
          className="size-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/avatar.png";
          }}
        />
      </div>

      {showPresence && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-brand-surface-sidebar transition-colors duration-300 ${
            online ? "bg-emerald-400" : "bg-slate-600"
          }`}
          style={{ width: dot, height: dot }}
          title={online ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}

export default Avatar;
