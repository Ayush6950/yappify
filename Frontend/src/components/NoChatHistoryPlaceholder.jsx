import { MessageCircleIcon } from "lucide-react";

const NoChatHistoryPlaceholder = ({ name }) => {
  const suggestions = [
    { emoji: "👋", text: "Say Hello", delay: 0 },
    { emoji: "🤝", text: "How are you?", delay: 100 },
    { emoji: "📅", text: "Meet up soon?", delay: 200 },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6 bg-transparent animate-fade-in">
      {/* Icon container with floating animation */}
      <div className="relative mb-6">
        {/* Icon background */}
        <div className="
          relative w-16 h-16 
          bg-indigo-500/10
          rounded-full flex items-center justify-center
          border-2 border-indigo-500/20
          shadow-sm
          animate-float
        ">
          <MessageCircleIcon className="size-8 text-indigo-400" />
        </div>
      </div>

      {/* Heading */}
      <h3 className="text-lg sm:text-xl font-semibold text-slate-200 mb-4 animate-slide-up">
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
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
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
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50
              overflow-hidden bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20
              text-indigo-400
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
      <div className="absolute top-20 left-10 w-2 h-2 bg-indigo-500/20 rounded-full animate-float animation-delay-500" />
      <div className="absolute bottom-32 right-12 w-1.5 h-1.5 bg-violet-500/20 rounded-full animate-float animation-delay-700" />
    </div>
  );
};

export default NoChatHistoryPlaceholder;