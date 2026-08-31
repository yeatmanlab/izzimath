<!-- Research output, preserved as received. -->

> **Status: reference document, not a description of the build.**
>
> This is the build specification produced by the research pass (8 agents, ~200
> sources, seven parallel reviews plus a synthesis). It is kept verbatim as the
> record of what the research recommended, so the reasoning behind the content can
> be checked later.
>
> **The shipped site does not implement all of it.** Section 0 lists the deltas
> against the activity registry as it stood when this was written. What is built,
> what is partially built and what is deliberately deferred is summarised in
> `docs/EVIDENCE.md`; the citations behind each activity are on the site's
> `/references/` page.

---

# Izzi Math — Content Build Specification v1

**Status:** build spec. Every number in it is meant to be typed into code.
**Scope:** K–5 scope & sequence, 30 activities (18 books + 12 games), the ROAM→recommendation engine, design rules, and attribution.
**Companions:** `docs/CONCEPT.md` (product), `docs/ROAM.md` (assessment reference), `docs/EVIDENCE.md` (research digest).

---

## 0. Deltas from the current registry (`content/activities/`)

The repo currently holds **31** activities (18 books / 13 games). This spec is **30** (18 / 12). Three changes, all reductions in code with **no loss of ROAM coverage**:

| Change | Was | Becomes | Why |
| --- | --- | --- | --- |
| **Remove** `which-is-more` (K game) | standalone single-digit comparison game | stages 1–2 of `decade-duel`, plus an untimed compare chapter inside the `counting-crew` book | One mechanic, staged K→5, per IM's Centers pattern. A K child reaches it via `?stage=1`; the book gives the untimed, worked introduction. |
| **Remove** `hundred-line-hop` (G2 game) | separate 0–100 estimation game | stages 3–4 of `number-line-hop` | Identical shell, identical scoring (PAE). Two activities were one activity with a different `S`. |
| **Add** `close-to-hundred` (G2 game) | — | target-number digit-card game, 7 stages spanning grades 1–5 | The catalogue had no target-number game — the format the task brief and the IM/TERC evidence both single out, and the cheapest proof of the paper↔screen thesis. |

Result: **2 games and 3 books per grade, every grade.** Games drop from 13 to 12; total from 31 to 30.

---

## 1. Scope and sequence, K–5

Five strands per grade. Order follows **IM K–5** (the only free, openly licensed, coherent K–5 sequence, EdReports "Meets Expectations" in all three gateways at every grade), cross-checked against Eureka Math², EngageNY/Zearn, Fishtank and Khan. Strand names are parent-facing (Zearn's register), with IM units and CCSS clusters as metadata.

`launch` = has a v1 activity. `v2` = strand is real, no v1 activity, reason given.

### Kindergarten — "part, part, total"

| # | Strand | IM units | CCSS | v1 activity |
| - | ------ | -------- | ---- | ----------- |
| 1 | Counting and cardinality | U1, U2, U6 | K.CC.A, K.CC.B | `counting-crew`, `great-race`, `ten-frame-flash` |
| 2 | Number bonds to 10 | U4, U5 | K.OA.A.3–4 | `number-friends` |
| 3 | Story problems — add to, take from, put together | U4 §B, U5 §B | K.OA.A.1–2 | **v2** (word-problem slots inside `number-friends` for now) |
| 4 | Flat and solid shapes | U3, U7 | K.G | `shape-sorter` |
| 5 | Compare and measure | U2 §D, U7 §B | K.CC.C.6–7, K.MD.A | `counting-crew` ch. 5; `decade-duel` stage 1 |

K weighting note: number strands get 4 of the 5 launch activities on purpose. WWC 2013 rates *number-and-operations by developmental progression* **Moderate** and rates geometry/patterns/measurement/data **Minimal** — so shapes are scoped as required coverage, not as an evidence claim.

### Grade 1 — "units of ten"

| # | Strand | IM units | CCSS | v1 activity |
| - | ------ | -------- | ---- | ----------- |
| 1 | Addition and subtraction to 20 | U1 §A, U3 | 1.OA.B, 1.OA.C | `adding-to-twenty`, `make-ten-race` |
| 2 | All kinds of story problems | U2 (one section per CGI type) | 1.OA.A.1–2 | **v2 — highest-value v2 book.** WWC Rec 5 (word problems) is STRONG, k=18, and fact fluency transfers to word problems only at g=0.25. |
| 3 | Place value to 100 | U4, U5 | 1.NBT | `tens-and-ones`, `number-line-hop` |
| 4 | Measure and tell time | U6, U7 §C | 1.MD | **v2** — no meaningful efficacy evidence; engagement content, not a headline claim |
| 5 | Shapes and halves | U7 §A–B | 1.G.A | `halves-and-quarters` |

### Grade 2 — "ten tens"

| # | Strand | IM units | CCSS | v1 activity |
| - | ------ | -------- | ---- | ----------- |
| 1 | Place value to 1,000 | U5 | 2.NBT.A | `place-value-palace` |
| 2 | Add and subtract within 100 and 1,000 | U1 §A, U2, U7 | 2.NBT.B | `carry-and-borrow`, `close-to-hundred` |
| 3 | The number line itself | **U4 (its own unit)** | 2.MD.B.6 | `number-line-hop` stages 2–3 |
| 4 | Measure and data | U3, U6 §C–D | 2.MD.A, 2.MD.D | **v2** |
| 5 | Arrays and equal groups | U8 | 2.OA.C | `arrays-and-equal-groups` |

Strand 3 is IM's most distinctive structural choice and we copy it: the line is taught as a **structure** (numbers as distances from zero) before it is used as a computation model. Izzi starts it earlier than IM — at K, via `great-race` — because that is where the Siegler evidence sits.

### Grade 3 — "units of any number"

| # | Strand | IM units | CCSS | v1 activity |
| - | ------ | -------- | ---- | ----------- |
| 1 | Multiplication and division | U1, U4 | 3.OA | `times-table-tower`, `fact-family-forge` |
| 2 | Fractions on the number line | U5 | 3.NF | `fraction-number-line` |
| 3 | Area and perimeter | U2 *and* U7 | 3.MD.C, 3.MD.D | `area-and-perimeter`, `array-architect` |
| 4 | Add, subtract and round within 1,000 | U3 | 3.NBT | `carry-and-borrow` stage 3 (2-digit → 3-digit) |
| 5 | Measurement and data | U6, U1 §A | 3.MD.A–B | **v2** |

### Grade 4 — "fractional units"

| # | Strand | IM units | CCSS | v1 activity |
| - | ------ | -------- | ---- | ----------- |
| 1 | Multi-digit operations | U4, U6 | 4.NBT.B | `long-multiplication`, `division-descent` |
| 2 | Equivalent fractions and decimals | U2, U3, U4 §A | 4.NF | `equivalent-fractions`, `decimal-drop` |
| 3 | Angles and lines | U7, U8 | 4.MD.C, 4.G.A | `angles-and-lines` |
| 4 | Factors, multiples and patterns | U1, U6 §A | 4.OA.B–C | **v2** (factor pairs covered by `array-architect`) |
| 5 | Times as many — multiplicative comparison | U5 | 4.OA.A.2, 4.MD.A | **v2** |

### Grade 5 — "fractions are numbers"

| # | Strand | IM units | CCSS | v1 activity |
| - | ------ | -------- | ---- | ----------- |
| 1 | Decimals to thousandths | U5 | 5.NBT.A, 5.NBT.B.7 | `decimal-place` |
| 2 | Fraction operations | U2, U3, U6 §B–C | 5.NF | `fraction-foundry`, `mixed-number-line` |
| 3 | Multi-digit multiplication and division | U4 | 5.NBT.B.5–6 | `long-multiplication` stage 4 (standard algorithm mastery) |
| 4 | Volume | U1 | 5.MD.C | `volume-and-space` |
| 5 | The coordinate plane and the shape hierarchy | U7 | 5.G.A, 5.OA.B.3 | `coordinate-quest` |

### 1.6 Where the curricula genuinely disagree

Nine real disagreements, and Izzi's call in each. These are the places a parent whose school uses a different program will notice a mismatch, so each one needs a documented position.

| Disagreement | The camps | Izzi's call |
| --- | --- | --- |
| **How multiplication is introduced (G3)** | IM: scaled picture/bar graphs first (U1 §A), *then* equal groups. Eureka/EngageNY: straight into units of 2,3,4,5,10. Fishtank: equal groups. | **Equal groups + arrays first**, data as context rather than gate. IM's graph on-ramp is elegant but it makes multiplication depend on a data-literacy prerequisite we have not built; the array is our frozen representation and becomes the area model. |
| **Standard algorithm for multi-digit × (G4 vs G5)** | IM: G4 requires *no* particular method, standard algorithm mastered in G5 U4. Eureka/EngageNY/Fishtank: taught in G4. | **Follow IM**: partial products and area model in G4, standard algorithm offered alongside and mastered in G5. But the G4 **printable prints both forms of the same problem**, because a parent whose school teaches the algorithm in G4 must not find our sheet unusable. |
| **When volume comes (G5)** | IM: Unit **1**, opens the year, before any fractions. EngageNY: Module 5. Eureka Math²: Module 5. | Treat as **order-independent**. `volume-and-space` declares no prerequisite beyond multiplication, so it works in September or April. |
| **When decimals come (G4)** | IM: U4, integrated with place value to 1,000,000. EngageNY: M6, late. Eureka Math² : M5. Khan: its own unit. | **Integrate with place value** (IM) and put the decimal on the *same* number line as the fractions, which is WWC Rec 4's explicit instruction. |
| **Area and perimeter: together or apart** | IM: separated by five units (U2 / U7) then deliberately contrasted. Fishtank: adjacent units. Eureka: M4 / M7. | **Follow IM's separation**, then add the contrast page IM implies but does not ship as an item ("which one needs square units?"). Separation in time is the cheap fix for the classic confusion. |
| **Rekenrek or ten-frame** | IM: 5-/10-frames and fingers, **no rekenrek**. Eureka/Eureka²: rekenrek is central (and its own MA review caught it shipping a rekenrek lesson with no digital rekenrek). | **Ten-frame only.** It does the 5+n work, it is far cheaper to render, and it keeps the representation set frozen. Documented so a rekenrek family knows why they do not see one. |
| **Where fraction denominators stop** | IM G3: {2,3,4,6,8}; G4: {2,3,4,5,6,8,10,12,100}. Khan splits far finer. | **Adopt IM's pools verbatim** as generator constraints, plus WWC's override: **odd denominators must appear early**, because children over-generalise from halving. |
| **Factors and multiples placement (G4)** | IM: Unit 1, only 6–8 days — the shortest unit in K–5. EngageNY: inside M3. Khan: mid-year unit. | Not a standalone v1 activity; factor pairs live inside `array-architect` (find *all* rectangles for a number), which is the same content with a better mechanic. |
| **Time and money** | Everyone teaches it (IM G1 U7, G2 U6; Khan G2 "Money and time"). | **Deferred to v2 and labelled as engagement content.** No efficacy evidence attaches to it; we would rather ship it late and honestly than early and dressed up. |

---

## 2. Activity catalogue — 30 activities

Field key. `id` is the URL slug and the registry key. `roam_link` uses exact ids from `content/roam.js`. Every activity's response types come from the eight-type system in `content/types.js`, which deliberately mirrors ALPACA's own item types — `choice`↔`multiChoice`, `choice`+image↔`multiChoiceImage`, `tap`↔`giveN`, `ordinal`↔`selectDuck`, `numberline`↔`numberLine`, `input`↔`textboxResponse` — so a child meets the same response formats here that they met in the assessment.

---

### KINDERGARTEN

#### 2.1 `counting-crew` — Counting Crew
**book · K · Counting and cardinality**

- **Skill:** Count to 20 and know the last word said is *how many*; name the next number; produce a set of a given size; find a position in a line; compare two single digits.
- **CCSS:** K.CC.A.2, K.CC.B.4, K.CC.B.5, K.CC.C.6, K.CC.C.7
- **Mechanic:** five chapter modes, cycled by page index `i % 5`.
  1. *How many dots* — `dots()` SVG, dice layout for n≤6 else seeded jitter scatter. **Each dot is tappable**: `pointerdown` marks it permanently with its ordinal numeral and plays an ascending tone, so double-counting is impossible and one-to-one tagging is explicit and animated. Answer = 4-choice numeral row.
  2. *What comes next* — `1, 2, 3, __`, 4-choice.
  3. *Give N* (`tap`) — a tray of 10 identical plain discs, a basket, "tap exactly 6". Running count shown in the basket; submit checks the count.
  4. *Which is Nth* (`ordinal`) — a row of 6 identical plain glyphs with a left-edge start arrow so ordinal direction is unambiguous; "tap the 4th".
  5. *Which is more* (`compare`) — two numerals in equal panels. **On answer a 0–10 number line animates in** with both numbers ticked: "9 is further right, so 9 is more." Elaborated feedback with a reusable reference point, never a bare verdict.
- **Generator:** seed varies dot count (3–9), sequence start (1–15), N (2–8), ordinal position (1–6), and the compare pair drawn from a precomputed ratio-band pool (never equal). Progression: pages 1–4 quantities ≤6 and ratio band *large* (≤0.5); pages 5–7 to 10, band *medium* (0.5–0.75); pages 8–10 to 20, band *small* (>0.75, i.e. adjacent pairs like 7 vs 8).
- **Printable:** 10 items, 2 columns, 24 pt. Dots printed as stroke-only circles at 96 px. Give-N becomes "draw 6 counters in this frame" over a blank ten-frame outline. Ordinal becomes "circle the 4th one" over a printed row. Compare becomes "write `<` or `>`" with a `< >` bank to circle. Answer key on its own trailing page, identical layout, answers in the boxes, and the grown-up line in the footer.
- **roam_link:** `roamAlpaca:cat1`; `roamMagpi:symbolic`
- **Evidence:** WWC 2013 Rec 1 (Moderate — the only recommendation in that guide above Minimal) specifies exactly this progression: subitize → meaningful object counting → counting-based comparison → number-after → **mental comparison of neighbouring numbers**, which is why the last pages are adjacent pairs. Symbolic comparison correlates r=.302 with math competence vs .241 for non-symbolic (Schneider 2017, 284 effect sizes, n=17,201). Counting with one-to-one correspondence predicted **larger** effects in the early-numeracy metaregression (weighted g=0.64), which is why the tagging is an animation and not just a total.

#### 2.2 `number-friends` — Number Friends
**book · K · Number bonds to 10**

- **Skill:** the two parts that make a whole, in both directions; missing part; all decompositions of 10.
- **CCSS:** K.OA.A.3, K.OA.A.4
- **Mechanic:** `bond` type. Singapore "cherry" bond drawn as SVG (whole circle, two branches, two part circles) with one part blank, and a ten-frame beside it filled to the *shown* part — the empty cells **are** the answer. Input is 4-choice for pages 1–5, keypad from page 6 (scaffold fades). Wrong answer → the frame fills the missing cells one at a time with the count spoken, then the bond completes. Roughly half the items are written with the total first (`10 = 7 + 3`) to build equal-sign flexibility.
- **Generator:** whole = 10 for pages 1–4, then drawn from {5,6,8,10}; part a ∈ 1..whole−1; blank side random. Progression: 1–4 whole 10 with choices; 5–7 mixed wholes with choices; 8–9 typed answer; 10 both-addends-unknown ("find two different ways to make 8" — divergent, many answers).
- **Printable:** 10 bonds, 2 columns, each with a partially filled stroke-only ten-frame. Lower third: an "all the ways to make 10" table, 6 rows of `__ + __ = 10`.
- **roam_link:** `fluencyArf:sum`; `roamAlpaca:cat1`
- **Evidence:** WWC 2021 Rec 3 (representations, **STRONG**, k=28) asks for a small set used consistently across grades — the ten-frame appears here, in G1 make-ten, and in G2 place value unchanged. IM devotes an entire section (K U5 §C) to decomposing 10 alone; pairs to ten underwrite every make-ten strategy that follows. Presented as a bond rather than a sum so the *relationship* is visible rather than procedural.

#### 2.3 `shape-sorter` — Shape Sorter
**book · K · Flat and solid shapes**

- **Skill:** name flat shapes independent of orientation; count sides and corners; distinguish examples from non-examples.
- **CCSS:** K.G.A.2, K.G.A.3, K.G.B.4
- **Mechanic:** three modes — (a) name the shape, 4-choice, where the shape is drawn at a **seeded rotation** so orientation is decoupled from name; (b) count sides, `input`; (c) *which one is not a triangle*, a 2×2 image grid with one non-example (curved side, or an open figure). All shapes are `<path>`/`<rect>`/`<circle>`, `fill=none`, stroke 3.5 screen / 2.4 print.
- **Generator:** seed picks shape from {circle, square, triangle, rectangle, hexagon}, rotation 0–350°, and the distractor set. Progression: 1–3 upright canonical; 4–6 rotated; 7–8 non-examples plus one open item ("draw a shape with 4 sides").
- **Printable:** 8 items, 2 columns, shapes printed at exactly the seeded rotations; final two items give a 1.4 in draw box.
- **roam_link:** `roamAlpaca:cat1`
- **Evidence:** stated honestly — WWC 2013 rates geometry-by-progression **Minimal**, so this is required standards coverage, not an efficacy claim. The one evidence-driven choice is the **examples-and-non-examples** technique WWC 2013 Rec 1 specifies for concept formation ("that's four toys, not three toys"), applied to shape rather than number, plus rotation variance so a triangle on its point is still a triangle.

#### 2.4 `great-race` — The Great Race
**game · K · Counting and cardinality** — *K flagship*

- **Skill:** count **on** along a linear numbered board; number as distance.
- **CCSS:** K.CC.A.2, K.CC.B.4, K.CC.C.7
- **Mechanic:** a faithful clone of the Siegler & Ramani board, and the details are load-bearing.
  - 10 **equal-size** squares in a horizontal row, numerals 1–10 increasing **left to right**, each square a distinct outline tint (no fills), `Start` immediately left of 1 and `End` immediately right of 10.
  - Spinner: SVG circle split into two halves labelled **1** and **2**; press → eased `rotate` transform (600 ms cubic-out) landing on the seeded value.
  - **The token never auto-slides.** The child must tap each square in turn; the tapped numeral scales 1→1.25 and is spoken. The response is the *array* of square numbers named; `isCorrect` requires the exact count-on sequence.
  - Tapping `1, 2` (counting moves instead of naming squares) is the **documented common error** and gets its own correction: the app names the squares and asks the child to repeat while the token moves — "count on from 3: four, five." No generic red X.
  - The character takes alternate turns. The game **always plays to completion** so the whole range is traversed.
  - Stage 2 (`?stage=2`): the 0–100 board as a 10×10 **column-aligned** matrix — 1 bottom-left, 11 directly *above* 1, so rows are decades and columns are units. Spinner 1–5. Background tint deepens every two rows. This is deliberately **not** the Chutes-and-Ladders serpentine.
- **Generator:** the seed drives the whole spin sequence for both players, so the printable can print the identical spins. Progression: rounds 1–4 start within 3 of Start; 5–8 mid-board; 9–12 within 2 of the end, so landing exactly matters and "you need a 1" reasoning appears.
- **Printable:** the board full width (7.0 in, 0.62 in squares), a paperclip-and-pencil spinner to cut out, **plus a pre-rolled spin strip generated from the same seed** ("your spins: 2, 1, 2, 2, 1 …") so no spinner is needed and paper matches screen exactly. Two 1-bit tokens to cut out. A 12-row turn log: `I was on ___ | I spun ___ | I said ___, ___ | now I'm on ___` — which is what forces the count-on verbalisation onto paper.
- **roam_link:** `roamMagpi:numberline` block `0_20`; `roamAlpaca:cat1`
- **Evidence:** the strongest causal evidence in the catalogue, *and* the clearest documented null. Siegler & Ramani 2009 (N=88, four to five 15-min sessions, ~1 hour total): number-line PAE 29%→21%, **d=1.01**; the *same game on a circular board* 29%→26%, d=0.43, with **no** gain on magnitude comparison; a numerical-activities control, nothing. Ramani & Siegler 2008: the colour-square version of the identical game improved **nothing on any measure**; gains held 9 weeks. Laski & Siegler 2014: count-on vs count-from-1 was the only manipulation, and count-on produced roughly **double** the gains. Hence every constraint above — linear, equal squares, numerals visible, count-on enforced, no loop. Expectations set at the pooled meta g=0.21 (Nelson 2025), not the original d.

#### 2.5 `ten-frame-flash` — Ten-Frame Flash
**game · K · Counting and cardinality**

- **Skill:** perceptual → **conceptual** subitizing ("five and two", not "one, two, three…").
- **CCSS:** K.CC.B.4, K.CC.B.5, K.OA.A.3
- **Mechanic:** flash-and-recall. Show a ten-frame (2×5, filled left→right, top row first) or a structured/scattered dot card for `flashMs`, blank it, then take a 4-choice numeral (K) or keypad entry. **On reveal the same image returns with a decomposition overlay** — a bracket round the full row of five and another round the remainder, labelled "5 and 2". Follow-up tap, logged but never scored: "how did you see it — five and two, or counted them?" Frame and scatter items alternate so frame position alone cannot carry the answer. Strategy card before Start and one tap away during play: *"A full row is five. Seven is five and two."*
- **Generator:** seed picks n and arrangement (canonical frame / frame with a gap / dice pattern / seeded scatter). Progression: rounds 1–4 n=2–5 at **900 ms**; 5–8 n=3–7 at **650 ms**; 9–12 n=4–10 at **450 ms**. `?stage=2` = double ten-frame, teens, for grade 1.
- **Printable:** paper cannot flash, so three named twins ship in this family — (i) a **cut-out flash-card page**, 8 frames, numeral on the reverse, for the grown-up to hold (default for K); (ii) a **fold-flap** page where each frame hides under a fold-down strip; (iii) a **30-frame speed sheet** with a "my time" box and a 5-session meet-or-beat strip (default for grade 1+).
- **roam_link:** `roamAlpaca:cat1`
- **Evidence:** brief exposure *is* the mechanism — a pattern left on screen gets counted one at a time, which trains counting (Clements & Sarama's "quick images": ~10 s per exercise, ~3 min/day). Groupitizing is real and school-age dependent: kindergartners show **no** grouping benefit, grade 1 is the first to show it, and the size of a child's grouping benefit **uniquely predicts** symbolic arithmetic fluency (Starkey & McCandliss 2014, N=378); grouping by proximity or colour raises numerosity precision up to 20% (Anobile 2020). Honest caveat, stated on the page: **no RCT isolates the ten-frame itself**; it is justified as an instance of WWC 2021 Rec 3's frozen representation set. Quantities are exact, small, structured and always mapped to a numeral — this is deliberately *not* ANS dot-cloud training, whose transfer to symbolic math is g=0.11 (ns), −0.04 after bias correction (Qiu 2021).

---

### GRADE 1

#### 2.6 `adding-to-twenty` — Adding to Twenty
**book · 1 · Addition and subtraction to 20**

- **Skill:** named strategies within 20 — count on from the larger, doubles, doubles ±1, make ten, take from ten — and the inverse relationship.
- **CCSS:** 1.OA.C.6, 1.OA.B.4, 1.OA.D.8
- **Mechanic:** every chapter is a **worked example → minimal twin → 6 items** sequence. The example is a 1 pt boxed panel with every step shown and labelled (8+6 → 8+2=10 → 10+4=14, with a double ten-frame animating two counters crossing into the second frame). The twin is the identical layout with **one number changed** and blank. The strategy name sits in the margin of every item and the hint is one tap. Items are `input` with a keypad; missing-addend items move the blank (`8 + __ = 14`), randomised so the child cannot learn "the answer goes last".
- **Generator:** seed picks the pair inside the chapter's constraint set — doubles `n+n`; near doubles `n+(n±1)`; make-ten `a+b` with `a+b>10, a≥6`; take-from-ten `1x−y`. Progression: pages 1–2 within 10; 3–4 doubles; 5–6 near doubles; 7–8 make ten (crossing ten = ARF bin A4); 9 subtraction within 20 via take-from-ten; **10 = interleaved, no two consecutive items sharing a strategy.**
- **Printable:** 12 items, 3 columns, 20 pt, with the worked example reproduced at the top of the sheet so the parent has the method. 3 work lines per item from page 7. The last sheet is the **8-item interleaved review** (Rohrer's exact template).
- **roam_link:** `fluencyArf:sum`, `fluencyArf:minus`; `roamAlpaca:cat2`
- **Evidence:** the biggest single lever in the fluency literature is not the timer, it is the strategy: WWC 2021's own contrast of fluency-**with**-strategy against fluency-without produced **g=1.48 vs g=0.37**. Worked-example effect (Sweller & Cooper 1985 — examples beat problem solving, and the problem-solving group took almost **six times** longer with more errors), delivered as example–problem pairs with backward fading. Instruction-first, because problem-solving-before-instruction reverses for grades 2–5 (Sinha & Kapur 2021, 53 studies) and was outright *worse* than instruct-first with second graders unless a knowledge-application step followed (Loehr 2014).

#### 2.7 `tens-and-ones` — Tens and Ones
**book · 1 · Place value to 100**

- **Skill:** two-digit numbers as tens and ones; the ten-for-one trade; non-standard decompositions; 10 more / 10 less.
- **CCSS:** 1.NBT.B.2, 1.NBT.B.3, 1.NBT.C.4, 1.NBT.C.5
- **Mechanic:** `baseTen()` widget, stroke-only rods and unit squares. Two directions: read a picture → type the numeral; and **build** a numeral by dragging rods and units into a two-column mat (pointer drag, snap to column, occupancy counted). The critical constraint: **a rod is not splittable.** To get ten ones you must drag a rod onto the *trade pad*, which animates it separating into ten units over 300 ms. That interaction **is** the lesson. Page 9 requires a *non-standard* decomposition ("show 34 another way") and rejects `3 tens 4 ones`.
- **Generator:** seed picks the target (11–99), the decomposition style, and the direction. Progression: 1–3 read (no trade); 4–6 build (no trade); 7–8 trade required; 9–10 ±10 and non-standard decomposition.
- **Printable:** 12 items, 2 columns — printed rod-and-unit pictures to label, and numerals with an empty two-column mat to draw into ("draw rods and squares"). One item asks for two different ways.
- **roam_link:** `roamAlpaca:cat2`; `fluencyCalf:add-nocarry`
- **Evidence:** IM G2 U2 L5's affordance lesson, ported: connecting cubes can be physically broken, base-ten blocks cannot, so a ten must be **traded** — and in a digital manipulative you control the affordance precisely, which teaches regrouping better than any explanation. IM G1 U4 §D teaches non-standard decompositions deliberately, and that is the conceptual prerequisite for borrowing (see the CALF `sub-borrow` route in §3). WWC 2021 Rec 3, STRONG.

#### 2.8 `halves-and-quarters` — Halves and Quarters
**book · 1 · Shapes and halves**

- **Skill:** partition circles and rectangles into 2 and 4 equal shares; *equal* means equal **size**, not equal shape; halves/fourths language; first appearance of the 0–1 line.
- **CCSS:** 1.G.A.2, 1.G.A.3, 2.G.A.3 (stretch)
- **Mechanic:** **drag-to-partition.** A shape carries 1–3 draggable cut lines; the child drags each one and the app computes the resulting areas **analytically** (closed form for rectangle and circle cuts — never pixel counting) and accepts only equal shares within 2%. Then a **card sort**: 8 tiles into three bins — *halves / fourths / not equal parts* — as touch drag with three drop zones. Final chapter: mark ½ on a 0–1 line by folding a strip (animated fold on screen; a real fold on paper).
- **Generator:** seed picks shape, share count (2 or 4), required cut orientation, and the distractor tiles — including the two engineered non-examples: a rectangle cut into two *unequal* parts (false), and a rectangle cut **diagonally** into two equal-but-differently-shaped parts (**true** — this is the item that teaches what "equal" means).
- **Printable:** 8 items — shapes to cut with a pencil line, plus a cut-and-sort tile strip and three labelled bins to glue into.
- **roam_link:** `roamAlpaca:cat2`
- **Evidence:** WWC 2021 Rec 4's fraction on-ramp is *literally* paper-strip folding into halves then fourths, marked on a 0–1 segment — so grade-1 shape partitioning is built as **step one of the number-line progression**, not as a separate geometry topic. Card Sort is IM's cheapest high-value routine: no numeric input, no keyboard, touch-native, and it prints as a cut-out with zero extra design work.

#### 2.9 `number-line-hop` — Number Line Hop
**game · 1 · Place value to 100**

- **Skill:** place a number on an unmarked line; magnitude estimation; skip counting as a composed unit.
- **CCSS:** 1.NBT.B.3, 2.NBT.A.4, 2.MD.B.6, 3.NF.A.2 (later stages)
- **Mechanic:** the research instrument, gamified — and this is the shell that `decimal-drop` and `mixed-number-line` reuse.
  - One SVG line. Endpoints labelled `0` and `S`. **No interior ticks.** Target numeral printed above centre.
  - `pointerdown` → `value = (x − x0) / (x1 − x0) × S`. **Nothing snaps.**
  - On commit: the child's tick renders, then the true tick animates in with the gap shaded and **the nearest benchmark named**: "50 is exactly halfway — you were 12 to the left of 63."
  - Score = **PAE** = |est − T| / S × 100. The session also logs **R²** of estimates against true values and the **slope**, which is the progress display.
  - Second mode in the same shell — **hop**: the character jumps in equal arcs of k drawn *above* the line, and the child taps where the next landing goes. (Georgie's bouncing-arc motif is exactly the right art for a composed unit.)
- **Generator:** seed picks the target list — **all targets shown once before any repeat, order shuffled**, per the research protocol — and the hop step. **Stages:** 1) 0–20, targets `1,3,5,7,9,11,13,15,17,19`; 2) 0–100, targets `3,7,14,19,24,32,44,51,63,76,84,98`; 3) 0–1000; 4) hop mode by 2s/5s/10s. Stages 1–2 are linked from grade 1, stages 2–3 from grade 2. Target lists 1 and 2 are **ROAM's own** `0_20` and `0_100` item lists.
- **Printable:** the most faithful twin in the catalogue, because the paper version *is* the original instrument: 6 unlabelled **25 cm** lines per page, `0` and `S` under the endpoints, target 2 cm above centre. **The answer key prints the true tick plus a shaded ±5%-of-scale tolerance band**, so a parent can mark a continuous response without a ruler. The first sheet of each stage carries a "halfway" tick.
- **roam_link:** `roamMagpi:numberline` blocks `0_20` and `0_100`; `roamAlpaca:cat2`
- **Evidence:** WWC 2021 Rec 4, **STRONG**, k=14 — the only representation with a strong-evidence recommendation of its own. Number-line estimation correlates **r=.443** with broad mathematical competence across 263 effect sizes and 10,576 children ages 4–14 (Schneider 2018), and number-line placement accuracy was a *unique* predictor of grade-5 achievement controlling for IQ, working memory and processing speed (Geary 2011). The feedback design follows the specific finding that corrective feedback on estimates improves performance **abruptly — often after a single trial — and broadly across the whole 0–1000 range**, apparently by supplying reference points: hence "name the benchmark", never a verdict.

#### 2.10 `make-ten-race` — Make Ten Race
**game · 1 · Addition and subtraction to 20**

- **Skill:** decompose to a target; combinations of ten; take from ten.
- **CCSS:** K.OA.A.4, 1.OA.B.3, 1.OA.C.6
- **Mechanic:** target-sum combine — Motion Math's *Hungry Fish* mechanic, de-skinned. A target numeral at the top; 5–7 numbered **plain** discs drifting on linear tweens (no physics). Drag one disc onto another → they **merge into their sum** with a 200 ms scale pulse. Land on the target to score. Overshoot dissolves the merged disc back into its parts — an undo, not a failure. Many decompositions satisfy one target, so the task is **divergent and self-levelling**: the child who knows 6+4 and the child who does 5+3+2 both succeed. Stage 2, *take from ten*: the target is a difference and discs are subtracted.
- **Generator:** seed picks the target and the disc pool, guaranteeing **at least two distinct solutions** and at least one three-disc solution. Progression: rounds 1–4 target 10, pool contains an exact pair; 5–8 target 10, pool forces three discs; 9–12 targets 11–20 crossing ten (ARF bin A4); stage 2 subtraction.
- **Printable:** the target in a circle with a numeral pool around it and arrows to draw between pairs; an "all the ways" table (8 rows of `__ + __ = 10`); and the IM **Check It Off** board — a 0–20 strip where you draw two digit cards, compute, check the value off, and **write the expression** next to it. Check It Off is self-differentiating because the child hunts for specific targets rather than answering a fixed row.
- **roam_link:** `fluencyArf:sum`, `fluencyArf:minus`
- **Evidence:** one of only two consumer game mechanics in this whole landscape with a positive randomised trial — Riconscente 2013 (*Games and Culture*), 122 grade-5 students, randomised crossover, 20 min/day × 5 days: **+15%** on a fractions test, p<.001, **η²=.387**, plus +10% on attitudes and self-efficacy, off a total dose of 100 minutes. The transferable property is that **the game action is the mathematical operation** — combining two quantities *is* addition. Divergent targets also hold the success rate near the 80–85% band (Wilson 2019) with no stored state.

---

### GRADE 2

#### 2.11 `place-value-palace` — Place Value Palace
**book · 2 · Place value to 1,000**

- **Skill:** three-digit place value; expanded form; compare and order — including the specific two-digit comparison traps.
- **CCSS:** 2.NBT.A.1, 2.NBT.A.3, 2.NBT.A.4, 2.NBT.B.8
- **Mechanic:** four chapters — (a) read a base-ten picture → numeral; (b) numeral → expanded form in three boxes; (c) compare with `< > =` (three buttons), where **on answer both numbers land on a shared 0–1000 line**; (d) order three numbers by dragging cards into slots.
- **Generator:** seed picks the numbers and, for (c), the **trap family** — drawn straight from MagPI's bins: *decade-compatible* (68 vs 24), *decade-**incompatible*** (71 vs 25; 65 vs 49), *ones-compare/tens-matched* (36 vs 37), *tens-compare/ones-matched* (92 vs 32), *reversed digits* (73 vs 37; 68 vs 86). Progression: pages 1–3 within 100; 4–6 within 1000; 7–8 **incompatible and reversed only**; 9–10 order-three plus "10 more / 100 more".
- **Printable:** 18 items, 3 columns, 18 pt — base-ten pictures to label, expanded-form blanks, and a comparison column with a printed `< > =` bank to circle.
- **roam_link:** `roamMagpi:symbolic`; `roamAlpaca:cat2`
- **Evidence:** MagPI's bins are a **diagnostic map, not a difficulty ramp** — decade-incompatible pairs and reversed digits are the documented two-digit errors, so we practise those rather than random pairs. This is the clearest case of ROAM earning its place in the content: the corpora tell us which cases are genuinely hard. Underneath, the **symbolic** distance effect (not the non-symbolic one) is what tracks individual differences in 6–8 year olds' achievement (Holloway & Ansari 2009).

#### 2.12 `carry-and-borrow` — Carry and Borrow
**book · 2 · Add and subtract within 100 and 1,000**

- **Skill:** multi-digit addition and subtraction with and without regrouping, in columns, plus the regrouping **judgment**.
- **CCSS:** 2.NBT.B.5, 2.NBT.B.7, 2.NBT.B.9; 3.NBT.A.2 (stage 3)
- **Mechanic:** the chapters map **1:1 onto CALF's `skill` field**.
  - **Chapter 0 — the regrouping judgment.** "Will this one need a trade?" Two buttons, no computing, 10 items in 20 s. It is the fastest diagnostic in the product and it costs one screen.
  - **A1** add without carry → **A2–A4** add with carry → **S1** subtract without borrow → **S2** subtract with borrow.
  - Column layout: right-aligned digit cells, a carry strip above the tens column, and a `borrow` gesture on the minuend digit that decrements it and prepends a 1 while the base-ten picture mirrors the trade.
  - Wrong answers get elaborated feedback anchored on the picture: "you have 12 ones — ten of them become one ten."
- **Generator:** operands are drawn inside **ROAM's own bin ranges**: A1 11–88 no carry; A2–A4 11–99 with carry; S1 12–99 no borrow; S2 20–98 with borrow. Progression: pages 1–2 judgment only; 3–4 A1; 5–6 A2; 7–8 S1; 9–10 S2; page 11 = **8-item interleaved review across all four**. Stage 3 (`?stage=3`) extends every bin to three digits for grade 3.
- **Printable:** 18 items, 3 columns, **vertical** format with faint 0.4 pt **grid support** so digits align, 3 work lines each. Variants: **left-handed** (carry strip and headings mirrored so the writing hand does not cover them) and **large print** (24 pt, 8 items).
- **roam_link:** `fluencyCalf:add-nocarry`, `add-carry`, `sub-noborrow`, `sub-borrow`; `roamAlpaca:cat2`
- **Evidence:** CALF exists precisely to separate carry from no-carry and borrow from no-borrow — 11,419 items with an explicit skill field — so a book whose chapters *are* those bins is the single most direct score→practice link in the catalogue. WWC 2021 names the regrouping-judgment task (decide before solving) as a grade-2-and-up fluency subtask. Grid support, left-handed and large-print variants are lifted from Math-Drills' shipped variant set, where "Large Print" measures as: same page, one quarter of the items, 1.5× type, 2× row pitch.

#### 2.13 `arrays-and-equal-groups` — Arrays and Equal Groups
**book · 2 · Arrays and equal groups**

- **Skill:** even and odd by pairing; rows and columns; an array total as repeated equal addends — the on-ramp to multiplication.
- **CCSS:** 2.OA.C.3, 2.OA.C.4; 3.OA.A.1 (stretch)
- **Mechanic:** **build-with-tiles.** A blank 10×10 grid; the child drags a rectangle's bottom-right handle to set rows × columns (snapping to cells) and the app writes the repeated-addition sentence live (`4 + 4 + 4 = 12`), adding the multiplication sentence from page 6. Second mode, **pair-up**: tap counters two at a time to pair them; a leftover counter *is* the definition of odd. Third mode, the **barrier task** (IM G3 U2 L4 "What Did I Create?") in single-player form: a rectangle is described only in words ("5 rows of 3") and the child builds it unseen, which forces precise row/column language.
- **Generator:** seed picks rows × cols (2–6 early, up to 5×10 later), the even/odd number (5–20), and the described rectangle. Progression: 1–2 even/odd; 3–5 build and write repeated addition; 6–8 both sentences, with a **commutativity page** placing 3×4 and 4×3 side by side.
- **Printable:** 18 items, 3 columns — printed dot arrays to label with rows/cols against a sentence frame; blank grids to draw a named array into; a "circle the pairs" even/odd row.
- **roam_link:** `roamAlpaca:cat2`
- **Evidence:** IM G2 U8 §B is exactly this on-ramp — arrays with rows and columns, totals expressed as sums of equal addends. The array is the third member of the frozen representation set and becomes the area model in grade 3 (WWC 2021 Rec 3, STRONG, k=28: general math achievement 0.64, whole-number computation 0.43). Commutativity is *observed* — 3 groups of 4 beside 4 groups of 3 — which is Marilyn Burns' Circles and Stars logic rather than a stated rule.

#### 2.14 `decade-duel` — Decade Duel
**game · 2 · Place value to 1,000** (staged K→5)

- **Skill:** speeded symbolic comparison, graded by ratio and by place-value trap.
- **CCSS:** K.CC.C.7, 1.NBT.B.3, 2.NBT.A.4, 4.NF.A.2, 5.NBT.A.3
- **Mechanic:** two-alternative forced choice. Two numerals in equal panels; tap, or ←/→. Time pressure is a **shrinking bar across the panel**, not a countdown clock — diegetic pressure, as in The Number Race, and **absent entirely at stages 1–2**. Which side holds the larger value is counterbalanced by seed. Feedback: correct = 90 ms lime pulse; wrong = both numbers **drop onto a shared number line** with the gap marked. Reaction time is recorded, so the progress display is **the child's own distance effect** ("far pairs 0.7 s, near pairs 1.4 s") — their own curve, never another child's.
- **Generator:** the pair is drawn from a **precomputed pool per stage** (no rejection loop, no possibility of an equal pair). **Stages:** 1) single digit, ratio ≤0.5; 2) single digit, ratio >0.75 (adjacent); 3) two-digit decade-compatible; 4) two-digit decade-**incompatible**; 5) matched tens / matched ones / reversed digits; 6) decimals and fractions (0.7 vs 0.65; 0.4 vs 0.40; 3/5 vs 4/7). Within a round, an adaptive staircase targets **75–85%** trailing success over the last 20 trials, stepping the ratio band and the deadline.
- **Printable:** a 40-pair page in 2 columns, "circle the one that is more" — which is literally how the research instrument was administered (a 20-page booklet, two numbers per page) — plus a box for the grown-up to write elapsed seconds and a 5-session meet-or-beat strip.
- **roam_link:** `roamMagpi:symbolic`
- **Evidence:** symbolic is the right target (r=.302 vs .241 non-symbolic, Schneider 2017) and the symbolic distance effect is the one that predicts achievement (Holloway & Ansari 2009). The staircase is The Number Race's published engine — distance × deadline × conceptual complexity, 75% target success computed over a rolling 20 trials — minus the stored matrix, which we cannot keep in a stateless product. Explicitly **not** dot clouds: ANS training transfer is g=0.11 (ns), −0.04 corrected, with no moderation by training type or duration (Qiu 2021, 11 studies).

#### 2.15 `close-to-hundred` — Close to 100
**game · 2 · Add and subtract within 100 and 1,000** (staged, grades 1–5)

- **Skill:** build two numbers from digit cards to land as close as possible to a target; place-value judgment; estimate then adjust.
- **CCSS:** 2.NBT.B.5, 2.NBT.B.6; 3.NBT.A.2, 4.NBT.B.4, 5.NBT.B.7 (by stage)
- **Mechanic:** TERC *Close to 100*, faithfully.
  - Deal **6** digit cards from a seeded 44-card deck (0–9 ×4 plus 4 wilds). The child drags **4** of them into four slots forming two 2-digit numbers; the running sum updates live.
  - **Score = |sum − 100|.** The two unused cards **carry over**. Deal four new. **Five rounds. Lowest total wins.**
  - Lowest-wins is the whole point: **care beats speed**, so this is the fluency game that needs no clock at all.
  - After each round the app brute-forces the ≤360 arrangements of that hand and shows the best possible ("it was possible to get 1") — *after* the child has committed, never before.
- **Generator:** the seed **is** the deck shuffle, so paper and screen deal identical hands. **Stages** (the IM *How Close?* ladder, one mechanic across grades 1–5): 1) Close to 10 — pick 5, use 3, single digits; 2) Close to 20; 3) **Close to 100** — pick 6, use 4, two 2-digit; 4) Close to 1000 — pick 8, use 6, two 3-digit; 5) Close to 0 with **signed** scoring (+5 / −1), an integers on-ramp; 6) Close to 1 with decimal cards; 7) Close to 5 with fraction cards.
- **Printable:** this *is* a paper game. Print the digit-card deck to cut out; the TERC recording sheet (five rows of `Round n: ___ + ___ = ___   Score ___` and a TOTAL box, **two games per page**); and the pre-dealt hands from the same seed for solitaire play. The key gives the optimal arrangement of each dealt hand.
- **roam_link:** `fluencyCalf:add-nocarry`, `fluencyCalf:add-carry`; `roamAlpaca:cat2`
- **Evidence:** the IM Centers **stage pattern** is the same idea as a seeded generator, already validated across the grade band by long classroom use — evidence tier stated honestly as **Tier 3: published rules, decades of classroom use, no RCT.** What earns it a slot anyway is the win condition: it rewards estimation, place value and flexible decomposition rather than recall speed, which is precisely IM's three-stage fluency progression, and it is **self-scoring** (no grading) with a natural parent-and-child two-player mode — the one feature that actually helped in the games-and-anxiety meta-analysis, where collaborative non-digital play beat digital play (ES −0.13 for digital games alone).

---

### GRADE 3

#### 2.16 `times-table-tower` — Times Table Tower
**book · 3 · Multiplication and division**

- **Skill:** multiplication and division facts to 100, **derived from the inverse relationship** rather than memorised in isolation.
- **CCSS:** 3.OA.A.1, 3.OA.A.2, 3.OA.B.5, 3.OA.B.6, 3.OA.C.7
- **Mechanic:** chapters sequenced **by fact family, not by table order**: 0s and 1s → 10s and 5s → 2s and 4s → squares → 3s and 6s → 9s (with the digit-sum pattern surfaced) → 7s and 8s → **mixed discrimination**. Each chapter runs array/area picture → equal groups → the **four-equation family from one triple** (`a×b`, `b×a`, `ab÷a`, `ab÷b`) → symbols only. Division appears in both meanings explicitly, labelled: *how many in each group* (partitive) and *how many groups* (quotitive).
- **Generator:** seed picks the triple inside the chapter's factor set and which of the four equations is asked. Progression: 1–4 picture-supported; 5–7 symbols only; 8–9 missing factor and missing divisor; 10 = 8-item interleaved review across all families.
- **Printable:** 21 items, 3 columns, 16 pt, plus a **fact-family triangle** column (whole at the apex, parts at the base, one vertex blank) with a four-line box beside each. Page 2 is the **Five Minute Frenzy** 10×10 grid — write the product of each row and column header, 100 facts in one compact self-checking artifact — with a personal-best strip and *no* comparison to anyone.
- **roam_link:** `fluencyArf:mult`, `fluencyArf:div`; `roamAlpaca:cat3`
- **Evidence:** IM G3 U4 §B derives single-digit fluency **from** the multiplication/division inverse relationship, not from memorisation first. Fact-fluency interventions pool at **g=0.76** (Douglas 2026: 35 group designs, 178 effect sizes), with two moderators we act on: covering **both** additive and multiplicative operations beat additive-only, and **30+ sessions** beat fewer than 10 — which is the argument for a 10-page book *plus* a game rather than one sheet. Transfer to word problems is only g=0.25, so word problems are a separate strand and this book does not claim them.

#### 2.17 `fraction-number-line` — Fraction Number Line
**book · 3 · Fractions on the number line**

- **Skill:** unit fractions built by **iteration** on a 0–1 line; naming; comparing; equivalence by co-location; whole numbers as fractions.
- **CCSS:** 3.NF.A.1, 3.NF.A.2, 3.NF.A.3
- **Mechanic:** five chapters.
  1. **Fold and partition.** A 0–1 segment and a *fold* button that halves the current partition (1→2→4→8), drawing and labelling `k/d` at each step. Then a direct d-way partition for **odd** denominators (3, 5, 6), where halving does not work.
  2. **Iterate the unit fraction.** Tap to lay 1/4 lengths end to end and watch 3/4 get **built** — a non-unit fraction as three copies of a unit fraction.
  3. **Place with no snapping.** Drag a fraction chip to a real position, scored by PAE exactly as the whole-number line is.
  4. **Equivalence by re-partitioning.** The *same* line is re-partitioned into halves, then fourths, then eighths, so 1/2, 2/4 and 4/8 resolve to **one point**.
  5. **Locate 1** — the inverse item. The line shows only `0` and `2/3` (or `5/4`, or `11/8`) and the child must locate 1.
- **Generator:** denominators from **{2,3,4,6,8}** (IM's grade-3 restriction), numerator including >d for the 0–2 stage, plus which mode. Progression: 1–2 halving; 3–4 odd denominators; 5–6 iterate and name; 7–8 place (PAE) and equivalence; 9–10 locate-1, **including 5/4 and 11/8 which are greater than 1**, so the child must reason backwards past the whole.
- **Printable:** pre-partitioned lines to label (halves, fourths, fifths, eighths); a **fraction-strip page to cut and fold** — the cheapest concrete manipulative a home printer can make; a cut-and-glue page of fraction cards to place on a printed 0–2 line; and the locate-1 items with only 0 and the given fraction marked. Key uses the ±5%-of-scale tolerance band.
- **roam_link:** `roamMagpi:numberline` block `0_1`; `roamAlpaca:cat3`
- **Evidence:** the highest-value activity in the product on the evidence, and it is also a literal ROAM construct. WWC 2021 Rec 4 (STRONG) reports rational-number effect sizes of **1.46** (computation), **1.00** (magnitude understanding) and 0.62 (knowledge). Fuchs's *Fraction Face-Off!* built on the **measurement interpretation** produced ES 0.29–2.50 with improvement in that interpretation **mediating** the effect (N=259 at-risk grade 4), and WWC-reviewed improvement indices of +33/+31/+24. Number-line/achievement correlations are strongest for fractions (Schneider 2018). Three of WWC's specific instructions are followed literally: **include odd denominators** (children over-generalise from halving), **go past 1**, and teach equivalence as different names for the **same point**. Chapter 5 is IM G3 U5 L9 — the inverse task, which is cheap to generate from the forward item and dramatically harder to fake procedurally.

#### 2.18 `area-and-perimeter` — Area and Perimeter
**book · 3 · Area and perimeter**

- **Skill:** area as tiled square units → rows × columns → composite figures; perimeter as distance around; and the explicit contrast between them.
- **CCSS:** 3.MD.C.5, 3.MD.C.6, 3.MD.C.7, 3.MD.D.8
- **Mechanic:** IM's staging, made interactive. (a) Fully tiled rectangle, count the squares, with a *count by rows* helper that highlights one row at a time. (b) Rectangle with **side lengths labelled only**. (c) Composite of two non-overlapping rectangles with a **decompose gesture** — drag a cut line, the app labels both parts and sums them. (d) Perimeter: tap each side in turn; the tapped side goes solid and its length accumulates. (e) **The contrast page** — same figure, two questions, plus "which one needs square units?" Then the missing-side item: perimeter given, find the unknown side.
- **Generator:** seed picks side lengths (2–12), the composite split point, and the unit (square cm / in / ft / m). Progression: 1–2 tiled; 3–4 labelled sides; 5–6 composite; 7–8 perimeter; 9–10 mixed with **units required in the answer** ("18 square cm", not "18"), plus one open item ("design a rectangle with perimeter 24" — many answers).
- **Printable:** 21 items; grid figures at 0.24 in cells, stroke only; side labels; a units box that must be filled; and a design task on the back with a blank grid.
- **roam_link:** `roamAlpaca:cat3`
- **Evidence:** IM separates area (G3 U2) from perimeter (G3 U7) **by five units** and then contrasts them explicitly — a structural sequencing decision that is free to copy and directly reduces the classic confusion. The area model is the frozen representation that becomes fraction multiplication in grade 5. Honest note: area/perimeter has **no isolating efficacy trial**; this is standards coverage built on a validated representation, not an effect-size claim.

#### 2.19 `fact-family-forge` — Fact Family Forge
**game · 3 · Multiplication and division**

- **Skill:** retrieve a fact from its family; missing factor and missing divisor; the inverse relationship.
- **CCSS:** 3.OA.A.4, 3.OA.B.6, 3.OA.C.7
- **Mechanic:** **single-player Salute** — the app is the referee. It shows **one** card and announces the **product** (stage 1: the sum); the child names the hidden card. Visually: a triangle, whole at the apex, one part blank; the blank vertex glows and takes keypad input. On answer, **all four equations of the family fan out** from the triangle with a 200 ms stagger — the reveal is the teaching moment, not the score. Clock: 60–90 s, **one item on screen at a time**, only correct answers counted, strategy card ("if 6 × ? = 42, think *what times 6 makes 42*") shown before Start and one tap away during play. Three attempts, personal best only.
- **Generator:** seed picks the triple. Progression: rounds 1–4 from {1,2,5,10}; 5–8 from {3,4,6}; 9–12 from {7,8,9}; **13–16 mixed, so the child must discriminate between families** rather than run a block. Stage 2 = addition/subtraction families, for grade 1–2 use and for ARF `minus`.
- **Printable:** 12 triangles with one corner blank and a four-line box beside each; plus a cut-out double-sided triangle card set for **two-player Salute**, and a referee card listing sums *and* products so a parent can referee without doing the arithmetic.
- **roam_link:** `fluencyArf:mult`, `fluencyArf:div`; `roamAlpaca:cat3`
- **Evidence:** WWC 2021 Rec 6 (**STRONG**, k=27) with all five implementation constraints honoured — 1–5 minutes, already-taught content only, strategy named and reminded before the clock, immediate error correction, self-referenced meet-or-beat. The strategy prompt matters more than the clock (**g=1.48 with** vs **g=0.37 without**). Drill-and-practice **with modelling** produced the largest effects in the component analysis of fact-fluency interventions, and >3 components beat <3 (Codding 2011). One triangle drills three facts across two inverse operations, cutting the flashcard inventory by a third.

#### 2.20 `array-architect` — Array Architect
**game · 3 · Area and perimeter**

- **Skill:** build rectangles for a product; factor pairs; area as multiplication; spatial packing.
- **CCSS:** 3.OA.A.3, 3.MD.C.7; 4.OA.B.4 (stretch)
- **Mechanic:** youcubed's *How Close to 100*. A **shared** blank 10×10 grid. Two seeded dice give a and b; the child places an a×b rectangle **anywhere** on the grid — drag, snap to cells, rejected on overlap (tested against a 100-bit occupancy mask) — and the app auto-writes the number sentence. The character takes alternate turns on the **same** grid. The game ends when no legal placement remains for any possible roll; score = cells filled out of 100. **Placement is the strategy**: you are packing rectangles into shrinking space, so orientation and factor choice matter. Stage ladder (IM *Rectangle Rumble*): factors {1,2,5,10} on 10×10 → 1–5 on 15×15 → 1–10 on 20×20 → whole × fraction on a 24×24 grid representing 16 square units → fraction × fraction on 20×20 representing **1** square unit. One mechanic carries 3.MD.C.7 all the way to 5.NF.B.4.
- **Generator:** the seed **is** the dice sequence, so the printable's roll strip matches the screen exactly. Within a game the grid fills, so later placements are genuinely harder without any difficulty parameter.
- **Printable:** the blank 10×10 grid with a number-sentence column down the right margin and a "squares filled / squares empty" tally at the foot, plus the **pre-rolled dice strip from the same seed** (no die needed) and a cut-out spinner alternative.
- **roam_link:** `roamAlpaca:cat3`; `fluencyArf:mult`
- **Evidence:** passes the one-line test we use to reject skins — *if you could swap the math for spelling words and the game still worked, it is a skin.* Here the game action **is** the area model. The array/area representation is WWC 2021 Rec 3 (STRONG). Evidence tier stated honestly: long classroom use via youcubed and IM Centers, **no RCT**.

---

### GRADE 4

#### 2.21 `long-multiplication` — Long Multiplication
**book · 4 · Multi-digit operations** (stage 4 carries the grade-5 standard)

- **Skill:** multi-digit multiplication by **partial products** and by the **area model**, with the standard algorithm offered and explained but not required.
- **CCSS:** 4.NBT.B.4, 4.NBT.B.5, 4.OA.A.2; 5.NBT.B.5 (stage 4)
- **Mechanic:** three representations of **one** product, always on the same page: an **area diagram** split by place value with each cell labelled with its partial product; the **partial-products list**; and the **standard algorithm column**. The child fills the area cells (`input` per cell), the app sums them, and then the same product appears in column form with the carry digit highlighted and IM's verbatim question: *"Why is there a 1 above the tens column?"* Final chapter: **compare two students** — Kiran's standard algorithm against Diego's partial products for the same product, "how are they alike and different?" as a 3-choice plus one written line.
- **Generator:** operands walk **CALF's M bins**: 2-digit × 1-digit (11–99 × 2–9) → 3-digit × 1-digit → 2-digit × 2-digit → 4-digit × 1-digit. Progression: 1–3 area model with the place-value split pre-drawn; 4–5 partial products, no diagram; 6–7 standard algorithm alongside; 8–9 two-digit × two-digit (four partial products); 10 compare-two-methods plus interleaved review.
- **Printable:** 12 items, 2 columns, vertical format with faint grid support and **8 work lines**. **Page 2 gives blank area-model frames for the same products**, so the child does the identical problem both ways — the transfer bridge made literal, and the answer to a school that teaches the algorithm in grade 4.
- **roam_link:** `fluencyCalf:mult`; `roamAlpaca:cat3`
- **Evidence:** IM's three-stage fluency progression — operate in ways that make sense, then analyse strategies and algorithms, then know and use the standard algorithm — with grade 4 explicitly **not** requiring a particular method and grade 5 owning the algorithm (G5 U4 §A). CALF's M1–M3 ranges set the operands. Compare-two-methods is IM's recurring MP3 task form (G4 U6 L11), it is generatable, and it gives the child an object to reason about without exposing a classmate.

#### 2.22 `equivalent-fractions` — Equivalent Fractions
**book · 4 · Equivalent fractions and decimals**

- **Skill:** equivalence; comparison with unlike denominators; the 1/2 and 1 benchmarks; the tenths/hundredths bridge into decimals.
- **CCSS:** 4.NF.A.1, 4.NF.A.2, 4.NF.C.5, 4.NF.C.6
- **Mechanic:** four chapters.
  1. **Card sort** into `< 1/2`, `= 1/2`, `> 1/2`, followed by generalisation sentence frames as a 3-choice ("a fraction is less than 1/2 when ___") — which converts sorting into a stated rule.
  2. **Benchmark distance ladder** (IM G4 U2 L6): name the fraction, is it more or less than 1/2, **how far** from 1/2 — over lines that deliberately vary the labelled reference: 0–1 by twentieths; 0–2 by fifths; only 1/2 labelled, at the 5th tick; 0–1 by fifths where 1/2 does **not** land on a tick, forcing subdivision.
  3. **Re-partition to find an equivalent** — drag a `×n` handle and watch numerator and denominator scale on the bar **and** the line simultaneously.
  4. **Tenths ↔ hundredths ↔ decimal** on a gridded square and the same line.
- **Generator:** denominators from **{2,3,4,5,6,8,10,12,100}** (IM's grade-4 set) plus the reference labelling. Progression: 1–2 sort; 3–5 benchmark distance; 6–7 equivalence; 8–10 unlike-denominator comparison and decimal conversion.
- **Printable:** 21 items — a cut-and-sort card strip with three labelled bins; benchmark number lines; and a conversion grid (given one form, produce the others: bar, fraction, decimal, words).
- **roam_link:** `roamMagpi:numberline` block `0_1`; `roamMagpi:symbolic`; `roamAlpaca:cat3`
- **Evidence:** we adopt **Fraction Face-Off!'s validated week order**, which is unusual and free: magnitude reasoning and 0–1 ordering in weeks 3–5, **before** equivalence (6–7) and before addition/subtraction (8–9). Most commercial materials sequence this differently. WWC improvement indices +33 / +31 / +24 across three domains. WWC 2021 also names **benchmark-fraction equivalence for 1/2 and 1** as the specific fluency subskill that makes comparing, ordering and estimating on a line possible — tiny item space, large downstream payoff.

#### 2.23 `angles-and-lines` — Angles and Lines
**book · 4 · Angles and lines**

- **Skill:** an angle as a fraction of a full turn; measure and draw with a protractor; classify; angle additivity; parallel, perpendicular, symmetry.
- **CCSS:** 4.MD.C.5, 4.MD.C.6, 4.MD.C.7, 4.G.A.1, 4.G.A.3
- **Mechanic:** the protractor is an SVG group the child **drags onto the vertex and rotates** (rotate handle, or two-finger). It is deliberately as fiddly as the physical tool, because aligning the vertex and the zero line **is** the skill. Reading is numeric input, tolerance ±3°. Draw mode: given 65°, drag a ray until the readout matches. Additivity: an angle split into two parts, one labelled, find the other. Symmetry: tap the lines of symmetry on a figure — each tap draws a dashed line, checked against the figure's true set.
- **Generator:** seed picks the angle in 5° steps (avoiding 90/180 until page 6, then including them), the **vertex orientation** so the protractor must actually be rotated, and the symmetry figure. Progression: 1–2 classify; 3–5 measure upright; 6–7 measure rotated; 8–9 draw and additivity; 10 symmetry, parallel and perpendicular.
- **Printable:** 12 items, with a **cut-out protractor on page 1 printed at true scale beside a 1 in calibration tick** so a parent can verify the print did not scale. Angles printed at exactly the seeded degrees; a draw-the-angle box.
- **roam_link:** `roamAlpaca:cat3`
- **Evidence:** honest note — angles have **no isolating efficacy evidence**; this is standards coverage (IM gives it 15–16 days because the standards require it). One real design decision earns its keep: *"a 1-degree angle is 1/360 of a full turn"* is a fraction statement, so the unit is introduced as **iteration of a unit angle** — the same measurement interpretation that carries the fraction work, which is the frozen-representation discipline applied to geometry.

#### 2.24 `division-descent` — Division Descent
**game · 4 · Multi-digit operations**

- **Skill:** divide multi-digit by one digit using **partial quotients**; interpret the remainder.
- **CCSS:** 4.NBT.B.6, 4.OA.A.3
- **Mechanic:** the partial-quotients **ladder is the game surface** (Flame's climbing motif, literally). The dividend sits at the top; the child picks a chunk from `×10 / ×5 / ×2 / ×1` buttons applied to the divisor; the app subtracts it and stacks the quotient piece on the right. The win condition is reaching a remainder smaller than the divisor. **Efficiency, not speed, is the score**: the number of steps, with the best-possible step count revealed afterwards ("you did it in 5 steps; 3 was possible"). **No clock by default.** Remainder-in-context round: the same quotient asked three ways — how many full boxes, how many left over, how many boxes *needed*.
- **Generator:** divisor 2–9 and dividend inside **CALF's D bins**: D1 22–198 ÷ 2–9 → D2 130–375 ÷ 3–9 → D3 288–891 ÷ 4–9, with an exact-division toggle. Progression: rounds 1–4 exact, D1; 5–8 remainders, D2; 9–12 D3 plus remainder interpretation.
- **Printable:** 12 items, 2 columns, long-division brackets with **10–14 work lines** (the deepest work space in the catalogue) and a partial-quotients column ruled down the right. **The key shows a full worked ladder**, not just the quotient.
- **roam_link:** `fluencyCalf:div`; `roamAlpaca:cat3`
- **Evidence:** IM G4 U6 §C teaches up to 4-digit ÷ 1-digit via partial quotients and requires interpreting the remainder in context; CALF's D bins set the ranges. Scoring on **steps** rather than seconds is the same "lowest score wins" property that makes Close to 100 and Strike It Out survive repeat play, and it satisfies WWC Rec 6's "score correct responses, not attempts" without needing a clock at all.

#### 2.25 `decimal-drop` — Decimal Drop
**game · 4 · Equivalent fractions and decimals**

- **Skill:** place a decimal on an unmarked line; decimal magnitude; the longer-decimal-looks-bigger error.
- **CCSS:** 4.NF.C.6, 4.NF.C.7, 5.NBT.A.3, 5.NBT.A.4
- **Mechanic:** the `number-line-hop` shell retargeted, **plus zoom**. A 0–1 line; the target decimal falls slowly from the top and the child taps where it lands — drop = commit, **nothing snaps**. Button or two-finger **zoom subdivides the visible range by ten** (0–1 → 0.6–0.7 → 0.65–0.66), which is what makes place value spatial rather than nominal. Scored by PAE. Interleaved comparison rounds use the trap pairs: **0.7 vs 0.65**, 0.4 vs 0.40, 0.09 vs 0.1.
- **Generator:** targets walk tenths → hundredths → thousandths; trap pairs drawn from a misconception pool. Progression: rounds 1–4 tenths on 0–1; 5–8 hundredths with one zoom level; 9–12 thousandths with two; comparison traps mixed in from round 5.
- **Printable:** 6 unlabelled 0–1 lines per page with decimal targets above; a **shade-the-grid** page (a unit square gridded to hundredths — given 0.47, shade it; and the inverse, given a shading, write the decimal, **hatched not filled** for ink); and a comparison column of trap pairs.
- **roam_link:** `roamMagpi:numberline` block `0_1`; `roamMagpi:symbolic`; `roamAlpaca:cat3`
- **Evidence:** WWC 2021 Rec 4 explicitly extends the *same* 0–1 line from fractions to decimals and percents so children see that one location has infinitely many names — which is the payoff of the frozen-representation strategy. Number-line estimation's correlation with achievement **grows with age** because it is stronger for rational numbers (Schneider 2018). Zoom-as-place-value is Motion Math Zoom's mechanic, from the one consumer product family with a positive randomised trial.

---

### GRADE 5

#### 2.26 `decimal-place` — Decimal Place
**book · 5 · Decimals to thousandths**

- **Skill:** place value to thousandths; expanded form as place-value products; compare, order, round; all four operations on decimals by place-value reasoning.
- **CCSS:** 5.NBT.A.1, 5.NBT.A.3, 5.NBT.A.4, 5.NBT.B.7
- **Mechanic:** the **multi-representation conversion grid** (IM G5 U5 L3). Each item seeds **one** form and demands the others: a shaded thousandths grid, the decimal, the words, expanded form as a sum of place-value products, and the fraction over 1000. Items are seeded in *different* forms so conversion runs in every direction. **Shade-the-grid mode:** given `(8×0.1)+(3×0.01)+(5×0.001)`, paint a unit square gridded to thousandths (drag across cells; a 10×10 grid of 10-cell strips). **Evaluate-a-claim:** "Mai says 0.105 is (1×0.1)+(5×0.01). Is she right?" with a required reason choice. Then computation chapters where the decimal point is justified **by place value**, never by a rule about counting places.
- **Generator:** seed picks the decimal (tenths → hundredths → thousandths), the seeded form, and the claim from a **named misconception pool**: longer-is-bigger, zero-placeholder-ignored, decimal-points-not-aligned. Progression: 1–3 conversions; 4–5 compare/order/round; 6–7 add and subtract; 8–9 multiply; 10 divide plus interleaved review.
- **Printable:** 28 items, 4 columns, 16 pt, plus one full-width shade-the-grid figure per sheet (**hatched, not filled**) and a conversion table with one column pre-filled per row.
- **roam_link:** `roamMagpi:symbolic`; `roamAlpaca:cat3`
- **Evidence:** the conversion grid and its inverse (give the expanded form, ask for the shading) are IM's own G5 U5 L3 design; **inverse items are cheap to generate from the forward item and dramatically harder to solve procedurally.** The evaluate-a-claim item ships a misconception taxonomy per task, which is exactly the gap the Massachusetts CURATE panel faulted IM K–5 for: "common student misconceptions are not listed."

#### 2.27 `fraction-foundry` — Fraction Foundry
**book · 5 · Fraction operations** — *product flagship*

- **Skill:** add and subtract unlike denominators; multiply fractions; divide with unit fractions; multiplication as scaling.
- **CCSS:** 5.NF.A.1, 5.NF.A.2, 5.NF.B.4, 5.NF.B.5, 5.NF.B.7
- **Mechanic:** four representations of one problem in a fixed order — **number line, then bar, then area square, then symbols**.
  - **Add/subtract:** two bars of different denominators; the child drags a `×n` handle on each until they share a partition, and **only then can they be combined**. The common denominator is *discovered as the shared partition*, not applied as a rule.
  - **Multiply:** an area square partitioned both ways (3/4 across, 2/3 down) with the overlap shaded, so `(a/b)×(c/d) = (a×c)/(b×d)` is read off the picture.
  - **Divide:** tape-diagram equal-groups reasoning for `1/3 ÷ 4` and `4 ÷ 1/3`, with IM's two diagrams side by side — Priya's (the result shown relative to the **whole**) against Mai's (relative only to the **third**) — under "what is the same, what is different?"
  - **Scaling:** compare `3/4 × 8` with `8` **without computing** — a `truefalse` judgment.
- **Generator:** fraction pairs from denominator pool {2,3,4,5,6,8,10,12}. Progression: 1–2 like denominators on the line; 3–4 unlike but related (halves and fourths); 5–6 unlike and unrelated (thirds and fourths); 7 fraction × whole; 8 fraction × fraction on the area square; 9 division with unit fractions; 10 scaling true/false plus interleaved review.
- **Printable:** 28 items, 4 columns, plus one full-width **pre-partitioned 0–2 line** and one blank area square per sheet. The **MLR3 critique item** prints as a boxed piece of wrong work with two response lines: "what questions do you have for ___?" and "how should she fix it?"
- **roam_link:** `roamMagpi:numberline` block `0_2`; `roamAlpaca:cat3`
- **Evidence:** rational-number computation carries the largest effect size anywhere in WWC 2021 — **1.46 [1.35–1.58]** across 10 studies — and the measurement interpretation on a number line was the **mediator** in the strongest fraction RCT (Fuchs 2013, N=259, ES 0.29–2.50). The 0–2 line is ROAM's `0_2` block verbatim (mixed and improper targets). The critique item is IM G5 U3 L12's MLR3 task on Priya's incorrect `1/3 ÷ 2 = 1/2`, whose misconception — naming the piece relative to the third rather than the whole — is the deliberate target. Flagship because a number line is the hardest thing to render well on both screen and paper: if the two-output model survives here it survives everywhere.

#### 2.28 `volume-and-space` — Volume and Space
**book · 5 · Volume**

- **Skill:** volume by counting unit cubes → `l×w×h` → base area × height → additive volume of two prisms.
- **CCSS:** 5.MD.C.3, 5.MD.C.4, 5.MD.C.5
- **Mechanic:** **2.5D isometric SVG, no 3D engine.** A prism is three parallelograms with a visible unit grid. A **layer slider peels layers off one at a time** and the count updates, so `base area × height` is *seen* as repeated layers. Build mode: given a volume, set l, w, h with three steppers and watch the figure redraw — **many answers accepted**, which makes it a factor-pair task in disguise. Composite mode: two joined prisms; a cut gesture separates them and the app labels both volumes and their sum.
- **Generator:** dimensions 2–8, composite split point, and which quantity is missing (V, a side, or the base area). Progression: 1–3 count cubes; 4–5 `l×w×h`; 6–7 base × height and missing side; 8–9 composites; 10 build-to-a-volume open items.
- **Printable:** 21 items — isometric prisms as line art on a faint isometric grid; one **cut-out net** per sheet to fold and count; and an `(l, w, h, V)` table with one column blank per row.
- **roam_link:** `roamAlpaca:cat3`
- **Evidence:** honest note — no efficacy evidence attaches to volume specifically; this is standards coverage, and the curricula disagree on placement (IM opens grade 5 with it, EngageNY puts it in Module 5), so we declare no prerequisite. The one evidence-driven choice is the **layer peel**: volume taught as iteration of a **composed unit** (a layer), the same composed-unit idea WWC 2021 Rec 4 uses for skip counting on a line.

#### 2.29 `mixed-number-line` — Mixed Number Line
**game · 5 · Fraction operations**

- **Skill:** place mixed numbers and improper fractions on a 0–2 line; convert between the forms; order three values.
- **CCSS:** 4.NF.B.3, 5.NF.A.1, 5.NF.A.2
- **Mechanic:** the placement shell on a **0–2 line with no interior ticks**. Targets alternate between improper (`7/4, 5/4, 7/6, 6/5`) and mixed (`1 2/4, 1 5/6`) forms, and **the same point is asked in both forms in consecutive rounds**, so the child discovers that 5/4 and 1¼ are one location — with WWC's own framing, "this is how a ruler is labelled". Scored by PAE. Second mode: three chips to drag into order along the line, scored on the **ordering**, not exact positions.
- **Generator:** targets drawn from **ROAM's own `0_2` list** (`2/3, 11/12, 1 2/4, 1 5/6, 7/4, 5/4, 7/6, 6/5`) plus generated siblings with denominators {2,3,4,5,6,8,12}. Progression: rounds 1–4 improper with d ∈ {2,4}; 5–8 mixed and improper of the same value **adjacent**; 9–12 d ∈ {3,5,6} plus order-three.
- **Printable:** 6 unlabelled 0–2 lines per page with the target above each, plus one page of the **inverse** item — the line shows only `0` and a single fraction, and the child must locate 1 **and** 2. Key with a tolerance band.
- **roam_link:** `roamMagpi:numberline` block `0_2`; `roamAlpaca:cat3`
- **Evidence:** `0_2` is a ROAM construct, and WWC 2021 Rec 4 asks specifically for the line to be extended past 1 (so nobody concludes all fractions are less than one) and for **5/4 and 1¼ to be shown at the same point**. Number-line/achievement correlation is strongest for fractions (Schneider 2018), and this is the last rung of the one ladder that started with `great-race` in kindergarten.

#### 2.30 `coordinate-quest` — Coordinate Quest
**game · 5 · The coordinate plane**

- **Skill:** plot and read ordered pairs in the first quadrant; x before y; graph a rule.
- **CCSS:** 5.G.A.1, 5.G.A.2, 5.OA.B.3
- **Mechanic:** the game **opens by rotating a horizontal number line up into the y-axis** over 600 ms, so the plane is introduced as *two number lines*, not as a new object. Plot mode: given (3,5), tap the lattice point (snap to lattice, tolerance half a cell); the **x/y reversal is detected specifically** and gets its own feedback — "you plotted (5,3); the first number is how far **across**." Read mode: a point is shown, type the pair. Path mode: plot a short sequence to trace a shape, and **the shape only completes if every point is right** — the drawing is the reward and the self-check, not a coin. Rule mode: given `y = x + 3`, plot three points.
- **Generator:** seed picks points — **avoiding symmetric pairs like (4,4) in early rounds**, because they hide the reversal error, then including them — and the rule. Progression: rounds 1–4 plot with axis labels every 1; 5–8 read and plot with labels every 2, so intermediate points must be inferred; 9–12 path and rule.
- **Printable:** 12 items on printed first-quadrant grids — plot and join in order (the picture is the self-check), read these points, and complete a table from a rule.
- **roam_link:** `roamAlpaca:cat3`
- **Evidence:** honest note — the coordinate plane has no isolating efficacy evidence and is standards coverage. It earns its slot **structurally**: WWC 2021 Rec 4 lists coordinate grids as an *application* of the number line, so the single-representation strategy pays off here — a child who has spent K–4 on one number line meets the plane as two of them. The x-before-y reversal is the one documented misconception and is targeted deliberately, and the self-completing drawing is an answer-bank-style self-check that works with no adult in the room.

---

### 2.31 ROAM coverage matrix — the completeness check

`scripts/check.mjs` must fail the build if any cell in the required set is empty.

| Task | Subscale / block | Activities |
| --- | --- | --- |
| `roamAlpaca` | `cat1` | counting-crew, number-friends, shape-sorter, great-race, ten-frame-flash |
| `roamAlpaca` | `cat2` | adding-to-twenty, tens-and-ones, halves-and-quarters, number-line-hop, place-value-palace, carry-and-borrow, arrays-and-equal-groups, close-to-hundred |
| `roamAlpaca` | `cat3` | times-table-tower, fraction-number-line, area-and-perimeter, fact-family-forge, array-architect, long-multiplication, equivalent-fractions, angles-and-lines, division-descent, decimal-drop, decimal-place, fraction-foundry, volume-and-space, mixed-number-line, coordinate-quest |
| `roamAlpaca` | `cat4` | **none — deliberately out of scope** (grades 7+). `/roam` shows "beyond grade 5" and recommends nothing. |
| `roamMagpi` | `symbolic` | counting-crew, place-value-palace, **decade-duel**, equivalent-fractions, decimal-drop, decimal-place |
| `roamMagpi` | `numberline` `0_20` | great-race, number-line-hop (stage 1) |
| `roamMagpi` | `numberline` `0_100` | number-line-hop (stages 2–3) |
| `roamMagpi` | `numberline` `0_1` | fraction-number-line, equivalent-fractions, decimal-drop |
| `roamMagpi` | `numberline` `0_2` | fraction-foundry, mixed-number-line |
| `fluencyArf` | `sum` | number-friends, adding-to-twenty, make-ten-race |
| `fluencyArf` | `minus` | adding-to-twenty, make-ten-race (stage 2), fact-family-forge (stage 2) |
| `fluencyArf` | `mult` | times-table-tower, fact-family-forge, array-architect |
| `fluencyArf` | `div` | times-table-tower, fact-family-forge |
| `fluencyCalf` | `add-nocarry` | tens-and-ones, carry-and-borrow (A1), close-to-hundred |
| `fluencyCalf` | `add-carry` | carry-and-borrow (A2–A4), close-to-hundred |
| `fluencyCalf` | `sub-noborrow` | carry-and-borrow (S1) |
| `fluencyCalf` | `sub-borrow` | carry-and-borrow (S2) |
| `fluencyCalf` | `mult` | long-multiplication |
| `fluencyCalf` | `div` | division-descent |

Single-home subscales (`sub-noborrow`, `sub-borrow`, `mult`, `div` in CALF) are the **v2 priority**: each currently rests on one activity, so `carry-and-borrow` stage 3 and a G5 division book are the first two additions.

---

## 3. ROAM score → recommendation engine

Lives at `/roam/` — grown-up facing, linked from the footer, never from the main nav. Nothing on the site requires a score.

### 3.1 The architectural decision

**ALPACA sets the shelf. MagPI, ARF and CALF pick the activity.**

ALPACA is a broad adaptive measure returning a theta and a grade-band subscale (`cat1`–`cat4`), so it is the right instrument for *which grade's material to work in*. The other three are narrow constructs with named subscales, so they are the right instruments for *which activity*. This uses each task for what it actually measures and it prevents the engine from recommending fraction work to a child whose problem is that 47 and 74 look the same.

### 3.2 Bands (verbatim from the lab)

| Band id | Label | Percentile | Meaning shown to the parent | Action |
| --- | --- | --- | --- | --- |
| `need` | **Needs extra support** | below 20th | "This skill is likely holding them back from grade-level material." | Start below grade level and build the foundation. Short, frequent sessions. |
| `dev` | **Developing skill** | 20th–40th | "Below average for their age, but growing." | Practise this skill directly, alongside grade-level work. |
| `ach` | **Achieved skill** | above 40th | "Not holding them back from grade-level material." | Keep it warm with light practice and push into the next thing. |

**Language rules, enforced by a lint in `scripts/check.mjs`:** the strings `at risk`, `high risk`, `below basic`, `struggling`, `deficit` and `behind` must not appear in any parent-facing copy. The band label names the **action**, not the child. This is the lab's deliberate choice and we adopt it verbatim.

### 3.3 Priority when several tasks are low

```
1. roamMagpi:numberline     magnitude is upstream of everything; largest effect sizes; WWC STRONG
2. roamMagpi:symbolic       symbolic magnitude access; cheap to fix; gates comparison and place value
3. fluencyArf               retrieval frees working memory for procedure (cognitive load)
4. fluencyCalf              procedure is downstream of retrieval
(ALPACA is not in this list — it sets the shelf level, not the target)
```

**Hard cap: three recommendations, ever.** One book, one game, one printable. A parent handed six activities does none of them.

### 3.4 The tables

#### ALPACA (`roamAlpaca`) — sets the shelf

| Subscale | Band | Shelf | Recommend, in order |
| --- | --- | --- | --- |
| `cat1` (preK–1) | `need` | K, or the earliest content regardless of enrolled grade | 1. `number-friends` 2. `great-race` 3. `counting-crew` printable |
| `cat1` | `dev` | grade level | 1. `counting-crew` 2. `ten-frame-flash` 3. K interleaved review sheet |
| `cat1` | `ach` | grade level + stretch | 1. `great-race` stage 2 (0–100 board) 2. `adding-to-twenty` 3. G1 review sheet |
| `cat2` (1–2) | `need` | one grade below | 1. `tens-and-ones` 2. `number-line-hop` stage 1 3. `adding-to-twenty` ch. 1–4 printable |
| `cat2` | `dev` | grade level | 1. grade-level book in the weakest strand 2. that grade's game 3. interleaved review |
| `cat2` | `ach` | grade + 1 opener | 1. `arrays-and-equal-groups` 2. `close-to-hundred` stage 3 3. `times-table-tower` ch. 1–2 |
| `cat3` (3–6) | `need` | two grades below, but **never below the strand's prerequisite** | 1. `arrays-and-equal-groups` (G2) 2. `times-table-tower` ch. 1–4 3. `number-line-hop` stage 2 |
| `cat3` | `dev` | grade level | 1. `fraction-number-line` (G3) or `equivalent-fractions` (G4) or `fraction-foundry` (G5) 2. the grade's number-line game 3. interleaved review |
| `cat3` | `ach` | grade + 1 | 1. next grade's flagship book 2. its game 3. the "Exploration" opt-in items |
| `cat4` (7+) | any | **out of scope** | Recommend nothing. Show: "This is beyond the grade 5 material Izzi Math covers." No upsell, no fake stretch content. |

#### MagPI — number line (`roamMagpi:numberline`)

| Band | Recommend, in order | Rule |
| --- | --- | --- |
| `need` | 1. `great-race` (stage 1 if grade ≤1, stage 2 otherwise) 2. `number-line-hop` stage 1 (0–20) 3. printed 0–20 line sheets, 6 lines/page, 4 days a week | **Always start with whole numbers, even for a grade-5 child.** The 0–1 line comes only after 0–100 placement is linear. Do not send a fifth grader straight to fractions on a line they cannot yet read. |
| `dev` | 1. `number-line-hop` at the grade's stage 2. then `fraction-number-line` (G3+) or `decimal-drop` (G4+) 3. the matching line sheet | Track PAE across sessions; the sheet's own 5-session strip is the progress display. |
| `ach` | 1. `mixed-number-line` (0–2) as a stretch 2. `decimal-drop` with two zoom levels 3. one line sheet a week to keep it warm | |

#### MagPI — symbolic comparison (`roamMagpi:symbolic`)

| Band | Recommend, in order | Rule |
| --- | --- | --- |
| `need` | 1. `decade-duel` **stages 1–2 with the deadline off** 2. `counting-crew` ch. 5 (compare with the line reveal) 3. `place-value-palace` ch. C if grade ≥2 | Far pairs before near pairs. **No deadline at all in the `need` band** — the construct is speeded, the practice does not have to be. |
| `dev` | 1. `decade-duel` at the trap stage for the grade (3–5), deadline on 2. `place-value-palace` 3. comparison printable, 40 pairs | Use the trap stage, not random pairs: incompatible decades and reversed digits are where the error lives. |
| `ach` | 1. `decade-duel` stage 6 (decimals and fractions) 2. `decimal-place` 3. — | |

#### ARF — fact retrieval (`fluencyArf`)

**Standing rule for every ARF subscale: approach a weak fact set through its FAMILY, never through a one-operation fact list.** IM derives fluency from the multiplication/division inverse relationship, and one triangle drills three facts across two operations.

| Subscale | Band | Recommend, in order |
| --- | --- | --- |
| `sum` | `need` | 1. `number-friends` (bonds to 10 first — the parts, not the sum) 2. `make-ten-race` **with no clock** 3. `ten-frame-flash` at 900 ms |
| `sum` | `dev` | 1. `make-ten-race` with the clock on 2. `adding-to-twenty` ch. 3–8 3. its interleaved review sheet |
| `sum` | `ach` | 1. `adding-to-twenty` ch. 10 (interleaved) 2. `fact-family-forge` stage 2 3. one Five Minute Frenzy a week |
| `minus` | `need` | 1. `number-friends` — **subtraction is read off the bond**, not taught as a separate fact set 2. `adding-to-twenty` ch. 9 (take from ten) 3. `fact-family-forge` stage 2, untimed |
| `minus` | `dev` | 1. `fact-family-forge` stage 2 2. `adding-to-twenty` ch. 9 3. interleaved review |
| `minus` | `ach` | 1. `close-to-hundred` stage 5 (Close to 0) 2. interleaved review 3. — |
| `mult` | `need` | 1. `arrays-and-equal-groups` (G2 — equal groups before facts) 2. `array-architect` stage 1 3. `times-table-tower` ch. 1–4, picture-supported |
| `mult` | `dev` | 1. `times-table-tower` ch. 5–7 2. `fact-family-forge` rounds 1–8 3. Five Minute Frenzy, personal best only |
| `mult` | `ach` | 1. `fact-family-forge` rounds 13–16 (**mixed** — discrimination, not blocks) 2. `array-architect` stage 3 3. weekly Frenzy |
| `div` | `need` | 1. `times-table-tower` ch. 8 (missing factor) 2. `fact-family-forge` 3. `array-architect` — **never a division fact list** |
| `div` | `dev` | 1. `fact-family-forge` division rounds 2. `times-table-tower` ch. 8–9 3. triangle printable |
| `div` | `ach` | 1. `division-descent` 2. `close-to-hundred` stage 4 3. — |

#### CALF — multi-digit procedure (`fluencyCalf`)

| Subscale | Band | Recommend, in order |
| --- | --- | --- |
| `add-nocarry` | `need` | 1. `tens-and-ones` ch. 1–6 2. `carry-and-borrow` **ch. 0** (the regrouping judgment) then A1 3. 8-item grid-support sheet |
| `add-nocarry` | `dev` | 1. `carry-and-borrow` A1 2. `close-to-hundred` stage 3 3. inter
| `add-nocarry` | `dev` | 1. `carry-and-borrow` A1 2. `close-to-hundred` stage 3 3. interleaved review |
| `add-nocarry` | `ach` | 1. `close-to-hundred` stage 4 2. `carry-and-borrow` stage 3 (3-digit) 3. — |
| `add-carry` | `need` | 1. `tens-and-ones` ch. 7–8 — **the trade gesture first**; the child must see a ten become ten ones before carrying means anything 2. `carry-and-borrow` ch. 0, then A2 3. 8-item grid-support sheet, vertical format |
| `add-carry` | `dev` | 1. `carry-and-borrow` A2–A4 2. `close-to-hundred` stage 3 3. interleaved review |
| `add-carry` | `ach` | 1. `close-to-hundred` stage 4 2. `long-multiplication` ch. 1–3 3. — |
| `sub-noborrow` | `need` | 1. `place-value-palace` ch. A–B (place value before procedure) 2. `carry-and-borrow` ch. 0, then S1 3. grid-support sheet |
| `sub-noborrow` | `dev` | 1. `carry-and-borrow` S1 2. `close-to-hundred` stage 2 3. interleaved review |
| `sub-noborrow` | `ach` | 1. `carry-and-borrow` S2 2. stage 3 (3-digit) 3. — |
| `sub-borrow` | `need` | 1. **`tens-and-ones` ch. 9 — non-standard decomposition (35 as 2 tens and 15 ones).** This is the conceptual prerequisite for borrowing and it is the one route in that is not a procedure. 2. `carry-and-borrow` ch. 0, then S2 3. grid-support sheet with 8 items |
| `sub-borrow` | `dev` | 1. `carry-and-borrow` S2 2. `tens-and-ones` ch. 9 as a refresher 3. interleaved review mixing S1 and S2 |
| `sub-borrow` | `ach` | 1. `carry-and-borrow` stage 3 2. `close-to-hundred` stage 5 (signed scores) 3. — |
| `mult` | `need` | 1. **`fluencyArf:mult` first** — if single-digit retrieval is also weak, fix that before the procedure (see the cross-task rule below) 2. `long-multiplication` ch. 1–3 (**area model, not the algorithm**) 3. area-model frames printable |
| `mult` | `dev` | 1. `long-multiplication` ch. 4–7 (partial products, then the column) 2. `array-architect` stage 3 3. both-methods printable |
| `mult` | `ach` | 1. `long-multiplication` ch. 8–9 (2-digit × 2-digit) 2. stage 4 (standard algorithm, grade-5 mastery) 3. interleaved review |
| `div` | `need` | 1. **`times-table-tower` — facts first.** A division procedure fails without retrieval; do not drill the algorithm on top of missing facts. 2. `division-descent` rounds 1–4 (exact division only) 3. long-division sheet with 14 work lines |
| `div` | `dev` | 1. `division-descent` rounds 5–8 (remainders) 2. `times-table-tower` ch. 8 (missing divisor) 3. interleaved review |
| `div` | `ach` | 1. `division-descent` rounds 9–12 (D3 + remainder interpretation) 2. `close-to-hundred` stage 4 3. — |

### 3.5 Cross-task rules

These fire **before** the per-task tables and can override them.

1. **Retrieval before procedure.** If `fluencyArf:mult` is `need` and `fluencyCalf:mult` is also `need`, recommend the ARF path only. Same for `div`. Never stack a multi-digit algorithm on top of missing facts — that is what cognitive load theory predicts will fail, and it is what a parent will interpret as "my child cannot do division."
2. **Magnitude before fractions.** If `roamMagpi:numberline` is `need`, suppress every `0_1` and `0_2` recommendation regardless of grade, and route to whole-number stages first.
3. **Place value before regrouping.** If `roamAlpaca:cat2` is `need` and any CALF add/sub subscale is `need`, lead with `tens-and-ones` or `place-value-palace`, not with `carry-and-borrow`.
4. **Two `need` bands maximum on screen.** If three or more subscales land in `need`, show only the top two by the §3.3 priority order, with one line: "Start here. There is more, and it will still be here in six weeks."
5. **An `ach` band never generates work.** It generates one keep-warm sheet a week and a link to the next thing. Do not manufacture practice for a skill that is not holding the child back.

### 3.6 The unreliable-score flag

ROAM marks a score unreliable when a child responds too fast: `responseTimeLowThreshold` 250 ms, `accuracyThreshold` 0.6, minimum 3 responses.

| Rule | Behaviour |
| --- | --- |
| **Never band it** | Show the raw result with no colour band and no label. The three-band UI is suppressed for that task. |
| **Drop it from the ranking** | The task does not participate in §3.3 priority ordering. |
| **An unreliable score can never move a child down** | A flagged score may **not** select a below-grade shelf, and may not suppress a strand (rules 2 and 3 above do not fire on flagged data). It can only ever be neutral. |
| **Copy, verbatim** | "This score was flagged because of very fast responses. Treat it as a hint, not a finding — and consider re-running ROAM when your child is fresh." |
| **Fallback** | If *every* task is flagged, fall back to the grade shelf: the grade's flagship book, its number-line game, and one interleaved review sheet. This is also the default for a family with no ROAM score at all — which must be a first-class path, not an error state. |

### 3.7 Output shape

```js
recommend({
  grade: '3',                                  // parent-entered, the shelf default
  alpaca: { subscale: 'cat3', pct: 14, flagged: false },
  magpi:  { numberline: { pct: 9,  flagged: false },
            symbolic:   { pct: 55, flagged: false } },
  arf:    { sum: null, minus: null, mult: { pct: 31 }, div: { pct: 26 } },
  calf:   { 'add-carry': { pct: 48 } },
}) =>
{
  shelf: '2',                                  // cat3 + need -> two grades below, floored at the prerequisite
  suppressed: ['0_1', '0_2'],                  // cross-task rule 2 fired
  focus: [
    { subscale: 'roamMagpi:numberline', band: 'need',
      why: 'Placing numbers on a line is the skill the rest of the maths sits on.',
      items: ['great-race?stage=2', 'number-line-hop?stage=2', 'print:number-line-hop'] },
    { subscale: 'fluencyArf:div', band: 'dev',
      why: 'Division facts are coming along. Practise them through the family, not on their own.',
      items: ['fact-family-forge', 'times-table-tower#ch8', 'print:fact-family-forge'] },
  ],
  dose: { minutesPerDay: 10, daysPerWeek: 4, reviewInWeeks: 6 },
  caveats: [],
}
```

Dose defaults by band: `need` → 10 min/day, 4–5 days/week, **one activity at a time**, revisit in **6–8 weeks**; `dev` → 10–15 min, 3 days/week, revisit in 8 weeks; `ach` → one sheet a week. The 6–8 week window is not arbitrary: the early-numeracy metaregression predicted **larger** effects for interventions of eight weeks or less.

### 3.8 What the engine never does

- Never produces a score, a predicted score, or a projected percentile. Izzi Math is practice, not assessment.
- Never claims practice here will change a ROAM result.
- Never shows a band, a percentile or a number **to the child**. `/roam/` is a grown-up page.
- Never uses the word "risk".
- Never gates content behind a score. Every activity is reachable from `/grades` by anyone.

---

## 4. Design rules

### 4.1 Timers — the defensible position

The popular framing ("timed drills cause math anxiety, so avoid timers") is not supported, and neither is the opposite. Both sides of that argument overreach, so we take a position on the *design*, not the slogan.

**What the evidence actually says.** WWC 2021 Rec 6 rates timed fluency activities **STRONG** on 27 studies (21 without reservations). The only clean experiment that manipulated timing in children — Fuchs 2012, 648 at-risk first graders randomised, where the *only* difference was the final five minutes of a 30-minute session — found speeded practice beat non-speeded at **ES 0.51** on arithmetic, and reported **no difference in attitudes, motivation or effort**. All three head-to-head timed-vs-untimed contrasts WWC located favoured timed (g = 0.42\*, 0.36\*, 0.20). Meanwhile *Fluency Without Fear*, the usual citation for the anxiety claim, cites **no experiment that manipulated timing in children**. Math anxiety is real (r = −.26 with achievement across 90 countries, 452 samples) and it hurts *higher*-attaining children more, but the intervention evidence says the way to reduce it is to build competence: skill interventions raise achievement g = 0.76 **and reduce** anxiety g = −0.32, while digital games per se do essentially nothing for anxiety (ES −0.13).

**So what is the critique actually about?** Long, graded, publicly-compared timed tests on unpractised content. That is a specific artifact, and we do not build it.

**The eleven rules. All eleven, or the evidence does not transfer.**

1. **A game never introduces a concept.** Games sit downstream of books; each game page opens with a "learn it first" link. WWC: *"Do not use timed activities to introduce and teach mathematics concepts and operations."*
2. **Every game names its strategy before Start and keeps it one tap away.** This is the biggest lever in the literature — fluency *with* strategy vs *without* was **g = 1.48 vs g = 0.37**, a larger swing than timing itself.
3. **Clocks run 60–90 seconds** (WWC's window is 1–5 minutes) and never longer.
4. **One item on screen at a time.** Never a visible grid of thirty. WWC's anxiety guidance is explicit: *"Students may be less anxious when they do not perceive that there are a large number of items."*
5. **No clock starts until the child presses Start.**
6. **Only correct answers score.** Racing and guessing must not pay.
7. **The target is the child's own previous score**, charted privately, three attempts per session. WWC: if tracking individually, *keep the graphs private*.
8. **Nothing is ever compared between children.** No leaderboards, no percentiles, no public scores, no streak-loss punishment. Comparison is the part of timed math with a real link to anxiety.
9. **Errors are corrected in-line with the taught strategy before advancing.** WWC: *"Select computer games that require students to correct their own errors before moving on."*
10. **The clock is not the only pressure model, and often not the best one.** Three of our twelve games are scored on **distance from a target** (`close-to-hundred`), **steps taken** (`division-descent`) or **placement error** (`number-line-hop`) — where **lowest wins**, so care beats speed and no clock is needed at all. Prefer this whenever the mechanic allows it.
11. **Timers are off by default and one click to disable.** Characters carry the default — Kiwi off, Georgie on — so a child who finds clocks stressful can pick Kiwi and never meet one, without ever being told that is what they have done. There is also a global "no clock" accessibility setting that swaps the timer for a fixed item count.

**One correction to the original concept doc:** the timer must not be *only* a character trait. A child who picks Kiwi should still be able to reach the bounded sprint, because it is the fluency component with the strongest evidence behind it. So: **one timed format across all characters, built to rules 1–10; what the character changes is the default and the framing, not access.**

### 4.2 Printable item counts, per grade

Three density presets. `Learn` for K–1 and any brand-new skill, `Practice` for the routine sheet, `Sprint` opt-in for grades 3–5. Geometry measured from production sheets (Math-Drills dense drill, Math-Drills Large Print, K5 Learning grade 1, Eureka Sprint) rather than chosen by taste.

| Grade | Practice items | Cols | Problem type | Row pitch | Answer box | Work lines | Est. time |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **K** | **8–10** | 2 | 24 pt | 1.20 in | 0.50 × 0.50 in | 0 | 10 min |
| **1** | **12** | 2–3 | 20–24 pt | 0.65 in | 0.50 × 0.50 in | 0–3 | 10–15 min |
| **2** | **18** | 3 | 18 pt | 0.55 in | 0.53 × 0.36 in | 3 | 15–20 min |
| **3** | **21** | 3 | 16 pt | 0.50 in | 0.53 × 0.36 in | 3–4 | 20 min |
| **4** | **28** | 4 | 16 pt | 0.45 in | 0.53 × 0.30 in | 8 (long ×) | 20–30 min |
| **5** | **28** | 4 | 16 pt | 0.45 in | 0.53 × 0.30 in | 10–14 (long ÷) | 25–35 min |
| **Review — every grade** | **8** | 2 | grade default | grade default | grade default | grade default | 10–15 min |
| **Sprint — 3–5, opt-in** | 44 (2 × 22) | 2 | 12–14 pt | 0.33 in | inline rule | 0 | 2 × 60 s |

Non-negotiables:

- **The review sheet is always exactly 8 items**, shuffled so no two consecutive problems need the same method. This is Rohrer's literal template — eight problems across two sides of one sheet — which produced **61% vs 38%, d = 0.83** on an unannounced test a month later. Same problems; only the order differed.
- **Hard ceiling of 12 items on any K–1 sheet**, regardless of preset.
- **Never a visible grid of 30+ items for K–2.**
- Every Sprint page prints, in the header: *"You are not expected to finish. Do your personal best."* Great Minds says the same thing about their own 44-item Sprints — *"the goal is never for students to complete all 44 problems"* — and discourages grading them.
- **Sample without replacement within a sheet.** K5 Learning's generator visibly does not, and repeats items on an 18-item grade-1 page. Ours must not.

### 4.3 Print geometry, fixed once

- Design inside the **Letter ∩ A4 intersection**: 8.27 in × 11.0 in, 0.5 in margins, 0.6 in at the bottom (inkjet bottom unprintable zones are the largest and asymmetric). Safe content box ≈ **7.27 × 9.9 in**.
- `@page { size: auto; margin: 0 }`, margins controlled in our own layout, so the browser's Save-as-PDF cannot shrink-to-fit.
- Seed, QR code and page number live **inside** the bottom 0.4 in of the content box, never below it.
- A **1 in calibration tick** prints on any sheet where measurement matters (protractors, rulers, number lines).
- **Hairlines at 0.4 pt** (0.14 mm) — the measured value on real production sheets, and about the thinnest that reproduces at 600 dpi.
- **Line art only, no solid fills, no background tints.** Shaded fractions are **hatched**. Solid area, not glyph weight, is what empties a cartridge; target under ~5% coverage on a fluency sheet.
- Variants that are cheap now and expensive to retrofit, so they ship in v1: **left-handed** (headings/carry strips mirrored), **large print** (1.5× type, ¼ the items, 2× pitch), **grid support** (faint 0.4 pt digit alignment), **four-per-page** (paper economy — say so openly).
- **Never split a figure from its questions.** A figure and every item referring to it must be one unbreakable block, same page, same side, with labels **on** the diagram, not in a legend. A print-layout test fails the build if any figure-plus-items block crosses a page boundary. (Split attention is the most common way a technically correct print stylesheet silently ruins a sheet.)

### 4.4 Colour and accessibility

- Build every sheet correct in **pure black on white first**; colour is decoration that can be discarded. A grayscale diff test runs in CI.
- **Never carry information in colour alone.** Avoid red/green, green/brown, blue/purple, black/grey. Note specifically: the hologrid palette's **magenta and violet collapse together** in grayscale and in deuteranopia — if two things must be distinguished, distinguish them by pattern, position or label.
- Label chart elements directly; no colour legends.
- Typography: body/instruction text **14 pt minimum**, 1.5 line spacing for prose, left-aligned ragged right (never justified), 60–70 characters per line, no italics, no underlining, no block capitals, headings ≥20% larger than body.
- **Validate the numerals before committing to Space Grotesk for math.** A "1" with a top arm *and* a bottom serif scores 97% identification against 43% for a top arm alone. Check `1`, `6`/`9` and `0`/`O` at 24 pt **and** 12 pt on a real inkjet. If the `1` fails, use tabular figures or a different face for numerals only.
- Math symbols: **obelus** for division in K–3 (never `/`), multiplication **cross** (never `*`, never a midpoint), **horizontal** fraction bar (a diagonal solidus reads as "a chunk"), never a midpoint as a decimal point, no Roman numerals, tabular figures on so digit columns align.
- Primary ruling for K–1 handwriting: **3/4 in** tall-letter height for K, **5/8 in** for grade 1, **1/2 in** for grades 2–3, with a **dashed midline** between solid headline and baseline, a start dot and one grey traced exemplar. A plain square box does not teach consistent digit height.

### 4.5 The other nine rules distilled from the learning science

1. **Elaborated feedback everywhere; verification feedback nowhere.** Elaborated g = 0.49, correct-answer 0.32, right/wrong **0.05** — and the effect is largest in mathematics, with delayed timing a negative moderator in primary settings. There is also evidence verification-only cues *reduce* children's persistence and strategy flexibility, so a bare red X is plausibly worse than nothing. **An activity without per-error diagnosis and a re-anchored explanation is incomplete and must not ship.** For K–2 the feedback is perceptually salient plus spoken; for 3–5 it shifts to written.
2. **Feedback names a reference point, not a verdict.** On the number line, reveal the true position, show the gap, and name the benchmark — because feedback on estimates improves performance abruptly (often after one trial) and broadly across the whole range, apparently by supplying reference points.
3. **Interleave on review; block during acquisition.** Rohrer's operational rule, literally: *no two consecutive problems require the same strategy*. Ship "Mixed Review" as a first-class sheet type in every book, and default the last page of every chapter to it. Expect the counterintuitive signature — lower in-session accuracy, large delayed gains. Caveat stated honestly: the RCTs are grade 7, so K–5 is a mechanism-based inference, and the one grade-3 study needed explicit strategy-**comparison** prompts ("which strategy did you use, and why?"), which we add for grades 3–5.
4. **Count on from where you are.** Any movement along a line starts from the token's current position, never from 1 — enforced in the `boardmove` type, because that was the only manipulation that doubled the effect.
5. **Concreteness fading as the shape of a book page:** manipulate → picture → symbols, same problem, links made explicit. Never run it backwards, never stop at either end.
6. **Worked example first, faded on measured performance.** Full example → last step blank → last two blank → solo. Skip worked examples entirely for low-element-interactivity content like single-digit facts, where generation is better, and fade adaptively because guidance that helps a novice becomes harmful once the child is competent.
7. **Instruction-first for K–2, always.** Explore-first is permitted only for grades 3–5, only for conceptual targets, and only with a mandatory application step afterwards. Productive-failure effects reverse for grades 2–5, and this is the single most over-applied finding in ed-tech.
8. **Target 80–85% success**, and do **not** optimise for in-session ease or self-reported enjoyment. Instrument delayed performance instead — the seed architecture makes "come back next week and try the same seed" nearly free, and immediate accuracy will actively mislead you.
9. **A frozen set of four representations, K→5, plus two additions.** Number line; ten-frame and structured dot patterns; array becoming the area model; bar for part-whole and fractions. Additions: base-ten blocks and the number bond, both for place value and part-whole specifically. **Nothing else gets invented per activity.** Where two representations appear together, a linking self-explanation prompt is mandatory — multiple graphics only beat one when the learner is made to explain how they relate.

### 4.6 The one hard limit on the character system

A character owns the palette, avatar, decorative frame, voice, level names and **word-problem nouns**. A character **never** touches the countable units inside a manipulative: ten-frame counters, array squares, dots, number-line ticks, base-ten units stay plain and identical for everyone, in every skin including "Just math".

This is not taste. Petersen & McNeil (133 preschoolers, 2×2) found perceptually rich objects **help** children with low knowledge of the object and **hurt** children who know it well — so precisely the children most attached to Georgie are the ones tennis-ball counters would damage, and Kaminski & Sloutsky (four experiments, 6–8 year olds) found children reading bar graphs made of countable objects **counted the objects and failed to learn the axis-reading strategy**. `scripts/check.mjs` renders every problem under all four characters and fails if a manipulative differs. Happy side effect: uniform low-detail counters are also exactly what the inkjet constraint wants.

### 4.7 Self-check, because there is no teacher in the room

Every sheet ships at least one of these, in increasing cost: (a) a checksum line ("the sum of all your answers should be 148"); (b) an answer bank of the correct answers in scrambled order at the foot; (c) a riddle/decode strip where answers map to letters; (d) the QR code to the interactive version at the same seed. **(a) or (b) on every sheet as a matter of course** — one line of text, and it satisfies WWC's immediate-feedback requirement without a parent marking anything.

Answer keys ship as **three artifacts from one seed**: the student sheet (no answers, seed + QR in the footer); the grown-up key as a separate trailing page reusing the question layout byte-for-byte with answers in the boxes; and a student-only PDF with the key stripped, so the adult chooses whether the key is in the room. For word problems the key gives the **equation and a full-sentence answer**, not just the number. The key's footer carries one line of adult guidance: *"If they get stuck, work through the example at the top together, then hand it back."*

That last point is the biggest strategic risk in the whole product and it deserves naming: the caregiver-delivered math meta-analysis (25 studies, 83 effect sizes, **g = 0.26**) found that the *intensity of caregiver training* and the presence of *follow-up support* were the significant moderators. Building Blocks' validated version shipped with 4–8 days of teacher training plus monthly coaching. Izzi Math ships materials to an untrained parent. The mitigations that fit a static site are cheap and should all be built: the 60-second "how to run this" note on every key, elaborated feedback written so an adult can read it aloud, the QR bridge carrying the strategy reminder to the grown-up, and an opt-in weekly printable sequence that supplies the follow-up structure.

### 4.8 Dosing copy

Print an honest time estimate on every sheet ("about 10 minutes") and hold to the 10-minute rule — 10 min at grade 1 rising to ~50 at grade 5 — with a **hard 20-minute default ceiling for K–2** regardless. Note that the 10-minute rule is correlational and explicitly weak at elementary level: it is a dosing ceiling, not an achievement claim.

And answer the question directly, on the site, in one paragraph, the way Math-Drills does ("Aren't math drills bad?"): worksheets do not teach math; a sheet arrives here with a worked example, a self-check, a paired interactive version at the same seed, and one line telling the adult what to do when the child gets stuck. That is the difference, and it is worth stating rather than implying.

---

## 5. Curricula and research to credit

### 5.1 The spine — cite this first, by recommendation

**IES/WWC 2021006, *Assisting Students Struggling with Mathematics: Intervention in the Elementary Grades*.** The only math evidence source in this landscape with **all six recommendations rated STRONG**, backed by 14–43 reviewed studies each, free and public. Izzi Math should be able to state, for every activity, which of the six it instantiates. That is a defensible evidence claim in a category where nobody makes one.

| Recommendation | Studies | Where it shows up |
| --- | --- | --- |
| 1 · Systematic instruction | 43 (32 w/o reservations) | book chapter architecture; worked example → twin → items |
| 2 · Mathematical language | 16 (12) | required vocabulary in area/perimeter units; "how did you see it"; critique items |
| 3 · Concrete and semi-concrete representations | 28 (19) | the frozen four; concreteness-fading page shape |
| 4 · **Number lines** | 14 (11) | seven activities; the spine of the whole K–5 sequence |
| 5 · Word problems by structure | 18 (15) | v2 story-problem books, schema-tagged |
| 6 · **Timed activities** | 27 (21) | the eleven timer rules; `fact-family-forge`; Frenzy and Sprint sheets |

### 5.2 Genuinely strong evidence — cite with specifics

| Source | What it earns | The honest number |
| --- | --- | --- |
| **Siegler & Ramani 2008, 2009; Laski & Siegler 2014** | `great-race`, and the count-on rule everywhere | d = 1.01 on number-line error, with a documented null for the circular board (0.43) and the colour board (nothing). Pooled across 18 later studies: **g = 0.21** (Nelson 2025) — quote the pooled figure, not the original. |
| **Fuchs, *Fraction Face-Off!*** | the grade-4 fraction sequence and its week order; the four-part lesson template | WWC-reviewed, potentially positive in all three domains, improvement indices **+33 / +31 / +24** |
| **Fuchs et al. 2013 (fraction magnitude)** | `fraction-number-line`, `fraction-foundry` | N = 259 randomised; ES 0.29–2.50, with the measurement interpretation **mediating** |
| **Fuchs et al. 2012 (speeded vs non-speeded)** | the timer position | N = 648 randomised; ES 0.51 on arithmetic; **no difference in attitudes, motivation or effort** |
| **Rohrer, Dedrick, Hartwig & Cheung 2020** | the 8-item interleaved review sheet | Preregistered cluster RCT, 787 students, 54 classes; **61% vs 38%, d = 0.83** |
| **Schneider et al. 2017, 2018** | why symbolic and why the number line | r = .443 (number line, 263 effect sizes); r = .302 vs .241 (symbolic vs non-symbolic) |
| **van der Kleij, Feskens & Eggen 2015** | the elaborated-feedback requirement | Elaborated **0.49**, correct-answer 0.32, right/wrong **0.05**; largest in mathematics |
| **Clements & Sarama / Building Blocks** | subitizing trajectory, quick images | WWC **Tier 2 Moderate**, n = 3,221 — the best-evidenced early-math curriculum, and also the clearest fade-out case |
| **Starkey & McCandliss 2014; Anobile 2020** | ten-frame grouping, and the K/G1 boundary | N = 378; no grouping benefit in K, growing from G1; grouping benefit uniquely predicts arithmetic fluency |
| **Riconscente 2013 (Motion Math)** | `make-ten-race`, `decimal-drop` zoom | 122 students, randomised crossover, **+15%**, η² = .387 |
| **Slice Fractions (Cyr & Riopel, UQAM)** | the "mechanic is the representation" test | 139 grade-3 students, 3 arms, TIMSS items; largest effect on items with **no visual support** |

### 5.3 Design credit, weak or no outcome evidence — say so plainly

| Source | Credit for | State clearly |
| --- | --- | --- |
| **Illustrative Mathematics K–5** (CC BY-NC, im.kendallhunt.com) | the topic order, the representation progression, the routine set, the assessment architecture, and several specific task forms | EdReports Meets Expectations in all three gateways at every grade (100 / 100 / 92) — **that is a design-quality rating.** The Massachusetts CURATE panel gave IM K–5 **no rating at all** on Impact on Learning (Oct 2024): *"high-quality studies of student learning impacts are not yet available."* The widely-quoted +0.18 to +0.50 SD figures are **grades 6–8** and were null-to-negative for post-COVID adopters. The one elementary number is a quasi-experimental Missouri study of Imagine Learning IM (+0.38, ESSA Tier 2). **NC licence: use as a design reference, author original items, take counsel before lifting task text.** |
| **TERC Investigations** (Close to 100 / 1,000) | `close-to-hundred`, its recording sheet, the carry-over rule | Tier 3 — published rules, decades of classroom use, **no RCT** |
| **NRICH (Cambridge)** | low-threshold-high-ceiling task design; Strike It Out and Magic V as print↔screen twins | Expert task design, no efficacy trial. Also a governance lesson: NRICH *deletes* its own material when it stops meeting the bar — never deep-link third-party activities as load-bearing content |
| **youcubed / Stanford** | `array-architect` (How Close to 100) | Task design, no trial for this task |
| **Eureka Math² / Great Minds** | the Sprint format, and the "you are not expected to finish / do not grade these" protocol | Format credit. Publisher-reported single-district outcomes; CAST UDL certification is a real third-party product credential, not efficacy |
| **Zearn** | the Tower-of-Power + Boost UX pattern (gate on 100%, on error open a scaffolded step then hand back a **new** problem), and the three-Boost escalation which becomes our quiet parent surface | Evidence for ESSA Tier 1 via a RAND RCT: **+0.11 SD on MAP, +0.07 non-significant on STAAR.** The "1.3 grade levels" claims are usage-correlational and self-published |
| **Khan Academy / Perseus** | the ~12-widget interaction vocabulary that caps our primitive set | No K–5 math efficacy claim surfaced |
| **Math-Drills, Super Teacher, homeschoolmath.net, K5 Learning** | measured print geometry, the generator parameter surface, independent operand ranges, print variants, the answer-key model | Convention, not research. Their own honesty is worth copying: *"Math worksheets are not magic; they will not teach math."* |
| **Greg Tang** (Kakooma, spiral-review workbook generator) | strategy-as-win-condition puzzle design | Design credit — and a cautionary tale: the free arcade now serves an expired certificate behind a paywall. Static export plus stable URLs is a durability decision |
| **Estimation 180 (Stadel), Splat and Esti-Mysteries (Wyborney), WODB (Danielson), Open Middle (Kaplinsky), CGI true/false (Carpenter/Franke/Levi)** | v2 routine formats, all cheap to print and hard to author well | Practitioner design, no trials. Generate quantities as SVG rather than sourcing photos — exact answers, seed-determinism, low ink |

### 5.4 Do **not** cite as evidence for anything

| Program | Why |
| --- | --- |
| **Bridges in Mathematics** | WWC identified 23 studies; **zero met evidence standards.** ESSA's "Moderate" rests on quasi-experiments averaging **+0.06**. EdReports scores are alignment reviews, not efficacy |
| **Singapore Math / Math in Focus** | WWC: **no studies met standards.** The one independent RCT gives ~+0.12 on problem solving with the state test non-significant and 21% teacher fidelity. ESSA's "Strong" includes vendor-contracted evaluations |
| **Number Worlds** | WWC: **no studies met standards.** The number-sense research cited for it is Jordan and Dyson's separate program |
| **Do The Math** | No WWC report, no ESSA entry. The cited research is the publisher's own uncontrolled 2008 study |
| **JUMP Math** | The two-year cluster RCT is genuinely **mixed**, including a **−0.25 SD grade-2 year-1 effect favouring the comparison group**. ESSA rates it "Promising" (lowest tier). Study the scaffolding as craft; do not cite the outcomes |
| **Numberblocks** | No RCT, no WWC review, no ESSA rating. A BAFTA and a DfE resource listing are not efficacy evidence. Worth studying as design — and it scores *lowest* on real-world connections and interactivity, which is a real opening |
| **ST Math** | Fine as a benchmark (+0.07 average across 4 studies, 346k students) but **the "0.35 SD" figure is a self-selected high-fidelity subgroup from a matched-comparison study** — a selection artifact, not a causal estimate |
| **Prodigy** | The anti-model. Its own cited research implies ~888 answered questions per standardized-test point; a documented 19-minute observation logged 16 membership ads against 4 math problems; non-members score lower for identical work |
| **DragonBox** | Cite as the instructive *failure*: beautiful custom notation, high engagement, gains below ordinary textbook instruction, documented transfer gap because the monsters were never tied to mathematical properties. Our print twin is the bridge DragonBox lacked |
| **Cognitive Tutor / MATHia** | Grades 6–12. Out of scope, and its geometry-domain effect was negative and significant |
| **Bedtime Math** | Frank's *Science* comment reanalysed the authors' own data and found no significant condition-by-time interaction. Treat the surviving claim — benefit concentrated in children of high-math-anxiety **parents** — as a hypothesis about the adult, which is directly relevant to our copy: calm, scripted, low-stakes, no implication the parent needs to be good at math |

### 5.5 The claims Izzi Math is allowed to make

- ✅ "Built on the practices the IES/WWC practice guide rates as strong evidence, and it says which one each activity uses."
- ✅ "The number line activities follow the design that produced d ≈ 1.0 in a randomised experiment — including the details that mattered, and we say what the pooled estimate is."
- ✅ "The grade-4 fraction sequence follows a WWC-reviewed program's validated week order."
- ✅ "The topic order comes from Illustrative Mathematics, which is expert-vetted for design quality."
- ❌ Any effect-size claim for **Izzi Math itself**. The realistic ceiling for a light-touch digital home product is **+0.04 to +0.13 SD** (Zearn +0.11, ST Math +0.07, DreamBox +0.11, ASSISTments +0.13). Nothing entitles us to claim more.
- ❌ Any implication that IM K–5 is efficacy-proven, or that middle-school IM effects are ours.
- ✅ And one thing worth saying out loud, because it is both honest and the strongest commercial position available: **nobody in the parent-facing K–5 market states which of their design choices are evidence-backed and which are craft judgement.** Characters, aesthetics, the print bridge and the seed architecture are design bets. The mechanics are not. Say which is which.

### 5.6 Two structural facts to design around

**Effects fade.** Building Blocks' 0.63 SD preschool impact retained ~40% by end of grade 1 and almost nothing by grade 4 (~60% decay per year); Math Recovery's grade-1 effects were gone by grade 2. This is not an argument against building — it is an argument that **continuation is the mechanism**, which makes the seeded-generator "infinite practice" model and the full K–5 span the correct structural answer. Spaced review of prior units and the next unit must be first-class product surfaces, not afterthoughts.

**The K–5 causal evidence gap is an opportunity.** There is no high-quality study of IM K–5 learning impacts, and the CURATE panel called it "a promising and important area for further study." A product that instruments its own cool-downs, checkpoints and delayed retries — which the `(activity, seed)` URL key already makes nearly free — can generate the elementary evidence the field does not have.