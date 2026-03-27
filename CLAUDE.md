# Brian Hymas Instagram Content System

## Project Overview
AI-powered Instagram content automation tool for Brian Hymas, a Boise Metro & Middleton realtor. Generates reel hooks, captions, and weekly content calendars — all trained on his ICP, brand voice, and proven content pillars.

## Stack
- React (JSX)
- Tailwind utility classes (base stylesheet only — no compiler)
- Anthropic API (`claude-sonnet-4-20250514`) via `fetch`
- Vite or Antigravity for local dev

## Project Structure
```
/
├── CLAUDE.md
├── .env
├── .env.example
├── src/
│   └── brian_hymas_content_system.jsx   ← main app
└── package.json
```

## Environment Variables
```
VITE_ANTHROPIC_API_KEY=your_key_here
```
Loaded via `import.meta.env.VITE_ANTHROPIC_API_KEY` in the JSX file.

## API Usage
The app calls the Anthropic Messages API directly from the browser:
- Endpoint: `https://api.anthropic.com/v1/messages`
- Model: `claude-sonnet-4-20250514`
- Auth: Bearer token from env variable
- Max tokens: 1000 per call

## Key Components
- `HookGenerator` — generates 5 reel hooks based on pillar/town/state
- `CaptionWriter` — writes full ready-to-post captions from a hook input
- `ContentCalendar` — plans a full 7-day content week, click any day for full caption

## Brian's Brand Voice (for AI prompts)
- Relatable local dad, straight shooter, conservative but kind
- Short sentences, lots of line breaks
- Nostalgic and story-driven
- Speaks directly to "you"
- Always ends with: Comment "RELOCATE" and I'll send you my free relocation guide.

## ICP Summary
Conservative family-first households relocating from CA, WA, OR, CO, NYC.
Moving for: safety, peace, space, community, lower taxes, conservative values, freedom.
Pain points: high taxes, crime, progressive culture, traffic, no land, kids indoors.

## Content Pillars
1. Relocation Truth
2. Lifestyle Paint
3. Values & Identity
4. Financial Reality
5. Client Story
6. Town Spotlight

## Towns
Middleton (primary), Star, Eagle, Caldwell, Nampa, Boise, Meridian

## Common Tasks for Claude Code
- `fix syntax errors in src/brian_hymas_content_system.jsx`
- `wire up VITE_ANTHROPIC_API_KEY from .env`
- `add error handling to API calls`
- `add copy-to-clipboard to all outputs`
