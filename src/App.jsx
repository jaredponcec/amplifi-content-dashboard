
import { useState, useCallback } from "react";

const BRIAN_SYSTEM_PROMPT = `You are Brian Hymas's Instagram content writer. Brian is a Boise Metro & Middleton realtor and relocation guide with 40+ years living in Idaho. He has helped 130+ families relocate, sold $100M+ in real estate, and built a 7,800+ follower audience on Instagram.

BRIAN'S IDEAL CUSTOMER (ICP):
Conservative, family-first households from CA (Orange County, San Diego, Bay Area), WA (Seattle), OR (Portland), CO (Denver), or NYC. They earn $100K–$400K HHI, have 1–4 kids, and are moving for identity and belonging — not just a house. They feel disconnected, overtaxed, politically alienated, and are craving safety, peace, space, and community.

PSYCHOGRAPHIC CORE — what they secretly feel:
- Life at home is too fast, too political, too expensive, too chaotic
- Their kids are missing out on a real childhood
- America has changed in ways they don't like
- They crave peace, simplicity, wide-open skies, and margin

BRIAN'S PROVEN PAIN POINTS TO TRIGGER:
High taxes, progressive policies, crime, unsafe schools, traffic, no land, no community, kids indoors, HOA micromanagement, feeling disconnected

BRIAN'S PROVEN DESIRES TO SPEAK TO:
Safety, peace, slower pace, freedom, more land, community, lower taxes, good schools, conservative values, outdoors, margin in life, a childhood like they remember

TOWNS BRIAN COVERS:
- Middleton: acreage, freedom, no HOA, open skies, faith/family/freedom, #1 pick for ICP
- Star: small-town charm, scenic, affordable, tight-knit
- Eagle: luxury suburban, foothills, river, but strict HOA and expensive
- Caldwell/Nampa: affordable, space, rural vibe, peaceful

BRIAN'S BRAND VOICE:
- Relatable local dad, straight shooter, conservative but kind
- Nostalgic, story-driven, calm, "real talk" honesty
- Warm and neighborly, never salesy
- Speaks as a local tour guide and Idaho native

WRITING STYLE RULES:
1. Short sentences. Lots of line breaks.
2. Emotional imagery and storytelling.
3. Speak directly to "you" — never "everyone."
4. Highlight specific towns.
5. Show lifestyle, not features.
6. Always connect back to family, peace, or values.
7. End with: Comment "RELOCATE" and I'll send you my free relocation guide.
8. Use contrast between old life (chaos) and new life (peace) — but state it as a direct description of Idaho life, not as "this isn't X, it's Y."

PROVEN HOOK FORMULAS:
- "If you're leaving a place that no longer feels like home…"
- "Here's the truth no one tells you about living in ____."
- "My clients who moved from California always say the same thing…"
- "If you want a place where values still matter…"
- "Why families are choosing Star/Middleton over [big city]…"
- "This is why Idaho feels different…"

CONTENT PILLARS:
1. Relocation Truth — honest pros/cons, things no one tells you
2. Lifestyle Paint — what daily life actually looks like in Idaho
3. Values & Identity — patriotism, faith, community, safety
4. Financial Reality — cost breakdowns, taxes, savings
5. Client Story — real family moves, real reactions
6. Town Spotlight — deep dive on Middleton, Star, Eagle, etc.

RULES FOR ALL OUTPUT:
- Every piece must make the reader feel: relief, hope, clarity, belonging, or "finally someone gets it"
- Speak to their kids, their values, their exhaustion, their longing
- If the copy doesn't make them feel something, it won't convert
- Never use generic real estate language
- Never sound like an ad`;

const CONTENT_PILLARS = [
  { id: "truth", label: "Relocation Truth", emoji: "🔍", color: "#8B7355" },
  { id: "lifestyle", label: "Lifestyle Paint", emoji: "🌄", color: "#5B7B5E" },
  { id: "values", label: "Values & Identity", emoji: "🇺🇸", color: "#7B5C8B" },
  { id: "financial", label: "Financial Reality", emoji: "💰", color: "#5B6B7B" },
  { id: "client", label: "Client Story", emoji: "👨‍👩‍👧", color: "#8B5B5B" },
  { id: "town", label: "Town Spotlight", emoji: "📍", color: "#5B7B6B" },
];

const TOWNS = ["Middleton", "Star", "Eagle", "Caldwell", "Nampa", "Boise", "Meridian"];
const STATES = ["California", "Washington", "Oregon", "Colorado", "New York", "Texas"];

async function callClaude(prompt, systemExtra = "") {
  const response = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: BRIAN_SYSTEM_PROMPT + (systemExtra ? "\n\n" + systemExtra : ""),
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `API error ${response.status}`);
  }
  return data.content?.map(b => b.text || "").join("\n") || "";
}

function ErrorBanner({ message }) {
  return (
    <div style={{
      marginTop: 16, padding: "14px 18px", borderRadius: 8,
      background: "#FDF2F2", border: "1.5px solid #E8BABA",
      color: "#7B3535", fontSize: 14, fontFamily: "Georgia, serif", lineHeight: 1.5,
    }}>
      <strong>Something went wrong:</strong> {message}
      <div style={{ fontSize: 12, marginTop: 6, color: "#9B5555" }}>
        Check that your VITE_ANTHROPIC_API_KEY is set in .env and restart the dev server.
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "12px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%", background: "#C8A96E",
          animation: "bounce 1.2s ease-in-out infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

function HookGenerator() {
  const [pillar, setPillar] = useState("truth");
  const [town, setTown] = useState("Middleton");
  const [state, setState] = useState("California");
  const [hooks, setHooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [error, setError] = useState(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setHooks([]);
    setError(null);
    const pillarLabel = CONTENT_PILLARS.find(p => p.id === pillar)?.label;
    try {
      const result = await callClaude(
        `Generate 5 Instagram Reel hooks/titles for Brian Hymas.
Content pillar: ${pillarLabel}
Town focus: ${town}
Audience from: ${state}

Requirements:
- Each hook is a bold on-screen text overlay (max 12 words)
- Grabs attention in 2 seconds
- Uses Brian's proven formulas
- Specific to the town and/or state mentioned
- Makes the viewer feel seen, curious, or alarmed

Return ONLY the 5 hooks, numbered 1-5. No explanations. No extra text.`
      );
      const lines = result.split("\n").filter(l => l.trim().match(/^\d\./));
      setHooks(lines.map(l => l.replace(/^\d\.\s*/, "").trim()));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pillar, town, state]);

  const copy = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{ maxWidth: 660, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <label style={labelStyle}>Content Pillar</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {CONTENT_PILLARS.map(p => (
            <button key={p.id} onClick={() => setPillar(p.id)}
              style={{ ...pillStyle, background: pillar === p.id ? p.color : "transparent",
                color: pillar === p.id ? "#FAF7F2" : "#8A7B6A",
                border: `1.5px solid ${pillar === p.id ? p.color : "#D4C9B8"}` }}>
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <div>
          <label style={labelStyle}>Town Focus</label>
          <select value={town} onChange={e => setTown(e.target.value)} style={selectStyle}>
            {TOWNS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Audience From</label>
          <select value={state} onChange={e => setState(e.target.value)} style={selectStyle}>
            {STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <button onClick={generate} disabled={loading} style={primaryBtn}>
        {loading ? "Generating..." : "Generate 5 Hooks →"}
      </button>

      {loading && <LoadingDots />}
      {error && <ErrorBanner message={error} />}

      {hooks.length > 0 && (
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
          {hooks.map((h, i) => (
            <div key={i} style={{ background: "#FAF7F2", border: "1px solid #E8DFD0",
              borderRadius: 10, padding: "16px 20px", display: "flex",
              justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 16,
                color: "#2C2416", lineHeight: 1.4 }}>{h}</div>
              <button onClick={() => copy(h, i)} style={{
                ...ghostBtn, minWidth: 62, fontSize: 12,
                background: copied === i ? "#5B7B5E" : "transparent",
                color: copied === i ? "#FAF7F2" : "#8A7B6A",
              }}>
                {copied === i ? "✓" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CaptionWriter() {
  const [hook, setHook] = useState("");
  const [pillar, setPillar] = useState("truth");
  const [town, setTown] = useState("Middleton");
  const [state, setState] = useState("California");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const generate = useCallback(async () => {
    if (!hook.trim()) return;
    setLoading(true);
    setCaption("");
    setError(null);
    const pillarLabel = CONTENT_PILLARS.find(p => p.id === pillar)?.label;
    try {
      const result = await callClaude(
        `Write a complete, ready-to-post Instagram caption for Brian Hymas.

Hook/Title: "${hook}"
Content pillar: ${pillarLabel}
Town: ${town}
Audience from: ${state}

Requirements:
- Open with the hook as the first line
- Short sentences, lots of line breaks (Brian's style)
- 200–350 words
- Tell a specific emotional story or give concrete info
- Speak directly to "you"
- Reference the specific town and/or state
- Connect back to family, peace, or values
- End with: Comment "RELOCATE" and I'll send you my free relocation guide.
- Use Brian's exact voice: relatable local dad, real talk, warm, never salesy

Write the full caption only. No labels, no explanations.`
      );
      setCaption(result.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hook, pillar, town, state]);

  const copy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ maxWidth: 660, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Hook or Topic</label>
        <textarea
          value={hook}
          onChange={e => setHook(e.target.value)}
          placeholder="e.g. My clients from Orange County said they regretted the move. Here's why."
          style={{ ...inputStyle, height: 80, resize: "vertical" }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Content Pillar</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {CONTENT_PILLARS.map(p => (
            <button key={p.id} onClick={() => setPillar(p.id)}
              style={{ ...pillStyle, background: pillar === p.id ? p.color : "transparent",
                color: pillar === p.id ? "#FAF7F2" : "#8A7B6A",
                border: `1.5px solid ${pillar === p.id ? p.color : "#D4C9B8"}` }}>
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div>
          <label style={labelStyle}>Town Focus</label>
          <select value={town} onChange={e => setTown(e.target.value)} style={selectStyle}>
            {TOWNS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Audience From</label>
          <select value={state} onChange={e => setState(e.target.value)} style={selectStyle}>
            {STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <button onClick={generate} disabled={loading || !hook.trim()} style={{
        ...primaryBtn, opacity: !hook.trim() ? 0.5 : 1,
      }}>
        {loading ? "Writing caption..." : "Write Caption →"}
      </button>

      {loading && <LoadingDots />}
      {error && <ErrorBanner message={error} />}

      {caption && (
        <div style={{ marginTop: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#8A7B6A" }}>Ready-to-post caption</span>
            <button onClick={copy} style={{
              ...ghostBtn, background: copied ? "#5B7B5E" : "transparent",
              color: copied ? "#FAF7F2" : "#8A7B6A",
            }}>
              {copied ? "✓ Copied!" : "Copy All"}
            </button>
          </div>
          <div style={{
            background: "#FAF7F2", border: "1px solid #E8DFD0", borderRadius: 12,
            padding: "24px 28px", fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: 15, lineHeight: 1.75, color: "#2C2416", whiteSpace: "pre-wrap",
          }}>
            {caption}
          </div>
        </div>
      )}
    </div>
  );
}

function ContentCalendar() {
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [detailError, setDetailError] = useState(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setCalendar(null);
    setSelected(null);
    setDetail(null);
    setError(null);

    try {
      const result = await callClaude(
        `Create a 7-day Instagram content calendar for Brian Hymas.

Return ONLY valid JSON (no markdown, no backticks, no explanation):
{
  "days": [
    {
      "day": "Monday",
      "pillar": "Relocation Truth",
      "pillarEmoji": "🔍",
      "hook": "short reel title here",
      "topic": "one sentence topic description",
      "format": "Reel" or "Carousel" or "Story"
    }
  ]
}

Rules:
- Rotate through all 6 content pillars across the week
- Mix Reels (4), Carousels (2), Stories (1)
- Each hook max 10 words, punchy and specific
- Vary the towns (Middleton, Eagle, Star, Caldwell)
- Vary the audience origin (CA, WA, CO)
- Make each day feel distinct and urgent
- Sunday should be a lighter/personal story`
      );
      const clean = result.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setCalendar(parsed.days);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const expand = useCallback(async (day) => {
    setSelected(day);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const result = await callClaude(
        `Write a complete, ready-to-post Instagram caption for this content day:

Day: ${day.day}
Hook: "${day.hook}"
Topic: ${day.topic}
Format: ${day.format}
Pillar: ${day.pillar}

Short sentences. Line breaks. Brian's voice. 200-300 words. End with Comment "RELOCATE".`
      );
      setDetail(result.trim());
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const pillarColor = (pillarName) => {
    const found = CONTENT_PILLARS.find(p => p.label === pillarName);
    return found?.color || "#8B7355";
  };

  return (
    <div style={{ maxWidth: 740, margin: "0 auto" }}>
      <button onClick={generate} disabled={loading} style={primaryBtn}>
        {loading ? "Building your week..." : "Generate This Week's Content →"}
      </button>

      {loading && (
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <LoadingDots />
          <span style={{ color: "#8A7B6A", fontSize: 13 }}>Planning 7 days of content…</span>
        </div>
      )}
      {error && <ErrorBanner message={error} />}

      {calendar && (
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 8 }}>
          {calendar.map((day, i) => (
            <div key={i} onClick={() => expand(day)}
              style={{
                background: selected?.day === day.day ? "#FAF7F2" : "#FFFFFF",
                border: `1.5px solid ${selected?.day === day.day ? pillarColor(day.pillar) : "#E8DFD0"}`,
                borderRadius: 12, padding: "16px 20px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 16,
                transition: "all 0.15s ease",
              }}>
              <div style={{ width: 40, textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 12,
                  color: "#8A7B6A", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: 1 }}>{day.day.slice(0,3)}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15,
                  color: "#2C2416", fontWeight: 600, marginBottom: 2 }}>{day.hook}</div>
                <div style={{ fontSize: 12, color: "#8A7B6A" }}>{day.topic}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                  background: pillarColor(day.pillar) + "22",
                  color: pillarColor(day.pillar), letterSpacing: 0.3,
                }}>
                  {day.pillarEmoji} {day.pillar}
                </span>
                <span style={{
                  fontSize: 11, padding: "3px 10px", borderRadius: 20,
                  background: "#EDE8E0", color: "#7A6E62",
                }}>{day.format}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div style={{ marginTop: 24, background: "#FAF7F2", border: "1px solid #E8DFD0",
          borderRadius: 14, padding: "28px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18,
                color: "#2C2416", fontWeight: 700 }}>{selected.day}</div>
              <div style={{ fontSize: 13, color: "#8A7B6A", marginTop: 2 }}>
                {selected.pillarEmoji} {selected.pillar} · {selected.format}
              </div>
            </div>
            {detail && (
              <button onClick={() => { navigator.clipboard.writeText(detail); }}
                style={{ ...ghostBtn, fontSize: 12 }}>Copy</button>
            )}
          </div>

          {detailLoading && <LoadingDots />}
          {detailError && <ErrorBanner message={detailError} />}

          {detail && (
            <div style={{ fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: 15, lineHeight: 1.8, color: "#2C2416", whiteSpace: "pre-wrap" }}>
              {detail}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block", fontFamily: "'Playfair Display', serif",
  fontSize: 13, fontWeight: 700, color: "#5A4E42",
  textTransform: "uppercase", letterSpacing: 1, marginBottom: 6,
};

const pillStyle = {
  borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600,
  cursor: "pointer", transition: "all 0.15s ease", letterSpacing: 0.3,
};

const selectStyle = {
  width: "100%", padding: "10px 14px", marginTop: 6, borderRadius: 8,
  border: "1.5px solid #D4C9B8", background: "#FFFFFF",
  fontFamily: "Georgia, serif", fontSize: 14, color: "#2C2416",
  outline: "none", cursor: "pointer", appearance: "none",
};

const inputStyle = {
  width: "100%", padding: "12px 14px", marginTop: 6, borderRadius: 8,
  border: "1.5px solid #D4C9B8", background: "#FFFFFF",
  fontFamily: "Georgia, serif", fontSize: 14, color: "#2C2416",
  outline: "none", boxSizing: "border-box",
};

const primaryBtn = {
  background: "#C8A96E", color: "#FAF7F2", border: "none",
  padding: "13px 28px", borderRadius: 8, fontFamily: "'Playfair Display', serif",
  fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5,
  transition: "opacity 0.15s ease",
};

const ghostBtn = {
  border: "1.5px solid #D4C9B8", background: "transparent", color: "#8A7B6A",
  padding: "7px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer",
  fontFamily: "Georgia, serif", transition: "all 0.15s ease",
};

const TABS = [
  { id: "calendar", label: "📅 Weekly Calendar" },
  { id: "hooks", label: "⚡ Hook Generator" },
  { id: "caption", label: "✍️ Caption Writer" },
];

export default function App() {
  const [tab, setTab] = useState("calendar");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F0E8",
      fontFamily: "Georgia, serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Source+Serif+4:wght@300;400;600&display=swap');
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
        * { box-sizing: border-box; }
        select:focus, textarea:focus, input:focus { border-color: #C8A96E !important; }
        button:hover:not(:disabled) { opacity: 0.85; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#2C2416",
        padding: "32px 40px 24px",
        borderBottom: "3px solid #C8A96E",
      }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
            <div style={{
              fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900,
              color: "#FAF7F2", letterSpacing: -0.5,
            }}>Brian Hymas</div>
            <div style={{ fontSize: 13, color: "#C8A96E", fontWeight: 600,
              letterSpacing: 2, textTransform: "uppercase" }}>Content System</div>
          </div>
          <div style={{ fontSize: 13, color: "#8A7B6A" }}>
            Boise Metro & Middleton · Instagram Automation
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#2C2416", padding: "0 40px" }}>
        <div style={{ maxWidth: 740, margin: "0 auto", display: "flex", gap: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "transparent", border: "none", cursor: "pointer",
              padding: "14px 22px", fontSize: 14, fontFamily: "Georgia, serif",
              color: tab === t.id ? "#C8A96E" : "#6A6058",
              borderBottom: `2.5px solid ${tab === t.id ? "#C8A96E" : "transparent"}`,
              transition: "all 0.15s ease", fontWeight: tab === t.id ? 600 : 400,
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "40px 40px 60px", maxWidth: 820, margin: "0 auto" }}>
        {tab === "calendar" && <ContentCalendar />}
        {tab === "hooks" && <HookGenerator />}
        {tab === "caption" && <CaptionWriter />}
      </div>
    </div>
  );
}
