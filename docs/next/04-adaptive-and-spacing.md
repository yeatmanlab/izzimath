# 4. Adaptive difficulty and spaced review

Large. **Both blocked on accounts**, for the same reason. Not started.

## Why they are blocked together

Izzi Math is stateless by design: the seed lives in the URL and nothing is
stored. Adaptivity and spacing both need to know what a child did *last time*,
which is the one thing the architecture deliberately does not know.

This is a real tension, not an oversight. The statelessness is what makes the
site free, private, accountless and shareable. Do not give it up casually.

## Adaptive difficulty

The best-specified engine in the literature is The Number Race
(Wilson & Dehaene), already cited in `content/references.js` — three difficulty
dimensions (numerical distance, response deadline, conceptual complexity), a
rolling 20-trial success estimate, and a target around 75–85% correct.

Build it **once, as a shared service**, and point every speed game at it. Then
Ten-Frame Flash, Which Is More, Decimal Drop and the fact-family rounds all
become configurations of one engine rather than four hand-tuned difficulty
ladders.

Two cautions:

- **Do not optimise for in-session ease or self-reported enjoyment.** Desirable
  difficulty feels worse and tests better. Interleaving has exactly this
  signature: lower in-session accuracy, large gains on a delayed test.
- The deadline dimension should stay **off by default**, consistent with the
  rest of the site.

### The honest interim version

Within-session adaptivity needs no storage. A game already knows how the current
run is going, so it can adjust the next round without any account at all. That
captures a good share of the benefit and requires nothing new architecturally.

## Spaced review

Same total practice spread across days beats massing it. But the effect is
grade-sensitive: it held to six weeks at grade 7 and only to about **one week**
at grade 3. So for K–5, weight the gaps *within* a week.

### The honest interim version

Ship a **"this week's mixed review" sheet** whose seed encodes which skills the
child has already met, with a printed five-day schedule on the sheet itself. The
paper carries the state. No account, no storage, and it works today.

## When accounts arrive

The key is already designed: `(user, activity_id, seed)`. Nothing about the
content model changes — see `../CONCEPT.md`. Add route handlers and a provider;
the generators stay exactly as they are.

## Acceptance

- One adaptive service, not one per game
- Deadline dimension off by default
- Within-session adaptivity works with no stored state
- The weekly review sheet works with no account
- Statelessness is still the default path, not a degraded one
