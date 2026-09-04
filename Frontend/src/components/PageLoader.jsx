import { MessageCircleIcon } from "lucide-react";

function PageLoader() {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-brand-surface-deep">
      {/* Ambient glow, matching the app shell */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/4 top-1/4 size-80 rounded-full bg-indigo-600/15 blur-[120px] animate-aurora" />
        <div className="absolute bottom-1/4 right-1/4 size-80 rounded-full bg-violet-600/15 blur-[120px] animate-aurora animation-delay-500" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-7 grid place-items-center">
          <span className="absolute size-20 rounded-full border-2 border-indigo-500/15" />
          <span className="absolute size-20 rounded-full border-2 border-transparent border-t-indigo-400 animate-spin-slow" />
          <span className="grid size-12 place-items-center rounded-2xl border border-indigo-400/25 bg-indigo-500/10">
            <MessageCircleIcon className="size-6 text-indigo-300" />
          </span>
        </div>

        <h2 className="text-3xl font-black tracking-tight text-gradient animate-gradient-shift">
          yappify
        </h2>
        <p className="mt-2 select-none text-[10px] uppercase tracking-[0.28em] text-slate-600">
          Getting things ready
        </p>
      </div>
    </div>
  );
}

export default PageLoader;
