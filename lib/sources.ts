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
  {
    name: "ByteByteGo",
    url: "https://blog.bytebytego.com/feed",
    category: "Tech",
  },
  {
    name: "Latent Space",
    url: "https://www.latent.space/feed",
    category: "Tech",
  },
  {
    name: "Mikhail Shilkov",
    url: "https://mikhail.io/feed/",
    category: "Tech",
  },
  {
    name: "Jay Alammar",
    url: "https://newsletter.languagemodels.co/feed",
    category: "Tech",
  },
  {
    name: "Ahead of AI",
    url: "https://magazine.sebastianraschka.com/feed",
    category: "Tech",
  },
  {
    name: "The Pragmatic Engineer",
    url: "https://newsletter.pragmaticengineer.com/feed",
    category: "Tech",
  },
  {
    name: "Daily Dose of Data Science",
    url: "https://blog.dailydoseofds.com/feed",
    category: "Tech",
  },
];
