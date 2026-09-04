import { MessagesSquare, Sparkles, PhoneIcon, ShieldCheck } from "lucide-react";

const HIGHLIGHTS = [
  { icon: Sparkles, label: "AI assist", hint: "Summarize, translate, reply" },
  { icon: PhoneIcon, label: "Voice & video", hint: "One tap from any chat" },
  { icon: ShieldCheck, label: "Private", hint: "Only you and your contacts" },
];

const NoConversationPlaceholder = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center animate-fade-in">
      <div className="relative mb-7">
        <span className="absolute inset-0 rounded-full bg-indigo-500/25 blur-3xl" aria-hidden="true" />
        <span className="relative grid size-20 place-items-center rounded-3xl border border-indigo-400/25 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 animate-float">
          <MessagesSquare className="size-9 text-indigo-300" />
        </span>
      </div>

      <h3 className="mb-2 text-xl font-semibold tracking-tight text-slate-100">
        Pick up where you left off
      </h3>
      <p className="mb-9 max-w-sm text-sm leading-relaxed text-slate-500">
        Choose a conversation from the sidebar, or head to Contacts to start a new one.
      </p>

      <div className="grid w-full max-w-lg gap-3 sm:grid-cols-3">
        {HIGHLIGHTS.map(({ icon: Icon, label, hint }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-4 text-left transition-colors duration-200 hover:border-white/[0.12] hover:bg-white/[0.05]"
          >
            <Icon className="mb-2.5 size-4 text-indigo-300" />
            <p className="text-sm font-semibold text-slate-200">{label}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoConversationPlaceholder;
