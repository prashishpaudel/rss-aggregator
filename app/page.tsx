"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Rss,
  RefreshCw,
  Sun,
  Moon,
  Search,
  X,
  ExternalLink,
  ChevronRight,
  Globe,
  Cpu,
  Lightbulb,
  FlaskConical,
  BarChart2,
  BookOpen,
  Layers,
  Menu,
  ArrowLeft,
} from "lucide-react";
import type { FeedItem } from "@/lib/rss";

type CategoryFilter = "All" | string;
type LanguageFilter = "All" | "EN" | "CN";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CategoryIcon({ category, size = 16 }: { category: string; size?: number }) {
  const props = { size, strokeWidth: 1.5 };
  switch (category) {
    case "Tech":     return <Cpu {...props} />;
    case "Ideas":    return <Lightbulb {...props} />;
    case "Politics": return <BarChart2 {...props} />;
    case "Science":  return <FlaskConical {...props} />;
    case "All":      return <Layers {...props} />;
    default:         return <BookOpen {...props} />;
  }
}

// Sidebar content — shared between desktop rail and mobile drawer
function SidebarContent({
  categories,
  sources,
  categoryFilter,
  setCategoryFilter,
  setSearch,
  darkMode,
  setDarkMode,
  loading,
  fetchFeed,
  onSelect,
}: {
  categories: string[];
  sources: string[];
  categoryFilter: CategoryFilter;
  setCategoryFilter: (c: string) => void;
  setSearch: (s: string) => void;
  darkMode: boolean;
  setDarkMode: (fn: (d: boolean) => boolean) => void;
  loading: boolean;
  fetchFeed: () => void;
  onSelect: () => void; // close drawer on mobile after picking
}) {
  return (
    <>
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {/* Categories */}
        <div>
          <p className="text-[10px] font-medium tracking-widest uppercase text-[#bbb] dark:text-[#444] mb-2 px-1">
            Category
          </p>
          <div className="space-y-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategoryFilter(cat); onSelect(); }}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-[0.85rem] text-left transition-colors duration-100 ${
                  categoryFilter === cat
                    ? "bg-[#e4e4e0] dark:bg-[#222220] text-[#1a1a1a] dark:text-[#e2e2de]"
                    : "text-[#888] dark:text-[#555] hover:bg-[#eaeae6] dark:hover:bg-[#1c1c1b] hover:text-[#444] dark:hover:text-[#aaa]"
                }`}
              >
                <CategoryIcon category={cat} size={15} />
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div>
          <p className="text-[10px] font-medium tracking-widest uppercase text-[#bbb] dark:text-[#444] mb-2 px-1">
            Sources
          </p>
          <div className="space-y-0.5">
            {sources.map((src) => (
              <button
                key={src}
                onClick={() => { setSearch(src); onSelect(); }}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-[0.85rem] text-left text-[#888] dark:text-[#555] hover:bg-[#eaeae6] dark:hover:bg-[#1c1c1b] hover:text-[#444] dark:hover:text-[#aaa] transition-colors duration-100"
              >
                <Globe size={15} strokeWidth={1.5} className="flex-shrink-0" />
                <span className="truncate">{src}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#e8e8e4] dark:border-[#222220] p-3 flex justify-between items-center">
        <button
          onClick={() => setDarkMode((d) => !d)}
          className="text-[#aaa] dark:text-[#444] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
        </button>
        <button
          onClick={fetchFeed}
          disabled={loading}
          className="text-[#aaa] dark:text-[#444] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] disabled:opacity-30 transition-colors"
          aria-label="Refresh feeds"
        >
          <RefreshCw size={16} strokeWidth={1.5} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
    </>
  );
}

export default function Home() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [langFilter, setLangFilter] = useState<LanguageFilter>("All");
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [selected, setSelected] = useState<FeedItem | null>(null);
  // Desktop: collapsible rail. Mobile: ignored (use drawerOpen instead)
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Mobile-only drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feed");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setItems(json.items);
      setCachedAt(json.cachedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSelected(null); setDrawerOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category))).sort()];
  const sources = Array.from(new Set(items.map((i) => i.source))).sort();

  const filtered = items.filter((item) => {
    if (categoryFilter !== "All" && item.category !== categoryFilter) return false;
    if (langFilter !== "All" && item.language !== langFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sidebarProps = {
    categories,
    sources,
    categoryFilter,
    setCategoryFilter,
    setSearch,
    darkMode,
    setDarkMode,
    loading,
    fetchFeed,
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex flex-col md:flex-row h-[100dvh] overflow-hidden bg-[#f7f7f5] dark:bg-[#0f0f0e] text-[#1a1a1a] dark:text-[#e2e2de] transition-colors duration-200">

        {/* ── Mobile top bar ── */}
        <header className="md:hidden flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#e8e8e4] dark:border-[#222220] bg-[#f0f0ec] dark:bg-[#141413]">
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-[#888] dark:text-[#555] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-2 text-[#888] dark:text-[#555]">
            <Rss size={16} strokeWidth={1.5} />
            <span className="text-sm font-medium tracking-widest uppercase">Feed</span>
          </div>
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="text-[#aaa] dark:text-[#444] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
          </button>
        </header>

        {/* ── Mobile drawer overlay ── */}
        {drawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30 dark:bg-black/50"
              onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer panel */}
            <aside className="relative flex flex-col w-72 max-w-[85vw] h-full bg-[#f0f0ec] dark:bg-[#141413] border-r border-[#e8e8e4] dark:border-[#222220] shadow-xl">
              <div className="flex items-center justify-between px-4 py-4 border-b border-[#e8e8e4] dark:border-[#222220]">
                <div className="flex items-center gap-2 text-[#888] dark:text-[#555]">
                  <Rss size={16} strokeWidth={1.5} />
                  <span className="text-sm font-medium tracking-widest uppercase">Feed</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-[#aaa] dark:text-[#444] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              <SidebarContent {...sidebarProps} onSelect={() => setDrawerOpen(false)} />
            </aside>
          </div>
        )}

        {/* ── Desktop sidebar ── */}
        <aside
          className={`hidden md:flex flex-shrink-0 flex-col border-r border-[#e8e8e4] dark:border-[#222220] bg-[#f0f0ec] dark:bg-[#141413] transition-all duration-200 ${
            sidebarOpen ? "w-52" : "w-12"
          }`}
        >
          {/* Desktop sidebar header */}
          <div className="flex items-center justify-between px-3 py-4 border-b border-[#e8e8e4] dark:border-[#222220]">
            {sidebarOpen && (
              <div className="flex items-center gap-2 text-[#888] dark:text-[#555]">
                <Rss size={16} strokeWidth={1.5} />
                <span className="text-sm font-medium tracking-widest uppercase">Feed</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="text-[#aaa] dark:text-[#444] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors ml-auto"
            >
              <ChevronRight
                size={16}
                strokeWidth={1.5}
                className={`transition-transform duration-200 ${sidebarOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {sidebarOpen && (
            <SidebarContent {...sidebarProps} onSelect={() => {}} />
          )}

          {/* Collapsed sidebar footer */}
          {!sidebarOpen && (
            <div className="mt-auto border-t border-[#e8e8e4] dark:border-[#222220] p-3 flex flex-col items-center gap-3">
              <button
                onClick={() => setDarkMode((d) => !d)}
                className="text-[#aaa] dark:text-[#444] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
              </button>
              <button
                onClick={fetchFeed}
                disabled={loading}
                className="text-[#aaa] dark:text-[#444] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] disabled:opacity-30 transition-colors"
                aria-label="Refresh feeds"
              >
                <RefreshCw size={16} strokeWidth={1.5} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          )}
        </aside>

        {/* ── Feed list ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Toolbar */}
          <div className="flex-shrink-0 flex items-center gap-3 px-4 md:px-5 py-3 border-b border-[#e8e8e4] dark:border-[#222220] bg-[#f7f7f5] dark:bg-[#0f0f0e]">
            {/* Language pills */}
            <div className="flex gap-1">
              {(["All", "EN", "CN"] as LanguageFilter[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLangFilter(lang)}
                  className={`text-[11px] tracking-widest uppercase px-2.5 py-1 rounded transition-colors duration-100 ${
                    langFilter === lang
                      ? "bg-[#e4e4e0] dark:bg-[#222220] text-[#1a1a1a] dark:text-[#e2e2de]"
                      : "text-[#bbb] dark:text-[#444] hover:text-[#666] dark:hover:text-[#888]"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="ml-auto flex items-center gap-2 text-[#aaa] dark:text-[#444] border-b border-[#ddd] dark:border-[#2a2a28] pb-0.5">
              <Search size={14} strokeWidth={1.5} />
              <input
                type="text"
                placeholder="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm bg-transparent outline-none text-[#1a1a1a] dark:text-[#e2e2de] placeholder:text-[#ccc] dark:placeholder:text-[#333] w-28 md:w-36"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={13} strokeWidth={1.5} />
                </button>
              )}
            </div>

            {cachedAt && (
              <span className="text-[11px] text-[#ccc] dark:text-[#333] tabular-nums hidden lg:block">
                {formatDate(cachedAt)}
              </span>
            )}
          </div>

          {/* Feed items */}
          <div className="flex-1 overflow-y-auto">
            {error && <p className="px-5 py-4 text-sm text-red-400">{error}</p>}
            {loading && items.length === 0 && (
              <p className="px-5 py-20 text-sm text-[#bbb] dark:text-[#444] text-center">Loading…</p>
            )}
            {!loading && filtered.length === 0 && (
              <p className="px-5 py-20 text-sm text-[#bbb] dark:text-[#444] text-center">Nothing here.</p>
            )}

            <div className="divide-y divide-[#ebebea] dark:divide-[#1c1c1b]">
              {filtered.map((item, idx) => (
                <button
                  key={`${item.link}-${idx}`}
                  onClick={() => setSelected(item)}
                  className={`w-full text-left px-4 md:px-5 py-4 hover:bg-[#f0f0ec] dark:hover:bg-[#141413] transition-colors duration-100 group ${
                    selected?.link === item.link && selected?.title === item.title
                      ? "bg-[#ebebea] dark:bg-[#1a1a18]"
                      : ""
                  }`}
                >
                  <p className="text-xs text-[#aaa] dark:text-[#444] mb-1.5 flex items-center gap-1.5 flex-wrap">
                    <span>{item.source}</span>
                    <span>·</span>
                    <span>{item.category}</span>
                    <span>·</span>
                    <span>{formatDate(item.date)}</span>
                    {item.fullContent && (
                      <>
                        <span>·</span>
                        <BookOpen size={11} strokeWidth={1.5} className="text-[#bbb] dark:text-[#3a3a38]" />
                      </>
                    )}
                  </p>
                  <p className="text-[1rem] font-medium leading-snug text-[#1a1a1a] dark:text-[#e2e2de] group-hover:text-[#444] dark:group-hover:text-[#aaa] transition-colors">
                    {item.title}
                  </p>
                  {item.summary && (
                    <p className="mt-1.5 text-[0.82rem] text-[#999] dark:text-[#4a4a48] leading-relaxed line-clamp-2">
                      {item.summary}
                    </p>
                  )}
                </button>
              ))}
            </div>

            {filtered.length > 0 && (
              <p className="text-[11px] text-[#ccc] dark:text-[#2a2a28] text-center py-4 tabular-nums">
                {filtered.length} posts
              </p>
            )}
          </div>
        </div>

        {/* ── Article reader panel ── */}
        {selected && (
          <div className="
            fixed inset-0 z-40
            md:static md:inset-auto md:z-auto
            md:flex-shrink-0 md:w-[520px]
            flex flex-col overflow-hidden
            border-l border-[#e8e8e4] dark:border-[#222220]
            bg-[#fafaf8] dark:bg-[#0d0d0c]
          ">
            {/* Reader header */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-3 border-b border-[#e8e8e4] dark:border-[#222220]">
              {/* Mobile: back arrow. Desktop: meta text */}
              <button
                onClick={() => setSelected(null)}
                className="md:hidden text-[#aaa] dark:text-[#444] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors mr-3"
                aria-label="Back to feed"
              >
                <ArrowLeft size={18} strokeWidth={1.5} />
              </button>
              <p className="text-[11px] text-[#aaa] dark:text-[#444] truncate flex-1 mr-3">
                {selected.source} · {selected.category} · {formatDate(selected.date)}
              </p>
              <div className="flex items-center gap-3 flex-shrink-0">
                <a
                  href={selected.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#aaa] dark:text-[#444] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors"
                  title="Open original"
                >
                  <ExternalLink size={15} strokeWidth={1.5} />
                </a>
                <button
                  onClick={() => setSelected(null)}
                  className="hidden md:block text-[#aaa] dark:text-[#444] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors"
                  aria-label="Close reader"
                >
                  <X size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Reader content */}
            <div className="flex-1 overflow-y-auto px-5 md:px-10 py-8 md:py-10">
              <h1 className="text-xl md:text-2xl font-semibold leading-tight text-[#1a1a1a] dark:text-[#e2e2de] mb-6 md:mb-8">
                {selected.title}
              </h1>

              {selected.fullContent ? (
                <div
                  className="prose-reader"
                  dangerouslySetInnerHTML={{ __html: selected.fullContent }}
                />
              ) : (
                <div>
                  <p className="text-sm text-[#666] dark:text-[#777] leading-relaxed">
                    {selected.summary}
                  </p>
                  <a
                    href={selected.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-6 text-sm text-[#aaa] dark:text-[#555] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors border-b border-[#ddd] dark:border-[#333] pb-0.5"
                  >
                    Read full article
                    <ExternalLink size={12} strokeWidth={1.5} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
