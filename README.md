# RSS Aggregator

Personal RSS news dashboard built with Next.js. Aggregates posts from multiple sources, organizes by category, and lets you read articles inline.

## Features

- Fetches multiple RSS feeds in parallel
- Category and language filters
- Inline article reader (full content when feed provides it)
- 10-minute server-side cache
- Dark mode
- Mobile responsive (slide-over drawer + full-screen reader)

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- `rss-parser`

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding RSS Sources

Edit `lib/sources.ts`:

```ts
{
  name: "My Source",
  url: "https://example.com/feed.xml",
  category: "Tech",   // Tech | Politics | Ideas | Science | Other
  language: "EN",     // EN | CN
}
```

## Deployment

Deploy to Vercel with zero config:

```bash
npx vercel
```

No environment variables required. Works on free plan.

## Project Structure

```
app/
  api/feed/route.ts   # API route — fetches, parses, caches feeds
  page.tsx            # Main UI
  globals.css         # Prose styles for article reader
lib/
  sources.ts          # RSS source definitions
  rss.ts              # Fetch + parse logic
```
