# Instagram Caption Copy Bot 📸

A high-performance, serverless Telegram Bot that automatically extracts captions, text, and hashtags from Instagram posts and reels. Built with [grammY](https://grammy.dev/), [Hono](https://hono.dev/), and deployed on [Cloudflare Workers](https://workers.cloudflare.com/) backed by a [Cloudflare D1](https://developers.cloudflare.com/d1/) database.

---

## ✨ Features

- **Automated Caption Extraction**: Send any Instagram post or reel link, and the bot returns the full caption, hashtags, and formatting cleanly in code blocks.
- **Required Channel Verification**: Ensures users join your official Telegram channel before using the bot.
- **Serverless Architecture**: Blazing fast responses and global edge deployment with zero server maintenance using Cloudflare Workers.
- **Built-in Analytics & Web Dashboard**: View user statistics, daily growth rates, and recent user signups directly via `/stats` (server-side rendered UI with Hono JSX) or via JSON at `/api/stats`.
- **Cloudflare D1 Persistence**: Lightweight SQL database storing user profiles and join timestamps.

---

## 🛠️ Tech Stack

- **Framework**: [Hono](https://hono.dev/) (Edge Web Framework)
- **Telegram Bot API**: [grammY](https://grammy.dev/)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless SQLite)
- **HTML Parser**: [Cheerio](https://cheerio.js.org/)
- **Deployment & CLI**: [Wrangler](https://developers.cloudflare.com/workers/wrangler/)
- **Linter & Formatter**: [Oxlint](https://oxc.rs/) & [Oxfmt](https://oxc.rs/)
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## 📁 Project Structure

```text
copy-instagram-captions-bot/
├── src/
│   ├── index.ts             # Main entry point (Hono app & /webhook handler)
│   ├── api/
│   │   ├── index.tsx        # Dashboard routes (/stats, /api/stats, /)
│   │   └── stats.tsx        # Hono JSX template for the analytics web dashboard
│   ├── bot/
│   │   ├── index.ts         # Telegram bot logic, command handlers, and channel check
│   │   └── services/
│   │       ├── api.ts       # Caption extraction HTTP client service
│   │       ├── dom.ts       # HTML parsing with Cheerio
│   │       └── validate.ts  # Link validation regex/helper
│   └── db/
│       └── user.ts          # D1 Database helper queries for user management & stats
├── dump.sql                 # Database backup / export file
├── run.sql                  # Initial database schema setup file
├── wrangler.jsonc           # Cloudflare Worker configuration & D1 bindings
├── package.json             # Dependencies and project scripts
└── tsconfig.json            # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (`npm i -g pnpm`)
- [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`pnpm install`)
- A Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/copy-instagram-captions-bot.git
   cd copy-instagram-captions-bot
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

---

## ⚙️ Environment Configuration

Environment variables and bindings are specified in [`wrangler.jsonc`](file:///C:/Users/GauravJatt/Desktop/my-projects/telegram-bots/copy-instagram-captions-bot/wrangler.jsonc).

| Variable / Binding | Description                                                                |
| :----------------- | :------------------------------------------------------------------------- |
| `BOT_TOKEN`        | Telegram Bot API Token obtained from @BotFather.                           |
| `BOT_INFO`         | JSON string containing Telegram bot metadata returned by `getMe`.          |
| `CHANNEL_ID`       | Telegram Channel handle (e.g. `@shutabots`) required for membership check. |
| `API_TOKEN`        | Access token for the caption extraction service.                           |
| `shuta`            | Cloudflare D1 database binding name.                                       |

---

## 🗄️ Database Setup

Create the Cloudflare D1 SQLite database and apply the initial schema.

1. **Create a D1 database**:

   ```bash
   pnpm wrangler d1 create shuta
   ```

   _(Update the `database_id` in [`wrangler.jsonc`](file:///C:/Users/GauravJatt/Desktop/my-projects/telegram-bots/copy-instagram-captions-bot/wrangler.jsonc) with the returned ID)._

2. **Initialize Local Database**:

   ```bash
   pnpm wrangler d1 execute shuta --local --file=run.sql
   ```

3. **Initialize Remote Database**:
   ```bash
   pnpm wrangler d1 execute shuta --remote --file=run.sql
   ```

---

## 💻 Development & Testing

Run the local development server with Wrangler:

```bash
pnpm dev
```

Generate Cloudflare Worker environment type definitions:

```bash
pnpm cf-typegen
```

Format & lint code:

```bash
pnpm format
pnpm lint
```

---

## 🌐 Webhook & Deployment

### 1. Deploy Worker to Cloudflare

Deploy the application to Cloudflare Workers:

```bash
pnpm deploy
```

### 2. Set Telegram Webhook

Configure your Telegram Bot webhook to point to your deployed Worker endpoint (`https://<your-worker>.<your-subdomain>.workers.dev/webhook`):

```bash
curl -F "url=https://<your-worker-url>/webhook" https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
```

---

## 📊 Analytics API & Web Dashboard

The application serves a web dashboard and REST endpoints:

- **`GET /`**: Returns JSON metadata about the Telegram bot.
- **`GET /stats`**: Interactive HTML dashboard displaying total users, today's joins, growth rate, and recent users.
- **`GET /api/stats`**: JSON endpoint returning raw analytics metrics.

---

## 📜 Available Scripts

| Script       | Command                                             | Description                                    |
| :----------- | :-------------------------------------------------- | :--------------------------------------------- |
| `dev`        | `wrangler dev`                                      | Starts local development server                |
| `deploy`     | `wrangler deploy --minify`                          | Deploys worker to Cloudflare with minification |
| `cf-typegen` | `wrangler types --env-interface CloudflareBindings` | Generates TypeScript definitions for bindings  |
| `format`     | `oxfmt`                                             | Formats code with Oxfmt                        |
| `lint`       | `oxlint`                                            | Lints code with Oxlint                         |
