import { MessageCircleIcon, Sparkles, PhoneIcon, ShieldCheck } from "lucide-react";
import BorderAnimatedContainer from "./BorderAnimatedContainer";

const FEATURES = [
  { icon: Sparkles, text: "AI that summarizes, translates and drafts replies" },
  { icon: PhoneIcon, text: "Crisp voice and video calls, one tap away" },
  { icon: ShieldCheck, text: "Private by default — no ads, no noise" },
];

/**
 * Shared chrome for the login and sign-up screens: brand header on the left,
 * illustration and value props on the right.
 */
function AuthLayout({ eyebrow, title, illustration, illustrationAlt, tagline, children, footer }) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-y-auto p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-5xl">
        <BorderAnimatedContainer>
          <div className="flex w-full flex-col md:flex-row">
            {/* ---------- FORM ---------- */}
            <div className="flex w-full items-center justify-center border-white/[0.07] p-6 sm:p-10 md:w-1/2 md:border-r animate-slide-right">
              <div className="w-full max-w-sm">
                <header className="mb-8 text-center animate-slide-down">
                  <div className="relative mx-auto mb-5 w-fit">
                    <span className="absolute inset-0 rounded-2xl bg-indigo-500/30 blur-xl" aria-hidden="true" />
                    <span className="relative grid size-14 place-items-center rounded-2xl border border-indigo-400/25 bg-gradient-to-br from-indigo-500/25 to-violet-500/15">
                      <MessageCircleIcon className="size-7 text-indigo-300" />
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-400">{eyebrow}</p>
                  <h1 className="mb-2 text-4xl font-black tracking-tight text-gradient animate-gradient-shift">
                    yappify
                  </h1>
                  <p className="text-sm text-slate-500">{title}</p>
                </header>

                {children}

                <div className="mt-7 text-center text-sm text-slate-500 animate-slide-up animation-delay-200">
                  {footer}
                </div>
              </div>
            </div>

            {/* ---------- ILLUSTRATION ---------- */}
            <div className="hidden items-center justify-center bg-gradient-to-bl from-white/[0.04] to-transparent p-10 md:flex md:w-1/2 animate-slide-left">
              <div className="animate-slide-up animation-delay-300 text-center">
                <div className="relative inline-block">
                  <span
                    className="absolute -inset-10 rounded-full bg-gradient-to-r from-indigo-500/15 to-violet-500/15 blur-3xl"
                    aria-hidden="true"
                  />
                  <img
                    src={illustration}
                    alt={illustrationAlt}
                    className="relative mx-auto w-full max-w-[15rem] object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
                  />
                </div>

                <h2 className="mt-9 text-xl font-semibold tracking-tight text-slate-100">{tagline}</h2>

                <ul className="mx-auto mt-7 max-w-xs space-y-3 text-left">
                  {FEATURES.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
                        <Icon className="size-3.5" />
                      </span>
                      <span className="text-sm leading-relaxed text-slate-400">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default AuthLayout;
