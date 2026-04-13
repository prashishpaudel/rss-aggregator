export type Category = "Tech" | "Politics" | "Ideas" | "Science" | "Other";

export interface RSSSource {
  name: string;
  url: string;
  category: Category;
}

// Add or remove sources here
export const sources: RSSSource[] = [
  {
    name: "LessWrong Frontpage",
    url: "https://www.lesswrong.com/feed.xml?view=frontpage",
    category: "Ideas",
  },
  {
    name: "LessWrong Curated",
    url: "https://www.lesswrong.com/feed.xml?view=curated",
    category: "Ideas",
  },
  {
    name: "Hacker News",
    url: "https://news.ycombinator.com/rss",
    category: "Tech",
  },
  {
    name: "Juejin",
    url: "https://juejin.cn/rss",
    category: "Tech",
  },
  {
    name: "Escalation Trap",
    url: "https://escalationtrap.substack.com/feed",
    category: "Politics",
  },
];
