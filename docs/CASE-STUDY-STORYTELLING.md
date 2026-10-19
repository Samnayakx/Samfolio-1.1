# Case study storytelling template

> How every UX case study on this site is written. The structure is distilled from Kunal Satpal's
> case studies (Promo Zone, Cart Abandonment, Partner.fit, Fitclub V2, WhatsApp Polls), then tuned
> for a senior / founding product designer narrative. Layout and UI are defined in `DESIGN.md`
> ("Case-study long-form direction"); this file only covers **what the story says and in what order**.
> Every case study, UX or branding, uses the same seven sections (after Ruben Cespedes' "Case Study Structure").

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

## 2. The seven sections

Every case study has exactly seven sections, in this order. The order never changes, and the renderer
(`CS_STRUCTURE` in `js/site.js`) supplies the numbered label, so a section object has no `title` to maintain.
`tools/check-seo.cjs` fails if a prerendered page does not have all seven.

| # | Section (contents rail) | The statement answers | Typical blocks |
|---|---|---|---|
| 01 | **Overview / Background** | What is this, who is it for, and what happened? | `text`, three `cards` (Problem / Solution / Outcome), hero media |
| 02 | **Defining the Problem** | What was broken, what did I find that changed the question, and what did it cost? | `text`, `media` (journey, old flow), `cards` |
| 03 | **Understanding your Users** | Who are they, what did we learn from them, and how many? | `stats`, numbered findings (`trades` or `cards`) |
| 04 | **Your Role and Responsibilities** | What was mine, who did I work with, and for how long? | `text`, `cards` (role, team, tools) |
| 05 | **Scope and Constraints** | What boxed this in, how will we know we won, and what did we choose not to do? | `cards`: Success metric, Guardrail, Limits; `steps` for principles |
| 06 | **Ideation Steps (The Solution)** | What did we try, kill and ship, and why? | `parts` (one per beat), `trades` (Decision 1…n), `media`, `ui` |
| 07 | **Outcomes and Takeaways** | What changed, what are the honest limits, and what would I do differently? | `dash`, `cards`, `quote`, `parts` for Learning |

### Prompts for each section

1. **Overview / Background.** "When I joined ___, I was asked to ___. The real problem was ___." End with one line of stakes (revenue, retention, trust, time).
2. **Defining the Problem.** One sentence that reframes the brief. "They weren't churning, they were quietly drifting." Then the question the rest of the study answers.
3. **Understanding your Users.** Lead with scale (`650+ reached, 72 qualified, 12 interviewed`), then 3–4 findings. Each finding is a number plus a plain-language meaning. If there was no user research, say so and name the evidence you used instead.
4. **Your Role and Responsibilities.** Title, timeline, team, and what you owned. Use "I" for owned work and "we" for team work, and say so once. Say plainly when the project was solo.
5. **Scope and Constraints.** The success metric, the guardrail, and the limits (data, time, people, platform). Include the rules you set before designing, so later trade-offs had a referee.
6. **Ideation Steps (The Solution).** Killed ideas first (the idea in one line, the reason it died in one line), then decisions with trade-off rows: `User need / Business need / Constraint / Compromise`, or `Issue / Hypothesis / Result` for iterations. Put each beat in a `part`.
7. **Outcomes and Takeaways.** The headline metric first, then two or three supporting metrics, then what it meant for the business. Close with one lesson that generalises, and one honest limitation.

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

The seven sections never change. A variant only changes what goes inside them.

- **Shipped product.** Outcomes carries measured results.
- **Concept / take-home (Arcade).** In 07, show a `Measurement` part (a plan, not results) and a `Takeaway` part with risks. Say "simulated data" once, plainly, in 05.
- **Confidential.** Keep all seven, but keep each short. Overview, one decision in 06, the headline outcome, and `cta` "Book a call".
- **Early-stage AI (CotonAI Agent).** In 05, separate *what the live product proved* from *where the agent is going*. Pilot numbers are labelled "early pilot".
- **Startup, then acquired (Gap 3D Fit).** Overview states the hypothesis with the startup and acquisition context, using public sources. 06 holds the decisions (real screen first, then the four trade-off rows, then "What testing showed / What I did next") and the final flow as a part. Lead 07 with the method ("A/B test") before the number. Use real screens and published numbers only.
- **Compressed (Trailhead Solve).** 06 carries `What we killed`, `What we shipped` and `Build & test` as parts, so the longer beats get sub-heads without adding rail items.
- **Systems work (CotonAI Design System).** 03 is about the people who build with the system, not end users. If there was no user study, say so.
- **Branding and redesign (Payman AI).** Positioning is the decision. 02 is the tension between product and surface, 03 is the buyer, 06 holds the decision, the system and the page as parts, and 07 names when there are no production metrics. The system is *derived from* the decision, never assembled from taste, and each system paragraph starts with its own name.

---

## 7. Schema reference (`PROJECTS[].cs.sections` in `js/site.js`)

`sections` is an array of exactly seven objects, in the order above. The label and number come from `CS_STRUCTURE`, not from the object. Put an optional `title` on a section for readability only.

```js
{
  title: "Scope and Constraints",                      // optional, for readability. The rail label comes from CS_STRUCTURE.
  statement: "Constraints: public docs only, no Agentforce.", // NType heading (prefix stripped)
  text: ["Two or three short paragraphs."],
  cards: [["Success metric", "Session duration and post-milestone drop-off."],
          ["Guardrail", "No AI speaking on a real person's behalf."],
          ["Limits", "Curated public documentation, 8 power users."]],
  steps: [["Ask less upfront", "Optional line."]],    // numbered
  stepsTitle: "Principles",                           // heading above steps (default "How it works")
  trades: [{ n: "Decision 1", t: "Accuracy vs completion",
             rows: [["User need", "…"], ["Business need", "…"], ["Constraint", "…"], ["Compromise", "…"]],
             note: "One-line consequence." }],
  media: ["Placeholder caption", { src, alt, cap }, { video, poster, alt, cap }, { diagram: { kind: "flow" | "merge" | "versus", … } }],
  dash: [{ type: "kpi", w: 4, label: "Add-to-bag", value: "+61%", note: "…" }],
  quote: "One sentence.", quoteBy: "Name or role",
  cta: { label: "Book a call", href: BOOK_A_CALL },
  parts: [{ title: "What we killed", statement: "What we killed: …", /* any field above */ }],
  ph: "02",   // optional: pins placeholder IDs (C2-02-1…) when sections move
}
```

`parts` render under the section's own content. Each part shows a mono label (its `title`) and an NType sub-heading (its `statement`), then fills like a section. Use parts when more than one beat belongs under one of the seven sections.

### Copy-ready skeleton

```js
sections: [
  { statement: "Overview: <the stakes in one line>.",
    text: ["When I joined <team>, I was asked to <brief>.", "<What was really at stake>."],
    cards: [["Problem: <claim>", "<line>"], ["Solution: <claim>", "<line>"], ["Outcome: <metric>", "<line>"]] },
  { statement: "Problem: <the turn>.", text: ["<Why the brief was the wrong question>."] },
  { statement: "Users: <what the evidence said>.",
    text: ["<Method, scale, duration>."], cards: [["<n> <finding>", "<meaning>"], ["…", "…"], ["…", "…"]] },
  { statement: "Role: <what I owned>.", text: ["<Title, timeline, team>."],
    cards: [["<Title>", "<dates>"], ["Owned", "<what>"], ["Worked with", "<who>"]] },
  { statement: "Constraints: <what boxed it in>.",
    cards: [["Success metric", "…"], ["Guardrail", "…"], ["Limits", "…"]] },
  { statement: "Solution: <the bet>.",
    parts: [
      { title: "What we killed", statement: "What we killed: <n> ideas, built to be killed.", cards: [["<Idea>: killed", "<reason>"]] },
      { title: "What we shipped", statement: "What we shipped: <the bet>.",
        trades: [{ n: "Decision 1", t: "<A vs B>", rows: [["User need", "…"], ["Business need", "…"], ["Constraint", "…"], ["Compromise", "…"]] }] },
    ] },
  { statement: "Outcome: <headline metric>.", dash: [/* kpis */], cards: [/* supporting */],
    parts: [{ title: "Learning", statement: "Learning: <the lesson that generalises>.", text: ["…"], quote: "…", quoteBy: "…" }] },
]
```

---

## 8. Pre-publish checklist

- [ ] There are exactly seven sections, in order. `node tools/check-seo.cjs` passes after the prerender.
- [ ] The first paragraph says what I was asked to do and what I found.
- [ ] Every statement is a claim a reviewer could disagree with.
- [ ] There is at least one killed idea or explicit trade-off.
- [ ] Success metric and guardrail are named in Scope and Constraints, before the solution.
- [ ] Section 03 says who the users are, or says plainly that there was no user research.
- [ ] Section 04 says what I owned and what was shared.
- [ ] The headline metric appears in the hero tile, the Overview and Outcomes, with the same value.
- [ ] Every number is observed, or labelled `Prototype target`, `Modeled estimate`, `Illustrative` or `Measurement plan`.
- [ ] Team work says "we" and names the team once.
- [ ] The reflection names one limitation.

---
