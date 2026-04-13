export type Category = "Tech" | "Politics" | "Ideas" | "Science" | "Other";
export type Language = "EN" | "CN";

export interface RSSSource {
  name: string;
  url: string;
  category: Category;
  language: Language;
}

// Add or remove sources here
export const sources: RSSSource[] = [
  {
    name: "LessWrong Frontpage",
    url: "https://www.lesswrong.com/feed.xml?view=frontpage",
    category: "Ideas",
    language: "EN",
  },
  {
    name: "LessWrong Curated",
    url: "https://www.lesswrong.com/feed.xml?view=curated",
    category: "Ideas",
    language: "EN",
  },
  {
    name: "Hacker News",
    url: "https://news.ycombinator.com/rss",
    category: "Tech",
    language: "EN",
  },
  {
    name: "Paul Graham Essays",
    url: "https://www.aaronsw.com/2002/feeds/pgessays.rss",
    category: "Ideas",
    language: "EN",
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    category: "Tech",
    language: "EN",
  },
  {
    name: "MIT Technology Review",
    url: "https://www.technologyreview.com/feed/",
    category: "Science",
    language: "EN",
  },
  {
    name: "Juejin",
    url: "https://juejin.cn/rss",
    category: "Tech",
    language: "CN",
  },
  {
    name: "Escalation Trap",
    url: "https://escalationtrap.substack.com/feed",
    category: "Politics",
    language: "EN",
  },
];
