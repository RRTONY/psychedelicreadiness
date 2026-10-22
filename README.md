# psychedelicreadiness.com

The Psychedelic Readiness Index and its companion pages (Deep Calibration, Efficacy Report,
Medicine Sequencing Ladder, Iboga & Ibogaine, Iboga Compass, Peyote & Mescaline, Facilitator
Index), split out of tonygreenberg.com. Next.js 16 + Tailwind v4 + shadcn/ui, hosted on Netlify,
with an MCP server at `/api/mcp` so Claude or ChatGPT can propose changes as pull requests.

```bash
pnpm install
cp .env.local.example .env.local   # fill in what you need; the site runs with none of it
pnpm dev                           # http://localhost:3000
pnpm typecheck && pnpm lint && pnpm test
pnpm build && pnpm start           # judge pages here, never on `pnpm dev`
```

Rules for people and AI tools: [`AGENTS.md`](AGENTS.md) → [`CONTRIBUTING.md`](CONTRIBUTING.md) →
[`docs/ai/`](docs/ai/README.md). Status: [`PROJECT-STATUS.md`](PROJECT-STATUS.md).
