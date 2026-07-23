import { MessageCircleIcon } from "lucide-react";

const NoChatHistoryPlaceholder = ({ name }) => {
  const suggestions = [
    { emoji: "👋", text: "Say Hello", delay: 0 },
    { emoji: "🤝", text: "How are you?", delay: 100 },
    { emoji: "📅", text: "Meet up soon?", delay: 200 },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-transparent animate-fade-in">
      {/* Icon container with floating animation */}
      <div className="relative mb-6">
        {/* Icon background */}
        <div className="
          relative w-16 h-16 
          bg-amber-500/10
          rounded-full flex items-center justify-center
          border-2 border-amber-500/20
          shadow-sm
          animate-float
        ">
          <MessageCircleIcon className="size-8 text-amber-400" />
        </div>
      </div>

      {/* Heading */}
      <h3 className="text-xl font-semibold text-slate-200 mb-4 animate-slide-up">
        Start your conversation with <span className="font-bold">{name}</span>
      </h3>

      {/* Description section */}
      <div className="flex flex-col space-y-4 max-w-md mb-8 animate-slide-up animation-delay-150">
        <p className="text-slate-450 text-sm leading-relaxed">
          This is the beginning of your conversation. Send a message to start chatting!
        </p>

        {/* Animated divider line */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <div className="h-px flex-1 bg-slate-800" />
        </div>
      </div>

      {/* Suggestion buttons */}
      <div className="flex flex-wrap gap-3 justify-center animate-slide-up animation-delay-300">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className={`
              relative px-4 py-2 text-xs font-medium
              rounded-full transition-all duration-300 ease-out
              focus:outline-none focus:ring-2 focus:ring-amber-500/50
              overflow-hidden bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20
              text-amber-400
            `}
            style={{
              animation: `slideUp 0.5s ease-out ${500 + suggestion.delay}ms both`,
            }}
            title={`Send "${suggestion.emoji} ${suggestion.text}"`}
          >
            {/* Content */}
            <span className="relative flex items-center gap-2">
              <span className="inline-block transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-125">
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