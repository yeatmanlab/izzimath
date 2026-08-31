# ROAM — what it measures, and how Izzi Math links to it

Reference notes for wiring Izzi Math activities to ROAM (Rapid Online Assessment of
Math, Yeatman Lab / Stanford). Everything here was read off the `yeatmanlab/roam-apps`
source and the live item corpora on `storage.googleapis.com/roam-apps`. **Read-only —
we do not modify ROAM.**

Standalone assessment: https://roam-apps.web.app/

## The four tasks

| Task | Internal id | What it measures |
| ---- | ----------- | ---------------- |
| **ALPACA** | `roamAlpaca` | Core Math: Algorithms, Procedures, and Calculations |
| **MagPI** | `roamMagpi` | Magnitude Processing Index |
| **ARF** | `fluencyArf` | Arithmetic Retrieval Fluency — single-digit fact *retrieval* |
| **CALF** | `fluencyCalf` | Calculation Fluency — multi-digit *procedure* |

ARF vs CALF is the important distinction: ARF is whether a fact is *recalled*, CALF is
whether a multi-digit *algorithm* is executed. A kid can be fine on one and not the
other, and they need different practice.

## ALPACA (`roamAlpaca`)

Adaptive (CAT), 4PL IRT with EAP estimation via `@bdelab/jscat`; returns a theta
ability score. 339 items, `cc_grade_level` from preK to Calculus.

**Four CAT subscales, which are grade bands** — this is how we target by grade:

| Subscale | Grades | Relevant to Izzi Math |
| -------- | ------ | --------------------- |
| `cat1` | preK, K, K–1 | yes |
| `cat2` | 1, 1–2, 2, 2–3 | yes |
| `cat3` | 3, 4, 5, 6 | yes |
| `cat4` | 7, 8, HS, Calc, Linear Algebra | no (out of K–5 scope) |

**Six item types** — worth mirroring, since they are the response formats kids will
already have met in the assessment:

| Item type | Example |
| --------- | ------- |
| `multiChoice` | "What number comes next? 1, 2, 3, __" |
| `multiChoiceImage` | "Select the rectangle where a fourth of it is yellow" |
| `giveN` | "Tap on 2 apples to place them in the basket" (give-N task) |
| `selectDuck` | "Click on the 4th duck in line" (**ordinality**) |
| `numberLine` | place 72 on a 1–100 line |
| `textboxResponse` | `3 × 2 =`, `17 × 42 =`, `3/4 + 5/6` |

Items are timed (`time_limit`, typically 20s, with a `countdown_time` of 10s).

## MagPI (`roamMagpi`) — two subtests

### (a) Symbolic comparison — `symbolic`

Two numbers side by side, pick the larger. 236 items, binned to isolate specific
confusions. The bins are a diagnostic map, not just difficulty:

**Single digit** — graded by *ratio* (large / medium / small), i.e. the classic
**numerical distance effect**: `9 vs 8` is harder than `9 vs 1`.

**Double digit** — binned by the actual place-value trap:

| Bin family | What it probes | Example |
| ---------- | -------------- | ------- |
| decade compatible | tens and ones agree in direction | `68 vs 24` |
| decade **incompatible** | tens and ones disagree — the classic error | `71 vs 25`, `65 vs 49` |
| ones comparison, decade matched | same tens, compare ones | `36 vs 37` |
| tens comparison, unit matched | same ones, compare tens | `92 vs 32` |
| **reversed digits** | digit-order confusion | `73 vs 37`, `68 vs 86` |

Also encoded per item: `distance` (numeric gap) and `target_pos` (left/right, to
control side bias).

### (b) Number line estimation — `numberline`

A slider. 52 items in four range blocks. K–2 gets 0–20 then 0–100; older gets 0–100,
0–1, 0–2.

| Block | Range | Targets |
| ----- | ----- | ------- |
| `0_20` | 0–20 | 1, 2, 3, 5, 7, 9, 11, 13, 15, 17, 19 |
| `0_100` | 0–100 | 3, 7, 14, 19, 24, 32, 44, 51, 63, 76, 84, 98 |
| `0_1` | 0–1 | **fractions** — 1/5, 1/6, 1/3, 1/4, 5/8, 3/8, 4/5, 5/6, 1/17, 13/14 |
| `0_2` | 0–2 | **mixed + improper** — 2/3, 11/12, 1 2/4, 1 5/6, 7/4, 5/4, 7/6, 6/5 |

**Fraction placement on a number line is literally a ROAM construct.** That makes the
fraction number line the single highest-value activity we can build — it maps directly
onto `roamMagpi:numberline` blocks `0_1` and `0_2`.

## ARF (`fluencyArf`) — fact retrieval

379 single-digit items, four separately-parameterised subscales: `sum`, `minus`,
`mult`, `div`. Multiple choice with 4 distractors.

| Bins | Range walk |
| ---- | ---------- |
| `A1`–`A4` (add) | `0+1` → `3+4` → `0+10` → `3+8` (crossing ten) |
| `S0`–`S4` (subtract) | `1-0` → `1-1` → `3-2` → `5-3` → `6-4` |
| `M1`–`M5` (multiply) | `1×1` → `1×6` → `1×10` → `3×8` → `4×8` |
| `D1`–`D5` (divide) | `1÷1` → `6÷1` → `10÷1` → `24÷3` → `32÷4` |

## CALF (`fluencyCalf`) — multi-digit procedure

11,419 items, with an explicit `skill` field naming the procedural step. **The
carry/borrow distinction is exactly what the task is built to separate**:

| Bin | n | Skill | Range | Example |
| --- | - | ----- | ----- | ------- |
| `A1` | 1295 | Addition **without** carry | 11–88 | `11 + 11` |
| `A2` | 1620 | Addition **with** carry | 11–98 | `11 + 91` |
| `A3` | 1620 | Addition with carry | 11–89 | `11 + 19` |
| `A4` | 2025 | Addition with carry | 11–99 | `11 + 99` |
| `S1` | 1943 | Subtraction **without** borrow | 12–99 | `12 - 11` |
| `S2` | 1620 | Subtraction **with** borrow | 20–98 | `20 - 11` |
| `M1` | 200 | × single digit | 11–99 × 2–9 | `11 × 2` |
| `M2` | 198 | × single digit | 21–99 × 3–9 | `56 × 3` |
| `M3` | 250 | × single digit | 36–99 × 4–9 | `76 × 4` |
| `D1` | 200 | ÷ single digit | 22–198 ÷ 2–9 | `22 ÷ 2` |
| `D2` | 198 | ÷ single digit | 130–375 ÷ 3–9 | `168 ÷ 3` |
| `D3` | 250 | ÷ single digit | 288–891 ÷ 4–9 | `304 ÷ 4` |

## Score reporting — the model Izzi Math mirrors

From the lab's ROAR *Next Steps* guide (`docs/` reference), four score types: **raw**,
**standard**, **percentile**, **support category**. For elementary (K–5), the support
category is set by percentile:

| Band | Percentile | Meaning |
| ---- | ---------- | ------- |
| **Needs extra support** | below 20th | This skill is holding them back from grade-level material |
| **Developing skill** | 20th–40th | May need focused practice alongside grade-level work |
| **Achieved skill** | above 40th | Not holding them back |

Two conventions we adopt verbatim:

1. **"Needs extra support", never "high risk."** The lab chose this deliberately —
   it names the action, not a label on the child. Izzi Math uses the same words.
2. **Reliability flagging.** ROAM marks a score unreliable when a child clicks too
   fast (`responseTimeLowThreshold` 250 ms, `accuracyThreshold` 0.6, min 3 responses).
   If a score is flagged, Izzi Math should not make confident recommendations from it.

## How Izzi Math links to it

Every activity declares a `roam` field naming the task and subscale it trains:

```js
roam: [
  { task: 'roamMagpi',   subscale: 'numberline', block: '0_1' },
  { task: 'roamAlpaca',  subscale: 'cat3' },
]
```

That gives us both directions:

- **Score → practice.** A ROAM result in "needs extra support" on MagPI number line
  surfaces exactly the activities carrying that tag.
- **Practice → construct.** Every book and game can honestly say which measured skill
  it trains, instead of a vague "improves math."

Izzi Math is **practice, not assessment**. It never produces a score, never claims to
predict one, and never replaces ROAM. The link is a recommendation, in one direction.

### Keep it subtle

ROAM is **one influence among several**, not the frame the site is built around. The
topic order comes from Illustrative Mathematics; the activity designs come from the
wider maths education research. Where ROAM earns its place is in the *difficulty
progressions* — its corpora encode which cases are genuinely hard and which
misconceptions are worth targeting, and that is unusually good information to have.

So the linkage lives mostly in the code rather than on the page:

- **In the content** — difficulty bands and target pools are drawn from the corpora,
  documented in code comments. Invisible to families, useful to maintainers.
- **On an activity page** — one quiet trailing line naming the related measured skill.
  Not a badge, not a table, not on the cards.
- **On one opt-in page** — `/roam/` exists for families who happen to have a score.
  It is linked from the footer, not the main navigation.

Nothing on the site requires a ROAM score, mentions one before the footer, or implies
a family should go and get one.
