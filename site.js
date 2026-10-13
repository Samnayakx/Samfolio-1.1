// ── Dot-matrix glyphs: 11×11 bitmaps, "#" = lit dot ──
const GLYPHS = {
  // About page characters (13×13, "e" = blinking eye)
  systems: [
    ".............",
    "..#########..",
    "..#.......#..",
    "..#.e...e.#..",
    "..#.......#..",
    "..#..###..#..",
    "..#########..",
    ".....#.#.....",
    "...#######...",
    "...#.#.#.#...",
    "...#######...",
    "...#.#.#.#...",
    "...#######...",
  ],
  translator: [
    "....#####....",
    "..##.....##..",
    ".#.........#.",
    ".#.ee...ee.#.",
    ".###########.",
    ".............",
    "...#######...",
    "#..#######..#",
    ".#.#######.#.",
    ".............",
    ".#...#...#...",
    "#.#.#.#.#.#.#",
    "...#...#...#.",
  ],
  tinkerer: [
    "......#......",
    "..#...#...#..",
    "...#.....#...",
    ".....###.....",
    "....#...#....",
    "#..#.e.e.#..#",
    "...#.....#...",
    "#..#.###.#..#",
    "....#...#....",
    ".....###.....",
    "...#.....#...",
    "..#...#...#..",
    "......#......",
  ],
  advocate: [
    ".............",
    "..###...###..",
    ".#...#.#...#.",
    "#.....#.....#",
    "#..e.....e..#",
    "#...........#",
    ".#...###...#.",
    "..#.......#..",
    "...#.....#...",
    "....#...#....",
    ".....#.#.....",
    "......#......",
    ".............",
  ],
  facilitator: [
    "......#......",
    ".....#.#.....",
    ".....#.#.....",
    "#####...#####",
    ".#..e...e..#.",
    "..#.......#..",
    "...#.###.#...",
    "...#.....#...",
    "..#...#...#..",
    "..#..#.#..#..",
    ".#..#...#..#.",
    ".#.#.....#.#.",
    ".##.......##.",
  ],
  mentor: [
    "......#......",
    ".....#.#.....",
    "....#...#....",
    "...#.e.e.#...",
    "..#..###..#..",
    ".###########.",
    ".............",
    ".....#.#.....",
    "......#......",
    "....#####....",
    "....#...#....",
    "....#...#....",
    ".....###.....",
  ],
  storyteller: [
    ".###########.",
    "#...........#",
    "#..e.....e..#",
    "#...........#",
    "#...#####...#",
    "#...........#",
    ".#####.######",
    ".....#.#.....",
    ".....##......",
    ".............",
    ".#.#.#.#.#.#.",
    ".............",
    "..#########..",
  ],
  work: [
    "###########",
    "#.#.#.....#",
    "###########",
    "#.........#",
    "#.###.###.#",
    "#.###.###.#",
    "#.........#",
    "#.###.###.#",
    "#.###.###.#",
    "#.........#",
    "###########",
  ],
  process: [
    "........##.",
    ".......#..#",
    "......#..#.",
    ".....#..#..",
    "....#..#...",
    "...#..#....",
    "..#..#.....",
    ".##.#......",
    ".###.......",
    "###........",
    "...........",
  ],
  playground: [
    ".....#.....",
    ".....#.....",
    "....###....",
    "....###....",
    ".#########.",
    "..#######..",
    "...#####...",
    "...##.##...",
    "..##...##..",
    "..#.....#..",
    "...........",
  ],
  about: [
    "...#####...",
    "..#.....#..",
    ".#.......#.",
    "#..#...#..#",
    "#.........#",
    "#.........#",
    "#.#.....#.#",
    "#..#...#..#",
    ".#..###..#.",
    "..#.....#..",
    "...#####...",
  ],
  writing: [
    ".#######...",
    ".#.....##..",
    ".#.....#.#.",
    ".#.....####",
    ".#.###....#",
    ".#........#",
    ".#.######.#",
    ".#........#",
    ".#.######.#",
    ".#........#",
    ".##########",
  ],
  contact: [
    "...........",
    "###########",
    "##.......##",
    "#.#.....#.#",
    "#..#...#..#",
    "#...#.#...#",
    "#....#....#",
    "#.........#",
    "#.........#",
    "###########",
    "...........",
  ],
};

const NS = "http://www.w3.org/2000/svg";
function drawGlyph(svg, boot = true) {
  const rows = GLYPHS[svg.dataset.glyph];
  svg.setAttribute("viewBox", `0 0 ${rows[0].length * 8} ${rows.length * 8}`);
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("shape-rendering", "crispEdges");
  if (boot) svg.classList.add("booting");
  // Only lit cells are drawn, as square pixels: no unlit grid behind the icon
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== "#" && ch !== "e") return;
      const c = document.createElementNS(NS, "rect");
      c.setAttribute("x", x * 8 + 0.5);
      c.setAttribute("y", y * 8 + 0.5);
      c.setAttribute("width", 7);
      c.setAttribute("height", 7);
      c.classList.add("on");
      if (ch === "e") c.classList.add("eye");
      c.style.setProperty("--d", `${(x + y) * 18}ms`);
      svg.appendChild(c);
    });
  });
  // Boot-up: light pixels in a diagonal sweep
  if (!boot) return;
  requestAnimationFrame(() => {
    svg.querySelectorAll("rect.on").forEach((c) => {
      c.style.transitionDelay = c.style.getPropertyValue("--d");
    });
    setTimeout(() => svg.classList.remove("booting"), 150);
  });
}
document.querySelectorAll(".glyph").forEach((svg) => {
  drawGlyph(svg);
  svg.style.setProperty("--blink", `${1.5 + Math.random() * 4}s`);
});

// ── Work: projects (edit this list to add your case studies). Text only. ──
const BOOK_A_CALL = "https://cal.com/sambit-nayak/30min?overlayCalendar=true";
const PROJECTS = [
  {
    name: "Gap 3D Fit", org: "Gap", area: "E-commerce · 3D sizing UX", tags: ["E-comm", "UX Design"],
    title: "Turning sizing uncertainty into a 61% add-to-bag decision.",
    desc: "Technical product designer and team lead on Gap's 3D Fit viewer: fit logic, UX flow, UI and testing across web and iOS.",
    metric: { value: "61%", label: "Add-to-bag lift" }, href: "/case-study?case="1", tint: ["#A4A6A3", "#E7E8E5", "#D6D7D4"],
    cs: {
      meta: [["Role", "Technical Product Designer"], ["Timeline", "6 months"], ["Skills", "UX flow, fit logic, UI, testing, 3D optimization · Web, iOS"], ["Team", "2 PMs, 1 designer, 1 UXR"]],
      sections: [
        { title: "Problem", media: ["Old sizing flow screenshot"], statement: "Problem: the old flow showed fit, but shoppers still felt risk.",
          text: ["Denim made sizing harder: one size had to explain multiple body zones without turning checkout into a long form.", "We saw an opportunity to help shoppers trust a size and move forward, instead of guessing and returning."] },
        { title: "Research", media: ["Sizing research insights / user feedback"], statement: "Research: confidence, not measurements, was the missing piece.",
          text: ["Sizing breakdowns kept coming back to trust: what shoppers saw was precise, but not convincing."],
          cards: [["Measurements were not enough", "Charts were precise; comfort was not."], ["Fit was multi-zone", "Waist, hip, thigh, calf, and inseam all mattered."], ["The answer needed a reason", "A size recommendation without evidence felt risky."], ["Every extra input had a cost", "More personalization could also mean more drop-off."]] },
        { title: "Solution", media: ["Final 3D Fit flow: baseline → calibration → tuning", "Explainable fit screen"], statement: "Solution: ask less upfront, show more evidence when trust is at stake.",
          text: ["The final flow made fit easier to trust without adding friction. Each step either improved the model or helped shoppers verify the recommendation."],
          steps: [["Baseline input"], ["Fit calibration"], ["Optional tuning"], ["Explainable fit"]],
          trades: [
            { n: "Decision 1", t: "Accuracy vs completion rate", rows: [["User need", "Credible sizing."], ["Business need", "Purchase momentum."], ["Constraint", "Too many inputs caused drop-off."], ["Compromise", "Baseline first, tuning optional."]], note: "Complexity moved later, after the value was clear." },
            { n: "Decision 2", t: "Explainability vs purchase velocity", rows: [["User need", "Evidence behind the size."], ["Business need", "Fast purchase flow."], ["Constraint", "Too much rationale slowed action."], ["Compromise", "Fast answer, optional reason."]], note: "The recommendation became inspectable without becoming heavy." },
            { n: "Decision 3", t: "Fit fidelity vs mobile performance", rows: [["User need", "Realistic body-zone fit."], ["Business need", "Reach mobile shoppers."], ["Constraint", "Fidelity slowed performance."], ["Compromise", "Use copy to support visuals."]], note: "Fit copy became interface logic: short, local, decision-tied." },
          ] },
        { title: "Impact", media: ["Results chart or before/after"], dash: [{ type: "donut", w: 4, label: "Add-to-bag", value: "61%", pct: 61, chip: "Lift", note: "Lift after the redesign" }], statement: "Impact: a 61% add-to-bag lift.", 
          text: ["The strongest signal was not more 3D realism. It was reducing sizing ambiguity at the moment shoppers decided whether to trust a size and add to bag.", "The visual was not the product. Confidence was what shoppers believed, understood, and felt ready to do next. I would cut more today: every control should earn its place at the moment of doubt."],
          cards: [["Product", "Connected confidence to commerce signals"], ["Engineering", "Balanced 3D assets with mobile performance"], ["Research", "Mapped trust breakdowns"], ["Fit language", "Aligned product, research, and merchandising terms"]] },
      ],
    },
  },
  {
    name: "AI Studio", org: "AI Studio", area: "Creative tools", tags: ["0→1 Product", "AI Design"],
    title: "Reduced lead time by 3 months and accelerated end-to-end workflow with AI Studio.",
    desc: "A 0→1 AI design product for creative tools. This case study is password protected.",
    metric: { value: "3×", label: "Faster workflow" }, href: "/case-study?case="2", tint: ["#A9AE7F", "#DADBC4", "#C7CBAF"],
    cs: {
      meta: [["Role", "Product Designer"], ["Timeline", "Password protected"], ["Skills", "0→1 product, AI design, creative tools"], ["Team", "Shared on request"]],
      sections: [
        { title: "Problem", media: ["Product hero or workflow image"], statement: "Problem: creative work took too long to get from idea to finished output.",
          text: ["AI Studio is a 0→1 product for creative tools, where AI shortens the path from idea to finished work."] },
        { title: "Impact", media: ["Results or workflow comparison"], dash: [{ type: "bars", w: 6, label: "Workflow speed", value: "3×", chip: "Faster", rows: [["Before", 1, "1×"], ["With AI Studio", 3, "3×"]], note: "Lead time reduced by 3 months" }], statement: "Impact: reduced lead time by 3 months.", 
          text: ["Book a call and I'll share the passcode and walk you through the full case study: research, solution and results."], cta: { label: "Book a call", href: BOOK_A_CALL } },
      ],
    },
  },
  {
    name: "Trailhead Solve", org: "Trailhead", area: "Enterprise · Agentic AI", tags: ["Ed-tech", "UX Research"],
    title: "An AI-powered re-engagement strategy Trailhead power users preferred over ChatGPT.",
    desc: "Improving power-user retention with an agentic AI RAG bot: Trailhead Solve, a dashboard redesign and a RAG assistant.",
    metric: { value: "22.7%", label: "Retention lift" }, href: "/case-study?case="3", tint: ["#BDCFDE", "#EBDAD3", "#E4EAEE"],
    cs: {
      meta: [["Role", "Product Designer (Apprentice)"], ["Timeline", "Aug 2025 – Apr 2026"], ["Skills", "Conversational UX, RAG workflows, power-user research, dashboard design"], ["Team", "Product, research, engineering"]],
      sections: [
        { title: "Problem", media: ["Trailhead power-user journey"], statement: "Problem: power users were leaving Trailhead for ChatGPT, YouTube, and Slack the moment they hit a real Salesforce problem at work.",
          text: ["Salesforce Trailhead was built for the climb: learning, upskilling, and getting certified. But once users became more competent and were in work environments, their needs shifted from learning paths to real problems at work.", "So they left for ChatGPT, YouTube, and Slack communities, where their needs were met. Aside from coming back a few times a year to renew certifications, the platform offered little of practical, immediate value. Re-engagement was the actual problem, not retention."] },
        { title: "Research", media: ["Interview synthesis / affinity map"], statement: "Research: power users needed practical value at work, not another beginner path.",
          text: ["Interviews surfaced a career-stage mismatch: Trailhead still worked for certification, but felt misaligned once people were solving real Salesforce problems daily."],
          cards: [["Re-engagement", "The job was bringing power users back, not holding beginners longer"], ["Where they went", "ChatGPT, YouTube, and Slack communities met their real work needs"]],
          quote: "Trailhead's learning content is just too basic for where I'm at in my career." },
        { title: "Solution", media: ["Solve chat interface", "Dashboard redesign"], statement: "Solution: two layers, working together.",
          text: ["Solve intercepts the ChatGPT moment; the dashboard turns each question into what to learn, where to contribute, and what path fits their level."],
          steps: [["Solve", "Plain-language questions with sourced Trailhead answers."], ["Community", "Where to contribute, based on what you asked."], ["Learn", "What path fits your level."]] },
        { title: "Impact", media: ["Side-by-side test results"], dash: [{ type: "meter", w: 4, label: "Preferred Solve", value: "6/8", n: 8, v: 6, note: "Power users who preferred Solve over ChatGPT" }, { type: "meter", w: 4, label: "Confidence", value: "4.5/5", n: 5, v: 4.5, note: "Average confidence in Solve’s answers" }, { type: "donut", w: 4, label: "Retention", value: "22.7%", pct: 22.7, chip: "Lift", note: "Retention lift" }], statement: "Impact: six out of eight power users preferred Solve over ChatGPT for Salesforce product questions.", 
          text: ["Each participant brought a real work problem, ran it through ChatGPT and Solve side by side, then rated confidence and preference.", "Trailhead won when experienced users had practical reasons to return: solving real work problems, contributing to community, and seeing learning paths that matched their career stage."],
          cards: [["Solve", "Intercept the ChatGPT moment with grounded answers"], ["Dashboard", "Turn questions into learning gaps and contribution opportunities"], ["Validation", "Preference testing beat opinion surveys"]] },
      ],
    },
  },
  {
    name: "CotonAI Modes", org: "CotonAI", area: "Agentic AI · Fashion", tags: ["AI Agents", "UX Design"],
    title: "Designing structured, mode-based UX in an AI platform for fashion teams.",
    desc: "End-to-end design of Modes at CotonAI: replacing prompt-heavy AI with structured entry points mapped to real fashion workflows.",
    metric: { value: "125%", label: "Feature adoption lift" }, href: "/case-study?case="4", tint: ["#9CB09E", "#E3EAE0", "#C9D5C8"],
    cs: {
      meta: [["Role", "Founding Product Designer"], ["Timeline", "Aug 2025 – Present"], ["Skills", "Interaction architecture, AI UX, design systems, prototyping, analytics"], ["Team", "Founder, PM, engineering"]],
      sections: [
        { title: "Problem", media: ["CotonAI canvas / prompt-heavy MVP screenshot"], statement: "Problem: to get high-quality visuals, users need strong prompting skills.",
          text: ["At CotonAI we are making the Figma for fashion: fine-tuned only for fashion and adjacent industries. I lead end-to-end design, and this case study walks through how I designed the Mode-based feature in a toolbar.", "So the question was: can we create something so easy, intuitive and no-brainer that any fashion user can use it?"],
          cards: [["Users don't know how to prompt", "Blank-page prompting put the burden on the user's language skills."], ["Too much prompting makes AI hallucinate", "Especially with visuals, long prompts led to unpredictable results."]] },
        { title: "Research", media: ["Wireframes vs shipped MVP", "User shadowing notes"], statement: "Research: from our hypothesis, we shipped an MVP in a record 3 weeks.",
          text: ["Our team has a combined 8 years of fashion industry experience, so we started from what we had observed. Then we shadowed users on the MVP and tested two ways of helping them prompt better. Both failed."],
          cards: [["Fashion tools had broken user flows", "Hypothesis from our industry experience."], ["Adoption of new tech is lower", "Hypothesis from our industry experience."], ["Fashion pipelines are disconnected", "Hypothesis from our industry experience."], ["They hesitated before typing prompts", "Pattern noticed while shadowing users."], ["They reused vague prompts repeatedly", "“change color”, “Make this editorial”, “Change the Model”."], ["Smarter prompt templates failed", "Reduced the blank page problem, but still required language precision and did not reduce hallucination."], ["System-generated prompts failed", "Still hid complexity instead of removing it, were hard to make predictable across fashion workflows, and users couldn't understand why results changed."]] },
        { title: "Solution", media: ["Modes toolbar (V1 → V2)", "Colourway picker redesign", "Figure submode flow"], dash: [{ type: "trend", w: 6, label: "Mode-bar adoption", value: "+125%", chip: "V1 → V2", points: [["V1", 100], ["V2", 225]], note: "Indexed to V1 = 100. Visual annotation helped users pick a mode faster." }, { type: "bars", w: 6, label: "Clicks to a try-on", value: "8 → 3", chip: "−5 clicks", rows: [["Editorial, V1", 8, "8"], ["Figure submode, V2", 3, "3"]], note: "No prompting needed in V2." }], statement: "Solution: we introduced modes in V1 instead of trying to help with prompts.",
          text: ["Principle: AI should adapt to designer intent. Designers should not adapt to AI syntax. Modes became structured entry points into AI capability, reducing ambiguity while keeping creativity open.", "After the MVP we refined the design direction, launched V1 for paid pilots with a more stable backend, and recently rolled out V2. Each mode maps to a real fashion workflow stage."],
          steps: [["Edit", "Multiple options alongside edit open."], ["Render", "Add required material or fabric to your garment."], ["Colourway", "Change garment colour and prints."], ["Studio", "Create editorial-level photoshoots with a reference image."]],
          trades: [
            { n: "Decision 1", t: "Treat the canvas as a behavioural system", rows: [["Architecture", "Modes act as semantic layers between user intent and AI execution."], ["Flow", "Mode logic → event → state → render loop."], ["It helped", "Predictable outcomes, reduced hallucination, consistent visual logic."]] },
            { n: "Decision 2", t: "Toolbar design evolution", rows: [["Issue with V1", "Users struggled to decide which mode they wanted, and onboarding took a long time. We used PostHog and trigger.dev to find this out."], ["Hypothesis for V2", "Visual annotation will help users pick the desired mode faster."], ["Result", "Adoption increased by 125%."]] },
            { n: "Decision 3", t: "Colourway redesign", rows: [["Issue with V1", "Users had access to hex codes but low recall and cognitive load caused hesitation and friction, so weekly adoption was low."], ["Hypothesis for V2", "A visual colour picker alongside hex input reduces cognitive load and matches familiar patterns from other design tools."], ["Result", "Significantly improved user feedback and feature adoption."]] },
            { n: "Decision 4", t: "Figure submode", rows: [["Issue with V1", "Creating a try-on on a model in Editorial took 8 clicks and prompting."], ["Change in V2", "A Figure submode inside Edit mode."], ["Result", "No prompting and 3 clicks to get results."]], note: "Sub-modes are for very specific use cases; they are not open-ended." },
            { n: "Decision 5", t: "Scaling the design system with AI", rows: [["Step 1", "Designed tokens in the Figma library."], ["Step 2", "Collaborated with dev to finalize the token specification, using shadcn as the base layer."], ["Step 3", "Created an .md file and pushed it as a UI library."], ["Result", "Every new custom UI pulls from the same GitHub repo, with no redesigning again and again."]] },
          ] },
        { title: "Impact", media: ["Impact metrics / client results"], dash: [{ type: "kpi", w: 4, label: "Images generated", value: "6000+", note: "In editorial mode on CotonAI" }, { type: "kpi", w: 4, label: "Cost saved", value: "$5k+", note: "Deciding UX flows and which AI models to work with" }, { type: "kpi", w: 4, label: "Enterprise pilot", value: "$$$", chip: "Paid", note: "Converted the MVP to a paid pilot with an enterprise client" }, { type: "waffle", w: 8, label: "Client time saved", value: "584 hrs", cells: 80, filled: 73, note: "In one season, about 73 working days at 8 hours a day. Each square is one day." }, { type: "kpi", w: 4, label: "Feature adoption", value: "125%", chip: "↑ vs V1", note: "After redesigning the Modes bar" }], statement: "Impact: a paid pilot, 584 hours saved for a client, and 125% higher adoption.",
          
          text: ["Designing CotonAI shifted my perspective on AI interfaces from feature design to interaction architecture. Early experimentation with open prompting revealed that the real challenge wasn't model capability, but how people translate intent into action. Introducing modes was a strategic move to reduce ambiguity, stabilize outcomes, and align AI behavior with how designers already think visually.", "Successful AI products are not built by adding more controls, but by shaping interaction models that make complex technology feel predictable, trustworthy, and native to human workflows."],
          quote: "While building CotonAI, I realized designers can directly influence business decisions through human-centered thinking, amplified by AI.", quoteBy: "Sambit Nayak",
          cards: [["Risk: over-structuring", "Could reduce creative freedom. Mitigation: modes guide the entry point, not the output style."], ["Risk: power users feel constrained", "Mitigation: Open mode retained for advanced control."], ["Risk: mode explosion", "Could confuse users. Mitigation: submodes nested inside parent workflows."]] },
      ],
    },
  },
];

const svgEl = (tag, attrs = {}) => {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
};

// A typographic tile: the project's headline metric, set large on its gradient
function metricTile(p, el, small = false) {
  p.tint.forEach((c, k) => el.style.setProperty(`--t${k + 1}`, c));
  const m = document.createElement("div");
  m.className = "metric" + (small ? " metric--sm" : "");
  m.innerHTML = "<strong></strong><span></span>";
  m.querySelector("strong").textContent = p.metric.value;
  m.querySelector("span").textContent = p.metric.label;
  el.appendChild(m);
}

const pad = (n) => String(n).padStart(2, "0");
document.querySelectorAll("[data-work-count]").forEach((el) => (el.textContent = pad(PROJECTS.length)));

const list = document.querySelector(".cards");
if (list) PROJECTS.forEach((p, i) => {
  const li = document.createElement("li");
  li.className = "case";
  li.innerHTML = `
    <div class="case__label">
      <span class="card__index">Case study ( ${pad(i + 1)} )</span>
      <span class="case__client"></span>
      <span class="case__year"></span>
    </div>
    <a class="case__link">
      <div class="case__tile"></div>
      <div class="case__text">
        <h3 class="card__title"></h3>
        <p class="card__desc"></p>
        <ul class="case__tags" role="list"></ul>
        <span class="case__cta">View case study <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"/></svg></span>
      </div>
    </a>`;
  metricTile(p, li.querySelector(".case__tile"));
  li.querySelector(".case__link").href = p.href;
  li.querySelector(".card__title").textContent = p.title;
  li.querySelector(".card__desc").textContent = p.desc;
  li.querySelector(".case__client").textContent = p.org;
  li.querySelector(".case__year").textContent = p.area;
  p.tags.forEach((t) => { const tag = document.createElement("li"); tag.textContent = t; li.querySelector(".case__tags").appendChild(tag); });
  list.appendChild(li);
});

// ── Work: dot field with a few dots lighting up at random ──
const field = document.querySelector(".dotfield");
if (field) {
  const COLS = 30, ROWS = 8, GAP = 14;
  field.setAttribute("viewBox", `0 0 ${COLS * GAP} ${ROWS * GAP}`);
  const dots = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const c = svgEl("circle", { cx: x * GAP + GAP / 2, cy: y * GAP + GAP / 2, r: 2 });
    field.appendChild(c);
    dots.push(c);
  }
  const lightRandom = () => {
    dots.forEach((d) => d.classList.remove("lit", "alt"));
    for (let k = 0; k < 6; k++) {
      const d = dots[Math.floor(Math.random() * dots.length)];
      d.classList.add("lit");
      if (k % 3 === 0) d.classList.add("alt");
    }
  };
  lightRandom();
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(lightRandom, 1400);
}

// ── Theme toggle ──
const root = document.documentElement;
const themeBtn = document.getElementById("theme");
const setTheme = (t) => {
  root.dataset.theme = t;
  themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
  try { localStorage.setItem("theme", t); } catch (e) {}
};
let saved = null;
try { saved = localStorage.getItem("theme"); } catch (e) {}
setTheme(saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeBtn.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));

// ── Contact details (replace the placeholders with your own) ──
const CONTACT = {
  email: "sambitnayak.ux@gmail.com",
  linkedin: "https://www.linkedin.com/in/sambitnayakux/",
  linkedinLabel: "/in/sambitnayakux",
  x: "https://x.com/sambit_nayak_",
  substack: "https://sambitnayak2.substack.com/",
  resume: "https://docs.google.com/document/d/1aNOOX1LozYOX2ORNFA7E4-M9VlcUOcra/edit?usp=sharing&ouid=105233102550308965413&rtpof=true&sd=true",
  book: "https://cal.com/sambit-nayak/30min?overlayCalendar=true",
};

// ── Nav: Work panel (project list + live stripe thumbnail) ──
const navProjects = document.getElementById("nav-projects");
const navThumb = document.getElementById("nav-thumb");
const showThumb = (i, hot = true) => {
  const p = PROJECTS[i];
  navThumb.replaceChildren(); navThumb.style.background = "none"; metricTile(p, navThumb, true);
  navProjects.querySelectorAll("a").forEach((a, j) => a.classList.toggle("is-hot", hot && j === i));
};
PROJECTS.forEach((p, i) => {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = p.href;
  a.textContent = p.name;
  a.addEventListener("mouseenter", () => showThumb(i));
  a.addEventListener("focus", () => showThumb(i));
  li.appendChild(a);
  navProjects.appendChild(li);
});
showThumb(0, false);

// ── Nav: Contact panel (stacked cards + actions) ──
const contactPanel = document.getElementById("contact-panel");
const CONTACT_CARDS = [
  { label: "Email", title: "Say hello", value: CONTACT.email, href: `mailto:${CONTACT.email}`, glyph: "contact" },
  { label: "LinkedIn", title: "Professional updates", value: CONTACT.linkedinLabel, href: CONTACT.linkedin, glyph: "about", external: true },
  { label: "Résumé", title: "View my résumé", value: "Google Doc", href: CONTACT.resume, glyph: "writing", external: true },
];
CONTACT_CARDS.forEach((c, i) => {
  const a = document.createElement("a");
  a.className = "pcard" + (i === 0 ? " is-active" : "");
  a.href = c.href;
  if (c.external) { a.target = "_blank"; a.rel = "noopener"; }
  a.innerHTML = `
    <div class="pcard__main">
      <p class="pcard__label"></p>
      <p class="pcard__title"></p>
      <span class="pcard__value"></span>
    </div>
    <div class="pcard__thumb"><svg class="glyph" data-glyph="${c.glyph}"></svg></div>`;
  a.querySelector(".pcard__label").textContent = c.label;
  a.querySelector(".pcard__title").textContent = c.title;
  a.querySelector(".pcard__value").textContent = c.value;
  a.addEventListener("mouseenter", () => {
    contactPanel.querySelectorAll(".pcard").forEach((el) => el.classList.toggle("is-active", el === a));
  });
  drawGlyph(a.querySelector(".glyph"), false);
  contactPanel.appendChild(a);
});
const bookBtn = document.createElement("a");
bookBtn.className = "btn";
bookBtn.href = CONTACT.book; bookBtn.target = "_blank"; bookBtn.rel = "noopener";
bookBtn.textContent = "Book a call";
const copyBtn = document.createElement("button");
copyBtn.type = "button";
copyBtn.className = "btn btn--ghost";
copyBtn.textContent = "Copy email";
copyBtn.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(CONTACT.email); copyBtn.textContent = "Copied ✓"; }
  catch (e) { copyBtn.textContent = CONTACT.email; }
  setTimeout(() => (copyBtn.textContent = "Copy email"), 1800);
});
contactPanel.append(bookBtn, copyBtn);

// ── Nav: open/close behaviour (click, hover on desktop, Esc, outside click) ──
const MENUS = [
  { tab: document.getElementById("work-tab"), panel: document.getElementById("work-panel") },
  { tab: document.getElementById("menu-tab"), panel: document.getElementById("work-panel") },
  { tab: document.getElementById("contact-tab"), panel: document.getElementById("contact-panel") },
];
let openMenu = null;
let openedByHover = false;
const setOpen = (menu, open) => {
  MENUS.forEach((m) => {
    const on = open && m.panel === menu?.panel && m.tab === menu.tab;
    m.tab.setAttribute("aria-expanded", on);
  });
  MENUS.forEach((m) => m.panel.classList.toggle("open", open && m.panel === menu.panel));
  openMenu = open ? menu : null;
  document.body.classList.toggle("nav-open", open);
};
const closeAll = () => openMenu && setOpen(openMenu, false);
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
MENUS.forEach((m) => {
  m.tab.addEventListener("click", () => {
    // A click on a panel that hover just opened pins it open instead of closing it
    if (openMenu?.tab === m.tab && openedByHover) { openedByHover = false; return; }
    openedByHover = false;
    setOpen(m, openMenu?.tab !== m.tab);
  });
  const group = m.tab.closest(".navgroup");
  let t;
  group.addEventListener("mouseenter", () => {
    if (!finePointer.matches || getComputedStyle(m.tab).display === "none") return;
    clearTimeout(t);
    if (openMenu?.tab !== m.tab) { setOpen(m, true); openedByHover = true; }
  });
  group.addEventListener("mouseleave", () => {
    if (!finePointer.matches || openMenu?.tab !== m.tab) return;
    t = setTimeout(() => { if (openMenu?.tab === m.tab) setOpen(m, false); }, 180);
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && openMenu) { const tab = openMenu.tab; closeAll(); tab.focus(); }
});
document.addEventListener("click", (e) => { if (openMenu && !e.target.closest(".navgroup")) closeAll(); });
document.querySelectorAll(".panel a").forEach((a) => a.addEventListener("click", closeAll));

// Align the Work panel under its tab
const alignWorkPanel = () => {
  const tab = document.getElementById("work-tab");
  document.getElementById("work-panel").style.left = tab.offsetParent ? `${tab.offsetLeft + 4}px` : "";
};
alignWorkPanel();
addEventListener("resize", alignWorkPanel);

// Scroll-spy: mark Work tab current while the Work section is in view
const workSection = document.getElementById("work");
if (workSection) new IntersectionObserver(([e]) => {
  document.getElementById("work-tab").setAttribute("aria-current", e.isIntersecting);
}, { threshold: 0.35 }).observe(workSection);

// Anything with data-open-contact opens the Contact panel
document.querySelectorAll("[data-open-contact]").forEach((el) =>
  el.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openedByHover = false;
    setOpen(MENUS[2], true);
    MENUS[2].tab.focus({ preventScroll: true });
  })
);

// ── Live San Francisco clock ──
const TZ = "America/Los_Angeles";
const period = document.getElementById("period");
const tick = () => {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
  document.querySelectorAll("[data-clock]").forEach((el) => (el.textContent = time));
  const h = Number(now.toLocaleString("en-US", { timeZone: TZ, hour: "numeric", hour12: false })) % 24;
  if (period) period.textContent = h < 6 ? "nighttime" : h < 12 ? "morning" : h < 18 ? "afternoon" : h < 21 ? "evening" : "nighttime";
};
tick();
setInterval(tick, 10000);

// ── Live weather (Open-Meteo, no key). Falls back to time-of-day only. ──
const WX = (code) =>
  code === 0 ? "clear" : code <= 2 ? "partly cloudy" : code === 3 ? "cloudy" :
  code <= 48 ? "foggy" : code <= 57 ? "drizzly" : code <= 67 ? "rainy" :
  code <= 77 ? "snowy" : code <= 82 ? "showery" : "stormy";
const weatherEl = document.getElementById("weather");
if (weatherEl) fetch("https://api.open-meteo.com/v1/forecast?latitude=37.3382&longitude=-121.8863&current=weather_code,temperature_2m,is_day&temperature_unit=fahrenheit")
  .then((r) => r.json())
  .then(({ current: c }) => {
    if (!c) return;
    weatherEl.textContent =
      `It’s currently ${WX(c.weather_code)}, ${Math.round(c.temperature_2m)}°F and ${c.is_day ? "daytime" : "nighttime"}.`;
  })
  .catch(() => {});

// ── Footer: interactive activity chart + wordmark ──
(function () {
  const host = document.querySelector("[data-footer]");
  if (!host) return;
  const BARS = 96, PER_HOUR = BARS / 24;
  const LAYERS = [["Ship", "--heat-4"], ["Prototype", "--heat-3"], ["Ideate", "--heat-2"], ["Research", "--heat-1"]]; // top → bottom

  // Deterministic data so every visit looks the same
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const bump = (t, c, w, a) => a * Math.exp(-((t - c) ** 2) / (2 * w * w));
  const data = Array.from({ length: BARS }, (_, i) => {
    const t = i / PER_HOUR;
    const total = Math.min(1, 0.3 + bump(t, 4, 1.8, 0.2) + bump(t, 11, 2.4, 0.3) + bump(t, 13.3, 2.8, 0.5) + bump(t, 23, 1.1, 0.62) - bump(t, 18.5, 1.6, 0.04) + (rnd() - 0.5) * 0.05);
    const wob = (k) => 1 + (rnd() - 0.5) * 0.12 + Math.sin(t / 2 + k) * 0.08;
    const raw = [0.34 * wob(1), 0.3 * wob(2), 0.24 * wob(3), 0.12 * wob(4)]; // red, orange, light, yellow
    const sum = raw.reduce((a, b) => a + b, 0);
    return { total: total * 0.86, parts: raw.map((v) => v / sum) };
  });

  const pct = (v) => `${Math.round(v * 100)}%`;
  host.className = "sitefoot";
  host.innerHTML = `
    <div class="sf__chart" role="img" tabindex="0" aria-label="Chart of design activity across a 24-hour day, in four stacked layers: research, ideate, prototype and ship. Use left and right arrow keys to explore.">
      <div class="sf__grid" aria-hidden="true"></div>
      <div class="sf__bars" aria-hidden="true"></div>
      <div class="sf__guide" aria-hidden="true"></div>
      <div class="sf__tip" aria-hidden="true">
        <div class="sf__tip-time"><span>Hour <strong class="t-hour"></strong></span><strong class="t-clock"></strong></div>
        <ul>${LAYERS.map(([n, c]) => `<li><i style="background:var(${c})"></i>${n}<span></span></li>`).join("")}</ul>
      </div>
    </div>
    <div class="sf__axis" aria-hidden="true">${Array.from({ length: 24 }, (_, i) => `<span>${i + 1}</span>`).join("")}</div>
    <a class="sf__mark" href="/" aria-label="Sam.design, home">${[..."Sam.design"].map((ch) => `<span>${ch}</span>`).join("")}</a>
    <div class="sf__legal">
      <span>© 2026 Sambit Nayak — San Francisco, California · <time data-clock>--:--</time></span>
      <span><a href="/#work">Work</a> · <a href="/about">About</a> · <a href="https://www.linkedin.com/in/sambitnayakux/" target="_blank" rel="noopener">LinkedIn</a> · <a href="https://x.com/sambit_nayak_" target="_blank" rel="noopener">X</a> · <a href="https://sambitnayak2.substack.com/" target="_blank" rel="noopener">Substack</a> · <a href="#top">Back to top ↑</a></span>
    </div>`;

  const nowTime = new Date().toLocaleTimeString("en-US", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
  host.querySelector("[data-clock]").textContent = nowTime;
  const chart = host.querySelector(".sf__chart");
  const bars = host.querySelector(".sf__bars");
  const guide = host.querySelector(".sf__guide");
  const tip = host.querySelector(".sf__tip");
  const labels = [...host.querySelectorAll(".sf__axis span")];

  host.querySelector(".sf__grid").innerHTML =
    [0.25, 0.5, 0.75, 1].map((p) => `<i class="h" style="top:${(1 - p) * 100 - (p === 1 ? 0 : 0)}%"></i>`).join("").replace('style="top:0%"', 'style="top:0"') +
    Array.from({ length: 9 }, (_, k) => `<i class="v" style="left:${(k / 8) * 100}%"></i>`).join("");

  data.forEach((d, i) => {
    const bar = document.createElement("div");
    bar.className = "sf__bar";
    bar.style.setProperty("--h", d.total.toFixed(3));
    bar.style.setProperty("--i", i);
    bar.innerHTML = [3, 2, 1, 0].map((k) => `<b style="--v:${d.parts[k].toFixed(3)}"></b>`).join("");
    bars.appendChild(bar);
  });
  const barEls = [...bars.children];

  // Grow in when scrolled into view
  new IntersectionObserver(([e], io) => {
    if (e.isIntersecting) { host.classList.add("in"); io.disconnect(); }
  }, { threshold: 0.25 }).observe(host);

  // Highlight the current hour in San Francisco
  const markNow = () => {
    const h = Number(new Date().toLocaleString("en-US", { timeZone: TZ, hour: "numeric", hour12: false })) % 24;
    labels.forEach((l, i) => l.classList.toggle("is-now", i === (h === 0 ? 23 : h - 1)));
  };
  markNow(); setInterval(markNow, 60000);

  let active = -1;
  const show = (i) => {
    if (game.state === "run") return;
    i = Math.max(0, Math.min(BARS - 1, i));
    if (i === active) return;
    active = i;
    chart.classList.add("is-hover");
    barEls.forEach((b, j) => {
      const dist = Math.abs(j - i);
      b.classList.toggle("is-active", dist === 0);
      b.classList.toggle("is-near", dist > 0 && dist <= 4);
      b.classList.toggle("is-lift", dist <= 2);
    });
    labels.forEach((l, j) => l.classList.toggle("is-hot", j === Math.floor(i / PER_HOUR)));
    const hour = Math.floor(i / PER_HOUR);
    const mins = (i % PER_HOUR) * 15;
    tip.querySelector(".t-hour").textContent = hour + 1;
    tip.querySelector(".t-clock").textContent = `${String(hour).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    tip.querySelectorAll("li span").forEach((s, k) => (s.textContent = pct(data[i].parts[k])));
    const w = chart.clientWidth, x = ((i + 0.5) / BARS) * w;
    guide.style.left = `${x}px`;
    const tw = tip.offsetWidth;
    tip.style.left = `${Math.max(0, Math.min(w - tw, x + 14 > w - tw ? x - tw - 14 : x + 14))}px`;
  };
  const hide = () => {
    active = -1;
    chart.classList.remove("is-hover");
    barEls.forEach((b) => b.classList.remove("is-active", "is-near", "is-lift"));
    labels.forEach((l) => l.classList.remove("is-hot"));
  };
  const fromEvent = (e) => {
    const r = chart.getBoundingClientRect();
    return Math.floor(((e.clientX - r.left) / r.width) * BARS);
  };
  chart.addEventListener("pointermove", (e) => show(fromEvent(e)));
  chart.addEventListener("pointerdown", (e) => { e.preventDefault(); game.press(); });
  chart.addEventListener("pointerleave", hide);
  chart.addEventListener("blur", hide);
  chart.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); show(active < 0 ? 0 : active + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); show(active < 0 ? BARS - 1 : active - 1); }
    else if (e.key === "Escape") hide();
  });

  // ── Wordmark: scale the type so "Sam.design" spans the footer's full content width ──
  const mark = host.querySelector(".sf__mark");
  const fitMark = () => {
    const cs = getComputedStyle(host);
    const avail = host.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    mark.style.fontSize = "100px";
    const w = mark.getBoundingClientRect().width;
    if (w) mark.style.fontSize = `${(100 * avail) / w}px`;
  };
  fitMark();
  document.fonts?.ready.then(fitMark);
  new ResizeObserver(fitMark).observe(host);

  // ── Game: Claude mascot endless runner. The 24-hour chart is the level and repeats day after day. ──
  const U_SPRITE = {
    mascot: [
      ".##########.",
      ".##e####e##.",
      ".##e####e##.",
      "############",
      "############",
      ".##########.",
      "..#.#..#.#..",
      "..#.#..#.#..",
    ],
    legsB: ["...#.#.#.#..", "...#.#.#.#.."],
    bug: [
      "..#.#..",
      "..###..",
      ".#####.",
      "#.###.#",
      ".#####.",
      "#.....#",
    ],
  };
  const CLAUDE = "#D97757", EYE = "#141413";
  const HEAT = ["#F8F07C", "#F1AD57", "#E26B3A", "#C92E1D"]; // bottom → top
  const canvas = document.createElement("canvas");
  canvas.className = "sf__game";
  canvas.setAttribute("aria-hidden", "true");
  chart.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const hud = document.createElement("div");
  hud.className = "sf__hint";
  chart.appendChild(hud);
  const msg = document.createElement("div");
  msg.className = "sf__msg";
  chart.appendChild(msg);

  let hi = 0;
  try { hi = Number(localStorage.getItem("sf-hi")) || 0; } catch (e) {}

  const game = {
    state: "idle", // idle | run | over
    cam: 0, t: 0, y: 0, vy: 0, onGround: true, obs: [], nextSpawn: 0, score: 0, overAt: 0, lastHour: -1,
    W: 0, H: 0, HEAD: 0, u: 3, pitch: 1, bw: 1, mx: 0, vis: false, last: 0, blink: 0,
  };
  const jit = (d) => (d === 0 ? 0 : (((Math.sin(d * 91.7) * 43758.5453) % 1 + 1) % 1 - 0.5) * 0.16);
  const colData = (col) => data[((col % BARS) + BARS) % BARS];
  const barH = (col) => Math.min(0.9, colData(col).total * (1 + jit(Math.floor(col / BARS)))) * game.H;
  const groundAt = (wx) => barH(Math.floor(wx / game.pitch));
  const fmtScore = (n) => String(n).padStart(5, "0");

  function sizeCanvas() {
    const g = game;
    g.W = chart.clientWidth; g.H = chart.clientHeight;
    g.HEAD = innerWidth < 768 ? 100 : 130;
    g.u = g.W > 900 ? 4 : 3;
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.style.height = `${g.H + g.HEAD}px`;
    canvas.width = Math.round(g.W * dpr);
    canvas.height = Math.round((g.H + g.HEAD) * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    g.pitch = barEls[1].offsetLeft - barEls[0].offsetLeft || g.W / BARS;
    g.bw = barEls[0].offsetWidth || g.pitch - 1;
    g.mx = Math.max(g.u * 14, g.W * 0.1);
    if (g.state === "idle") g.y = Math.max(groundAt(g.mx + 2 * g.u), groundAt(g.mx + 10 * g.u));
  }
  new ResizeObserver(sizeCanvas).observe(chart);
  sizeCanvas();

  function reset() {
    const g = game;
    Object.assign(g, { cam: 0, t: 0, vy: 0, onGround: true, obs: [], score: 0, lastHour: -1 });
    g.nextSpawn = g.W * 0.9;
    g.y = Math.max(groundAt(g.mx + 2 * g.u), groundAt(g.mx + 10 * g.u));
  }
  function setState(state) {
    game.state = state;
    chart.classList.toggle("is-playing", state !== "idle");
    chart.classList.remove("is-hover");
    barEls.forEach((b) => b.classList.remove("is-active", "is-near", "is-lift"));
    msg.classList.toggle("on", state === "over");
    if (state === "idle") labels.forEach((l) => l.classList.remove("is-hot"));
  }
  game.press = () => {
    const g = game;
    if (g.state === "idle") { reset(); setState("run"); g.vy = 160 * g.u; g.onGround = false; g.y += 1; }
    else if (g.state === "run") { if (g.onGround) { g.vy = 160 * g.u; g.onGround = false; g.y += 1; } }
    else if (performance.now() - g.overAt > 350) { reset(); setState("run"); }
  };
  game.release = () => { if (game.state === "run" && game.vy > 0) game.vy *= 0.5; };
  game.quit = () => { if (game.state !== "idle") { reset(); setState("idle"); } };

  const JUMP_KEYS = new Set([" ", "ArrowUp", "w", "W"]);
  addEventListener("keydown", (e) => {
    const playing = game.state !== "idle";
    if (!JUMP_KEYS.has(e.key) && !(playing && e.key === "Escape")) return;
    if (!playing && document.activeElement !== chart) return;
    e.preventDefault();
    if (e.key === "Escape") return game.quit();
    if (!e.repeat) game.press();
  });
  addEventListener("keyup", (e) => { if (JUMP_KEYS.has(e.key)) game.release(); });
  addEventListener("pointerup", game.release);
  chart.addEventListener("blur", () => { if (game.state === "over") game.quit(); });

  function sprite(rows, x, y, u, color, opts = {}) {
    ctx.fillStyle = color;
    rows.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch === ".") continue;
        if (ch === "e") { ctx.fillStyle = opts.eyesOff ? color : EYE; ctx.fillRect(x + c * u, y + r * u, u, u); ctx.fillStyle = color; continue; }
        ctx.fillRect(x + c * u, y + r * u, u, u);
      }
    });
  }

  function update(dt) {
    const g = game, u = g.u;
    g.t += dt;
    const speed = Math.min(140 * u, 55 * u + g.t * 4 * u);
    g.cam += speed * dt;
    const feet = () => Math.max(groundAt(g.cam + g.mx + 2 * u), groundAt(g.cam + g.mx + 10 * u));
    const ground = feet();
    if (g.onGround) {
      if (ground < g.y - 3 * u) { g.onGround = false; g.vy = 0; } else g.y = ground;
    }
    if (!g.onGround) {
      g.vy -= 475 * u * dt;
      g.y += g.vy * dt;
      if (g.y <= ground && g.vy <= 0) { g.y = ground; g.vy = 0; g.onGround = true; }
    }
    // obstacles
    while (g.nextSpawn < g.cam + g.W + 80) {
      g.obs.push(g.nextSpawn);
      g.nextSpawn += speed * (0.95 + Math.random() * 1.0) + 16 * u;
    }
    g.obs = g.obs.filter((wx) => wx - g.cam > -10 * u);
    for (const wx of g.obs) {
      const sx = wx - g.cam;
      const og = groundAt(wx + 3.5 * u);
      if (sx + 6 * u > g.mx + 2 * u && sx + 1 * u < g.mx + 10 * u && g.y + 0.5 * u < og + 5 * u) return gameOver();
    }
    g.score = Math.floor(g.cam / (5 * u));
    const hr = Math.floor((g.cam + g.mx) / g.pitch / PER_HOUR) % 24;
    if (hr !== g.lastHour) { g.lastHour = hr; labels.forEach((l, j) => l.classList.toggle("is-hot", j === hr)); }
  }
  function gameOver() {
    const g = game;
    g.overAt = performance.now();
    if (g.score > hi) { hi = g.score; try { localStorage.setItem("sf-hi", String(hi)); } catch (e) {} }
    const day = Math.floor((g.cam + g.mx) / g.pitch / BARS) + 1;
    msg.innerHTML = `<strong>Game over</strong><span>Day ${day} · score ${fmtScore(g.score)}</span><span>Space / tap to retry · Esc to exit</span>`;
    setState("over");
  }

  let themeFg = "#000";
  function draw(now) {
    const g = game, u = g.u, ctxH = g.H + g.HEAD;
    ctx.clearRect(0, 0, g.W, ctxH);
    const toY = (h) => Math.round(ctxH - h);
    if (g.state !== "idle") {
      // terrain: the chart's bars, scrolling and repeating
      const c0 = Math.floor(g.cam / g.pitch), c1 = Math.floor((g.cam + g.W) / g.pitch) + 1;
      for (let c = c0; c <= c1; c++) {
        const d = colData(c), h = barH(c), x = Math.round(c * g.pitch - g.cam);
        let y = ctxH;
        [3, 2, 1, 0].forEach((k, i) => {
          const seg = Math.max(1, d.parts[k] * h);
          ctx.fillStyle = HEAT[i];
          ctx.fillRect(x, Math.round(y - seg), Math.max(1, Math.round(g.bw)), Math.max(1, Math.round(seg) - (i < 3 ? 1 : 0)));
          y -= seg;
        });
      }
      ctx.fillStyle = themeFg;
      for (const wx of g.obs) {
        const sx = Math.round(wx - g.cam);
        sprite(U_SPRITE.bug, sx, toY(groundAt(wx + 3.5 * u) + 6 * u), u, themeFg);
      }
    }
    // mascot
    const run = g.state === "run";
    const legsB = run && g.onGround && Math.floor(g.t * 12) % 2 === 1;
    const rows = U_SPRITE.mascot.map((r, i) => (i >= 6 && legsB ? U_SPRITE.legsB[i - 6] : r));
    const blink = g.state === "idle" && now % 3200 < 140;
    const dead = g.state === "over";
    sprite(rows, Math.round(g.mx), toY(g.y + 8 * u), u, dead ? "#9a8a82" : CLAUDE, { eyesOff: blink });
    hud.textContent = g.state === "idle" ? "Space / tap the graph to play" : `HI ${fmtScore(hi)}  ${fmtScore(g.score)}`;
  }

  new IntersectionObserver(([e]) => { game.vis = e.isIntersecting; }, { threshold: 0.05 }).observe(chart);
  let frame = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    if (!game.vis || document.hidden) { game.last = now; return; }
    const dt = Math.min(0.05, (now - (game.last || now)) / 1000);
    game.last = now;
    if (frame++ % 30 === 0) themeFg = getComputedStyle(host).color;
    if (game.state === "run") update(dt);
    draw(now);
  }
  requestAnimationFrame(loop);
})();


// ── Brand mark: nav logo spins while hovered, then settles back to its resting pose ──
document.querySelectorAll(".logo").forEach((svg) => {
  const ring = Ring.mount(svg);
  const link = svg.closest("a");
  if (!link) return;
  link.addEventListener("pointerenter", () => ring.spin(180));
  link.addEventListener("pointerleave", () => ring.settle(null, 30));
  link.addEventListener("focus", () => ring.spin(180));
  link.addEventListener("blur", () => ring.settle(null, 30));
});


// ── Capabilities tiles: pixel art, toggle, parallax, reveal ──
(function () {
  const tiles = document.querySelector(".tiles");
  if (!tiles) return;
  tiles.closest(".caps").style.containerType = "inline-size";

  const ART = {
    cursor: {
      u: 2, gap: 0,
      pal: { k: "#1D1D1B", w: "#FFFFFF" },
      rows: [
        "k.........", "kk........", "kwk.......", "kwwk......", "kwwwk.....", "kwwwwk....", "kwwwwwk...",
        "kwwwwwwk..", "kwwwwwwwk.", "kwwwwkkkkk", "kwwkwk....", "kwk.kwk...", "kk..kwk...", "k....kk...",
      ],
    },
    flower: {
      u: 8,
      pal: { p: "#EE7C9C", o: "#F29A4B", y: "#F6D45A", g: "#4E9E6B", b: "#6FB3E8", k: "#2f6f9a" },
      rows: [
        "..p.p......o..",
        ".ppypp....oyo.",
        "..ppp.....ooo.",
        "...g.......g..",
        "...g...g...g..",
        "..gg...g..gg..",
        "..kkkkkkkkkk..",
        "...kkkkkkkk...",
      ],
    },
  };
  document.querySelectorAll("svg[data-pixel]").forEach((svg) => {
    const a = ART[svg.dataset.pixel];
    svg.setAttribute("viewBox", `0 0 ${a.rows[0].length * a.u} ${a.rows.length * a.u}`);
    svg.setAttribute("shape-rendering", "crispEdges");
    a.rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === ".") return;
      const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      const gap = a.gap ?? 1;
      r.setAttribute("x", x * a.u + gap / 2); r.setAttribute("y", y * a.u + gap / 2);
      r.setAttribute("width", a.u - gap); r.setAttribute("height", a.u - gap);
      r.setAttribute("fill", a.pal[ch]);
      svg.appendChild(r);
    }));
  });

  // Interaction tile: the brand ring, spinning slowly (faster on hover)
  const ringSvg = document.querySelector(".ring-art");
  if (ringSvg) {
    const ring = Ring.mount(ringSvg);
    ring.grow(700, 60);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ring.spin(40);
      const t = ringSvg.closest(".tile");
      t.addEventListener("pointerenter", () => ring.spin(160));
      t.addEventListener("pointerleave", () => ring.spin(40));
    }
  }

  // Strategy / Craft toggle
  const modeTile = document.querySelector("[data-mode-tile]");
  const text = modeTile.querySelector("[data-mode-text]");
  const COPY = {
    research: "Qual + eval loops that stress-test model behavior in context.",
    strategy: "Roadmaps that connect AI capability to shipped outcomes.",
  };
  modeTile.querySelectorAll("[data-mode]").forEach((btn) => btn.addEventListener("click", () => {
    modeTile.dataset.mode = btn.dataset.mode;
    modeTile.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", b === btn));
    text.classList.add("swap");
    setTimeout(() => { text.textContent = COPY[btn.dataset.mode]; text.classList.remove("swap"); }, 220);
  }));

  // Pointer parallax
  tiles.querySelectorAll(".tile").forEach((t) => {
    t.addEventListener("pointermove", (e) => {
      const r = t.getBoundingClientRect();
      t.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      t.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
  });

  // Reveal on scroll
  new IntersectionObserver(([e], io) => { if (e.isIntersecting) { tiles.classList.add("in"); io.disconnect(); } }, { threshold: 0.12 }).observe(tiles);
})();


// ── Hero artifacts: San Francisco / California pixel motifs ──
(function () {
  const wrap = document.querySelector(".hero__art");
  const PAL = { o: "#E8551F", p: "#D96A8C", g: "#6F8F3A", d: "#4E6B2A", b: "#8A4B3C", B: "#5A2E26", t: "#E8B79B", y: "#F2C14E", r: "#C0362C", w: "#F6EFE0", s: "#8DB3CC", k: "#3B3733", f: "#C5D0D6" };

  const grid = (w, h) => Array.from({ length: h }, () => Array(w).fill("."));
  const put = (g, x, y, c) => { if (g[y] && x >= 0 && x < g[0].length) g[y][x] = c; };
  const box = (g, x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(g, x + i, y + j, c); };
  const rows = (g) => g.map((r) => r.join(""));
  const pad = (list, w) => list.map((r) => r.padEnd(w, "."));
  const plus = (g, cx, cy, arm, mid) => { [[0, -1], [-1, 0], [1, 0], [0, 1]].forEach(([dx, dy]) => put(g, cx + dx, cy + dy, arm)); put(g, cx, cy, mid); };

  const ART = {
    // California poppy: the state flower
    poppies() {
      const g = grid(15, 13);
      plus(g, 3, 3, "o", "t"); plus(g, 7, 1, "o", "t"); plus(g, 11, 3, "o", "t");
      box(g, 7, 3, 1, 8, "g");
      [[3, 5], [4, 6], [5, 7], [6, 8]].forEach(([x, y]) => put(g, x, y, "g"));
      [[11, 5], [10, 6], [9, 7], [8, 8]].forEach(([x, y]) => put(g, x, y, "g"));
      put(g, 3, 4, "g"); put(g, 11, 4, "g");
      box(g, 5, 9, 2, 1, "d"); box(g, 8, 9, 2, 1, "d"); box(g, 6, 11, 3, 1, "g"); put(g, 7, 10, "g");
      return rows(g);
    },
    // Golden Gate Bridge, with a wisp of fog
    bridge() {
      const W = 30, g = grid(W, 14);
      box(g, 0, 8, W, 1, "k");
      for (let y = 10; y < 13; y++) for (let x = 0; x < W; x++) if ((x + y * 2) % 6 < 3) put(g, x, y, "s");
      [[7, 9], [21, 22]].forEach(([a, b]) => { box(g, a, 1, 1, 8, "r"); box(g, b, 1, 1, 8, "r"); box(g, a, 3, b - a + 1, 1, "r"); box(g, a, 6, b - a + 1, 1, "r"); box(g, a, 0, b - a + 1, 1, "r"); });
      for (let c = 9; c <= 20; c++) { if (c === 9 || c === 21) continue; const y = 1 + Math.round(5 * (1 - ((c - 14.5) / 6.5) ** 2)); put(g, c, y, "r"); if (c % 2 === 0) for (let j = y + 1; j < 8; j++) put(g, c, j, "r"); }
      for (let c = 0; c < 7; c++) { const y = Math.round(6 - (5 * c) / 7); put(g, c, y, "r"); if (c % 2 === 0) for (let j = y + 1; j < 8; j++) put(g, c, j, "r"); }
      for (let c = 23; c < W; c++) { const y = Math.round(1 + (5 * (c - 22)) / 7); put(g, c, y, "r"); if (c % 2 === 1) for (let j = y + 1; j < 8; j++) put(g, c, j, "r"); }
      [[2, 0], [3, 0], [4, 0], [12, 0], [13, 0], [26, 1], [27, 1]].forEach(([x, y]) => put(g, x, y, "f"));
      return rows(g);
    },
    cablecar() {
      const g = grid(20, 11);
      box(g, 0, 0, 20, 1, "k"); put(g, 9, 1, "k"); put(g, 10, 1, "k");
      box(g, 2, 2, 16, 1, "B"); box(g, 2, 3, 16, 3, "w");
      [3, 7, 11, 15].forEach((x) => box(g, x, 3, 3, 2, "s"));
      box(g, 2, 6, 16, 2, "r"); box(g, 1, 8, 18, 1, "B");
      box(g, 4, 9, 2, 2, "k"); box(g, 14, 9, 2, 2, "k");
      return rows(g);
    },
    // Painted Ladies on Alamo Square
    ladies() {
      const g = grid(24, 17), ground = 16;
      [[0, 9, "p"], [6, 12, "t"], [12, 10, "g"], [18, 13, "o"]].forEach(([x, h, c]) => {
        const top = ground - h + 1;
        box(g, x, top, 6, h, c);
        for (let i = 0; i < 3; i++) box(g, x + i, top - 1 - i, 6 - 2 * i, 1, "B");
        for (let y = top + 1; y < ground - 2; y += 3) { put(g, x + 1, y, "w"); put(g, x + 4, y, "w"); put(g, x + 1, y + 1, "w"); put(g, x + 4, y + 1, "w"); }
        box(g, x + 2, ground - 2, 2, 3, "B");
      });
      box(g, 0, ground, 24, 1, "d");
      return rows(g);
    },
    bear() {
      return pad([
        "..................b.b",
        ".................bbbbb",
        "...........bbbbbbbBbb",
        ".........bbbbbbbbbbk",
        "...bbbbbbbbbbbbbbbbb",
        "..bbbbbbbbbbbbbbbbb.",
        ".bbbbbbbbbbbbbbbbbb..",
        ".bbbtttbbbbbbbbbbbb..",
        ".bbbbbbbbbbbbbbbbb...",
        ".bb.bb........bb.bb..",
        ".bb.bb........bb.bb..",
        ".BB.BB........BB.BB..",
      ], 21);
    },
    crab() {
      return pad([
        "oo............oo",
        "o.o..........o.o",
        "oo.oooooooooo.oo",
        "..oooooooooooo..",
        "..ookoooookoo...",
        "o.oooooooooooo.o",
        ".o.oooooooooo.o.",
        "o..o.o....o.o..o",
      ], 16);
    },
    sourdough() {
      return pad([
        "...bbbbbbbb...",
        "..bbtbbtbbtb..",
        ".bbbtbbtbbtbb.",
        ".bbbbbbbbbbbb.",
        "..bbbbbbbbbb..",
        "...BBBBBBBB...",
      ], 14);
    },
    redwood() {
      const rowsOut = [], W = 11;
      [1, 3, 5, 3, 5, 7, 5, 7, 9, 7, 9, 11].forEach((w, i) => { const l = (W - w) >> 1; rowsOut.push(".".repeat(l) + (i % 3 === 2 ? "d" : "g").repeat(w) + ".".repeat(W - w - l)); });
      for (let i = 0; i < 5; i++) rowsOut.push("....BB.....".slice(0, W));
      return rowsOut;
    },
    sealion() {
      return pad([
        "...............bb.....",
        "..............bbbb....",
        ".............bbBbbk...",
        ".............bbbbbb...",
        ".............bbbbb....",
        "............bbbbbb....",
        "...........bbbbbbb....",
        "..........bbbbbbbb....",
        "....bbb..bbbbbbbbb....",
        "...bbbbbbbbbbbbbbb....",
        "..bbbbbbbbbbbbbbbb....",
        ".bb.bbbbbbbbbbbbb.....",
        "ff.ffffffffffffffff...",
      ], 22);
    },
  };

  const NS = "http://www.w3.org/2000/svg";
  // Build a coloured pixel-art SVG from a named artifact (also used by the Playground page)
  function build(key) {
    const r = ART[key]();
    const cols = Math.max(...r.map((x) => x.length)), h = r.length;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${cols * 8} ${h * 8}`);
    svg.setAttribute("shape-rendering", "crispEdges");
    const back = document.createElementNS(NS, "g"), front = document.createElementNS(NS, "g");
    r.forEach((row, y) => [...row].forEach((ch, x) => {
      const col = PAL[ch]; if (!col) return;
      const a = document.createElementNS(NS, "rect");
      a.setAttribute("x", x * 8 + 1); a.setAttribute("y", y * 8 - 1); a.setAttribute("width", 8); a.setAttribute("height", 8); a.setAttribute("class", "mis");
      back.appendChild(a);
      const b = document.createElementNS(NS, "rect");
      b.setAttribute("x", x * 8); b.setAttribute("y", y * 8); b.setAttribute("width", 8); b.setAttribute("height", 8); b.setAttribute("fill", col);
      front.appendChild(b);
    }));
    svg.append(back, front);
    return { svg, cols, rows: h };
  }
  window.PixelArt = { build, keys: Object.keys(ART) };
  if (!wrap) return;

  wrap.querySelectorAll(".artifact").forEach((el) => {
    const { svg, cols, rows } = build(el.dataset.art);
    el.style.setProperty("--cols", cols); el.style.setProperty("--rows", rows);
    el.appendChild(svg);
    el.style.setProperty("--d", String(6 + Math.round(Math.random() * 10)));
  });

  // Gentle pointer parallax
  const hero = wrap.parentElement;
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    hero.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const r = hero.getBoundingClientRect();
      wrap.style.setProperty("--px", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
      wrap.style.setProperty("--py", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
    });
    hero.addEventListener("pointerleave", () => { wrap.style.setProperty("--px", 0); wrap.style.setProperty("--py", 0); });
  }
})();

// ── Template pages: Playground, Writing, Case study (text only) ──
(function () {
  const page = document.body.dataset.page;
  if (!page) return;
  const pad2 = (n) => String(n).padStart(2, "0");
  const setCount = (n) => document.querySelectorAll("[data-count]").forEach((el) => (el.textContent = pad2(n)));
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
// ── Case-study data dashboard: one tile shell (label · chip · value · chart · note), pure CSS/SVG ──
function dashTile(v) {
  const t = el("div", `dt dt--${v.type} dt--w${v.w || 4}`);
  const head = el("div", "dt__head"); head.appendChild(el("span", "dt__label", v.label));
  if (v.chip) head.appendChild(el("span", "dt__chip", v.chip));
  t.append(head, el("strong", "dt__value", v.value));
  const chart = el("div", "dt__chart"); chart.setAttribute("aria-hidden", "true");
  if (v.type === "bars") {
    const max = Math.max(...v.rows.map((r) => r[1]));
    v.rows.forEach(([label, val, shown], i) => {
      const row = el("div", "dt__row" + (i === v.rows.length - 1 ? " is-hi" : ""));
      const bar = el("i"); bar.style.setProperty("--w", `${(val / max) * 100}%`); bar.style.transitionDelay = `${i * 120}ms`;
      const track = el("div", "dt__track"); track.appendChild(bar);
      row.append(el("span", "", label), el("b", "", shown), track); chart.appendChild(row);
    });
  } else if (v.type === "meter") {
    for (let i = 0; i < v.n; i++) { const seg = el("i"); seg.style.setProperty("--f", `${Math.max(0, Math.min(1, v.v - i)) * 100}%`); seg.style.transitionDelay = `${i * 70}ms`; chart.appendChild(seg); }
  } else if (v.type === "waffle") {
    for (let i = 0; i < v.cells; i++) { const c = el("i", i < v.filled ? "on" : ""); c.style.transitionDelay = `${i * 12}ms`; chart.appendChild(c); }
  } else if (v.type === "donut") {
    const C = 2 * Math.PI * 40;
    const svg = svgEl("svg", { viewBox: "0 0 100 100" });
    svg.append(svgEl("circle", { cx: 50, cy: 50, r: 40, class: "trk" }), svgEl("circle", { cx: 50, cy: 50, r: 40, class: "arc", "stroke-dasharray": C, "stroke-dashoffset": C, style: `--to:${C * (1 - v.pct / 100)}`, transform: "rotate(-90 50 50)" }));
    chart.appendChild(svg);
  } else if (v.type === "trend") {
    const [p0, p1] = v.points, X0 = 14, X1 = 226, Y0 = 70, Y1 = 12, max = Math.max(p0[1], p1[1]);
    const y = (n) => Y0 - (n / max) * (Y0 - Y1);
    const svg = svgEl("svg", { viewBox: "0 0 240 96", preserveAspectRatio: "none" });
    const defs = svgEl("defs"), g = svgEl("linearGradient", { id: "dtg", x1: 0, y1: 0, x2: 0, y2: 1 });
    g.append(svgEl("stop", { offset: "0", "stop-color": "currentColor", "stop-opacity": ".25" }), svgEl("stop", { offset: "1", "stop-color": "currentColor", "stop-opacity": "0" })); defs.appendChild(g);
    [30, 50, 70].forEach((gy) => svg.appendChild(svgEl("line", { x1: 0, x2: 240, y1: gy, y2: gy, class: "grid" })));
    svg.append(defs, svgEl("path", { d: `M${X0} ${y(p0[1])} L${X1} ${y(p1[1])} L${X1} 86 L${X0} 86Z`, fill: "url(#dtg)", class: "area" }),
      svgEl("path", { d: `M${X0} ${y(p0[1])} L${X1} ${y(p1[1])}`, class: "line", pathLength: 1 }),
      svgEl("circle", { cx: X0, cy: y(p0[1]), r: 3.5, class: "pt" }), svgEl("circle", { cx: X1, cy: y(p1[1]), r: 4.5, class: "pt pt--hi" }));
    chart.appendChild(svg);
    const ax = el("div", "dt__axis"); ax.append(el("span", "", p0[0]), el("span", "", p1[0])); t.append(chart, ax);
  }
  if (v.type !== "kpi" && v.type !== "trend") t.appendChild(chart);
  if (v.note) t.appendChild(el("p", "dt__note", v.note));
  return t;
}

  // Filter chips: show the items whose data-tag matches, hide the rest
  function wireChips(items, onChange) {
    const chips = [...document.querySelectorAll("[data-chips] .chip")];
    chips.forEach((chip) => chip.addEventListener("click", () => {
      chips.forEach((c) => c.setAttribute("aria-pressed", c === chip));
      const f = chip.dataset.filter;
      items.forEach((it) => { it.hidden = !(f === "all" || it.dataset.tag === f); });
      onChange && onChange(f);
    }));
  }

  if (page === "playground") {
    const T = [["#F6C7D6", "#F8E2C8", "#F3EEE8"], ["#8FB0C8", "#EBDDD3", "#DCE7EE"], ["#E8B79B", "#F6EFE0", "#F1D8C4"], ["#A9AE7F", "#DADBC4", "#C7CBAF"], ["#BDCFDE", "#EBDAD3", "#E4EAEE"], ["#9CB09E", "#E3EAE0", "#C9D5C8"]];
    const LAB = [
      ["PROTO-01", "Connection onboarding", "Mobile · 2026", "Onboarding", "Connect your Spotify account to see your top artists and get personalized recommendations.", "prototype"],
      ["PROTO-02", "AI UX Studio", "Web", "Studio site", "A multidisciplinary practice designing intelligent, human-centered experiences at the intersection of AI technology and product design.", "prototype"],
      ["PROTO-03", "Jenyi", "AI journal · 2026", "Voice · Mobile editorial", "Your journal starts here. Speak freely and Jenyi turns voice into entries you'll actually revisit.", "prototype"],
      ["PROTO-04", "Intercom MCP", "Web · MCP · 2026", "Agent integration", "An MCP integration so agents can read and act on Intercom conversations with clear guardrails.", "prototype"],
      ["SUB-AMEX-01", "Membership App", "Concept", "Mobile · iOS", "Rewards flow & card management UI", "mobile"],
      ["SUB-LOG-07", "Brand System", "Shipped", "Print · B2B", "Business card system & identity touchpoints", "brand"],
      ["SUB-ICO-12", "Line Icon Set", "Library", "Design system", "4×8 minimal icon grid for product UI", "system"],
      ["SUB-APL-03", "Intelligence Stamp", "Exploration", "Brand · Physical", "Apple Intelligence postage stamp visual", "brand"],
      ["SUB-TIG-09", "Platform Branding", "In review", "Fintech · B2B", "Card system for intelligent finance platform", "brand"],
      ["SUB-AI-18", "Prompt Bar", "Prototype", "AI · Product UI", "Generative prompt bar & model controls", "ai"],
      ["SUB-MRC-04", "AI Recruiting", "Concept", "Landing · Web", "Hero narrative for global talent network", "web"],
      ["SUB-VSW-11", "View Switcher", "Component", "Controls · iOS", "List/grid toggle with neumorphic affordance", "system"],
      ["SUB-MNU-06", "Menu Control", "Component", "Navigation", "Glass toggle track with glowing thumb", "system"],
      ["SUB-SLD-15", "Control Kit", "System", "Dark UI", "Sliders, palettes & export controls", "system"],
      ["SUB-IND-08", "Studio Follow-up", "Prototype", "Agent · CAD", "Follow-up card with CAD package delivery", "ai"],
      ["SUB-PLN-02", "Plant Health", "Concept", "Agtech · Web", "Crop diagnostics landing & data story", "web"],
      ["SUB-MOD-21", "Material Studies", "Research", "3D · Architecture", "Stacked mood board: materials, light & form", "research"],
    ];
    setCount(LAB.length);
    const list = document.querySelector("[data-lab]");
    const tiles = LAB.map(([code, title, status, area, scope, tag], i) => {
      const li = el("li", "lab__tile grain");
      li.style.setProperty("--i", i);
      li.dataset.tag = tag;
      T[i % T.length].forEach((c, k) => li.style.setProperty(`--t${k + 1}`, c));
      const top = el("div", "lab__top"); top.append(el("span", "", code), el("span", "", status));
      const bottom = el("div", "lab__bottom");
      bottom.append(el("h3", "lab__title", title), el("p", "lab__area", area), el("p", "lab__scope", scope));
      li.append(top, bottom);
      li.addEventListener("pointermove", (e) => {
        const r = li.getBoundingClientRect();
        li.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
        li.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
      });
      list.appendChild(li);
      return li;
    });
    wireChips(tiles);
    new IntersectionObserver(([e], io) => { if (e.isIntersecting) { list.classList.add("in"); io.disconnect(); } }, { threshold: 0.05 }).observe(list);
  }

  if (page === "writing") {
    setCount(document.querySelectorAll("[data-posts] .post").length);
  }

  if (page === "case") {
    const n = PROJECTS.length;
    const id = Math.min(n, Math.max(1, parseInt(new URLSearchParams(location.search).get("case") || "1", 10) || 1));
    const p = PROJECTS[id - 1];
    const root = document.querySelector("[data-case]");
    p.tint.forEach((c, k) => root.style.setProperty(`--t${k + 1}`, c));
    document.title = `${p.name}: case study — Sambit Nayak`;
    document.querySelector("[data-cs-num]").textContent = pad2(id);
    document.querySelector("[data-cs-client]").textContent = `${p.org} · ${p.area}`;
    document.querySelector("[data-cs-title]").textContent = p.title;
    document.querySelector("[data-cs-desc]").textContent = p.desc;
    metricTile(p, document.querySelector("[data-cs-tile]"));

    const meta = document.querySelector("[data-cs-meta]");
    meta.style.setProperty("--n", Math.min(5, p.cs.meta.length));
    p.cs.meta.forEach(([k, v]) => { const d = el("div"); d.append(el("dt", "", k), el("dd", "", v)); meta.appendChild(d); });

    const body = document.querySelector("[data-cs-body]");
    p.cs.sections.forEach((sec, i) => {
      const row = el("section", "cs__row");
      row.id = sec.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const label = el("div", "cs__label"); label.append(el("span", "", pad2(i + 1)), el("h2", "", sec.title));
      const c = el("div", "cs__content");
      if (sec.statement) c.appendChild(el("p", "cs__statement", sec.statement));
      if (sec.stats) { const g = el("div", "cs__stats" + (sec.stats.length < 3 ? " cs__stats--big" : "")); sec.stats.forEach(([v, l]) => { const d = el("div"); d.append(el("strong", "", v), el("span", "", l)); g.appendChild(d); }); c.appendChild(g); }
      if (sec.dash) { const g = el("div", "dash"); sec.dash.forEach((v) => g.appendChild(dashTile(v))); c.appendChild(g);
        new IntersectionObserver(([e], io) => { if (e.isIntersecting) { g.classList.add("in"); io.disconnect(); } }, { threshold: 0.25 }).observe(g); }
      (sec.text || []).forEach((t) => c.appendChild(el("p", "", t)));
      if (sec.media) { const g = el("div", "cs__media cs__media--" + Math.min(sec.media.length, 3)); sec.media.forEach((m) => { const f = el("figure", "ph"); f.append(el("span", "ph__tag", "Placeholder"), el("figcaption", "", m)); g.appendChild(f); }); c.appendChild(g); }
      if (sec.quote) { const q = el("blockquote", "cs__quote"); q.append(el("p", "", `“${sec.quote}”`), el("footer", "", sec.quoteBy || "Power user interview")); c.appendChild(q); }
      if (sec.cards) { const ul = el("ul", "cs__cards cs__cards--2"); ul.setAttribute("role", "list"); sec.cards.forEach(([h, t]) => { const li = el("li"); li.append(el("h3", "", h), el("p", "", t)); ul.appendChild(li); }); c.appendChild(ul); }
      if (sec.trades) { const g = el("div", "cs__trades"); sec.trades.forEach((t) => {
        const card = el("div", "cs__trade"); card.append(el("span", "cs__trade-n", t.n), el("h3", "", t.t));
        const dl = el("dl"); t.rows.forEach(([k, v]) => { const r = el("div"); r.append(el("dt", "", k), el("dd", "", v)); dl.appendChild(r); }); card.appendChild(dl);
        if (t.note) card.appendChild(el("p", "cs__trade-note", t.note));
        g.appendChild(card); }); c.appendChild(g); }
      if (sec.steps) { const ol = el("ol", "cs__steps cs__steps--cards"); ol.setAttribute("role", "list"); sec.steps.forEach(([h, t], k) => { const li = el("li"); li.append(el("span", "cs__n", pad2(k + 1)), el("h3", "", h)); if (t) li.appendChild(el("p", "", t)); ol.appendChild(li); }); c.appendChild(ol); }
      if (sec.cta) { const a = el("a", "btn", sec.cta.label); a.href = sec.cta.href; a.target = "_blank"; a.rel = "noopener"; a.style.alignSelf = "flex-start"; c.appendChild(a); }
      row.append(label, c); body.appendChild(row);
    });

    const link = (q, dir) => {
      const a = document.createElement("a");
      a.href = PROJECTS[q].href;
      a.innerHTML = `<small>${dir}</small><strong></strong>`;
      a.querySelector("strong").textContent = PROJECTS[q].name;
      return a;
    };
    const next = document.querySelector("[data-cs-next]");
    next.append(link((id - 2 + n) % n, "← Previous case study"), link(id % n, "Next case study →"));
  }
})();
