# Case study storytelling template

> How every UX case study on this site is written. The structure is distilled from Kunal Satpal's
> case studies (Promo Zone, Cart Abandonment, Partner.fit, Fitclub V2, WhatsApp Polls), then tuned
> for a senior / founding product designer narrative. Layout and UI are defined in `DESIGN.md`
> ("Case-study long-form direction"); this file only covers **what the story says and in what order**.

---

## 1. What makes these stories work

| Pattern | Seen in | Why it works |
|---|---|---|
| **Open on the brief, then the turn.** "I was tasked with X. What I found sent us somewhere else." | Promo Zone, Cart Abandonment | Shows judgment in the first paragraph, not after the reader has scrolled past background. |
| **A causal chain, not a process list.** Context → evidence → insight → hypothesis → decision → test → outcome → lesson. | All five | Every section answers "so what?" for the one before it. |
| **Numbered insights and challenges.** "1. Indonesia is budget sensitive. 2. Funnel analysis…" | Promo Zone, Partner.fit | Scannable; a hiring manager can skim the argument in 20 seconds. |
| **Success criteria and guardrails up front.** Short-term and long-term goals, plus what must not get worse. | Fitclub V2, Partner.fit | Signals product thinking, not only interface thinking. |
| **Killed ideas, out loud.** "We tried a scratch-card reveal, realised we were overdoing it, removed it." | Fitclub V2 | Judgment is shown by what you cut. |
| **Stakeholder craft.** "An artefact to gain buy-in, from my PM up to the SLT." | Promo Zone | Seniority is influence, not only output. |
| **Small bet, fast test.** "We built a widget from existing atoms and ran a 2-week A/B test." | Cart Abandonment | Speed and rigour together. |
| **Honest close.** "Several assumptions were made; the solution needs deeper research." | WhatsApp Polls, Promo Zone | Credibility. Reviewers trust the numbers more when limits are named. |

---

## 2. The master arc

Ten beats. Most case studies use six to nine of them; the order never changes.

| # | Beat | Section `title` (contents rail) | The statement answers | Typical blocks |
|---|---|---|---|---|
| 01 | **The brief** | `Overview` or `The brief` | What was I asked to do, and what was really at stake? | `text`, three `cards` (Problem / Solution / Outcome), hero media |
| 02 | **The turn** | `Problem` | What did I find that changed the question? | `text`, `media` (journey, old flow) |
| 03 | **Evidence** | `Research` / `Insights` | What did we learn, from whom, and how many? | numbered `cards` (count, method, finding), `dash` |
| 04 | **Reframe** | `Reframe` / `Strategy` | What is the problem now, how will we know we won, what must not break? | `cards`: Goal, Success metric, Guardrail |
| 05 | **Principles** | `Principles` | What rules did I set before designing, so later trade-offs had a referee? | `steps` (3–4 principles) |
| 06 | **Explorations** | `Ideation` / `Exploration` | What did we try and kill, and why? | `media` diagram `versus`, `cards` with reasons |
| 07 | **Decisions** | `Solution` / feature names | What did I decide, what did it cost, what did it buy? | `trades` (Decision 1…n), `ui`, `media` |
| 08 | **Validation** | `Validation` / `Testing` | How did we test it before and after shipping? | `text`, `cards`, `dash` |
| 09 | **Impact** | `Impact` / `Outcome` | What changed for users and for the business? | `dash`, `cards`, `quote` |
| 10 | **Reflection** | `Learning` / `Next steps` | What would I do differently, and what comes next? | `text`, `quote`, risks as `cards` |

### Prompts for each beat

1. **The brief.** "When I joined ___, I was asked to ___. The real problem was ___." End with one line of stakes (revenue, retention, trust, time).
2. **The turn.** One sentence that reframes the brief. "They weren't churning, they were quietly drifting."
3. **Evidence.** Lead with scale (`650+ reached, 72 qualified, 12 interviewed`), then 3–4 numbered findings. Each finding is a number plus a plain-language meaning.
4. **Reframe.** Write the new problem statement as a question. Add one success metric and one guardrail.
5. **Principles.** Three or four imperative rules ("Ask less upfront", "Never a dead end").
6. **Explorations.** For each killed idea: the idea in one line, the reason it died in one line.
7. **Decisions.** Use the trade-off rows: `User need / Business need / Constraint / Compromise`, or `Issue / Hypothesis / Result` for iterations.
8. **Validation.** Method, sample, duration. "A 2-week A/B test", "12 AI agents, then 8 power users".
9. **Impact.** The headline metric first, then two or three supporting metrics, then what it meant for the business.
10. **Reflection.** One lesson that generalises beyond the project, and one honest limitation.

---

## 3. Writing rules

- **Statements are claims, not labels.** `"Problem: power users were quietly drifting."` not `"Problem"`. The prefix before `: ` is the section label and is stripped when shown (if it's under 48 characters).
- **One idea per section.** If a section needs two statements, it is two sections.
- **Paragraphs:** two or three, each under ~60 words. 15px muted body, so length shows.
- **Cards:** title is the claim (often a number), the line is what it means. `["64% post-milestone", "Disengaged after major milestones like certifications"]`.
- **First person, precise ownership.** "I led", "I set the north star", "we shipped". Use "we" for team work and say so once.
- **Verbs of judgment:** chose, cut, killed, bet, traded, scoped, deferred, aligned.
- **No filler openers** ("In today's fast-paced world…"), no tool lists in the story (they go in `meta`).

---

## 4. Leadership lenses: startup vs enterprise

The same arc reads differently depending on where the work happened. Pick the lens from the team, not the title.

| | **Startup / founding designer** (CotonAI Modes, CotonAI Design System, Arcade take-home) | **Enterprise / large team** (Gap, Trailhead with Salesforce) |
|---|---|---|
| **The brief** | No brief. "I defined the problem." Ambiguity is the starting point. | A brief from product leadership. "I was asked to ___; I reframed it as ___." |
| **Stakes** | Survival metrics: paid pilots, conversion to revenue, time to value, cost saved. | Scale metrics: add-to-bag, retention, drop-off, across millions of users. |
| **Evidence** | Shadowing, founder and customer calls, product analytics (PostHog), fast MVPs. | Structured research ops, recruiting funnels, UXR partners, A/B tests. |
| **Decisions** | Product strategy and sequencing: what to build first, what to defer, which model to use. | Trade-offs negotiated across PM, engineering, research, merchandising. |
| **Seniority signal** | Owning strategy, design system, and shipping code; influencing business decisions. | Leading a team, aligning stakeholders, protecting the guardrails at scale. |
| **Speed** | "MVP in 3 weeks", "V1 to V2 in one season". | "Six months, three experiment rounds", staged rollout. |
| **Close** | What the company now does because of the work (pilot, roadmap, system). | What the org learned and adopted (language, patterns, rollout plan). |

---

## 5. Numbers: how to make them hit, honestly

Make every real number land. Never publish a number as observed if it wasn't.

**Do**
- Lead with the strongest *real* metric and give it context: `+61% add-to-bag` → "from the old flow, measured over the test period".
- Convert to what a reviewer feels: `584 hours` → "about 73 working days in one season".
- Show before → after: `8 clicks → 3`, `3–5 revisions → 1–2`.
- Use ranges and qualifiers where they are true: "typical", "early pilot", "in testing".

**When a number doesn't exist yet**, it can still appear, but it must say what it is:

| Label | Use for | Example |
|---|---|---|
| `Prototype target` | A goal set before launch | "Prototype target: first authorized call in under 5 minutes" |
| `Modeled estimate` | Arithmetic from real inputs | "Modeled estimate: ~$40k a season in sampling cost, from 584 hours at a blended rate" |
| `Illustrative` | Shape of a chart without data | "Illustrative shape. No data until it's instrumented." |
| `Measurement plan` | Metrics you will track | "M1: time to first authorized call" |

Named clients (Gap, Salesforce, Steele) only carry numbers that are already in this portfolio or the résumé.

---

## 6. Variants

- **Shipped product.** Full arc, Impact carries measured results.
- **Concept / take-home.** Swap `Validation` for `Measurement` (plan, not results) and add `Risks` in the reflection. Say "simulated data" once, plainly.
- **Confidential.** Brief + one decision + headline outcome + `cta` "Book a call". Three sections at most.
- **Early-stage AI.** Separate *what the live product proved* from *where the agent is going*. Pilot numbers are labelled "early pilot".
- **Compressed six-beat.** Overview · Insight · What we killed · What we shipped · Build & test · Impact & learning. Merge evidence, findings and reframe into one Insight section; put sub-beats (findings, killed ideas, features) in `trades` so they get subheads without adding rail items. Trailhead Solve uses this.

---

## 7. Schema reference (`PROJECTS[].cs.sections` in `js/site.js`)

```js
{
  title: "Reframe",                                   // contents rail + mono label
  statement: "Reframe: re-engagement, not retention.", // NType heading (prefix stripped)
  text: ["Two or three short paragraphs."],
  cards: [["Goal", "Bring power users back between milestones."],
          ["Success metric", "Session duration and post-milestone drop-off."],
          ["Guardrail", "No AI speaking on a real person's behalf."]],
  steps: [["Ask less upfront", "Optional line."]],    // numbered
  stepsTitle: "Principles",                           // heading above steps (default "How it works")
  trades: [{ n: "Decision 1", t: "Accuracy vs completion",
             rows: [["User need", "…"], ["Business need", "…"], ["Constraint", "…"], ["Compromise", "…"]],
             note: "One-line consequence." }],
  media: ["Placeholder caption", { src, alt, cap }, { video, poster, alt, cap }, { diagram: { kind: "flow" | "merge" | "versus", … } }],
  dash: [{ type: "kpi", w: 4, label: "Add-to-bag", value: "+61%", note: "…" }],
  quote: "One sentence.", quoteBy: "Name or role",
  cta: { label: "Book a call", href: BOOK_A_CALL },
  ph: "02",   // optional: pins placeholder IDs (C2-02-1…) when sections are inserted above
}
```

### Copy-ready skeleton

```js
sections: [
  { title: "Overview", statement: "Overview: <the stakes in one line>.",
    text: ["When I joined <team>, I was asked to <brief>.", "<What was really at stake>."],
    cards: [["Problem: <claim>", "<line>"], ["Solution: <claim>", "<line>"], ["Outcome: <metric>", "<line>"]] },
  { title: "Problem", statement: "Problem: <the turn>.", text: ["<Why the brief was the wrong question>."] },
  { title: "Research", statement: "Research: <what the evidence said>.",
    text: ["<Method, scale, duration>."], cards: [["<n> <finding>", "<meaning>"], ["…", "…"], ["…", "…"]] },
  { title: "Reframe", statement: "Reframe: <new problem as a claim>.",
    cards: [["Goal", "…"], ["Success metric", "…"], ["Guardrail", "…"]] },
  { title: "Principles", statement: "Principles: <the rule that refereed every trade-off>.",
    stepsTitle: "Principles", steps: [["<Principle 1>", "…"], ["<Principle 2>", "…"], ["<Principle 3>", "…"]] },
  { title: "Explorations", statement: "Explorations: <n> ideas, built to be killed.",
    cards: [["<Idea>: killed", "<reason>"], ["<Idea>: killed", "<reason>"]] },
  { title: "Solution", statement: "Solution: <the bet>.",
    trades: [{ n: "Decision 1", t: "<A vs B>", rows: [["User need", "…"], ["Business need", "…"], ["Constraint", "…"], ["Compromise", "…"]] }] },
  { title: "Validation", statement: "Validation: <how we knew before launch>.", text: ["<Method, sample, duration>."] },
  { title: "Impact", statement: "Impact: <headline metric>.", dash: [/* kpis */], cards: [/* supporting */] },
  { title: "Learning", statement: "Learning: <the lesson that generalises>.", text: ["…"], quote: "…", quoteBy: "…" },
]
```

---

## 8. Pre-publish checklist

- [ ] The first paragraph says what I was asked to do and what I found.
- [ ] Every statement is a claim a reviewer could disagree with.
- [ ] There is at least one killed idea or explicit trade-off.
- [ ] Success metric and guardrail are named before the solution.
- [ ] The headline metric appears in the hero tile, the Overview and Impact, with the same value.
- [ ] Every number is observed, or labelled `Prototype target`, `Modeled estimate`, `Illustrative` or `Measurement plan`.
- [ ] Team work says "we" and names the team once.
- [ ] The reflection names one limitation.

---

## 5. The branding and redesign arc (after Contra, "Crown AI Rebranding for Enterprise Credibility")

Used for identity and redesign work where the story is a positioning call, not a research process (Payman AI). Six beats, in this order, with these section titles:

| # | Section `title` | The statement answers | What goes in it |
|---|---|---|---|
| 1 | **The Setup** | Who is the company, what is the product, who is the buyer, and what does the surface say today? | Two or three paragraphs, hero media |
| 2 | **The Tension** | Why does the category's default fail this buyer? What is the gap between product and surface? | The category problem, the pressure, the real challenge (belief, not awareness) |
| 3 | **The Decision** | What was the one strategic call? What did it reject? | Positioning line, the rejected conventions, the principle |
| 4 | **The System** | How does the identity follow from the decision? | Color, Typography, Artwork, Messaging architecture, one paragraph each, led by its name |
| 5 | **The Impact** | What do the surfaces now say? | Qualitative outcome; name when there are no production metrics |
| 6 | **The Takeaway** | What generalises? | One principle, then honest limits and the next step |

Rules: the system is *derived from* the decision, never assembled from taste; each System paragraph starts with its own name and explains the reasoning, not only the value; copy is exactly one idea per paragraph; honesty about a portfolio redesign (no invented metrics) is part of the story.

