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
  Bookmark,
  Maximize2,
  Minimize2,
  Tv,
} from "lucide-react";
import type { FeedItem } from "@/lib/rss";
import { sources as allSources } from "@/lib/sources";
import { mediaItems, youtubeEmbedUrl, spotifyEmbedUrl, applePodcastEmbedUrl } from "@/lib/media";

type CategoryFilter = "All" | "Saved" | string;
type LangFilter = "All" | "EN" | "CN";

const FAVS_KEY = "rss-favorites";

function favKey(item: FeedItem) {
  return item.link || item.title;
}

function loadFavs(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(FAVS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveFavs(favs: Set<string>) {
  localStorage.setItem(FAVS_KEY, JSON.stringify(Array.from(favs)));
}

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
    case "Saved":    return <Bookmark {...props} />;
    default:         return <BookOpen {...props} />;
  }
}

// Map source name → domain for favicon lookup
const sourceDomainMap: Record<string, string> = Object.fromEntries(
  allSources.map((s) => [s.name, new URL(s.url).hostname.replace("www.", "")])
);

function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

function SourceFavicon({ domain, size = 16 }: { domain: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Globe size={size} strokeWidth={1.5} className="flex-shrink-0" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={faviconUrl(domain)}
      alt=""
      width={size}
      height={size}
      className="flex-shrink-0 rounded-sm"
      onError={() => setFailed(true)}
    />
  );
}

function MediaPanel() {
  const [expandedVideos, setExpandedVideos] = useState<Set<number>>(new Set());
  const videos = mediaItems.filter((m) => m.type === "youtube");
  const podcasts = mediaItems.filter((m) => m.type === "spotify" || m.type === "apple-podcast");

  function toggleVideo(i: number) {
    setExpandedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {videos.length > 0 && (
        <section className="border-b border-[#e8e8e4] dark:border-[#222220]">
          <p className="text-[10px] font-medium tracking-widest uppercase text-[#bbb] dark:text-[#444] px-4 md:px-6 pt-5 pb-3">
            YouTube
          </p>
          <div className="divide-y divide-[#ebebea] dark:divide-[#1c1c1b]">
            {videos.map((item, i) => {
              const expanded = expandedVideos.has(i);
              return (
                <div key={i} className="px-4 md:px-6 pt-8 pb-4">
                  {item.title && <p className="text-[0.88rem] text-[#666] dark:text-[#777] mb-2">{item.title}</p>}
                  <div className={`relative aspect-video rounded-lg overflow-visible ${
                    expanded ? "w-full" : "w-full md:w-[32rem]"
                  }`}>
                    <button
                      onClick={() => toggleVideo(i)}
                      className="absolute -top-5 -right-5 hidden md:block text-[#bbb] dark:text-[#444] hover:text-[#555] dark:hover:text-[#aaa] transition-colors"
                      aria-label={expanded ? "Shrink video" : "Expand video"}
                    >
                      {expanded
                        ? <Minimize2 size={20} strokeWidth={1.5} />
                        : <Maximize2 size={20} strokeWidth={1.5} />
                      }
                    </button>
                    <div className="w-full h-full rounded-lg overflow-hidden bg-[#e8e8e4] dark:bg-[#1c1c1b]">
                      <iframe
                        src={youtubeEmbedUrl(item.url)}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {podcasts.length > 0 && (
        <section>
          <p className="text-[10px] font-medium tracking-widest uppercase text-[#bbb] dark:text-[#444] px-4 md:px-6 pt-5 pb-3">
            Podcasts
          </p>
          <div className="divide-y divide-[#ebebea] dark:divide-[#1c1c1b]">
            {podcasts.map((item, i) => (
              <div key={i} className="px-4 md:px-6 py-4">
                {item.title && <p className="text-[0.88rem] text-[#666] dark:text-[#777] mb-2">{item.title}</p>}
                {item.type === "apple-podcast" ? (
                  <iframe
                    src={applePodcastEmbedUrl(item.url)}
                    className="w-full rounded-lg"
                    height="175"
                    sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
                    allow="autoplay *; encrypted-media *; clipboard-write"
                  />
                ) : (
                  <iframe
                    src={spotifyEmbedUrl(item.url)}
                    className="w-full rounded-lg"
                    height="152"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {mediaItems.length === 0 && (
        <p className="text-sm text-[#bbb] dark:text-[#444] text-center mt-20">
          No media yet. Add items to <code className="text-[#999] dark:text-[#555]">lib/media.ts</code>.
        </p>
      )}
    </div>
  );
}

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
  favCount,
  mediaMode,
  search,
  onSelect,
}: {
  categories: string[];
  sources: string[];
  categoryFilter: CategoryFilter;
  setCategoryFilter: (c: string) => void;
  search: string;
  setSearch: (s: string) => void;
  darkMode: boolean;
  setDarkMode: (fn: (d: boolean) => boolean) => void;
  loading: boolean;
  fetchFeed: () => void;
  favCount: number;
  mediaMode: boolean;
  onSelect: (val?: string) => void;
}) {
  return (
    <>
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">

        {/* Saved */}
        <div>
          <p className="text-[10px] font-medium tracking-widest uppercase text-[#bbb] dark:text-[#444] mb-2 px-1">
            Library
          </p>
          <button
            onClick={() => { setCategoryFilter("Saved"); setSearch(""); onSelect(); } }
            className={`w-full flex items-center justify-between px-2 py-2 rounded-md text-[0.92rem] text-left transition-colors duration-100 ${
              categoryFilter === "Saved"
                ? "bg-[#e4e4e0] dark:bg-[#222220] text-[#1a1a1a] dark:text-[#e2e2de]"
                : "text-[#888] dark:text-[#555] hover:bg-[#eaeae6] dark:hover:bg-[#1c1c1b] hover:text-[#444] dark:hover:text-[#aaa]"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Bookmark size={17} strokeWidth={1.5} />
              Saved
            </span>
            {favCount > 0 && (
              <span className="text-[10px] tabular-nums text-[#bbb] dark:text-[#444]">{favCount}</span>
            )}
          </button>
        </div>

        {/* Categories */}
        <div>
          <p className="text-[10px] font-medium tracking-widest uppercase text-[#bbb] dark:text-[#444] mb-2 px-1">
            Category
          </p>
          <div className="space-y-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategoryFilter(cat); setSearch(""); onSelect(); }}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-[0.92rem] text-left transition-colors duration-100 ${
                  categoryFilter === cat
                    ? "bg-[#e4e4e0] dark:bg-[#222220] text-[#1a1a1a] dark:text-[#e2e2de]"
                    : "text-[#888] dark:text-[#555] hover:bg-[#eaeae6] dark:hover:bg-[#1c1c1b] hover:text-[#444] dark:hover:text-[#aaa]"
                }`}
              >
                <CategoryIcon category={cat} size={17} />
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Media */}
        <div>
          <p className="text-[10px] font-medium tracking-widest uppercase text-[#bbb] dark:text-[#444] mb-2 px-1">
            Media
          </p>
          <button
            onClick={() => { onSelect("__media__"); }}
            className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-[0.92rem] text-left transition-colors duration-100 ${
              mediaMode
                ? "bg-[#e4e4e0] dark:bg-[#222220] text-[#1a1a1a] dark:text-[#e2e2de]"
                : "text-[#888] dark:text-[#555] hover:bg-[#eaeae6] dark:hover:bg-[#1c1c1b] hover:text-[#444] dark:hover:text-[#aaa]"
            }`}
          >
            <Tv size={17} strokeWidth={1.5} />
            <span>Media</span>
          </button>
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
                onClick={() => { setCategoryFilter("All"); setSearch(src); onSelect(); }}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-[0.92rem] text-left transition-colors duration-100 ${
                  search === src && categoryFilter === "All"
                    ? "bg-[#e4e4e0] dark:bg-[#222220] text-[#1a1a1a] dark:text-[#e2e2de]"
                    : "text-[#888] dark:text-[#555] hover:bg-[#eaeae6] dark:hover:bg-[#1c1c1b] hover:text-[#444] dark:hover:text-[#aaa]"
                }`}
              >
                <SourceFavicon domain={sourceDomainMap[src] ?? src} size={17} />
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
  const [langFilter, setLangFilter] = useState<LangFilter>("All");
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [selected, setSelected] = useState<FeedItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [fetchedContent, setFetchedContent] = useState<string | null>(null);
  const [fetchingArticle, setFetchingArticle] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [mediaMode, setMediaMode] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => { setFavs(loadFavs()); }, []);

  const toggleFav = useCallback((item: FeedItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavs((prev) => {
      const next = new Set(prev);
      const key = favKey(item);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      saveFavs(next);
      return next;
    });
  }, []);

  const fetchArticle = useCallback(async (url: string) => {
    setFetchingArticle(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/article?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setFetchedContent(json.content);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to fetch article");
    } finally {
      setFetchingArticle(false);
    }
  }, []);

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

  // Reset expanded + fetched content when article changes or closes
  useEffect(() => {
    setExpanded(false);
    setFetchedContent(null);
    setFetchError(null);
    setFetchingArticle(false);
  }, [selected]);

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category))).sort()];
  const sources = Array.from(new Set(items.map((i) => i.source))).sort();

  // CN sources — detected by domain (juejin.cn)
  const cnDomains = new Set(["juejin.cn"]);

  const filtered = items.filter((item) => {
    if (categoryFilter === "Saved") return favs.has(favKey(item));
    const isCN = cnDomains.has(item.sourceDomain);
    if (langFilter === "EN" && isCN) return false;
    if (langFilter === "CN" && !isCN) return false;
    // "All" — no language filtering
    if (categoryFilter !== "All" && item.category !== categoryFilter) return false;
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

  function handleSidebarSelect(val?: string) {
    if (val === "__media__") {
      setMediaMode(true);
      setSelected(null);
    } else {
      setMediaMode(false);
      setSelected(null);
    }
  }

  const sidebarProps = {
    categories,
    sources,
    categoryFilter,
    setCategoryFilter,
    search,
    setSearch,
    darkMode,
    setDarkMode,
    loading,
    fetchFeed,
    favCount: favs.size,
    mediaMode,
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
            <Menu size={24} strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-2 text-[#888] dark:text-[#555]">
            <Rss size={18} strokeWidth={1.5} />
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
            <div
              className="absolute inset-0 bg-black/30 dark:bg-black/50"
              onClick={() => setDrawerOpen(false)}
            />
            <aside className="relative flex flex-col w-72 max-w-[85vw] h-full bg-[#f0f0ec] dark:bg-[#141413] border-r border-[#e8e8e4] dark:border-[#222220] shadow-xl">
              <div className="flex items-center justify-between px-4 py-4 border-b border-[#e8e8e4] dark:border-[#222220]">
                <div className="flex items-center gap-2 text-[#888] dark:text-[#555]">
                  <Rss size={18} strokeWidth={1.5} />
                  <span className="text-sm font-medium tracking-widest uppercase">Feed</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-[#aaa] dark:text-[#444] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              <SidebarContent {...sidebarProps} onSelect={(val) => { handleSidebarSelect(val); setDrawerOpen(false); }} />
            </aside>
          </div>
        )}

        {/* ── Desktop sidebar ── */}
        <aside
          className={`hidden md:flex flex-shrink-0 flex-col border-r border-[#e8e8e4] dark:border-[#222220] bg-[#f0f0ec] dark:bg-[#141413] transition-all duration-200 ${
            sidebarOpen ? "w-52" : "w-12"
          }`}
        >
          <div className="flex items-center justify-between px-3 py-4 border-b border-[#e8e8e4] dark:border-[#222220]">
            {sidebarOpen && (
              <div className="flex items-center gap-2 text-[#888] dark:text-[#555]">
                <Rss size={18} strokeWidth={1.5} />
                <span className="text-sm font-medium tracking-widest uppercase">Feed</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="text-[#aaa] dark:text-[#444] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors ml-auto"
            >
              <ChevronRight
                size={18}
                strokeWidth={1.5}
                className={`transition-transform duration-200 ${sidebarOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {sidebarOpen && <SidebarContent {...sidebarProps} onSelect={handleSidebarSelect} />}

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

        {/* ── Feed list / Media panel ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">{mediaMode ? <MediaPanel /> : (<>
          {/* Toolbar */}
          <div className="flex-shrink-0 flex items-center gap-3 px-4 md:px-5 py-4 border-b border-[#e8e8e4] dark:border-[#222220] bg-[#f7f7f5] dark:bg-[#0f0f0e]">
            {/* EN / CN toggle */}
            <div className="flex gap-1.5">
              {(["All", "EN", "CN"] as LangFilter[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLangFilter(lang)}
                  className={`text-xs tracking-widest uppercase px-3 py-1.5 rounded transition-colors duration-100 ${
                    langFilter === lang
                      ? "bg-[#e4e4e0] dark:bg-[#222220] text-[#1a1a1a] dark:text-[#e2e2de]"
                      : "text-[#bbb] dark:text-[#444] hover:text-[#666] dark:hover:text-[#888]"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2 text-[#aaa] dark:text-[#444] border-b border-[#ddd] dark:border-[#2a2a28] pb-0.5">
              <Search size={15} strokeWidth={1.5} />
              <input
                type="text"
                placeholder="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-[0.9rem] bg-transparent outline-none text-[#1a1a1a] dark:text-[#e2e2de] placeholder:text-[#ccc] dark:placeholder:text-[#333] w-28 md:w-36"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={14} strokeWidth={1.5} />
                </button>
              )}
            </div>

            {cachedAt && (
              <span className="text-[11px] text-[#ccc] dark:text-[#333] tabular-nums hidden lg:block">
                {formatDate(cachedAt)}
              </span>
            )}
          </div>

          {/* Translate banner — shown when CN is active */}
          {langFilter === "CN" && (
            <div className="flex-shrink-0 flex items-center justify-between px-4 md:px-5 py-2 bg-[#f0f0ec] dark:bg-[#141413] border-b border-[#e8e8e4] dark:border-[#222220]">
              <span className="text-xs text-[#888] dark:text-[#555]">Showing Chinese sources</span>
              <a
                href={`https://translate.google.com/translate?sl=zh-CN&tl=en&u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center gap-1.5 text-[#888] dark:text-[#555] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors border-b border-[#ddd] dark:border-[#333] pb-0.5"
              >
                <Globe size={12} strokeWidth={1.5} />
                Translate page
              </a>
            </div>
          )}

          {/* Feed items */}
          <div className="flex-1 overflow-y-auto">
            {error && <p className="px-5 py-4 text-sm text-red-400">{error}</p>}
            {loading && items.length === 0 && (
              <p className="px-5 py-20 text-sm text-[#bbb] dark:text-[#444] text-center">Loading…</p>
            )}
            {!loading && filtered.length === 0 && (
              <p className="px-5 py-20 text-sm text-[#bbb] dark:text-[#444] text-center">
                {categoryFilter === "Saved" ? "No saved articles yet." : "Nothing here."}
              </p>
            )}

            <div className="divide-y divide-[#ebebea] dark:divide-[#1c1c1b]">
              {filtered.map((item, idx) => {
                const isFav = favs.has(favKey(item));
                return (
                  <div
                    key={`${item.link}-${idx}`}
                    className={`relative group flex items-start gap-2 px-4 md:px-5 py-4 hover:bg-[#f0f0ec] dark:hover:bg-[#141413] transition-colors duration-100 ${
                      selected?.link === item.link && selected?.title === item.title
                        ? "bg-[#ebebea] dark:bg-[#1a1a18]"
                        : ""
                    }`}
                  >
                    {/* Main clickable area */}
                    <button
                      className="flex-1 text-left min-w-0"
                      onClick={() => setSelected(item)}
                    >
                      <p className="text-xs text-[#aaa] dark:text-[#444] mb-1.5 flex items-center gap-1.5 flex-wrap">
                        <SourceFavicon domain={item.sourceDomain} size={13} />
                        <span>{item.source}</span>
                        <span>·</span>
                        <span>{formatDate(item.date)}</span>
                        {item.fullContent && (
                          <>
                            <span>·</span>
                            <BookOpen size={11} strokeWidth={1.5} className="text-[#bbb] dark:text-[#3a3a38]" />
                          </>
                        )}
                      </p>
                      <div className={`flex items-start gap-3 ${item.image ? "justify-between" : ""}`}>
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-[1.05rem] font-normal leading-snug text-[#1a1a1a] dark:text-[#e2e2de] group-hover:text-[#444] dark:group-hover:text-[#aaa] transition-colors">
                            {item.title}
                          </p>
                          {item.summary && (
                            <p className="mt-1.5 text-[0.82rem] text-[#999] dark:text-[#4a4a48] leading-relaxed line-clamp-2">
                              {item.summary}
                            </p>
                          )}
                        </div>
                        {item.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt=""
                            className="flex-shrink-0 w-20 h-14 object-cover rounded-md bg-[#e8e8e4] dark:bg-[#222220]"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                        )}
                      </div>
                    </button>

                    {/* Bookmark button */}
                    <button
                      onClick={(e) => toggleFav(item, e)}
                      className={`flex-shrink-0 mt-0.5 p-1 rounded transition-colors duration-100 ${
                        isFav
                          ? "text-[#888] dark:text-[#666]"
                          : "text-transparent group-hover:text-[#ccc] dark:group-hover:text-[#333]"
                      } hover:text-[#555] dark:hover:text-[#aaa]`}
                      aria-label={isFav ? "Remove from saved" : "Save article"}
                    >
                      <Bookmark
                        size={14}
                        strokeWidth={1.5}
                        fill={isFav ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            {filtered.length > 0 && (
              <p className="text-[11px] text-[#ccc] dark:text-[#2a2a28] text-center py-4 tabular-nums">
                {filtered.length} posts
              </p>
            )}
          </div>
        </>)}</div>

        {/* ── Article reader panel ── */}
        {selected && (
          <div className={
            expanded
              // Desktop expanded: centered overlay
              ? "fixed inset-0 z-40 flex flex-col overflow-hidden bg-[#fafaf8] dark:bg-[#0d0d0c]"
              // Mobile: full screen. Desktop: side panel
              : "fixed inset-0 z-40 md:static md:inset-auto md:z-auto md:flex-shrink-0 md:w-[520px] flex flex-col overflow-hidden border-l border-[#e8e8e4] dark:border-[#222220] bg-[#fafaf8] dark:bg-[#0d0d0c]"
          }>
            {/* Reader header */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-4 border-b border-[#e8e8e4] dark:border-[#222220]">
              <button
                onClick={() => setSelected(null)}
                className="md:hidden text-[#aaa] dark:text-[#444] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors mr-3"
                aria-label="Back to feed"
              >
                <ArrowLeft size={24} strokeWidth={1.5} />
              </button>
              <p className="text-sm text-[#aaa] dark:text-[#444] truncate flex-1 mr-3 flex items-center gap-2">
                <SourceFavicon domain={selected.sourceDomain} size={15} />
                {selected.source} · {formatDate(selected.date)}
              </p>
              <div className="flex items-center gap-4 flex-shrink-0">
                {/* Expand/collapse — desktop only */}
                <button
                  onClick={() => setExpanded((e) => !e)}
                  className="hidden md:block text-[#aaa] dark:text-[#444] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors"
                  aria-label={expanded ? "Collapse reader" : "Expand reader"}
                >
                  {expanded
                    ? <Minimize2 size={22} strokeWidth={1.5} />
                    : <Maximize2 size={22} strokeWidth={1.5} />
                  }
                </button>
                {/* Read in app / toggle */}
                <button
                  onClick={() => {
                    if (fetchedContent) {
                      setFetchedContent(null);
                      setFetchError(null);
                    } else {
                      fetchArticle(selected.link);
                    }
                  }}
                  disabled={fetchingArticle}
                  className={`transition-colors duration-100 disabled:opacity-30 ${
                    fetchedContent
                      ? "text-[#555] dark:text-[#aaa]"
                      : "text-[#ccc] dark:text-[#333] hover:text-[#555] dark:hover:text-[#aaa]"
                  }`}
                  aria-label={fetchedContent ? "Back to feed content" : "Read in app"}
                  title={fetchedContent ? "Back to feed content" : "Read in app"}
                >
                  <BookOpen size={22} strokeWidth={1.5} className={fetchingArticle ? "animate-pulse" : ""} />
                </button>
                {/* Bookmark in reader */}
                <button
                  onClick={(e) => toggleFav(selected, e)}
                  className={`transition-colors duration-100 ${
                    favs.has(favKey(selected))
                      ? "text-[#888] dark:text-[#666]"
                      : "text-[#ccc] dark:text-[#333] hover:text-[#555] dark:hover:text-[#aaa]"
                  }`}
                  aria-label={favs.has(favKey(selected)) ? "Remove from saved" : "Save article"}
                >
                  <Bookmark
                    size={22}
                    strokeWidth={1.5}
                    fill={favs.has(favKey(selected)) ? "currentColor" : "none"}
                  />
                </button>
                <a
                  href={selected.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#aaa] dark:text-[#444] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors"
                  title="Open original"
                >
                  <ExternalLink size={22} strokeWidth={1.5} />
                </a>
                <button
                  onClick={() => setSelected(null)}
                  className="hidden md:block text-[#aaa] dark:text-[#444] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors"
                  aria-label="Close reader"
                >
                  <X size={22} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Reader content */}
            <div className={`flex-1 overflow-y-auto py-8 md:py-10 ${
              expanded
                ? "px-5 md:px-0"
                : "px-5 md:px-10"
            }`}>
            <div className={expanded ? "max-w-[680px] mx-auto px-6" : ""}>
              <h1 className="font-display text-2xl md:text-3xl font-normal leading-tight text-[#1a1a1a] dark:text-[#e2e2de] mb-6 md:mb-8">
                {selected.title}
              </h1>

              {/* Priority: fetched > fullContent > fallback */}
              {fetchedContent ? (
                <div
                  className="prose-reader"
                  dangerouslySetInnerHTML={{ __html: fetchedContent }}
                />
              ) : selected.fullContent ? (
                <div
                  className="prose-reader"
                  dangerouslySetInnerHTML={{ __html: selected.fullContent }}
                />
              ) : (
                <div>
                  {selected.summary && (
                    <p className="text-sm text-[#666] dark:text-[#777] leading-relaxed mb-6">
                      {selected.summary}
                    </p>
                  )}

                  {fetchingArticle && (
                    <p className="text-sm text-[#bbb] dark:text-[#444]">Fetching article…</p>
                  )}

                  {fetchError && (
                    <p className="text-sm text-red-400">{fetchError}</p>
                  )}

                  {!fetchingArticle && !fetchError && (
                    <p className="text-sm text-[#bbb] dark:text-[#444]">
                      Use the <BookOpen size={13} strokeWidth={1.5} className="inline-block mx-0.5 align-text-bottom" /> icon above to read in app.
                    </p>
                  )}

                  <a
                    href={selected.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-6 text-sm text-[#aaa] dark:text-[#555] hover:text-[#1a1a1a] dark:hover:text-[#e2e2de] transition-colors border-b border-[#ddd] dark:border-[#333] pb-0.5"
                  >
                    Open original
                    <ExternalLink size={12} strokeWidth={1.5} />
                  </a>
                </div>
              )}
            </div>{/* end centering div */}
            </div>{/* end scroll div */}
          </div>
        )}
      </div>
    </div>
  );
}
