# Izzi Math — first concept

Interactive math workbooks and games for K–5, where every activity also exists as a
printable sheet. Stateless to start; accounts later without re-architecting.

## 1. The core idea: one activity, three outputs

The single most important decision. An activity is **authored once as data**, then
rendered three ways:

```
Activity (the atom)
├── meta      grade, strand, CCSS standard, difficulty, est. minutes
├── generate  (seed) => Problem[]        deterministic, seeded
└── renderers
    ├── <Interactive/>   web: input, hints, instant feedback, animation
    ├── <PrintSheet/>    paper: layout, work space, no interactivity
    └── <AnswerKey/>     paper: solutions for the grown-up
```

Nobody authors a worksheet twice. Add an activity, get the interactive version, the
printable, and the answer key.

## 2. Seeded generators are the state

Problems are produced by a deterministic function of a seed, and the seed lives in
the URL:

```
/books/fractions-on-a-number-line?seed=8817
```

This gives us, with no backend and no login:

- **Infinite practice** — new seed, new problems, same skill.
- **"New sheet" button** — a teacher clicks and gets a fresh printable forever.
- **Shareable + reproducible** — the same link always renders the same problems, so a
  teacher can assign one, and a kid can come back to it.
- **The paper and the screen can match** — same activity, same seed, same 20 problems.

The URL is the save file. That is what makes "stateless now, accounts later" honest
rather than a promise.

## 3. Paper ↔ screen bridge

Every printable carries a QR code in the footer pointing at the interactive version
*with the same seed*. Finish the sheet on paper, scan, check your answers on screen.
Print sheets are a first-class product surface, not an export.

## 4. Aesthetic direction: "hologrid"

The brief is futuristic and impressive to adults *and* kids. Those usually pull in
opposite directions — kid-appealing means bright and rounded, adult-futuristic means
dark and precise. The resolution is a single metaphor:

> **Graph paper, lit from behind.**

Kids read a luminous grid as a video game. Adults read it as a technical HUD. Both
are correct.

- **Base** — deep space navy (`#05060E`), never pure black.
- **Surfaces** — glass panels, 1px luminous hairlines, soft depth.
- **Accents** — cyan → violet → magenta gradient spectrum; lime reserved for "correct".
- **Ornament is content** — the decoration *is* math: number lines, fraction bars,
  ten-frames, tessellations, isometric solids. No generic swooshes.
- **Type** — Space Grotesk for display (excellent numerals, geometric but warm),
  Inter for body.
- **Motion** — springy and physical, not cartoon-bouncy. Every input gets feedback.
- **Print is the inverse** — the same system flipped to ink on white, high contrast,
  generous work space. Deliberately calm. It has to survive a school photocopier.

## 5. Information architecture

```
/                                 hero, grade picker, featured book + game
/grades/[k|1|2|3|4|5]             grade hub — strands, books, games
/grades/[grade]/[strand]          topic list
/books                            all books
/books/[slug]                     interactive workbook (chaptered, paged)
/books/[slug]/print               print view  → browser "Save as PDF"
/games                            all games
/games/[slug]                     game
/printables                       browse and download every sheet, filter by grade
/about
```

Grade is the primary axis, as requested. Strand is secondary. A parent lands on
`/grades/3`, a teacher lands on `/printables`.

## 6. Books vs games

|            | Books                          | Games                              |
| ---------- | ------------------------------ | ---------------------------------- |
| Shape      | Chaptered, paged, progressive  | Single loop, replayable            |
| Goal       | Learn a skill                  | Build fluency and speed            |
| Feedback   | Hints, worked solutions        | Score, streak, timer               |
| Print twin | Workbook pages + answer key    | Puzzle page version of the mechanic |

## 7. Grade + strand map (CCSS-aligned)

| Grade | Strands                                                              |
| ----- | -------------------------------------------------------------------- |
| K     | Counting and cardinality · Number bonds · Shapes · Measurement       |
| 1     | Addition and subtraction to 20 · Place value · Time and money · Shapes |
| 2     | Place value to 1000 · Two-step problems · Measurement · Arrays        |
| 3     | Multiplication and division · Fractions · Area and perimeter · Data  |
| 4     | Multi-digit operations · Equivalent fractions · Angles · Factors     |
| 5     | Decimals · Fraction operations · Volume · Coordinate plane           |

## 8. Launch content (proof the model works)

Three books and three games, one per grade band, chosen to stress-test different
renderer needs:

| Band | Book                  | Skill                        | Game             |
| ---- | --------------------- | ---------------------------- | ---------------- |
| K–1  | Number Friends        | Number bonds to 10           | Ten-frame blitz  |
| 2–3  | Times Table Tower     | Multiplication fluency       | Fact family forge |
| 4–5  | Fraction Foundry      | Number line and equivalence  | Decimal drop     |

Fraction Foundry is the flagship — a number line activity is the hardest thing to
render well on both screen and paper, so if the two-output model survives it, it
survives everything.

## 9. Technical plan

**Stack** — Next.js (App Router) + TypeScript, static export. Tailwind v4 with the
design tokens above as CSS custom properties. Framer Motion for the springy feel.
SVG-first for activities; canvas only where a game genuinely needs it.

Next.js over Astro because heavy interactivity is the product, not an island, and
because the auth/API path later is a config change rather than a migration.

**Content** — typed TypeScript modules under `content/`. No CMS. It is authored by us,
it is code-shaped (generators are functions), and it wants type-checking.

**PDF, two tiers**
- *Now* — a dedicated `/print` route with real `@media print` CSS, and the browser's
  Save as PDF. Zero infrastructure, works on a static host, and looks correct if the
  print CSS is treated as a real design surface rather than an afterthought.
- *Later* — a server route rendering the same activity data through
  `@react-pdf/renderer` or headless Chrome, for pre-baked branded downloads and
  multi-sheet packets.

**Hosting** — static on Vercel or GitHub Pages. No server, no cost, until logins.

**When accounts arrive** — Next.js gains route handlers, add Supabase or Clerk. The
progress table is keyed on `(user, activity_id, seed)` — which already exists in the
URL today. Nothing about the content model changes.

## 10. Open questions

1. **Grade range** — assumed K–5. Extend to 6–8 later, or now?
2. **Standards** — CCSS assumed. Worth surfacing standard codes in the UI for
   teachers, or hiding them as metadata?
3. **Mascot** — does "Izzi" become a character? A friendly geometric creature would
   land with K–2 but risks undercutting the adult-facing polish. Recommend holding.
4. **Audience priority** — parents at home, or teachers printing class sets? It
   changes whether `/printables` or `/grades` is the real front door.
