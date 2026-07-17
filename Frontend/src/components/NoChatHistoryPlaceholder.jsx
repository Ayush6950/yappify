import { MessageCircleIcon } from "lucide-react";

const NoChatHistoryPlaceholder = ({ name }) => {
  const suggestions = [
    { emoji: "👋", text: "Say Hello", delay: 0 },
    { emoji: "🤝", text: "How are you?", delay: 100 },
    { emoji: "📅", text: "Meet up soon?", delay: 200 },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-fade-in">
      {/* Icon container with floating animation */}
      <div className="relative mb-6">
        {/* Animated glow rings */}
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-lg animate-pulse opacity-75" />
        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-md animate-pulse animation-delay-300" />

        {/* Icon background with glow */}
        <div className="
          relative w-16 h-16 
          bg-gradient-to-br from-cyan-500/30 to-blue-500/20
          rounded-full flex items-center justify-center
          border-2 border-cyan-500/30
          shadow-lg shadow-cyan-500/30
          animate-float
        ">
          <MessageCircleIcon className="size-8 text-cyan-300 drop-shadow-lg" />
        </div>
      </div>

      {/* Heading with staggered animation */}
      <h3 className="
        text-xl font-semibold text-slate-100 mb-4
        animate-slide-up
        bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent
      ">
        Start your conversation with <span className="font-bold">{name}</span>
      </h3>

      {/* Description section with staggered animation */}
      <div className="flex flex-col space-y-4 max-w-md mb-8 animate-slide-up animation-delay-150">
        <p className="text-slate-400 text-sm leading-relaxed">
          This is the beginning of your conversation. Send a message to start chatting!
        </p>

        {/* Animated divider line */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        </div>
      </div>

      {/* Suggestion buttons with staggered animation */}
      <div className="flex flex-wrap gap-3 justify-center animate-slide-up animation-delay-300">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className={`
              relative group px-4 py-2 text-xs font-medium
              rounded-full transition-all duration-300 ease-out
              focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-900
              overflow-hidden
            `}
            style={{
              animation: `slideUp 0.5s ease-out ${500 + suggestion.delay}ms both`,
            }}
            title={`Send "${suggestion.emoji} ${suggestion.text}"`}
          >
            {/* Animated background gradient */}
            <div
              className={`
                absolute inset-0 bg-gradient-to-r from-cyan-600/0 to-cyan-600/0
                group-hover:from-cyan-600/20 group-hover:to-cyan-600/10
                transition-all duration-300 ease-out -z-10
              `}
            />

            {/* Base background */}
            <div className={`
              absolute inset-0 -z-10 bg-cyan-500/10 rounded-full
              transition-all duration-300
              group-hover:bg-cyan-500/20 group-active:bg-cyan-500/30
            `} />

            {/* Shine effect on hover */}
            <div
              className={`
                absolute inset-0 opacity-0 group-hover:opacity-100
                transition-opacity duration-300 -z-10
                bg-gradient-to-r from-transparent via-white/10 to-transparent
                translate-x-full group-hover:translate-x-0 duration-500
              `}
            />

            {/* Content */}
            <span className={`
              relative flex items-center gap-2
              text-cyan-300 group-hover:text-cyan-200
              transition-colors duration-300
              group-hover:scale-105 group-active:scale-95
              inline-block
            `}>
              <span className={`
                inline-block transition-transform duration-300
                group-hover:-rotate-12 group-hover:scale-125
              `}>
                {suggestion.emoji}
              </span>
              {suggestion.text}
            </span>
          </button>
        ))}
      </div>

      {/* Optional: floating accent elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-cyan-500/20 rounded-full animate-float animation-delay-500" />
      <div className="absolute bottom-32 right-12 w-1.5 h-1.5 bg-blue-500/20 rounded-full animate-float animation-delay-700" />

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animation-delay-150 {
          animation-delay: 150ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-500 {
          animation-delay: 500ms;
        }

        .animation-delay-700 {
          animation-delay: 700ms;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in,
          .animate-slide-up,
          .animate-float,
          .animate-pulse {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default NoChatHistoryPlaceholder;