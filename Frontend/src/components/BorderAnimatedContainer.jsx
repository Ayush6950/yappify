// Animated gradient border 👇
// https://cruip-tutorials.vercel.app/animated-gradient-border/
function BorderAnimatedContainer({ children, className = "" }) {
  return (
    <div
      className={`flex w-full overflow-hidden rounded-3xl border border-transparent shadow-shell animate-border [background:linear-gradient(160deg,#0f162a,#0b1020_55%,#111a30)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.700/.35)_78%,_theme(colors.indigo.500)_86%,_theme(colors.violet.400)_90%,_theme(colors.indigo.600)_94%,_theme(colors.slate.700/.35))_border-box] ${className}`}
    >
      {children}
    </div>
  );
}
export default BorderAnimatedContainer;
