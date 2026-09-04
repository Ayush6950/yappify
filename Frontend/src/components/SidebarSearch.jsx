import { Search, XIcon } from "lucide-react";

/**
 * The single search field used by both sidebar tabs.
 *
 * Sticks to the top of the scrolling list so it stays reachable once the
 * list gets long.
 */
function SidebarSearch({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="sticky top-0 z-10 -mx-3 mb-2 bg-brand-surface-sidebar/80 px-3 pb-2 pt-3 backdrop-blur-xl">
      <div className="group relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/[0.08] bg-black/30 py-2.5 pl-10 pr-9 text-sm text-slate-100 placeholder-slate-500 transition-all duration-200 hover:border-white/[0.14] focus:border-indigo-400/60 focus:bg-black/45 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-200"
            title="Clear search"
          >
            <XIcon className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SidebarSearch;
