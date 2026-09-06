# If there is ever a backend

Written while building the character cup (2026-09-06), which is the first feature
that would benefit from one. It runs entirely on-device today and the page says
so; this is what turning it on would actually take, and which of the plausible
backends is the right shape for it.

The short version: **there are two separate problems here, they want different
backends, and the cheap one is the one worth doing first.**

---

## The two problems are not the same size

| | The cup | Profile sync |
| --- | --- | --- |
| What it stores | **N counters**, one per character | Every child's progress and badges |
| Rows per child | **zero** | one profile + one doc per activity |
| Needs identity | **no** | yes |
| Needs authentication | **no** | yes, and see below |
| Privacy surface | four integers | a child's whole history |
| Rough size | ~50 lines and one table | the thing `src/lib/profile.js` was built for |

**The cup's character view needs no accounts at all.** It is four numbers that go
up. Nobody logs in to increment a counter, there is no per-child row to protect,
and the worst case for an attacker is that a cartoon koala looks more popular
than it is. That is why it is worth building first and separately: it delivers
the visible feature without touching the identity question.

**The cup's PLAYER view is a different matter, and only because of scope.** On
one device it is free — it reads the profiles already in this browser and sends
nothing. Made *global*, it stops being N counters and becomes exactly the
per-child problem in the right-hand column: a row per child, an identity to
attach it to, and something worth taking. So:

> The player view is safe to ship now and is **not** safe to make global on the
> back of a nine-bit snack. If it ever goes global it goes with profile sync, not
> with the counters.

Worth noting what makes the local player view defensible at all: it ranks on
**effort** — activities done and sheets printed — and shows **no place numbers**.
Badges would have made it a skill board, because 8 of the 24 are skill gates (the
five Climbing badges are reached depth, the three Streaks badges are consecutive
right answers). `scripts/check.mjs` fails the build if either property is lost.

One thing this view sharpens locally that a global one would blunt: on a single
device, the players are **siblings**. Sibling-versus-sibling in the same house is
the closest-to-the-bone version of the comparison, and it is the exact thing the
snack check was built to prevent ("so that two children sharing a tablet land on
their own scores"). Effort-only ranking and no places are what keep it on the
right side of that; if it ever starts showing badges or positions, it has crossed
back over.

Profile sync is a different project, and it is the one that runs into the
authentication problem below. Do not let the cup drag it along.

---

## The recommendation

**For the cup: one Cloudflare Worker with a Durable Object (or KV), spoken to
with plain `fetch`.**

- No client SDK. The build is zero-dependency and the client ships hand-written
  ESM; adding a ~100KB vendor SDK to increment four counters would be the largest
  single thing on the page.
- Two routes: `POST /cup` with a small delta, `GET /cup` returning the totals,
  edge-cached for a minute. A Durable Object gives a consistent counter without a
  database; KV is eventually consistent, which for a house cup is fine.
- Cost is effectively zero at this traffic, and there is no cold-start problem
  worth caring about for a counter.
- It never sees a profile id, a name or an avatar — only `{ character, badges,
  right }`. That is worth writing into the request shape so it cannot drift.

**For profile sync later: Firestore is a defensible choice, and not for the
reason it usually is.** `src/lib/profile.js` was deliberately built against it —
async API, documents at paths, per-field merge rules, plain JSON — and it says a
driver "would be about thirty lines and nothing above it would change." I read
the code; that looks true. Offline persistence and atomic increment are both
free, and both are exactly what the MERGE table describes.

Its real costs, stated plainly:

- **The client SDK is big** — an order of magnitude more JavaScript than the
  entire current site. That fights the "no dependencies" property more than any
  other decision in this document.
- **Security rules cannot authenticate a snack.** Firestore rules reason about a
  Firebase auth token. There isn't one here, and there is not going to be — see
  below. Anonymous auth gives every browser a token that says nothing about which
  child it is, so the rules would end up allowing any client to write any
  profile. That is not Firestore's fault; it is the identity model.
- **Reads are the billing unit.** Cheap here, but a leaderboard implemented as
  "read every profile" is the classic way to make it not cheap. The cup avoids
  this by construction: N counters, already summed.

**Worth a look before committing:** Supabase, if you would rather have SQL and
row-level security, and because its REST endpoint means you can still use plain
`fetch` and skip the SDK. Cloudflare D1 if you already have the Worker. Both are
about the same effort as Firestore for this shape of data.

**Not worth it:** anything that needs a container running, and anything where the
free tier sleeps. A children's site that is slow on the first visit of the
morning is worse than one with no cup.

---

## The problem no backend solves

**Nine bits is not a password, and a backend is what makes that matter.**

Sign-in today is: pick your character-name from a list, then pick your snack from
**six** offered out of 500. That is a **one-in-six** guess — `content/avatars.js`
says so, in a comment that ends *"Do not let it grow into something that guards
anything that matters."* It is a nudge to keep two siblings on their own scores
when nothing ever leaves the browser, and for that it is well judged.

Moving to "pick from all 500" takes it from **2.6 bits to 9.0 bits**. A script
tries 500 options in seconds, so it is still not authentication — and it costs a
lot on the way:

- The decoy rules deliberately avoid putting "Dragon pancakes" next to "Moon
  pancakes", so a child who half-remembers still gets in. A 500-tile grid throws
  that away, for a six-year-old, with **no recovery path**.
- **Three snacks in order from a twelve-tile grid is 10.8 bits** — more than
  1-of-500 — from three easy taps instead of one long search. If more entropy is
  wanted, that is the direction: recognition, not recall.

Either way it is obfuscation. The honest position:

> **Per-character totals need no authentication. Per-child anything does.** If a
> child's history is ever synced to a server, the snack cannot be what protects
> it, and the alternative is a real secret — which is the thing this project has
> deliberately chosen not to have.

A workable middle path exists: sync a profile keyed on a **long random device
token** the browser keeps, with the snack demoted to what it already is — the
picker that chooses between the profiles on this device. The token is the
credential, the child never sees it, and nothing identifying is stored. The cost
is that a lost browser is a lost profile, which is already true today.

---

## One thing the architecture gives you for free

Problems are a deterministic function of a seed, and the seed is in the URL. So a
server can re-derive any problem from `(activityId, seed, index)` and **check
that a submitted answer was actually right**. Most products cannot verify a
submitted score at all.

The limit is sharp and worth stating: it proves the answers were right. It cannot
prove a human answered them, and it cannot prove how long it took. So:

- **Badge and answer counts are checkable.** Rank on those.
- **Times are not.** Which is also why the cup does not rank on speed, and why
  the site says in three places that it never produces a score.

## And one invariant that would change

`CLAUDE.md` currently argues that getting a suggestion to the author "needs one of
exactly three things and there is no fourth: an account on something, an address
the site publishes, or a third-party endpoint." **A backend is the fourth.** Once
one exists, the Google Form and the GitHub split could collapse into a single
direct post, and that paragraph needs rewriting rather than quietly outliving its
own reasoning.

The ongoing cost is the part that tends to get underestimated: a writable
endpoint attached to a children's product means rate limiting, some thought about
abuse, uptime, and a privacy policy page. Today there is none of that, and the
hosting is free.
