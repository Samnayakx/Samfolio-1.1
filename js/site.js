// Vercel Web Analytics. The script is served by Vercel once Analytics is enabled on the project.
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
if (!document.querySelector('script[src="/_vercel/insights/script.js"]')) {
  const insights = document.createElement("script");
  insights.defer = true;
  insights.src = "/_vercel/insights/script.js";
  document.head.appendChild(insights);
}

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
    name: "Trailhead Solve", org: "Trailhead", area: "Enterprise · Agentic AI", tags: ["Ed-tech", "UX Research"],
    title: "An AI-powered re-engagement strategy Trailhead power users preferred over ChatGPT.",
    desc: "Improving power-user retention with an agentic AI RAG bot: Trailhead Solve, a dashboard redesign and a RAG assistant.",
    metric: { value: "22.7%", label: "Retention lift" }, thumb: { video: "/assets/images/trailhead/video-trailhead-promo-web.mp4", poster: "/assets/images/trailhead/video-trailhead-promo-web-poster.webp", alt: "Trailhead Solve product video", navPoster: "/assets/images/trailhead/video-trailhead-chatbot-poster.webp" }, href: "/case-study?case=1", tint: ["#BDCFDE", "#EBDAD3", "#E4EAEE"], accent: "#2F7DC4",
    cs: {
      meta: [["Role", "Product Designer (Apprentice)"], ["Timeline", "Aug 2025 – Apr 2026"], ["Skills", "Conversational UX, RAG workflows, power-user research, dashboard design"], ["Team", "Team of five with the Salesforce Trailhead product team"]],
      sections: [
        { title: "Overview", statement: "Overview: built for the climb, and it loses experts at the top.",
          text: ["Trailhead is Salesforce's free learning platform, taking millions of professionals from beginner to certified expert. The Trailhead product team brought us one question: why are the platform's most experienced users showing up less?",
            "What we found changed the brief: power users weren't unhappy with Trailhead. They were taking their hardest questions to ChatGPT. We ran it like a product bet: kill ideas fast, ship working software, test with real experts. This was a team of five; the research, prototype and media are shared work."],
          cards: [["Problem: Experts took their questions elsewhere.", "Salesforce's most experienced users were taking their questions to ChatGPT and Slack instead of Trailhead's own community, and between milestones, nothing gave them a reason to come back."], ["Solution: Answers, plus prompts.", "Plain-language answers to real Salesforce problems inside Trailhead, paired with proactive prompts that surface what's relevant next without being asked."], ["Outcome: 6/8", "Given the same Salesforce question, 6 of 8 power users preferred Solve over ChatGPT."]],
          media: [{ video: "/assets/images/trailhead/video-trailhead-promo-web.mp4", poster: "/assets/images/trailhead/video-trailhead-promo-web-poster.webp", alt: "Promo video for the Trailhead Solve project", cap: "Project promo" }] },

        { title: "Insight", statement: "Insight: the certification path ended, and ChatGPT caught them on the way out.",
          text: ["Salesforce's ecosystem runs on power users who answer questions, mentor newcomers and champion the platform. They weren't churning in anger. They were quietly drifting, and nothing on the platform noticed.",
            "We reached 650+ professionals, qualified 72 power users and interviewed 12. A first round on opinion gave warm, useless answers, so we switched to behavior: where people drop off and where they go instead. Engagement fell exactly where certification ended, and between milestones experts took their questions to ChatGPT."],
          stats: [["650+", "Reached across five regions"], ["72", "Qualified power users"], ["12", "Interviewed, two rounds"]],
          mediaLayout: "duo",
          media: [{ src: "/assets/images/trailhead/trailhead-user-journey.png", alt: "Diagram of the engaged state (trails, badges, certifications) and the disengaged state, where a user runs into a Salesforce issue and turns to ChatGPT, Claude or Google.", cap: "The journey: churn after certification, and the moment to win it back" }, { src: "/assets/images/trailhead/case-study-trailhead-5.webp", alt: "Graph comparing Trailhead engagement against the learner journey from certification to real-world problem solving.", cap: "Engagement against the learner journey" }],
          trades: [
            { n: "Findings", t: "Why experts left", rows: [["64% post-milestone", "Disengaged after major milestones like certifications."], ["45% workarounds", "Supplemented Trailhead with ChatGPT, YouTube and Slack."], ["45% depth", "Found the content too shallow for their experience."], ["36% personalization", "Were unhappy with the existing personalization."]] },
            { n: "Reframe", t: "Re-engagement, not retention", rows: [["Question", "How might Trailhead become the first place an expert goes when they're stuck, not only when they're studying?"], ["Success metric", "Preference over ChatGPT on a real question, session duration, and drop-off after milestones."], ["Guardrail", "Protect Trailhead's warm, human brand. No AI speaking on behalf of a real person."]] },
          ] },

        { title: "What we killed", statement: "What we killed: two ideas we built on purpose, so the real bet had room.",
          text: ["We explored community status, leverage and skill visibility, then skipped wireframes and vibe-coded the two strongest into working proofs of concept. Trying them ourselves was faster than debating them.",
            "Neither held up. Killing them told us what not to build, and shaped the two features we shipped."],
          media: [{ diagram: { kind: "versus", title: "Two proofs of concept", cards: [{ tag: "Exploration 1", title: "An AI version of themselves", body: "An AI trained on their posts answers community questions on their behalf.", status: "Killed" }, { tag: "Exploration 2", title: "A public skill profile", body: "A shareable Trailhead profile showing certifications, badges, and skill levels.", status: "Killed" }] } }, { src: "/assets/images/trailhead/trailhead-ideation-whiteboard.jpg", alt: "Whiteboard from a team ideation session.", cap: "Whiteboard ideation session" }, { src: "/assets/images/trailhead/trailhead-ideation-team.jpg", alt: "The team during an ideation session.", cap: "Team ideation session" }],
          trades: [
            { n: "Killed 01", t: "An AI version of themselves", rows: [["The idea", "Power users lead groups while an AI trained on their posts answers community questions on their behalf."], ["Fully automated", "Undisclosed AI speaking as a real person damages trust."], ["Disclosed or approve-first", "Clashed with Trailhead's warm, human brand, and approving every reply stopped saving anyone time."], ["Underneath", "Research was clear these users didn't want to engage with the community anyway."]] },
            { n: "Killed 02", t: "A public skill profile", rows: [["The idea", "Borrowed from GitHub's contribution graph: make skill currency public, and visibility pressures people to keep it current."], ["Adoption was out of our hands", "It only works if employers treat the profile as a credential."], ["Engagement for its own sake", "Even if it caught on, it gave no meaningful, lasting reason to return."]], media: [{ src: "/assets/images/trailhead/case-study-trailhead-7.webp", alt: "Public skill profile concept UI showing certifications, badges and skill currency.", cap: "The shareable profile we killed" }] },
          ] },

        { title: "What we shipped", statement: "What we shipped: catch the ChatGPT moment, then give experts a reason to come back.",
          text: ["We bet that plain-language answers drawn from Salesforce's own knowledge would beat any general AI. Proprietary data and Agentforce were never on the table, so we built on OpenAI with curated Salesforce documentation and focused on proving the experience.",
            "The bet became two connected features. Solve catches power users at the moment they would otherwise open ChatGPT; proactive prompts make returning worth it. Neither works alone."],
          trades: [
            { n: "01 · Solve", t: "A plain-language answer, calibrated to you", rows: [["Ask in plain language", "A specific, actionable answer that cites Salesforce documentation."], ["Set the depth", "Beginner, Intermediate or Advanced, so you are never over-explained or underserved."], ["Never a dead end", "When Solve can't fully help, it drafts a ready-to-post Trailblazer Community question from your conversation."]],
              mediaLayout: "quad",
              media: [{ video: "/assets/images/trailhead/video-trailhead-chatbot.mp4", poster: "/assets/images/trailhead/video-trailhead-chatbot-poster.webp", alt: "Solve answering a Salesforce question in plain language", cap: "Solve answering" }, { src: "/assets/images/trailhead/trailhead-solve-1.png", alt: "Solve main interface: a greeting, three suggested starting points and a message field.", cap: "Solve: the main interface" }, { src: "/assets/images/trailhead/trailhead-solve-2.png", alt: "Solve answer listing the sources behind it: a community thread, a Trailhead module and developer docs.", cap: "Solve: the sources behind an answer" }, { src: "/assets/images/trailhead/trailhead-solve-3.png", alt: "Solve offering Solved or Need more help, then a drafted post to the community.", cap: "Solve: never a dead end, with a drafted community post" }] },
            { n: "02 · Proactive prompts", t: "The platform does the noticing", rows: [["Renewals", "Flags a certification renewal before it lapses, closing a notification gap users complained about."], ["Skill gaps", "Measures a skill profile against what the market is hiring for and builds a path to close the gap."], ["Follow-ups", "Reads the questions asked in Solve and recommends what to learn next."]],
              mediaLayout: "hero-trio",
              media: [{ src: "/assets/images/trailhead/case-study-trailhead-4.webp", alt: "Personalised dashboard full view showing trending skills and personalized trail recommendations.", cap: "Dashboard full view: trending skills and personalized trail recommendations" }, { src: "/assets/images/trailhead/trailhead-trail-prompt.png", alt: "A prompt showing progress towards a trail, three hours from completing it, with a Continue Trail button.", cap: "A prompt that builds on what you completed" }, { src: "/assets/images/trailhead/trailhead-skills.png", alt: "Skills employers want: a radar chart of skills in demand against your skills, with tailored trailmixes for each deficient skill.", cap: "Skills employers want, with a tailored trailmix for each gap" }] },
          ] },

        { title: "Build & test", statement: "Build & test: working software and synthetic users before we spent real people's time.",
          text: ["Each component was designed in Figma against Trailhead's design system, then taken through Figma MCP into Cursor and Claude Code and wired to OpenAI. No handoff, no rebuild from a spec: a working app, so we could test it like a product instead of a slideshow.",
            "Real power users were scarce, so we turned our research into 12 AI agents and ran them through the flows first. By the time 8 real power users arrived, the obvious rough edges were gone and their time went to what needed a person."],
          cards: [["What was running", "React front end, Express and SQLite back end, OpenAI for responses, voice input, expertise calibration and community-post drafting."], ["12 agents, then 8 users", "Synthetic users built from research data caught usability problems before real sessions."]] },

        { title: "Impact & learning", statement: "Impact & learning: preferred over ChatGPT, with honest limits on what we proved.",
          text: ["Each participant asked the same question about the Salesforce product they work with to both ChatGPT and Solve. 6 of 8 preferred Solve.",
            "The prototype also pulled experts back into the content, lifting session duration 35% and cutting drop-off after milestones 22%, the half of the problem we most needed to prove.",
            "The honest limit: curated public documentation, not Salesforce's proprietary data or Agentforce, and 8 power users. The next step is a larger test on real support data, where the bet can be proven at scale."],
          cards: [["6/8 preferred Solve over ChatGPT", "Same Salesforce question, side by side."], ["4.5/5 confidence", "In Solve's answers."], ["+35% session duration", "Power users stayed in the content."], ["−22% drop-off after milestones", "Experts who used to leave after a milestone stayed."]],
          quote: "I had never been comfortable in code, and had never prototyped with it, so teaching myself to ship this as working software is the barrier I'm proudest of clearing.", quoteBy: "Teammate on this project" },
      ],
    },
  },
  {
    name: "CotonAI Modes", org: "CotonAI", area: "Agentic AI · Fashion", tags: ["AI Agents", "UX Design"],
    title: "Designing structured, mode-based UX in an AI platform for fashion teams.",
    desc: "End-to-end design of Modes at CotonAI: replacing prompt-heavy AI with structured entry points mapped to real fashion workflows.",
    metric: { value: "125%", label: "Feature adoption lift" }, thumbnail: { src: "/assets/images/cotonai-modes/canvas-hero.webp", alt: "The CotonAI canvas: a board of generated fashion looks with the Modes bar open beneath.", bleed: true }, href: "/case-study?case=2", tint: ["#9CB09E", "#E3EAE0", "#C9D5C8"], photo: { src: "/assets/images/case-bg-bloom.jpg", pos: "50% 38%" },
    cs: {
      meta: [["Role", "Founding Product Designer"], ["Timeline", "Aug 2025 – Present"], ["Skills", "Interaction architecture, AI UX, design systems, prototyping, analytics"], ["Team", "Founder, PM, engineering"]],
      sections: [
        { title: "Overview", statement: "Overview: great AI visuals shouldn't require a prompting degree.",
          text: ["At CotonAI we're building the Figma for fashion: an AI workspace fine-tuned for fashion and adjacent industries. As founding product designer there was no brief. I owned the problem, the interaction model and the design system, working directly with the founder, PM and engineering.",
            "This is how a prompt box became Modes, structured entry points mapped to the way fashion teams actually work, and how that decision helped turn our MVP into a paid enterprise pilot."],
          media: [{ src: "/assets/images/cotonai-modes/canvas-hero.webp", alt: "The CotonAI canvas: a fashion board of generated looks with the Modes bar open at the bottom.", cap: "The CotonAI canvas, with the Modes bar open under a board of looks." }],
          cards: [["Problem: Prompting was a tax.", "Great visuals needed great prompts, and fashion designers aren't prompt engineers."], ["Solution: Modes, not better prompts.", "Edit, Render, Colourway and Studio, each mapped to a real workflow stage."], ["Outcome: +125% adoption", "After the V2 Modes bar, alongside a paid enterprise pilot and 584 hours saved for one client."]] },
        { title: "Problem", ph: "01", media: [{ src: "/assets/images/cotonai-modes/mvp-wireframes.webp", alt: "Four grey wireframes exploring the canvas, toolbar and side panel.", cap: "Initial wireframes while ideating" }, { src: "/assets/images/cotonai-modes/mvp-shipped.webp", alt: "The shipped MVP: a garment on a dark canvas with a single prompt bar underneath.", cap: "The shipped MVP: a canvas and a prompt box" }], statement: "Problem: to get high-quality visuals, users need strong prompting skills.",
          text: ["Our MVP opened on a canvas and a prompt box. Users who could write precise prompts got striking results. Everyone else got unpredictable images and stalled.", "So the question became: can we make something so intuitive that any fashion user gets a high-quality result without writing a prompt?"],
          cards: [["Users don't know how to prompt", "Blank-page prompting put the burden on the user's language skills."], ["Too much prompting makes AI hallucinate", "Especially with visuals, long prompts led to unpredictable results."]] },
        { title: "Research", ph: "02", media: [{ src: "/assets/images/cotonai-modes/prompt-templates.webp", alt: "The MVP prompt bar with suggested prompt chips such as re-design to a modern style.", cap: "Smarter prompt templates: less blank page, still language-precise" }, { src: "/assets/images/cotonai-modes/prompt-system-generated.webp", alt: "The MVP prompt bar pre-filled with a system-written prompt.", cap: "System-generated prompts: complexity hidden, not removed" }], statement: "Research: we shipped an MVP in 3 weeks to learn where it broke.",
          text: ["Our team has a combined 8 years of fashion industry experience, so we started from what we had observed and shipped an MVP in a record 3 weeks. Then we shadowed users on it and tested two ways of helping them prompt better. Both failed, and that was the most useful result of the quarter."],
          cards: [["Fashion tools had broken user flows", "Hypothesis from our industry experience."], ["Adoption of new tech is lower", "Hypothesis from our industry experience."], ["Fashion pipelines are disconnected", "Hypothesis from our industry experience."], ["They hesitated before typing prompts", "Pattern noticed while shadowing users."], ["They reused vague prompts repeatedly", "“change color”, “Make this editorial”, “Change the Model”."], ["Smarter prompt templates failed", "Reduced the blank page problem, but still required language precision and did not reduce hallucination."], ["System-generated prompts failed", "Still hid complexity instead of removing it, were hard to make predictable across fashion workflows, and users couldn't understand why results changed."]] },
        { title: "Principles", statement: "Principles: AI should adapt to designer intent, not the other way round.",
          text: ["Before redesigning anything, I set the rules every later trade-off would be judged against. They came straight from what failed in research."],
          stepsTitle: "Principles",
          steps: [["Intent over syntax", "Designers choose what they want to do, not how to phrase it."], ["Structure the entry, not the output", "Modes guide where you start. Creativity stays open."], ["Familiar before novel", "Borrow patterns fashion teams already know from design tools."], ["Every mode earns its place", "Instrument adoption so each iteration has a verdict."]] },
        { title: "Solution", ph: "03", media: [{ src: "/assets/images/cotonai-modes/workspace.webp", alt: "The CotonAI workspace with the Modes bar at the bottom of an empty board.", cap: "The workspace, with the Modes bar docked at the bottom" }, { src: "/assets/images/cotonai-modes/toolbar-v2.webp", alt: "Edit mode open: the selected garment beside Open, Combine, Upscale and Figure options.", cap: "Edit mode: options open alongside the edit" }, { diagram: { kind: "versus", title: "Figure submode", cards: [{ tag: "V1 · Editorial", title: "Try-on on a model", body: "Took 8 clicks and prompting.", status: "8 clicks" }, { tag: "V2 · Edit mode", title: "Figure submode", body: "No prompting needed.", status: "3 clicks", hi: true }] } }],
          ui: { kind: "tour", title: "Modes at CotonAI", items: [["Edit", "Edit, with options alongside", "Multiple options open next to your edit, so you compare without re-prompting."], ["Render", "Render a material or fabric", "Add the required material or fabric to your garment."], ["Colourway", "Change colour and prints", "A visual picker alongside hex input, so there are no codes to recall."], ["Studio", "Editorial photoshoots", "Create editorial-level shoots from a reference image."]] }, dash: [{ type: "trend", w: 6, label: "Mode-bar adoption", value: "+125%", chip: "V1 → V2", points: [["V1", 100], ["V2", 225]], note: "Indexed to V1 = 100. Visual annotation helped users pick a mode faster." }, { type: "bars", w: 6, label: "Clicks to a try-on", value: "8 → 3", chip: "−5 clicks", rows: [["Editorial, V1", 8, "8"], ["Figure submode, V2", 3, "3"]], note: "No prompting needed in V2." }], statement: "Solution: we replaced the prompt box with modes.",
          text: ["Instead of helping users prompt better, I removed the need to. Modes became structured entry points into AI capability, reducing ambiguity while keeping creativity open.", "After the MVP we refined the direction, launched V1 for paid pilots on a more stable backend, and rolled out V2. Each mode maps to a real fashion workflow stage, and each iteration was decided by usage data, not opinion."],
          steps: [["Edit", "Multiple options alongside edit open."], ["Render", "Add required material or fabric to your garment."], ["Colourway", "Change garment colour and prints."], ["Studio", "Create editorial-level photoshoots with a reference image."]],
          trades: [
            { n: "Decision 1", t: "Treat the canvas as a behavioural system", rows: [["Architecture", "Modes act as semantic layers between user intent and AI execution."], ["Flow", "Mode logic → event → state → render loop."], ["It helped", "Predictable outcomes, reduced hallucination, consistent visual logic."]] },
            { n: "Decision 2", t: "Toolbar design evolution", rows: [["Issue with V1", "Users struggled to decide which mode they wanted, and onboarding took a long time. We used PostHog and trigger.dev to find this out."], ["Hypothesis for V2", "Visual annotation will help users pick the desired mode faster."], ["Result", "Adoption increased by 125%."]], media: [{ src: "/assets/images/cotonai-modes/toolbar-v1.webp", alt: "The V1 Modes bar: a plain row of text mode labels under the prompt field.", cap: "V1: modes as a text row" }, { src: "/assets/images/cotonai-modes/toolbar-v2.webp", alt: "The V2 Modes bar with visual annotation: each option previewed as a thumbnail.", cap: "V2: visual annotation on every option" }] },
            { n: "Decision 3", t: "Colourway redesign", rows: [["Issue with V1", "Users had access to hex codes but low recall and cognitive load caused hesitation and friction, so weekly adoption was low."], ["Hypothesis for V2", "A visual colour picker alongside hex input reduces cognitive load and matches familiar patterns from other design tools."], ["Result", "Significantly improved user feedback and feature adoption."]], media: [{ src: "/assets/images/cotonai-modes/colourway-v1.webp", alt: "The V1 Colourway mode: hex-code entry only.", cap: "V1: hex codes only" }, { src: "/assets/images/cotonai-modes/colourway-v2.webp", alt: "The V2 Colourway mode with a garment selected and a visual colour picker.", cap: "V2: a visual picker alongside hex input" }] },
            { n: "Decision 4", t: "Figure submode", rows: [["Issue with V1", "Creating a try-on on a model in Editorial took 8 clicks and prompting."], ["Change in V2", "A Figure submode inside Edit mode."], ["Result", "No prompting and 3 clicks to get results."]], note: "Sub-modes are for very specific use cases; they are not open-ended.", media: [{ src: "/assets/images/cotonai-modes/figure-v2.webp", alt: "The Figure submode inside Edit mode: a garment beside its on-model try-on.", cap: "V2: Figure submode inside Edit" }] },
            { n: "Decision 5", t: "Scaling the design system with AI", rows: [["Step 1", "Designed tokens in the Figma library."], ["Step 2", "Collaborated with dev to finalize the token specification, using shadcn as the base layer."], ["Step 3", "Created an .md file and pushed it as a UI library."], ["Result", "Every new custom UI pulls from the same GitHub repo, with no redesigning again and again."]], note: "The full system, and how a flow is specified before it is built, is case study 03.", media: [{ src: "/assets/images/cotonai-modes/tokens-workflow.webp", alt: "The token workflow: Figma library, token specification with the developer, then an md file pushed to GitHub, beside the mode buttons built from those tokens.", cap: "The token workflow, and the mode buttons it produces" }] },
            { n: "Decision 6", t: "Specify flows as states, not screens", rows: [["Flow", "In Editorial mode the user clicks + Look or + Reference, enters a temporary assignment state, and picks an image from the board or overlay. The system assigns it to the slot, shows the thumbnail, switches to Replace and exits with clear visual feedback."], ["Spec", "Each flow is defined as states, events, constraints and acceptance criteria, so selection logic, slot mapping and Generate gating stay predictable and error resistant."], ["Ship", "The spec goes into Cursor to prototype. A feature branch is created, slot state and overlay logic are implemented and pushed to GitHub, reviewed in check-in and finalized before merge."]], media: [{ src: "/assets/images/cotonai-modes/flow-1.webp", alt: "Editorial mode flow, part one: clicking Reference, the board entering assignment state, an image assigned to the slot.", cap: "Editorial mode: assign a look or reference" }, { src: "/assets/images/cotonai-modes/flow-2.webp", alt: "Editorial mode flow, part two: the thumbnail shown in the slot, the button switching to Replace, Generate unlocked.", cap: "Then the slot, Replace and Generate states" }] },
          ] },
        { title: "Impact", dash: [{ type: "kpi", w: 4, label: "Images generated", value: "6000+", note: "In editorial mode on CotonAI" }, { type: "kpi", w: 4, label: "Cost saved", value: "$5k+", note: "Deciding UX flows and which AI models to work with" }, { type: "kpi", w: 4, label: "Enterprise pilot", value: "$$$", chip: "Paid", note: "Converted the MVP to a paid pilot with an enterprise client" }, { type: "waffle", w: 8, label: "Client time saved", value: "584 hrs", cells: 80, filled: 73, note: "In one season, about 73 working days at 8 hours a day. Each square is one day." }, { type: "kpi", w: 4, label: "Feature adoption", value: "125%", chip: "↑ vs V1", note: "After redesigning the Modes bar" }], statement: "Impact: a paid pilot, 584 hours saved for a client, and 125% higher adoption.",

          text: ["Modes changed what CotonAI could sell. The MVP converted into a paid pilot with an enterprise client, one client saved 584 hours in a single season, and the Modes bar redesign more than doubled adoption.", "It also changed how we build: deciding UX flows before committing to AI models saved $5k+."] },
        { title: "Learning", statement: "Learning: shape the interaction model, not more controls.",
          text: ["Designing CotonAI shifted my perspective on AI interfaces from feature design to interaction architecture. The real challenge wasn't model capability, but how people translate intent into action. Modes were a strategic move to reduce ambiguity, stabilize outcomes, and align AI behavior with how designers already think visually.", "Successful AI products are not built by adding more controls, but by shaping interaction models that make complex technology feel predictable, trustworthy, and native to human workflows. The risks below are what I'm watching as Modes grow."],
          quote: "While building CotonAI, I realized designers can directly influence business decisions through human-centered thinking, amplified by AI.", quoteBy: "Sambit Nayak",
          cards: [["Risk: over-structuring", "Could reduce creative freedom. Mitigation: modes guide the entry point, not the output style."], ["Risk: power users feel constrained", "Mitigation: Open mode retained for advanced control."], ["Risk: mode explosion", "Could confuse users. Mitigation: submodes nested inside parent workflows."]] },
      ],
    },
  },
  {
    name: "CotonAI Design System", org: "CotonAI", area: "Design systems · AI product", tags: ["Design Systems", "AI UX"],
    title: "One repo, so every new CotonAI screen is built from the same library.",
    desc: "Founding product designer at CotonAI: Figma tokens, a spec on shadcn, and a markdown library in GitHub. New custom UI is pulled from that repo.",
    metric: { value: "1", label: "Repo every new custom UI is built from" }, href: "/case-study?case=3", tint: ["#8AA3AE", "#E3ECEE", "#C5D5DA"],
    cs: {
      meta: [["Role", "Founding Product Designer"], ["Timeline", "Aug 2025 – Present"], ["Skills", "Design tokens, component specs, shadcn, AI-assisted UI"], ["Team", "Founder, PM, engineering"]],
      sections: [
        { title: "Overview", statement: "Overview: the next screen should come from the repo.",
          text: ["At CotonAI I was founding product designer. There was no brief and no system. I owned the interaction model and the design system, with the founder, PM and engineering. The product, an AI workspace for fashion teams, moved in weeks: an MVP, then Modes.",
            "The Modes case is the product decision. This one is the system under it. A new custom UI gets made once, written down, and pulled the next time we need it."],
          cards: [["Problem: Every custom UI started over.", "Each new control was drawn again, and Cursor had nothing to read."], ["Solution: Three steps, then the repo.", "Figma tokens, a spec on shadcn, a markdown file pushed as the UI library."], ["Outcome: One GitHub repo.", "Every new custom UI pulls from it."]] },

        { title: "Problem", statement: "Problem: the chrome was being redesigned every time the product grew.",
          text: ["The MVP shipped in three weeks. Modes, Colourway and the editorial slots each arrived as their own screen. Drawing them was not the slow part. Engineering had no shared spec, and Cursor, where we prototype, had no library to pull from.",
            "A Figma file the model never opens is redrawn the moment a new control is needed."],
          cards: [["Screens arrived one at a time", "Each mode was its own drawing, with its own states."], ["Code had no contract", "The next button was a guess for engineering and for Cursor."], ["The primitives already existed", "shadcn could be the base. The custom work was the fashion UI on top."]] },

        { title: "Reframe", statement: "Reframe: the system has two readers, the team and the model.",
          text: ["The question stopped being “what should this button look like?” and became “where does the next screen get its answer?” Figma keeps the team aligned. The file in the repo is what actually gets built."],
          cards: [["Goal", "One source for every new custom UI."], ["Success metric", "A new screen is pulled from the GitHub repo."], ["Guardrail", "shadcn stays the base layer. We specify the fashion controls on top."]] },

        { title: "Principles", statement: "Principles: tokens first, and a spec the model can read.",
          text: ["These are the rules the workflow follows. A later feature uses the path instead of opening a blank frame."],
          stepsTitle: "Principles",
          steps: [["Tokens before components", "Colour, type and control states start in the Figma library."], ["shadcn is the base", "The token spec is finalized with engineering on top of shadcn."], ["The spec lives in the repo", "A markdown file is what Cursor reads when it builds the next screen."], ["Flows are states", "Events, constraints and acceptance criteria travel with the prototype."]] },

        { title: "Workflow", media: [{ src: "/assets/images/cotonai-modes/tokens-workflow.webp", alt: "My AI workflow: tokens designed in the Figma library, a token specification with the developer on shadcn, then a markdown file pushed to GitHub, beside the canvas controls in default and selected states.", cap: "The workflow, and the controls the library produces." }],
          statement: "Workflow: Figma tokens, a shadcn spec, a markdown library.",
          text: ["I designed the tokens in the Figma library, then worked with engineering to turn them into a specification on shadcn. In Cursor I wrote that spec as a markdown file and pushed it to GitHub as the UI library.",
            "The sheet on the right is what that library has to cover: the canvas controls, in the states the product actually uses."],
          stepsTitle: "The workflow",
          steps: [["Figma library", "Designed the tokens there first."], ["Token specification", "Finalized it with engineering, with shadcn as the base layer."], ["Markdown in the repo", "Wrote the .md file in Cursor and pushed it to GitHub as the UI library."]],
          trades: [
            { n: "Decision 1", t: "One path from token to generated UI", rows: [["Step 1", "Designed tokens in the Figma library."], ["Step 2", "Collaborated with engineering to finalize the token specification, using shadcn as the base layer."], ["Step 3", "Created an .md file in Cursor and pushed it to GitHub as a UI library."], ["Result", "Every new custom UI pulls from the same repo."]] },
            { n: "Decision 2", t: "Specify the fashion layer on top of shadcn", rows: [["Base", "shadcn, agreed with engineering as the primitive layer."], ["What we designed", "The canvas controls and their states: Edit, Render, Colourway, Video, Generate, Cancel, Back and Side."], ["States on the sheet", "Each control is drawn in a quiet state and a lime state. Back and Side also have a filled emphasis button."], ["Why this shape", "The product was still changing by the week, so the custom work stayed on the fashion controls."]] },
            { n: "Decision 3", t: "Write a flow as states, then build it", rows: [["Flow", "In Studio, Editorial, the user clicks + Look or + Reference, enters an assignment state, and picks an image from the board or overlay. The slot shows the thumbnail, the button becomes Replace, and Generate unlocks."], ["Spec", "States, events, constraints and acceptance criteria, so selection, slot mapping and Generate gating stay predictable."], ["Ship", "The spec goes into Cursor to prototype. A feature branch carries the slot state and overlay logic to GitHub, then review in check-in, then merge."]], note: "The same path as the library: write the contract, then let the build pull from it.", media: [{ src: "/assets/images/cotonai-modes/flow-1.webp", alt: "Editorial mode: clicking Reference, the board entering an assignment state, then the image assigned and the button switching to Replace.", cap: "Assignment state, then Replace" }, { src: "/assets/images/cotonai-modes/flow-2.webp", alt: "Editorial mode: selecting images on the board, choosing one for Look and one for Reference, then Generate unlocking.", cap: "Look and Reference filled, then Generate unlocks" }] },
          ] },

        { title: "Impact", statement: "Impact: new custom UI comes from one repo.",
          text: ["The result I will stand behind is the one written on the workflow: every time we need a new custom UI, it pulls from the same GitHub repo. We stopped redrawing the chrome for each feature.",
            "The 125% Modes adoption lift, the paid pilot and the 584 hours saved sit in the Modes case. They measure the product. This case is the build path those screens share."],
          cards: [["One repo", "The library every new custom UI is generated from."], ["shadcn underneath", "Primitives were specified with engineering and left in place."], ["States before screens", "Editorial slot logic shipped from a spec: assignment, Replace, and Generate gating."]] },

        { title: "Learning", statement: "Learning: if the model cannot read the system, the system is not in the build.",
          text: ["Tokens in Figma keep the team on one visual language. The markdown file is what Cursor uses when a new screen starts. Both have to exist, and they have to say the same thing.",
            "The limit: I do not have a separate count of components or hours saved by the library, and the two files drift if only one of them is updated. The next step is to keep the Figma library and the markdown spec in lockstep as Modes and the agent add controls."],
          quote: "A design system that lives only in Figma gets redesigned the moment we open Cursor.", quoteBy: "Sambit Nayak" },
      ],
    },
  },
  {
    name: "Arcade Control Plane", org: "Arcade.dev", area: "Take-home · Agent infrastructure", tags: ["Dev tools", "AI Agents"],
    title: "Turning Arcade from an infrastructure inventory into an agent deployment control plane.",
    desc: "A take-home redesign of Arcade.dev. I chose the problem, set the north star, scoped the build and shipped a working prototype of the path to a first authorized tool call.",
    metric: { value: "1", label: "North star: first authorized tool call" }, thumb: { video: "/assets/images/arcade/video-arcade-cover.mp4", poster: "/assets/images/arcade/video-arcade-cover-poster.jpg", alt: "Arcade cover: the Authorize and run action, goal, tool, gateway and agent cards, an execution trace authorizing Linear mid-run, and the key numbers", navPoster: "/assets/images/arcade/video-arcade-cover-poster.jpg", bleed: true }, href: "/case-study?case=4", tint: ["#F6A6CF", "#FFDDEE", "#FFF7FB"], accent: "#F0299B",
    cs: {
      meta: [["Role", "Product Designer, end to end"], ["Format", "Take-home challenge, solo"], ["Skills", "Product strategy, IA, onboarding, AI UX, prototyping"], ["Tools", "Figma, shadcn/ui, Cursor + Figma MCP, ChatGPT"]],
      sections: [
        { title: "Context", statement: "Context: Arcade wins when the first tool call works.",
          text: ["Arcade is the auth and tool-calling layer for AI agents. The take-home was open-ended, so I treated it like week one as a founding designer: no PM, no spec. I owned the problem, the scope and how to measure it.", "Before designing anything, I tried every product flow myself, logged where it broke, and shadowed an AI engineer for 30 minutes."],
          bento: { label: "Context at a glance", tiles: [
            { k: "num", tone: "ac", w: 4, label: "North star", value: "1", sub: "First successful, authorized, reviewable tool call." },
            { k: "stack", tone: "mid", w: 4, label: "How I worked", rows: [["Product flows tried", "All", "Logged wins and failures", "white"], ["AI engineer interview", "30", "Minutes, with shadowing", "light"]] },
            { k: "text", tone: "dark", w: 4, label: "Shipped", title: "A deck and a working prototype in code.", body: "Figma and shadcn/ui first, then Cursor with the Figma MCP." }] } },

        { title: "Problem", statement: "Problem: users meet the architecture before the value.",
          text: ["The dashboard is a resource inventory. Users have to assemble Arcade's runtime in their heads before anything runs."],
          bento: { label: "The problem in numbers", tiles: [
            { k: "num", tone: "dark", w: 4, label: "Old dashboard", value: "≈8k", sub: "Tools exposed by default." },
            { k: "num", tone: "light", w: 4, label: "Sidebar", value: "18", sub: "Flat items, named after backend objects." },
            { k: "num", tone: "soft", w: 4, label: "First decision", value: "3", sub: "Paths to pick before any value: code, gateway, sandbox." },
            { k: "list", tone: "graphite", w: 12, label: "Diagnosis", rows: [["01", "Resource inventory", "18 items"], ["02", "Decision paralysis", "3 paths"], ["03", "Fragmented setup", "4 places"], ["04", "Weak feedback", "No next step"]] }] } },

        { title: "Strategy", statement: "Strategy: build one path, completely.",
          text: ["Everything served one moment. I built the path to it end to end and labelled the rest."],
          bento: { label: "Scope", tiles: [
            { k: "donut", tone: "light", w: 4, h: 2, label: "Sidebar built", value: "4/12", pct: 33, sub: "Plus onboarding and the code wizard, outside the sidebar." },
            { k: "list", tone: "dark", w: 8, label: "Built", rows: [["✓", "Dashboard", "4 states"], ["✓", "Playground", "Chat + Execute"], ["✓", "Tool catalog", "39 integrations"], ["✓", "Servers", "Gateway wizard"]] },
            { k: "text", tone: "soft", w: 8, label: "Deferred", title: "Users, policies, runs, audit and usage wait.", body: "They matter, but none gets a new user closer to the first call." }] } },

        { title: "Navigation", statement: "Navigation: group by the job, not the object.",
          text: ["Same features, regrouped into Build, Roll out and Observe. Ten old items were really one job."],
          bento: { label: "Information architecture", tiles: [
            { k: "bars", tone: "white", w: 8, h: 2, label: "Items per group", bars: [["Home", 1, 1], ["Build", 2, 3], ["Roll out", 10, 5], ["Observe", 1, 3], ["Footer", 4, 4]], legend: ["Before", "After"], sub: "Mapping is my reading of the redesign." },
            { k: "num", tone: "ac", w: 4, label: "Sidebar", value: "18→12", sub: "Destinations, grouped into three jobs." },
            { k: "num", tone: "dark", w: 4, label: "Roll out", value: "10→5", sub: "Backend objects folded into jobs." }] },
          mediaLayout: "stack", media: [{ src: "/assets/images/arcade/nav-old-new.jpg", alt: "Old Arcade sidebar with 18 ungrouped destinations next to the new sidebar grouped into Build, Roll out and Observe.", cap: "Old sidebar (left), redesign (right)", narrow: true }] },

        { title: "Onboarding", statement: "Onboarding: intent before infrastructure.",
          text: ["Ask what they want done, recommend the fastest path, keep expert paths one click away."],
          bento: { label: "Path to a first call", tiles: [
            { k: "list", tone: "graphite", w: 6, label: "Before", rows: [["1", "Land on a resource dashboard"], ["2", "Pick code, gateway or sandbox"], ["3", "Assemble docs, config, OAuth"], ["?", "Hope the first call works"]] },
            { k: "list", tone: "soft", w: 6, label: "After", rows: [["1", "Pick an outcome", "5 goals"], ["2", "Choose a path", "1 recommended"], ["3", "Connect & run", "Inline auth"], ["✓", "Trace, then Project Home"]] },
            { k: "keys", tone: "dark", w: 4, label: "Three paths", hi: 0, keys: [["▶", "Playground"], ["⇄", "MCP gateway"], ["</>", "SDK"], ["↗", "Explore first"]] },
            { k: "num", tone: "light", w: 4, label: "Expert wizards", value: "8", unit: "steps", sub: "Gateway and SDK each, with live status beside every step." },
            { k: "text", tone: "ac", w: 4, label: "Default", title: "Sandbox first.", body: "“Sandbox runs are safe to test. You can promote to production later.”" }] },
          mediaLayout: "stack", media: [{ src: "/assets/images/arcade/onboarding-goal.jpg", alt: "Onboarding step one: What do you want to get done? with five outcome cards.", cap: "Step 1: pick an outcome" }, { src: "/assets/images/arcade/onboarding-path.jpg", alt: "Onboarding step two: choose Playground, MCP gateway or SDK, with the proposed tool bundle and its auth status.", cap: "Step 2: choose how to use it" }] },

        { title: "Playground", statement: "Playground: a runtime simulator, not a chat box.",
          text: ["Every run shows the same eight checks. When a tool needs access, the run pauses and asks in place."],
          bento: { label: "Execution visibility", tiles: [
            { k: "dial", tone: "graphite", w: 4, h: 2, label: "Checks per run", n: 8, at: 3, value: "8", center: "Paused at 3" },
            { k: "list", tone: "dark", w: 4, h: 2, label: "The trace", title: "Paused for one scope: issues:create.", rows: [["✓", "User intent"], ["✓", "Tool selected"], ["●", "Authorization", "Now"], ["○", "Scope check"], ["○", "Policy check"], ["○", "Tool execution"], ["○", "Result returned"], ["○", "Audit log saved"]] },
            { k: "num", tone: "ac", w: 4, label: "To authorize", value: "1", unit: "click", sub: "“Continue to Linear”, inside the run." },
            { k: "stack", tone: "mid", w: 4, label: "In the Playground", rows: [["Modes", "2", "Chat · Execute", "white"], ["Tools ready", "64", "Across 20+ apps", "light"]] }] },
          mediaLayout: "stack", media: [{ src: "/assets/images/arcade/playground-chat.jpg", alt: "Playground chat with an execution map and an eight-step execution visibility rail.", cap: "Chat, execution map and trace rail" }, { src: "/assets/images/arcade/playground-auth.jpg", alt: "Playground paused at step three, authorization required, showing the user, required scope and a Continue to Linear button.", cap: "Authorization, at the moment it's needed" }] },

        { title: "Project Home", statement: "Project Home: one page, four states.",
          ui: { kind: "checklist", title: "Set up your project", link: "View all", note: "Connect a tool and run your first agent action. Every blocker ships with its fix.", remaining: "3 steps remaining", steps: [["Pick tools", "2 mins", "Choose the tools your agent can call."], ["Connect auth", "3 mins", "Authorize once, inside the run."], ["Test action", "1 min", "Run your first reviewable tool call."]] },
          text: ["The dashboard follows the user's progress, and every blocker ships with its fix."],
          bento: { label: "Project Home", tiles: [
            { k: "keys", tone: "dark", w: 4, h: 2, label: "States", hi: 2, keys: [["0/3", "Empty"], ["1/3", "Needs auth"], ["3/4", "First run"], ["4/4", "Active"]] },
            { k: "num", tone: "ac", w: 4, label: "First run", value: "3/4", sub: "Setup done. Next: enable test users.", bar: 75 },
            { k: "donut", tone: "light", w: 4, label: "Success rate", value: "91%", pct: 91 },
            { k: "list", tone: "graphite", w: 8, label: "Blockers, ranked", rows: [["▲", "Salesforce auth expired", "Fix now"], ["▲", "Slack missing chat:write", "Reauthorize"], ["■", "Slack approval pending", "Review"], ["▼", "Gateway has no client", "Copy config"]] }] },
          mediaLayout: "stack", media: [{ src: "/assets/images/arcade/dashboard-needs-auth.jpg", alt: "Dashboard in the Needs auth state, with a setup checklist and a single next action.", cap: "Needs auth: one next action" }, { src: "/assets/images/arcade/dashboard-active.jpg", alt: "Dashboard in the Active state with KPIs, project summary and a recent execution map.", cap: "Active: health, runs and blockers (prototype data)" }] },

        { title: "Measurement", statement: "Measurement: time to a safe agent in production.",
          text: ["Scale it if time to first call drops without new auth drop-off. Rethink it if users run but never open a trace.", "Prototype target: a new user reaches a first authorized, reviewable tool call in a single session, without leaving the product for docs."],
          bento: { label: "Metrics and rollout", tiles: [
            { k: "bars", tone: "soft", w: 6, h: 2, label: "Activation funnel", bars: [["Start", 100], ["M2", 84], ["Auth", 68], ["M1", 54], ["M3", 42], ["M4", 30], ["M5", 20]], sub: "Illustrative shape. No data until it's instrumented." },
            { k: "list", tone: "dark", w: 6, h: 2, label: "Five metrics", title: "Measured by safe production use, not time in the dashboard.", rows: [["M1", "Time to first authorized call", "Activation"], ["M2", "Setup completion by path", "Onboarding"], ["M3", "First trace opened", "Understanding"], ["M4", "Repeat call in week 1", "Retention"], ["M5", "Invited user activation", "Rollout"]] },
            { k: "timeline", tone: "white", w: 12, label: "Same design, three levels of build", phases: [["2 weeks", "Validate", "Built", 2, "Prototype, tested with 5–10 agent builders."], ["4 weeks", "Beta", "Next", 2, "Onboarding and Playground MVP, instrumented."], ["8 weeks", "Production", "Later", 4, "Live node canvas, real-time runs, readiness score."]] }] } },

        { title: "Outcome", statement: "Outcome: a working path to the first call.",
          text: ["Simulated data, no production results yet. The metrics above decide whether it scales.", "The call I'd want to own as a first designer: pick the moment that matters, build the path to it, and be honest about what waits."],
          bento: { label: "Risks", tiles: [
            { k: "text", tone: "dark", w: 4, label: "Risk", title: "The guided path hides power.", body: "Mitigation: “Explore dashboard first” stays one click away." },
            { k: "text", tone: "graphite", w: 4, label: "Risk", title: "Sandbox success doesn't transfer.", body: "Mitigation: First run ends in “Enable test users”." },
            { k: "text", tone: "light", w: 4, label: "Risk", title: "Simulated data.", body: "Mitigation: the 2-week plan tests with real agent builders." }] },
          cta: { label: "View the prototype", href: "https://arcadedevv.vercel.app/" } },
      ],
    },
  },
  {
    name: "Gap 3D Fit", org: "Gap", area: "E-commerce · 3D fit · Web and iOS", tags: ["E-comm", "UX Design"],
    title: "Turning sizing uncertainty into a 61% add-to-bag decision.",
    desc: "Technical product designer on Drapr, a Y Combinator 3D-fit startup that Gap Inc. acquired. I led the redesign of the 3D Fit flow so shoppers could trust a size. An A/B test showed a 61% lift in add-to-bag.",
    metric: { value: "+61%", label: "Add-to-bag lift, A/B tested" }, thumb: { video: "/assets/images/gap/video-gap-cover.mp4", poster: "/assets/images/gap/video-gap-cover-poster.jpg", alt: "Gap 3D Fit cover: the real QuickFit Finder, with Waist, Hips and Calf fit descriptors, and the key numbers", navPoster: "/assets/images/gap/video-gap-cover-poster.jpg", bleed: true }, href: "/case-study?case=5", tint: ["#9096CA", "#FEFBF2", "#F45220"],
    cs: {
      meta: [["Role", "Technical Product Designer"], ["Timeline", "6 months"], ["Skills", "UX flow, fit logic, UI, testing, 3D optimization · Web, iOS"], ["Team", "2 PMs, 1 designer, 1 UXR"]],
      sections: [
        { title: "Overview", statement: "Overview: fit is the biggest friction in online denim. Showing it wasn't enough.",
          text: ["Drapr built a 3D avatar that lets shoppers try on clothes. Gap Inc. acquired it in August 2021 to improve fit across its brands, and called fit “the number one point of friction for customers” (Gap Inc. press release, 26 August 2021).",
            "My hypothesis: a 3D avatar shows fit, but shoppers buy on trust. So I designed the flow around what a shopper needs to believe a size, then tested it against the old one."],
          cards: [["Drapr: 3D avatar try-on", "A Y Combinator startup. Gap acquired it in August 2021."], ["Hypothesis: ask less, prove more", "Little upfront. Explain the size when trust is at stake."], ["Result: +61% add-to-bag", "An A/B test of the new flow against the old one."]] },
        { title: "Problem", statement: "Problem: the old flow showed fit. Shoppers still felt risk.",
          text: ["Denim made sizing harder: one size had to explain multiple body zones without turning checkout into a long form."],
          media: [{ src: "/assets/images/gap/problem-size-chart.webp", alt: "Gap size guide table for women's jeans.", cap: "Charts were precise; comfort was not." }, { src: "/assets/images/gap/problem-denim-fit.webp", alt: "Jeans fit diagram with body-zone measurement markers.", cap: "Fit was multi-zone: waist, hip, thigh, calf, and inseam all mattered." }, { src: "/assets/images/gap/problem-recommendations.webp", alt: "Product recommendation carousel for Gap apparel.", cap: "A size recommendation without evidence felt risky." }],
          cards: [["Measurements were not enough", "Charts were precise; comfort was not."], ["Fit was multi-zone", "Waist, hip, thigh, calf, and inseam all mattered."], ["The answer needed a reason", "A size recommendation without evidence felt risky."], ["Every extra input had a cost", "More personalization could also mean more drop-off."]] },
        { title: "Decisions", statement: "Decisions: I asked less upfront and showed more evidence when trust was at stake.",
          text: ["The key move was sequencing: what to ask, what to defer, and when to explain. I tested each call with participants before it shipped."],
          trades: [
            { n: "Decision 1", t: "Accuracy vs completion rate", mediaLayout: "stack", media: [{ wide: true, src: "/assets/images/gap/decision-1.webp", alt: "Two versions of the Further customize your avatar screen, one showing size numbers beside each body measurement and one without.", cap: "The avatar customization screen, with and without size numbers" }],
              rows: [["User need", "Credible sizing."], ["Business need", "Purchase momentum."], ["Constraint", "Too many inputs caused drop-off."], ["Compromise", "Baseline first, tuning optional."]],
              find: [["What testing showed", "Participants said they felt more confident seeing the numbers when they entered their measurements, especially those who knew a few of them, than relying on a visual approximation."], ["What I did next", "Keep the dimensions visible by default. It is less ambiguous than showing no numbers at all."]],
              note: "Complexity moved later, after the value was clear." },
            { n: "Decision 2", t: "Explainability vs purchase velocity", mediaLayout: "stack", media: [{ wide: true, src: "/assets/images/gap/decision-2.webp", alt: "The QuickFit Finder with an open Why this recommendation panel that explains what to do if a size feels too small or too large.", cap: "A toggle-able Why this recommendation panel" }],
              rows: [["User need", "Evidence behind the size."], ["Business need", "Fast purchase flow."], ["Constraint", "Too much rationale slowed action."], ["Compromise", "Fast answer, optional reason."]],
              find: [["What testing showed", "Almost everyone opened it out of curiosity, even when the size matched what they usually wear."], ["What I did next", "Add a brief explanation of the recommendation, especially when it falls outside their usual range, to build trust in the tool."]],
              note: "The recommendation became inspectable without becoming heavy." },
            { n: "Decision 3", t: "Fit fidelity vs mobile performance", mediaLayout: "stack", media: [{ wide: true, src: "/assets/images/gap/decision-3.webp", alt: "The QuickFit Finder with Waist, Hips and Calf fit descriptors that explain what tight, fitted and loose feel like.", cap: "Toggle-based fit descriptors for waist, hips and calves" }],
              rows: [["User need", "Realistic body-zone fit."], ["Business need", "Reach mobile shoppers."], ["Constraint", "Fidelity slowed performance."], ["Compromise", "Use copy to support visuals."]],
              find: [["What testing showed", "Participants knew to click the question mark for more information and valued the clarity of what fitted, loose and relaxed mean."], ["What I did next", "Add definitions for the fit descriptors, so shoppers know what each one feels like."]],
              note: "Fit copy became interface logic: short, local, decision-tied." },
          ] },
        { title: "Solution", statement: "Solution: the final flow made fit easier to trust without adding friction.",
          text: ["Each step either improved the model or helped shoppers verify the recommendation."],
          mediaLayout: "stack",
          media: [{ wide: true, src: "/assets/images/gap/solution-flow.webp", alt: "The final flow in the QuickFit Finder: how tall are you, optional avatar customization, and a size shown on the avatar with Waist, Hips and Calf fit descriptors.", cap: "The final flow in the QuickFit Finder" }],
          steps: [["Baseline input", "How tall are you?"], ["Fit calibration"], ["Optional tuning", "Further customize your avatar"], ["Explainable fit", "Why this recommendation, and what tight, fitted and loose feel like"]] },
        { title: "Impact", statement: "Impact: an A/B test showed a 61% lift in add-to-bag.",
          dash: [{ type: "kpi", w: 4, label: "Add-to-bag", value: "+61%", chip: "A/B test", note: "New flow against the old flow" }, { type: "trend", w: 8, label: "Add-to-bag, indexed", value: "100 → 161", chip: "Old → new flow", points: [["Old flow", 100], ["New flow", 161]], note: "Indexed to the old flow = 100. The same 61% lift, shown as a change, not a share." }],
          text: ["The strongest signal was not more 3D realism. It was reducing sizing ambiguity at the moment shoppers decided whether to trust a size and add to bag.", "Leading the team meant keeping four disciplines on one definition of success:"],
          cards: [["Product", "Connected confidence to commerce signals"], ["Engineering", "Balanced 3D assets with mobile performance"], ["Research", "Mapped trust breakdowns"], ["Fit language", "Aligned product, research, and merchandising terms"]] },
        { title: "Reflection", statement: "Reflection: I changed my mind about the job of 3D.",
          text: ["The visual was not the product. Confidence was what shoppers believed, understood, and felt ready to do next.", "I would cut more today: every control should earn its place at the moment of doubt."],
          cta: { label: "Book a call", href: BOOK_A_CALL } },
      ],
    },
  },
  {
    name: "CotonAI Agent", org: "CotonAI", area: "Agent UX · Creative tools", tags: ["AI Agents", "0→1 Product"],
    title: "Designing an AI agent that understands how creative teams work.",
    desc: "Co-founder and founding product designer at CotonAI: moving from an image generator to an agent that carries creative intent across the whole workflow.",
    metric: { value: "71%", label: "First-pass acceptance in the Steele pilot" }, thumb: { video: "/assets/images/cotonai/video-cotonai-agent.mp4", poster: "/assets/images/cotonai/video-cotonai-agent-poster.jpg", alt: "CotonAI Agent walkthrough: asking the agent about a board, selection and brand memory", navPoster: "/assets/images/cotonai/video-cotonai-agent-poster.jpg", bleed: true }, href: "/case-study?case=6", tint: ["#9CB09E", "#E3EAE0", "#C9D5C8"],
    cs: {
      meta: [["Role", "Co-founder & Founding Product Designer"], ["Timeline", "2025 – Present"], ["Scope", "Product strategy, user research, interaction design, agent UX, design systems"], ["Focus", "0→1 product design, human–AI interaction, creative tools"]],
      sections: [
        { title: "Overview", statement: "Overview: from an image generator to an agent that remembers the brief.",
          text: ["As co-founder and founding product designer at CotonAI, I owned product strategy as well as design. The question I kept bringing back to the team wasn't \u201chow do we generate better images?\u201d but \u201cwhy does every prompt start from zero?\u201d",
            "This is how that question moved CotonAI from a visual workspace toward an agent that carries creative intent across a whole collection."],
          cards: [["Problem: Every prompt started over.", "The AI forgot why a colour was rejected or which silhouette was approved."], ["Solution: The canvas is the context.", "An agent that plans, executes and returns work to the canvas, with designers approving each step."], ["Outcome: 71% first-pass", "Designs accepted without a revision in the Steele pilot."]] },
        { title: "Problem", media: [{ diagram: { kind: "merge", title: "Before CotonAI", inputs: ["Moodboards", "Spreadsheets", "Image generators", "Review threads"], output: "One collection", note: "Designers spent hours moving between them." } }], statement: "Problem: we didn't need another AI image generator.",
          text: ["Fashion teams already had plenty of tools to generate images. Yet designers were still spending hours moving between moodboards, spreadsheets, image generators, review threads and production files.", "The real problem wasn't creating an image. It was everything that happened before and after it. A designer could generate 20 variations in minutes, but the AI wouldn't remember why a color was rejected, which silhouette was approved, or how the collection needed to evolve. Every new prompt felt like starting over."],
          cards: [["No memory of decisions", "Rejected colors and approved silhouettes were lost between prompts."], ["Context scattered across tools", "References, material constraints, brand identity and feedback lived in different places."]] },
        { title: "Direction", media: [{ diagram: { kind: "flow", title: "One shared canvas", nodes: ["Sketch", "Generate", "Edit", "Colourway", "Review"] } }, { diagram: { kind: "merge", title: "Canvas as context", inputs: ["Selected region", "Annotation", "Reference"], output: "Agent", note: "An image, sketch, annotation or selected region communicates intent." } }], statement: "Direction: what if AI understood the whole creative process, not just the next prompt?",
          text: ["Working with fashion brands and production teams, we saw how much creative work depended on invisible context: reference images, material constraints, brand identity, previous decisions and feedback.", "We started CotonAI as a collaborative visual workspace where designers could sketch, generate, edit, explore colorways and review work together on a shared canvas. The bigger opportunity emerged from those workflows: the canvas shouldn't just hold the work. It should become the context through which an agent understands the work."] },
        { title: "Solution", statement: "Solution: three product decisions for the agent experience.",
          ui: { kind: "trio", cards: [{ t: "Show the agent what you're working on", chips: ["Sketch", "Annotation", "Canvas region"], hi: 2, d: "An image, sketch, annotation or selected region communicates intent, so you don't have to describe it." }, { t: "Execution, not just generation", chips: ["Plan", "Execute", "Review"], hi: 1, d: "The agent plans steps, selects tools, generates alternatives and returns outputs to the canvas." }, { t: "Humans stay creative directors", chips: ["Compare versions", "Approve"], hi: 1, d: "Visible progress, contextual feedback and approval checkpoints keep creative judgment with the designer." }] },
          media: [{ video: "/assets/images/cotonai/video-cotonai-agent.mp4", poster: "/assets/images/cotonai/video-cotonai-agent-poster.jpg", alt: "CotonAI Agent walkthrough", cap: "The agent panel beside the canvas, using board, selection, brand and memory context." }],
          text: ["The proposed workflow became a loop the agent runs with the designer. The design challenge was making complex execution feel understandable, without exposing unnecessary technical complexity."],
          steps: [["Understand context"], ["Plan"], ["Execute"], ["Review"], ["Refine"], ["Remember"]],
          trades: [
            { n: "Decision 1", t: "Context before conversation", rows: [["Before", "Designers had to explain everything through prompts."], ["Change", "An image, sketch, annotation, garment reference or selected canvas region can communicate intent."], ["Result", "From “describe exactly what you want” to “show the agent what you're working on.”"]] },
            { n: "Decision 2", t: "Execution, not just generation", rows: [["Before", "A creative task rarely ends with one image, but the tool did."], ["Change", "A harness for managing context, planning steps, selecting tools, generating alternatives and returning outputs to the canvas."], ["Result", "Multi-step work that stays understandable."]] },
            { n: "Decision 3", t: "Humans remain creative directors", rows: [["Risk", "Autonomy is useful until an agent makes the wrong creative decision."], ["Change", "Visible progress, contextual feedback, version comparison and approval checkpoints."], ["Result", "The agent handles repetitive execution. The designer keeps creative judgment."]] },
          ] },
        { title: "Impact", dash: [{ type: "kpi", w: 4, label: "AI-assisted designs", value: "140+", note: "Steele pilot" }, { type: "kpi", w: 4, label: "Review comments", value: "188", note: "Left by teams on the shared canvas" }, { type: "donut", w: 4, label: "First-pass acceptance", value: "71%", pct: 71, note: "Designs accepted without a revision, Steele pilot" }, { type: "bars", w: 6, label: "Revisions per design", value: "3–5 → 1–2", chip: "Typical", rows: [["Before", 4, "3–5"], ["With CotonAI", 1.5, "1–2"]], note: "Typical revisions in the Steele pilot. Bars sit at the midpoint of each range." }, { type: "kpi", w: 6, label: "Visual assets per month", value: "~5,000", note: "Workflows supported through CreateNet" }],
          statement: "Impact: early pilot outcomes validated the collaborative workflow.",
          text: ["These are early workspace and pilot outcomes, not evidence that the proposed autonomous agent architecture has already achieved the same results."] },
        { title: "Learning", statement: "Learning: make intelligence understandable, controllable and useful inside real work.",
          text: ["The hardest part of designing AI products isn't making intelligence more powerful. It's making it understandable, controllable and useful inside real work.", "The live workspace established the foundation. Persistent creative memory, multi-step orchestration and richer agent controls are the next product direction: moving from AI that generates creative outputs toward AI that helps teams carry creative intent across an entire workflow."],
          quote: "That's the design problem I'm most interested in solving.", quoteBy: "Sambit Nayak" },
      ],
    },
  },
  {
    name: "Payman AI", org: "Payman", area: "Fintech · Agentic banking", tags: ["Fintech", "Branding"],
    title: "Payman AI: rebranding an agentic banking site for institutional trust.",
    desc: "Payman had agents that move real money and a first screen that read as a friendly startup. Audited the site as a bank buyer, rebuilt the brand around control, and fixed the usability that got in the way.",
    metric: { value: "4", label: "Steps from question to payment, each one logged" }, thumb: { video: "/assets/images/payman-case/video-payman-cover.mp4", poster: "/assets/images/payman-case/video-payman-cover-poster.jpg", alt: "Payman AI cover: the Meet your agent action, the four control steps, a bank chat paying five vendors after approval, and the key numbers", navPoster: "/assets/images/payman-case/video-payman-cover-poster.jpg", bleed: true }, href: "/case-study?case=7", tint: ["#3C9A98", "#C6E6DF", "#86C6C0"],
    cs: {
      meta: [["Role", "Brand and Web Designer, end to end"], ["Timeline", "2026"], ["Format", "Portfolio redesign of paymanai.com, solo"], ["Skills", "Brand audit, positioning, visual identity, web design, front-end build"]],
      sections: [
        { title: "The Setup", statement: "Setup: a platform that moves real money, built for a buyer who trusts nothing yet.",
          text: ["Payman AI deploys agents for banks and credit unions that carry out real transactions: payments, transfers and account analysis, inside the institution's own systems.", "The buyer is a skeptical, risk-averse bank decision maker. This is my portfolio redesign of paymanai.com. Facts, quotes and the logo come from the live site; the audit, positioning and visual system are mine."],
          media: [{ src: "/assets/images/payman-case/before-hero.jpg", alt: "The live paymanai.com hero: the headline We deploy AI agents that handle money on a cream background, a choice between Banks and Credit Unions, and a mountain illustration.", cap: "paymanai.com as I found it: a warm hero, a mountain illustration, and a choice between “Banks” and “Credit Unions”" }] },

        { title: "The Tension", statement: "Tension: the page sold warmth to a buyer who needs proof.",
          text: ["For a bank, capability is the frightening part: an agent that can move money can move it wrongly. The live page answered with warmth: one friendly voice, a decorative mountain, and an announcement bar, a pop-up and a cookie banner in front of the headline.", "The job wasn't awareness. It was belief: from “AI will take my customers' questions” to “I can deploy this, and I hold the kill switch.”"],
          cards: [["55%", "of U.S. consumers and small businesses already take their money questions to AI. TD Bank, 2026 AI Insights Report."], ["200M+", "people ask ChatGPT about money every month, and it can't see a single one of your balances. OpenAI usage disclosures, 2026."]],
          media: [{ src: "/assets/images/payman-case/before-first-load.jpg", alt: "The live paymanai.com on first load: an announcement bar, a newsletter pop-up covering the headline, and a cookie banner.", cap: "First load on desktop: announcement bar, newsletter pop-up over the headline, cookie banner" }, { src: "/assets/images/payman-case/before-mobile-first-load.jpg", alt: "The live paymanai.com on a phone: the newsletter pop-up with its email field clipped to the word Enter.", cap: "First load on a phone: the email field is clipped to “Enter”" }, { wide: true, src: "/assets/images/payman-case/first-screen-analytics.webp", alt: "The old Payman first screen with three numbered callouts: the announcement bar, a header with no primary action, and a segment picker, each with a mock analytics figure.", cap: "Mock analytics: where the first screen loses a cautious buyer (illustrative, not measured)" }, { wide: true, src: "/assets/images/payman-case/redesign-shift.webp", alt: "Two columns: when the customer asks AI outside the bank, the customer leaves; inside the bank, the customer stays, with data, audit trail and a kill switch.", cap: "The redesigned “shift” section: where the question is asked decides who keeps the customer" }] },

        { title: "The Decision", statement: "Decision: sell the control, not the magic.",
          text: ["Position Payman as the AI you can govern: show the controls, not the intelligence. No hype, no decorative first screen, no pop-ups.", "“You set the rules. You see every action.” names what a bank is afraid of and answers it. I audited the live site as a first-time bank buyer and wrote the fix beside every finding."],
          media: [{ diagram: { kind: "audit", title: "Audit: what I found, what I did", rows: [["One friendly voice for everything", "Two voices: a serif for the signed statement, a mono for the system record"], ["Decorative mountain art on the first screen", "The control process is the hero image: request, policy check, approval, audit log"], ["Rules, audit trail and kill switch in the last third", "Moved up to the fourth section, on their own teal stage"], ["Announcement bar, pop-up and cookie banner before the headline", "Nothing between the visitor and the headline; the pop-up is dropped"], ["A segment choice instead of an action", "One primary action, “Meet your agent”, in the header and the hero"], ["Pop-up clips the email field on phones", "One column on phones, form fields at least 44px tall, no overlays"]] } }, { diagram: { kind: "flow", title: "The control process, shown in the hero", hi: 1, nodes: ["Request", "Policy check", "Approval required", "Audit log"], note: "Requested, checked, approved, logged. The same four steps return in the explainer and in the audit log." } }, { wide: true, src: "/assets/images/payman-case/layout-exploration.webp", alt: "A two-by-two grid of wireframes comparing control steps below the fold or in the hero, with a segment picker or one primary action; the hero with one action is chosen and leads to the final hero.", cap: "Layout exploration: control steps in the hero, with one primary action" }, { wide: true, src: "/assets/images/payman-case/redesign-control.webp", alt: "The redesigned control section on a deep teal stage: Your rules, Full audit trail and Kill switch, with stepped bars above a governed agent layer between cores and anything that moves money.", cap: "Rules, audit trail and kill switch, moved up to the fourth section on their own teal stage" }, { wide: true, src: "/assets/images/payman-case/redesign-how-logged.webp", alt: "The four-step section: a live chat in a bank app where Payman lists five vendor payments, asks for a phone code, and confirms five payments sent.", cap: "Four steps as a live chat: ask, check, approve, log" }] },

        { title: "The System", statement: "System: a visual identity derived from the positioning, not from taste.",
          text: ["The look follows from the position: paper and ink for the document, deep teal for institutional trust, mauve for warmth, and yellow only as a signal. There is no red, so status reads as confirmation, not alarm.", "Three voices, one job each: serif for the signed statement, sans for body, mono for the system record. Every line passes one test: could a compliance officer quote this?"],
          media: [{ diagram: { kind: "swatches", title: "Palette", chips: [["#F3F3F0", "Paper", "Page"], ["#171717", "Ink", "Text"], ["#0E3D42", "Teal", "Trust"], ["#2F8A8C", "Mid teal", "Focus"], ["#D4B3CA", "Mauve", "Warmth"], ["#F4FF45", "Signal yellow", "Signal only"]], note: "Yellow is a bar, a digit or a strip. Never a fill." } }, { diagram: { kind: "specimen", title: "Type: three voices, one job each", lines: [["Display · Newsreader", "'Newsreader', 'Times New Roman', serif", 46, "We deploy AI agents that handle money."], ["Body · Geist", "'Geist', sans-serif", 17, "Agents that carry out real banking transactions for your customers, under policies, approvals and audit trails you control."], ["Record · Geist Mono", "'Geist Mono', monospace", 12, "PM-2026-001 // VERSION 1.0 · REQUESTED → CHECKED → APPROVED → LOGGED"]] } }, { diagram: { kind: "flow", title: "The page, in the order a buyer worries", hi: 1, nodes: ["Risk", "Control", "Process", "Proof", "Fit", "Reassurance", "Action"], note: "Each section answers one question a bank asks before it says yes." } }, { wide: true, src: "/assets/images/payman-case/design-system.webp", alt: "Design system preview: typography, colour tokens and icons; buttons in active, hovered and disabled states; form inputs, checkboxes and radios; and components such as status tags, the kill switch and audit rows.", cap: "The design system behind the page: type, colour, buttons, forms and components" }, { wide: true, src: "/assets/images/payman-case/redesign-security.webp", alt: "The security section: tabs for data and custody, identity and policy, and audit and control, with a teal panel of mono reference lines.", cap: "Security, laid out like a bank document: three tabs, one mono record" }, { wide: true, src: "/assets/images/payman-case/redesign-who.webp", alt: "The audience section: Payman at the centre of a grid of banks, credit unions, customers, members, staff, core banking, digital banking and voice and text.", cap: "Who it serves, drawn as one grid with Payman at the centre" }] },

        { title: "The Impact", statement: "Impact: the surfaces now match the claim.",
          text: ["Same facts, same viewport, before and after. The first screen now answers the buyer's risk question before it asks for anything.", "This is a portfolio redesign: no production metrics, and no tests with real bank buyers. The chat, payments and approval code are illustrative."],
          media: [{ diagram: { kind: "slider", title: "Hero, desktop. Drag to compare", before: "/assets/images/payman-case/before-hero.jpg", after: "/assets/images/payman-case/after-hero.jpg", ar: "1440 / 900", altBefore: "The live paymanai.com hero.", altAfter: "The redesigned hero with the four-step control process." } }, { diagram: { kind: "slider", title: "The numbers, desktop. Drag to compare", before: "/assets/images/payman-case/before-numbers.jpg", after: "/assets/images/payman-case/after-numbers.jpg", ar: "1440 / 900", altBefore: "The live site's statistics section.", altAfter: "The redesigned statistics section, with sources in mono." } }, { diagram: { kind: "slider", title: "Hero, phone. Drag to compare", before: "/assets/images/payman-case/before-mobile.jpg", after: "/assets/images/payman-case/after-mobile.jpg", ar: "390 / 844", narrow: true, altBefore: "The live site's hero on a phone.", altAfter: "The redesigned hero on a phone." } }],
          cards: [["Control in the first scroll", "The four-step process is the hero image, not an illustration."], ["One action, everywhere", "“Meet your agent” in the header and the hero, from the first pixel."], ["Nothing in the way", "No pop-up, no banner between the visitor and the headline."]],
          cta: { label: "View the prototype", href: "/payman" } },

        { title: "The Takeaway", statement: "Takeaway: in regulated software, show the control before the capability.",
          text: ["Show the control before the capability. The page works because it opts out of the AI category's vocabulary of magic and warmth and builds its own: paper, hairlines, serif authority, evidence on every screen.", "The limits: a free stand-in serif, two text-wordmark logos, and no testing with real bank buyers. Next, I'd see whether compliance leads find the kill switch unprompted."] },
      ],
    },
  },
];

const svgEl =(tag, attrs = {}) => {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
};

// A typographic tile: the project's headline metric, set large on its gradient
function metricTile(p, el, small = false) {
  p.tint.forEach((c, k) => el.style.setProperty(`--t${k + 1}`, c));
  el.classList.toggle("case__tile--photo", !!p.photo);
  if (p.photo) el.style.background = `url("${p.photo.src}") ${p.photo.pos} / cover`;
  if (p.thumbnail) {
    el.classList.add("case__tile--media");
    if (p.thumbnail.bleed) el.classList.add("case__tile--bleed");
    const img = document.createElement("img");
    img.className = "case__img";
    img.src = p.thumbnail.src;
    img.alt = p.thumbnail.alt;
    img.loading = "lazy";
    img.decoding = "async";
    el.appendChild(img);
    return;
  }
  if (p.thumb) {
    // Product media instead of the metric: the video plays while visible; the small nav preview shows its poster frame
    el.classList.add("case__tile--media");
    if (p.thumb.bleed) el.classList.add("case__tile--bleed");
    if (small) { const img = document.createElement("img"); img.className = "case__img"; img.src = p.thumb.navPoster || p.thumb.poster; img.alt = p.thumb.alt; el.appendChild(img); return; }
    const v = document.createElement("video");
    v.className = "case__vid"; v.muted = true; v.loop = true; v.playsInline = true; v.preload = "none"; v.poster = p.thumb.poster; v.setAttribute("aria-label", p.thumb.alt);
    const src = document.createElement("source"); src.src = p.thumb.video; src.type = "video/mp4"; v.appendChild(src);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) v.controls = false;
    else new IntersectionObserver(([e]) => { e.isIntersecting && !document.hidden ? v.play().catch(() => {}) : v.pause(); }, { threshold: 0.4 }).observe(v);
    el.appendChild(v); return;
  }
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
// CotonAI's studies sit together as one row of three locked cards; their case ids stay tied to PROJECTS order
const LOCK_SVG = '<svg class="lockcard__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><g class="lockcard__shackle"><path d="M8 10V7.5a4 4 0 0 1 8 0V10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></g><rect x="5" y="10" width="14" height="10" rx="2.5" fill="currentColor"/><circle cx="12" cy="15" r="1.3" fill="var(--lock-dot, #fff)"/></svg>';
let lockGroup = null;
// What each project is filed under. date = when the work last moved (drives "Recent").
const WORK_META = {
  "Trailhead Solve": { sectors: ["Enterprise", "AI agents"], featured: true, date: "2026-04" },
  "CotonAI Modes": { sectors: ["Fashion & retail", "AI agents"], featured: true, date: "2026-10" },
  "CotonAI Design System": { sectors: ["Fashion & retail"], featured: false, date: "2026-10" },
  "Arcade Control Plane": { sectors: ["Dev tools", "AI agents"], featured: false, date: "2026-05" },
  "Gap 3D Fit": { sectors: ["Fashion & retail"], featured: true, date: "2025-07" },
  "CotonAI Agent": { sectors: ["Fashion & retail", "AI agents"], featured: true, date: "2026-10" },
  "Payman AI": { sectors: ["Fintech", "AI agents"], featured: false, date: "2026-10" },
};
const units = [];
if (list) PROJECTS.forEach((p, i) => {
  if (p.org === "CotonAI") {
    if (!lockGroup) {
      lockGroup = document.createElement("li");
      lockGroup.className = "case case--locked";
      const ids = PROJECTS.map((q, k) => (q.org === "CotonAI" ? pad(k + 1) : null)).filter(Boolean).join(" · ");
      lockGroup.innerHTML = `<div class="case__label"><span class="card__index">Case studies ( ${ids} )</span><span class="case__client">CotonAI</span><span class="case__year">Passcode protected</span></div><ul class="lockgrid" role="list"></ul>`;
      list.appendChild(lockGroup);
      units.push({ li: lockGroup, group: true, members: [], ids });
    }
    let open = false; try { open = sessionStorage.getItem("samfolio-unlocked") === "1"; } catch {}
    const item = document.createElement("li");
    item.innerHTML = `<a class="lockcard${open ? " is-open" : ""}"><div class="case__tile lockcard__tile"><img class="lockcard__img" alt="" loading="lazy" decoding="async"><span class="lockcard__badge">${LOCK_SVG}</span></div><span class="card__index">Case study ( ${pad(i + 1)} )</span><h3 class="lockcard__title"></h3><p class="lockcard__area"></p><span class="case__cta">${open ? "View case study" : "Enter passcode"} <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"/></svg></span></a>`;
    const a = item.querySelector("a"), tile = item.querySelector(".case__tile"), img = tile.querySelector("img");
    if (p.thumb && p.thumb.video) {
      const v = document.createElement("video");
      v.className = "lockcard__vid"; v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.preload = "metadata"; v.poster = p.thumb.poster || "";
      v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-label", p.thumb.alt || p.name);
      const src = document.createElement("source"); src.src = p.thumb.video; src.type = "video/mp4"; v.appendChild(src);
      img.replaceWith(v);
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const play = () => { if (!document.hidden && v.getBoundingClientRect().bottom > 0 && v.getBoundingClientRect().top < innerHeight) v.play().catch(() => {}); else v.pause(); };
        new IntersectionObserver(play, { threshold: 0.25 }).observe(v);
        document.addEventListener("visibilitychange", play);
      }
    } else {
      const th = p.thumbnail ? p.thumbnail.src : p.thumb && p.thumb.poster; if (th) { img.src = th; if (p.thumbnail && p.thumbnail.fit === "contain") tile.classList.add("lockcard__tile--contain"); } else { img.remove(); if (p.photo) tile.style.background = `url("${p.photo.src}") ${p.photo.pos} / cover`; }
    }
    a.href = p.href; p.tint.forEach((c, k) => tile.style.setProperty(`--t${k + 1}`, c));
    a.setAttribute("aria-label", `${p.name}, passcode protected case study`);
    item.querySelector(".lockcard__title").textContent = p.name;
    item.querySelector(".lockcard__area").textContent = p.area;
    lockGroup.querySelector(".lockgrid").appendChild(item);
    units.find((u) => u.group).members.push({ p, i, item });
    return;
  }
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
  units.push({ li, members: [{ p, i }] });
});

// ── Work filter: Recent, Featured, then the sectors ──
if (list && units.length) {
  const meta = (p) => WORK_META[p.name] || { sectors: [], featured: false, date: "0000-00" };
  const sectors = [...new Set(PROJECTS.flatMap((p) => meta(p).sectors))].sort((a, b) => PROJECTS.filter((p) => meta(p).sectors.includes(b)).length - PROJECTS.filter((p) => meta(p).sectors.includes(a)).length);
  const filters = [{ key: "recent", label: "Recent" }, { key: "featured", label: "Featured" }, ...sectors.map((x) => ({ key: x, label: x }))];
  const fits = (p, key) => key === "recent" || (key === "featured" ? meta(p).featured : meta(p).sectors.includes(key));
  const tabs = document.getElementById("work-tabs"), unitDate = (u) => u.members.reduce((m, x) => (meta(x.p).date > m ? meta(x.p).date : m), "");
  const countEls = document.querySelectorAll("[data-work-count]");
  let active = "recent";
  const render = (key) => {
    active = key;
    tabs.querySelectorAll(".work__tab").forEach((b) => { const on = b.dataset.key === key; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
    list.setAttribute("aria-labelledby", `work-tab-${filters.findIndex((f) => f.key === key) === 0 ? "recent" : key.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
    let shown = 0;
    const ordered = units.map((u, idx) => ({ u, idx })).sort((a, b) => (key === "recent" ? (unitDate(b.u) > unitDate(a.u) ? 1 : unitDate(b.u) < unitDate(a.u) ? -1 : 0) : 0) || a.idx - b.idx);
    ordered.forEach(({ u }) => {
      const vis = u.members.filter((m) => fits(m.p, key));
      u.li.hidden = vis.length === 0;
      shown += vis.length;
      if (u.group) {
        u.members.forEach((m) => { m.item.hidden = !fits(m.p, key); m.item.classList.remove("is-wide"); });
        const v = u.members.filter((m) => !m.item.hidden);
        if (v.length === 1) v[0].item.classList.add("is-wide"); else if (v.length === 3) v[2].item.classList.add("is-wide");
        const lab = u.li.querySelector(".case__label .card__index"); if (lab) lab.textContent = `Case ${v.length === 1 ? "study" : "studies"} ( ${v.map((m) => pad(m.i + 1)).join(" · ")} )`;
      }
      list.appendChild(u.li);
    });
    countEls.forEach((el) => (el.textContent = pad(shown)));
  };
  filters.forEach((f) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "work__tab"; b.dataset.key = f.key; b.setAttribute("role", "tab"); b.id = `work-tab-${f.key === "recent" ? "recent" : f.key.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const n = PROJECTS.filter((p) => fits(p, f.key)).length;
    b.append(f.label); const sup = document.createElement("sup"); sup.textContent = pad(n); b.appendChild(sup);
    b.addEventListener("click", () => render(f.key));
    tabs.appendChild(b);
  });
  tabs.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const bs = [...tabs.querySelectorAll(".work__tab")], at = bs.findIndex((b) => b.dataset.key === active), next = bs[(at + (e.key === "ArrowRight" ? 1 : bs.length - 1)) % bs.length];
    next.focus(); render(next.dataset.key); e.preventDefault();
  });
  render("recent");
}

// ── Work: the rim glow under the hero follows the pointer and brightens on hover ──
(() => {
  const work = document.querySelector(".work");
  if (!work || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches, IDLE = 0.45;
  let gx = 50, gi = IDLE, tx = 50, ti = IDLE, raf = 0;
  const paint = () => { work.style.setProperty("--gx", gx.toFixed(2) + "%"); work.style.setProperty("--gi", gi.toFixed(3)); };
  const tick = () => {
    gx += (tx - gx) * 0.14; gi += (ti - gi) * 0.1; paint();
    raf = Math.abs(tx - gx) > 0.05 || Math.abs(ti - gi) > 0.005 ? requestAnimationFrame(tick) : 0;
  };
  const go = () => { if (reduced) { gx = tx; gi = ti; paint(); } else if (!raf) raf = requestAnimationFrame(tick); };
  addEventListener("pointermove", (e) => {
    const r = work.getBoundingClientRect(), near = e.clientY > r.top - 240 && e.clientY < r.bottom;
    if (near) { tx = Math.min(94, Math.max(6, ((e.clientX - r.left) / r.width) * 100)); ti = 1; } else ti = IDLE;
    go();
  }, { passive: true });
  document.addEventListener("pointerleave", () => { ti = IDLE; go(); });
})();

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
  resume: "https://drive.google.com/file/d/1jfC3rljbphQxvY5BD0zZ4kYsjuRtTjkr/view?usp=sharing",
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
  { label: "Résumé", title: "View my résumé", value: "Google Drive", href: CONTACT.resume, glyph: "writing", external: true },
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
// Product-UI illustrations built from case content: checklist, tour (dialog), trio (cards), rows (feature rows)
function uiMock(v) {
  const wrap = el("div", "ui ui--" + v.kind);
  const reveal = () => { wrap.classList.add("ui--rv"); [...wrap.children].forEach((k, i) => k.style.setProperty("--i", i)); new IntersectionObserver(([e], io) => { if (e.isIntersecting) { wrap.classList.add("in"); io.disconnect(); } }, { threshold: 0.2 }).observe(wrap); return wrap; };
  const ico = (cls) => el("span", cls);
  if (v.kind === "checklist") {
    const head = el("div", "ui__head"); head.append(el("h3", "", v.title)); if (v.link) head.append(el("span", "ui__link", v.link + " ›"));
    const note = el("div", "ui__note"); note.append(el("span", "ui__i", "i"), el("p", "", v.note));
    const card = el("div", "ui__card"); card.append(el("p", "ui__rem", v.remaining));
    v.steps.forEach(([t, time, d], i) => {
      const r = el("div", "ui__step" + (i === 0 ? " is-on" : ""));
      const n = i === 0 ? ico("ui__ring") : el("span", "ui__num", String(i + 1));
      const b = el("div"); const l = el("strong", "", t); l.append(el("em", "", time)); b.append(l, el("p", "", d));
      r.append(n, b, el("span", "ui__chev", "›")); card.appendChild(r);
    });
    wrap.append(head, note, card); return reveal();
  }
  if (v.kind === "tour") {
    const dlg = el("div", "ui__dlg");
    const left = el("div", "ui__left"); left.appendChild(el("h3", "", v.title));
    const nav = el("div", "ui__nav"); nav.setAttribute("role", "tablist");
    const right = el("div", "ui__right"); const art = el("div", "ui__art"); const h = el("h4"); const d = el("p"); const act = el("div", "ui__act");
    right.append(art, h, d, act);
    const show = (i) => {
      [...nav.children].forEach((b, k) => { b.classList.toggle("is-on", k === i); b.setAttribute("aria-selected", k === i); });
      const it = v.items[i]; h.textContent = it[1]; d.textContent = it[2]; art.innerHTML = "";
      v.items.forEach((_, k) => art.appendChild(el("i", k === i ? "is-on" : "")));
      art.appendChild(el("b", "", it[0])); act.innerHTML = "";
      const next = v.items[(i + 1) % v.items.length][0];
      act.append(el("span", "ui__btn", "Try it out"), Object.assign(el("button", "ui__btn ui__btn--p", "Next: " + next), { type: "button", onclick: () => show((i + 1) % v.items.length) }));
    };
    v.items.forEach((it, i) => nav.appendChild(Object.assign(el("button", "", it[0]), { type: "button", role: "tab", onclick: () => show(i) })));
    left.appendChild(nav); dlg.append(left, right); wrap.appendChild(dlg); show(0); return reveal();
  }
  if (v.kind === "trio") {
    v.cards.forEach((c) => {
      const card = el("div", "ui__tc"); card.append(el("h3", "", c.t));
      const vis = el("div", "ui__vis"); c.chips.forEach((ch, i) => vis.appendChild(el("span", "ui__chip" + (i === c.hi ? " is-on" : ""), ch)));
      card.append(vis, el("p", "", c.d)); wrap.appendChild(card);
    });
    return reveal();
  }
  v.rows.forEach((r) => {
    const row = el("div", "ui__row"); const txt = el("div", "ui__txt");
    txt.append(el("span", "ui__tag", r.tag), el("h3", "", r.t), el("p", "", r.d));
    const stack = el("div", "ui__stack");
    r.cards.forEach(([a, b, c], i) => { const k = el("div", "ui__sc" + (i === r.cards.length - 1 ? " is-on" : "")); k.append(el("span", "", a), el("strong", "", b), el("small", "", c)); stack.appendChild(k); });
    row.append(txt, stack); wrap.appendChild(row);
  });
  return reveal();
}

function dashTile(v) {
  const t = el("div", `dt dt--${v.type} dt--w${v.w || 4}`);
  const head = el("div", "dt__head"); head.appendChild(el("span", "dt__label", v.label));
  if (v.chip) head.appendChild(el("span", "dt__chip", v.chip));
  t.append(head, el("strong", "dt__value", v.value));
  const chart = el("div", "dt__chart"); if (["meter", "waffle", "donut"].includes(v.type)) chart.setAttribute("aria-hidden", "true");
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

function arcadePrototype(kind) {
  const shell = el("div", `ap ap--${kind}`);
  shell.innerHTML = `
    <div class="ap__bar">
      <span class="ap__brand"><i></i>ARCADE</span>
      <span class="ap__sandbox">INTERACTIVE PROTOTYPE</span>
    </div>
    <div class="ap__body"></div>
    <p class="ap__hint"></p>`;
  const body = shell.querySelector(".ap__body");
  const hint = shell.querySelector(".ap__hint");

  if (kind === "ia") {
    hint.textContent = "Switch views to compare what the navigation asks users to understand.";
    shell.querySelector(".ap__bar").insertAdjacentHTML("beforeend", `
      <div class="ap__toggle" role="group" aria-label="Navigation version">
        <button type="button" aria-pressed="true" data-ia="before">Current</button>
        <button type="button" aria-pressed="false" data-ia="after">Proposed</button>
      </div>`);
    const before = ["Tools", "Servers", "Secrets", "OAuth providers", "Users", "Policies", "Logs", "API keys", "Usage"];
    const groups = [
      ["Build", "Project Home · Playground · Tools · Agents"],
      ["Roll out", "Gateways · Users & Access · Auth · Policies"],
      ["Observe", "Runs & Traces · Audit logs · Usage"],
    ];
    const render = (view) => {
      body.innerHTML = view === "before"
        ? `<div class="ap__ia-copy"><span>RESOURCE MODEL</span><strong>Find the object you need.</strong><p>The sidebar mirrors the backend. The user assembles the workflow.</p></div><div class="ap__resource-list">${before.map((x, i) => `<span><b>${String(i + 1).padStart(2, "0")}</b>${x}</span>`).join("")}</div>`
        : `<div class="ap__ia-copy"><span>JOB MODEL</span><strong>Move the work forward.</strong><p>The architecture is still available, grouped by the job it supports.</p></div><div class="ap__job-list">${groups.map(([h, t], i) => `<button type="button"><b>0${i + 1}</b><span><strong>${h}</strong><small>${t}</small></span><i>→</i></button>`).join("")}</div>`;
    };
    render("before");
    shell.querySelectorAll("[data-ia]").forEach((btn) => btn.addEventListener("click", () => {
      shell.querySelectorAll("[data-ia]").forEach((b) => b.setAttribute("aria-pressed", b === btn));
      render(btn.dataset.ia);
    }));
  }

  if (kind === "onboarding") {
    hint.textContent = "Choose a goal, then a path. The prototype keeps architecture choices behind user intent.";
    const goals = [
      ["Triage inbound issues", "GitHub · Linear · Slack"],
      ["Stay on top of inbox", "Gmail · Slack"],
      ["Plan my day", "Calendar · Gmail"],
    ];
    const paths = [
      ["Try in Playground", "Recommended", "Prove Arcade can execute safely."],
      ["Connect to Cursor / Claude", "MCP gateway", "Use tools inside an AI client."],
      ["Build into my app", "SDK", "Call execute() from your backend."],
    ];
    let goal = "";
    const progress = (step) => `<ol class="ap__progress">${["Pick a goal", "Choose how", "Connect & run"].map((x, i) => `<li class="${i < step ? "done" : i === step ? "active" : ""}"><i>${i < step ? "✓" : i + 1}</i>${x}</li>`).join("")}</ol>`;
    const renderGoals = () => {
      body.innerHTML = `${progress(0)}<div class="ap__screen-head"><span>STEP 01</span><h3>What do you want to get done?</h3><p>Pick an outcome. We’ll prepare the right tools.</p></div><div class="ap__goal-grid">${goals.map(([h, t]) => `<button type="button" data-goal="${h}"><strong>${h}</strong><span>${t}</span><i>Choose goal →</i></button>`).join("")}</div>`;
      body.querySelectorAll("[data-goal]").forEach((btn) => btn.addEventListener("click", () => { goal = btn.dataset.goal; renderPaths(); }));
    };
    const renderPaths = () => {
      body.innerHTML = `${progress(1)}<div class="ap__screen-head"><button class="ap__back" type="button">← Goals</button><span>STEP 02</span><h3>How do you want to use this?</h3><p>For <strong>${goal.toLowerCase()}</strong>. You can change paths anytime.</p></div><div class="ap__tool-bundle"><span>PROPOSED TOOLS</span><b>GitHub <i>Connected</i></b><b>Linear <em>Needs auth</em></b><b>Slack <em>Needs auth</em></b></div><div class="ap__path-grid">${paths.map(([h, badge, t], i) => `<button type="button" data-path="${h}" class="${i === 0 ? "recommended" : ""}"><small>${badge}</small><strong>${h}</strong><span>${t}</span><i>Continue →</i></button>`).join("")}</div>`;
      body.querySelector(".ap__back").addEventListener("click", renderGoals);
      body.querySelectorAll("[data-path]").forEach((btn) => btn.addEventListener("click", () => {
        body.innerHTML = `${progress(2)}<div class="ap__success"><span>READY TO RUN</span><strong>${goal}</strong><p>${btn.dataset.path} is prepared with three tools and visible authorization state.</p><button type="button">Open Playground →</button></div>`;
        body.querySelector(".ap__success button").addEventListener("click", renderGoals);
      }));
    };
    renderGoals();
  }

  if (kind === "runtime") {
    hint.textContent = "Run the prompt. Authorization pauses in context, then the same execution resumes.";
    const checks = ["User intent", "Tool selected", "Authorization", "Scope check", "Policy check", "Tool execution", "Result returned", "Audit log saved"];
    body.innerHTML = `
      <div class="ap__play-main">
        <div class="ap__play-head"><span>CHAT</span><small>SANDBOX · ACTING AS SAMBIT</small></div>
        <div class="ap__prompt">Create a Linear issue from the latest failed deployment.</div>
        <div class="ap__response"><span>ARCADE</span><strong>Ready to execute one authorized action.</strong><p data-runtime-copy>The run will show every check between intent and audit log.</p></div>
        <button class="ap__primary" type="button" data-runtime-action>Run safely →</button>
      </div>
      <ol class="ap__trace">${checks.map((x, i) => `<li data-check="${i}"><i>${String(i + 1).padStart(2, "0")}</i><span>${x}</span><b>Waiting</b></li>`).join("")}</ol>`;
    const action = body.querySelector("[data-runtime-action]");
    const copy = body.querySelector("[data-runtime-copy]");
    const rows = [...body.querySelectorAll("[data-check]")];
    let phase = "idle";
    let timers = [];
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const mark = (i, status) => {
      rows[i].className = status;
      rows[i].querySelector("b").textContent = status === "done" ? "Passed" : status === "blocked" ? "Needs auth" : "Running";
    };
    const runRange = (from, to, done) => {
      for (let i = from; i <= to; i++) timers.push(setTimeout(() => {
        if (i > from) mark(i - 1, "done");
        mark(i, "running");
        if (i === to) timers.push(setTimeout(done, 420));
      }, (i - from) * 420));
    };
    action.addEventListener("click", () => {
      if (phase === "idle" || phase === "done") {
        clear(); rows.forEach((r) => { r.className = ""; r.querySelector("b").textContent = "Waiting"; });
        phase = "running"; action.disabled = true; action.textContent = "Checking runtime…";
        copy.textContent = "Arcade is resolving the user, selected tool and required access.";
        runRange(0, 2, () => {
          mark(2, "blocked"); phase = "auth"; action.disabled = false; action.textContent = "Continue to Linear →";
          copy.innerHTML = "Authorization required for <code>issues:create</code>. The model never sees your token.";
        });
      } else if (phase === "auth") {
        phase = "running"; action.disabled = true; action.textContent = "Resuming run…"; mark(2, "done");
        copy.textContent = "Authorized. Resuming from the exact check where the run paused.";
        runRange(3, 7, () => {
          mark(7, "done"); phase = "done"; action.disabled = false; action.textContent = "Run again ↻";
          copy.textContent = "Workflow succeeded. The result and complete audit trace are ready to review.";
        });
      }
    });
  }

  if (kind === "dashboard") {
    hint.textContent = "Switch maturity states. The destination stays stable while its priority changes.";
    const states = ["Empty", "Needs auth", "First run", "Active"];
    shell.querySelector(".ap__bar").insertAdjacentHTML("beforeend", `<div class="ap__toggle ap__toggle--states" role="group" aria-label="Dashboard maturity">${states.map((s, i) => `<button type="button" aria-pressed="${i === 0}" data-state="${i}">${s}</button>`).join("")}</div>`);
    const screens = [
      ["YOUR PROJECT IS READY", "Connect a tool and run your first agent action.", [["01", "Pick tools"], ["02", "Connect auth"], ["03", "Test action"]], "Choose tools →"],
      ["1 STEP BLOCKING YOUR RUN", "Authorize GitHub to run the first action.", [["✓", "Tools selected"], ["02", "GitHub needs auth"], ["03", "First trace waiting"]], "Authorize GitHub →"],
      ["FIRST TRACE SUCCEEDED", "The action ran safely and every check is reviewable.", [["✓", "Authorized"], ["✓", "Execution passed"], ["✓", "Audit log saved"]], "Enable test users →"],
      ["3 AGENTS RUNNING", "Two issues need attention across live operations.", [["99.2%", "Success rate"], ["14.8k", "Tool calls"], ["2", "Blocked users"]], "Review blockers →"],
    ];
    const render = (i) => {
      const [k, h, cards, cta] = screens[i];
      body.innerHTML = `<div class="ap__dash-head"><span>DASHBOARD / ${states[i].toUpperCase()}</span><h3>${h}</h3></div><div class="ap__dash-grid">${cards.map(([v, l], n) => `<div class="${i === 3 && n === 2 ? "warn" : ""}"><strong>${v}</strong><span>${l}</span><i>${i < 3 ? (n < i + 1 ? "Complete" : "Waiting") : n === 2 ? "Review" : "Healthy"}</i></div>`).join("")}</div><button class="ap__primary" type="button">${cta}</button>`;
    };
    render(0);
    shell.querySelectorAll("[data-state]").forEach((btn) => btn.addEventListener("click", () => {
      shell.querySelectorAll("[data-state]").forEach((b) => b.setAttribute("aria-pressed", b === btn));
      render(Number(btn.dataset.state));
    }));
  }
  return shell;
}

function caseViz(kind) {
  const figure = el("figure", `cv cv--${kind}`);
  if (kind === "metrics") {
    const metrics = [
      ["01", "Activation", "Time to first authorized call"],
      ["02", "Completion", "Setup completion by path"],
      ["03", "Understanding", "First trace discovery"],
      ["04", "Retention", "Week 1 repeat tool calls"],
      ["05", "Rollout", "Invited user activation"],
    ];
    figure.innerHTML = `
      <figcaption>Measurement system · leading signals roll up to one product outcome</figcaption>
      <div class="cv__north"><span>NORTH STAR</span><strong>Time to production</strong><small>Safe agent deployment</small></div>
      <div class="cv__metrics">${metrics.map(([n, k, v]) => `<div><i>${n}</i><span>${k}</span><strong>${v}</strong></div>`).join("")}</div>
      <p>These are proposed instrumentation points for a take-home concept, not observed production results.</p>`;
  }
  return figure;
}


// ── Case-study bento board: solid tiles on a dark ground, one idea per tile (kinds: num, stack, bars, donut, dial, list, keys, text, timeline) ──
function bento(v) {
  const board = el("figure", "bento cs__wide");
  if (v.label) board.setAttribute("aria-label", v.label);
  v.tiles.forEach((t, i) => board.appendChild(bentoTile(t, i)));
  new IntersectionObserver(([e], io) => { if (e.isIntersecting) { board.classList.add("in"); io.disconnect(); } }, { threshold: 0.12 }).observe(board);
  return board;
}

function bentoTile(t, i) {
  const tile = el("div", `bt bt--${t.k} bt--${t.tone || "white"} bt--w${t.w || 4}` + (t.h ? ` bt--h${t.h}` : ""));
  tile.style.setProperty("--i", i);
  if (t.label) tile.appendChild(el("span", "bt__label", t.label));

  if (t.k === "num") {
    const v = el("strong", "bt__value", t.value); if (t.unit) v.appendChild(el("small", "", t.unit));
    tile.appendChild(v); if (t.sub) tile.appendChild(el("span", "bt__sub", t.sub));
    if (t.bar != null) { const bar = el("div", "bt__bar"), f = el("i"); f.style.setProperty("--w", `${t.bar}%`); bar.appendChild(f); tile.appendChild(bar); }
  } else if (t.k === "stack") {
    t.rows.forEach(([label, value, sub, tone]) => {
      const r = el("div", `bt__card bt--${tone || "white"}`), top = el("div", "bt__cardtop");
      top.append(el("span", "bt__cardlabel", label), el("strong", "", value)); r.appendChild(top);
      if (sub) r.appendChild(el("span", "bt__sub", sub)); tile.appendChild(r);
    });
  } else if (t.k === "bars") {
    const max = t.max || Math.max(...t.bars.flatMap((b) => b.slice(1).filter((n) => typeof n === "number")));
    const chart = el("div", "bt__chart");
    t.bars.forEach(([label, a, b], k) => {
      const col = el("div", "bt__col"), plot = el("div", "bt__plot");
      const add = (n, cls) => { const bar = el("i", cls); bar.style.setProperty("--h", `${(n / max) * 100}%`); bar.style.setProperty("--k", k); bar.title = String(n); plot.appendChild(bar); };
      if (typeof b === "number") { add(a, "is-before"); add(b, "is-after"); } else { const tr = el("i", "is-track"); plot.appendChild(tr); add(a, "is-after"); }
      col.append(plot, el("span", "bt__axis", label)); chart.appendChild(col);
    });
    tile.appendChild(chart);
    if (t.legend) { const lg = el("div", "bt__legend"); t.legend.forEach((x, k) => { const s = el("span"); s.append(el("i", k ? "is-after" : "is-before"), document.createTextNode(x)); lg.appendChild(s); }); tile.appendChild(lg); }
    if (t.sub) tile.appendChild(el("span", "bt__sub", t.sub));
  } else if (t.k === "donut") {
    const C = 2 * Math.PI * 40, svg = svgEl("svg", { viewBox: "0 0 100 100", "aria-hidden": "true" });
    svg.append(svgEl("circle", { cx: 50, cy: 50, r: 40, class: "trk" }), svgEl("circle", { cx: 50, cy: 50, r: 40, class: "arc", "stroke-dasharray": C, "stroke-dashoffset": C, style: `--to:${C * (1 - t.pct / 100)}`, transform: "rotate(-90 50 50)" }));
    const ring = el("div", "bt__ring"); ring.append(svg, el("strong", "", t.value)); tile.appendChild(ring);
    if (t.sub) tile.appendChild(el("span", "bt__sub", t.sub));
  } else if (t.k === "dial") {
    const dial = el("div", "bt__dial");
    for (let k = 1; k <= t.n; k++) { const n = el("span", k === t.at ? "is-at" : "", String(k)); n.style.setProperty("--a", `${((k - 1) / t.n) * 360}deg`); dial.appendChild(n); }
    const mid = el("div", "bt__dialmid"); mid.append(el("strong", "", t.value), el("span", "", t.center)); dial.appendChild(mid);
    tile.appendChild(dial); if (t.sub) tile.appendChild(el("span", "bt__sub", t.sub));
  } else if (t.k === "list") {
    if (t.title) tile.appendChild(el("b", "bt__title", t.title));
    const ul = el("ul", "bt__list"); ul.setAttribute("role", "list");
    t.rows.forEach(([mark, label, right]) => { const li = el("li"); li.append(el("span", "bt__mark", mark), el("span", "", label), el("span", "bt__right", right || "")); ul.appendChild(li); });
    tile.appendChild(ul);
  } else if (t.k === "keys") {
    const g = el("div", "bt__keys");
    t.keys.forEach(([glyph, cap], k) => { const key = el("div", "bt__key" + (k === t.hi ? " is-hi" : "")); key.append(el("strong", "", glyph), el("span", "", cap)); g.appendChild(key); });
    tile.appendChild(g);
  } else if (t.k === "text") {
    tile.append(el("b", "bt__title", t.title), el("span", "bt__body", t.body));
  } else if (t.k === "timeline") {
    const g = el("div", "bt__time");
    t.phases.forEach(([wk, name, status, span, body], k) => {
      const ph = el("div", "bt__phase" + (status === "Built" ? " is-on" : "")); ph.style.gridColumn = `span ${span}`; ph.style.setProperty("--k", k);
      const top = el("div", "bt__phasetop"); top.append(el("span", "", wk), el("span", "bt__chip", status));
      ph.append(el("i"), top, el("b", "", name), el("span", "bt__body", body)); g.appendChild(ph);
    });
    tile.appendChild(g);
  }
  return tile;
}

// Lightbox: click a screenshot to read it at full size
function openLightbox(src, alt, opener) {
  const lb = el("div", "lb"); lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", alt || "Screenshot");
  const img = el("img"); img.src = src; img.alt = alt || "";
  const close = el("button", "", "Close"); close.type = "button";
  const done = () => { lb.classList.remove("is-open"); document.removeEventListener("keydown", onKey); setTimeout(() => { lb.remove(); opener && opener.focus(); }, 200); };
  const onKey = (e) => { if (e.key === "Escape") done(); };
  lb.addEventListener("click", done); document.addEventListener("keydown", onKey);
  lb.append(img, close); document.body.appendChild(lb);
  requestAnimationFrame(() => { lb.classList.add("is-open"); close.focus(); });
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
    // Only finished pieces go on the board. Interaction studies run live (js/playground.js); every tile opens the overlay.
    const LAB = [
      { code: "INT-07", title: "Market Select", status: "Interaction · Flow", area: "DeFi · Yield", tag: "interaction", demo: "marketSelect", bg: "#2B3150", dark: true, bleed: true, wide: true, ptr: "none",
        scope: "Pick where your money earns. Choose markets or let AI pick, review a split weighted by APR, hold to deposit, and the whole card folds down to a single summary. The more you touch it, the smaller it gets.",
        hint: "Tap markets to toggle them, then Next. Or try Auto Select or the sparkle. On the review step, press and hold to deposit. Tap the summary to start again.", tags: ["Flow", "Motion", "Hold to confirm", "AI"] },
      { code: "INT-02", title: "Segmented Navigation", status: "Interaction", area: "Navigation · Component", tag: "interaction", demo: "segmentedNav", bg: "#000", dark: true, ptr: "hover",
        scope: "Ten links in a compact bar. Ticks magnify under the cursor, and the one you're on opens into a labelled pill.",
        hint: "Move across the bar. Keyboard: Tab through the links.", tags: ["Navigation", "Magnify", "Component"],
        credit: { name: "Till Janek", handle: "tilljanek", url: "https://x.com/tilljanek/status/2105929799613243856" } },
      { code: "INT-03", title: "Bounding Box", status: "Interaction", area: "Canvas · Editor", tag: "interaction", demo: "boundingBox", bg: "#F3F3F3", ptr: "none",
        scope: "A selection box study: zoom out from the corner, drag any handle to resize, and read the size live as you go.",
        hint: "Drag a corner or an edge. Hover a size readout to type an exact value, then press Enter.", tags: ["Canvas", "Resize", "Wireframe"],
        credit: { name: "Azlen", handle: "azlenelza", url: "https://x.com/azlenelza/status/2106600214593462393" } },
      { code: "INT-04", title: "Clouds That Wiggle", status: "Interaction", area: "Logo · Motion", tag: "interaction", demo: "clouds", bg: "#FFFFFF", ptr: "hover",
        scope: "A logo that reacts to touch: hover a cloud and it wobbles like jelly before settling back into shape.",
        hint: "Hover over any cloud.", tags: ["Logo", "Motion", "SVG filter"],
        credit: { name: "Oğuz Yağız Kara", handle: "oguzyagizkara", url: "https://x.com/oguzyagizkara/status/2105694365922541784" } },
      { code: "INT-08", title: "Onboarding Tour", status: "Interaction · Flow", area: "Onboarding · SaaS", tag: "interaction", demo: "onboardingTour", bg: "#EDEDEA", ptr: "none",
        scope: "A welcome card where each feature shows itself. Pick a row and the highlight glides over, the preview changes with a shared-axis move, and the Teams step lifts one collaborator forward.",
        hint: "Click a feature, or use the up and down arrow keys. Start Designing takes you back to the first step.", tags: ["Onboarding", "Shared axis", "Preview"] },
      { code: "INT-09", title: "API Key & Install", status: "Interaction · Component", area: "Developer tools", tag: "interaction", demo: "apiKey", bg: "#FAFBFC", ptr: "none",
        scope: "A developer card with a masked key, package-manager tabs and a code sample. Reveal types the key in, Copy confirms with a check, and the tab underline slides between managers.",
        hint: "Press Reveal, then Copy. Switch between NPM, BUN, YARN and PNPM. Copy the command or the code.", tags: ["Copy", "Tabs", "Code"] },
      { code: "INT-10", title: "Day Timeline", status: "Interaction · Scrubber", area: "Data · Time", tag: "interaction", demo: "timelineScrub", bg: "#121212", dark: true, ptr: "none", wide: true,
        scope: "A scrubber for a day of events. Drag the playhead and the hour under it lights up and the event count follows. Press play to let it run.",
        hint: "Drag anywhere on the timeline, or use the left and right arrow keys. Space plays and pauses.", tags: ["Scrubber", "Drag", "Spring"] },
      { code: "INT-11", title: "Glass Sliders", status: "Interaction · Controls", area: "Image · Settings", tag: "interaction", demo: "glassSliders", bg: "#1A2418", dark: true, bleed: true, ptr: "none",
        scope: "Four frosted controls that edit the photo behind them: Brightness, Contrast, Hue and Saturation. The image changes live as you drag.",
        hint: "Drag the sliders. Double-click a row to reset it. Arrow keys work on every row (Shift for bigger steps).", tags: ["Sliders", "Glass", "Live filter"] },
      { code: "INT-12", title: "Podcast Player", status: "Interaction · Media", area: "Audio · Mobile", tag: "interaction", demo: "podcastPlayer", bg: "#000000", dark: true, ptr: "none",
        scope: "A player whose transcript follows the audio. Segments show who is speaking, the playhead scrubs, and the button changes shape between play and pause.",
        hint: "Play, drag the timeline, tap a line to jump, change speed, or pin a moment from the options button.", tags: ["Media", "Transcript", "Scrub"] },
      { code: "INT-13", title: "Compose Bar", status: "Interaction · Input", area: "Mobile · Writing", tag: "interaction", demo: "composeBars", bg: "#1E1E1E", dark: true, ptr: "none", wide: true,
        scope: "One compose bar in three themes. Type, refine the text, dictate, then send, and the message slides into the feed above.",
        hint: "Type in any phone and press Enter or the arrow. The ring tidies your text, the mic dictates sample words, the bin clears.", tags: ["Input", "Themes", "Dictation"] },
      { code: "INT-15", title: "Empty Sessions", status: "Interaction · Empty state", area: "Dev tools", tag: "interaction", demo: "emptySessions", bg: "#0C0C0C", dark: true, ptr: "none",
        scope: "An empty state with some life in it: the windows fan out on hover, the pixel glyphs drift against the pointer, and clicking the stack shuffles it.",
        hint: "Move the pointer over the card, hover a glyph, and click the stack of windows.", tags: ["Empty state", "Parallax", "Pixel art"] },
      { code: "BRAND-01", title: "Veyra: Hero", status: "Branding · Hero", area: "AI infrastructure", tag: "branding", image: "/assets/images/playground/veyra-hero.jpg", alt: "Veyra launch hero: a dark panel with the headline For ideas beyond the obvious, a pixel-dot butterfly and a Start creating button, set on a collage of mountain photos, code and torn lilac paper.", bg: "#E4DFD2", wide: true,
        scope: "A launch hero for Veyra, AI infrastructure for agents. A dark panel sits on a collage of mountains, code and torn paper, with a pixel-dot butterfly as the mark.", tags: ["Branding", "Hero", "Collage"] },
      { code: "BRAND-02", title: "Veyra: Poster", status: "Branding · Poster", area: "AI infrastructure", tag: "branding", image: "/assets/images/playground/veyra-poster.jpg", alt: "Veyra poster: a torn dark panel with the headline The engine behind your next idea and a lilac line-drawn butterfly, beside a strip of code symbols on mint paper.", bg: "#C9DDD3",
        scope: "A poster for Veyra. The same butterfly redrawn in lilac scanlines on a torn navy sheet, with a strip of code symbols down the edge.", tags: ["Branding", "Poster", "Print"] },
    ];
    setCount(LAB.length);
    const list = document.querySelector("[data-lab]");
    const tiles = LAB.map((it, i) => {
      const li = el("li", "lab__tile");
      li.style.setProperty("--i", i);
      li.dataset.tag = it.tag;
      const top = el("div", "lab__top"); top.append(el("span", "", it.code), el("span", "", it.status));
      const bottom = el("div", "lab__bottom");
      bottom.append(el("h3", "lab__title", it.title), el("p", "lab__area", it.area), el("p", "lab__scope", it.scope));
      li.append(top);
      if (it.demo) {
        // Live interaction: the demo plays a loop in the tile, and is fully interactive in the overlay
        li.classList.add("lab__tile--ix", it.ptr === "hover" ? "lab__tile--hover" : "lab__tile--noptr");
        if (it.dark) li.classList.add("lab__tile--dark");
        if (it.bleed) li.classList.add("lab__tile--bleed");
        li.style.setProperty("--ix-bg", it.bg);
        const stage = el("div", "lab__stage"); li.appendChild(stage);
        window.Playground && window.Playground.DEMOS[it.demo](stage, { auto: true });
      } else if (it.image) {
        // Branding: the artwork itself, contained on a tint taken from it
        li.classList.add("lab__tile--ix", "lab__tile--noptr"); li.style.setProperty("--ix-bg", it.bg);
        const stage = el("div", "lab__stage lab__stage--img"), img = el("img");
        img.src = it.image; img.alt = it.alt || it.title; img.loading = "lazy"; img.decoding = "async"; stage.appendChild(img); li.appendChild(stage);
      } else if (it.thumb) {
        // Contextual thumbnail: the page itself inside a small browser frame, cropped by the tile
        li.classList.add("lab__tile--shot", "grain");
        ["#3C9A98", "#C6E6DF", "#86C6C0"].forEach((c, k) => li.style.setProperty(`--t${k + 1}`, c));
        const shot = el("div", "lab__shot"), bar = el("div", "lab__shotbar"), img = el("img");
        bar.append(el("i"), el("i"), el("i"), el("span", "", "paymanai.com"));
        img.src = it.thumb; img.alt = `Preview of the ${it.title} page`; img.loading = "lazy"; img.decoding = "async";
        shot.append(bar, img); li.appendChild(shot);
        li.addEventListener("pointermove", (e) => {
          const r = li.getBoundingClientRect();
          li.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
          li.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
        });
      }
      if (it.wide) li.classList.add("lab__tile--wide");
      li.append(bottom);
      const open = el("button", "lab__cover"); open.type = "button"; open.setAttribute("aria-label", `Open ${it.title}`);
      li.appendChild(open);
      li.addEventListener("click", (e) => {
        if (e.target.closest("a, input")) return;
        const shown = LAB.filter((_, k) => !tiles[k].hidden);
        window.Playground && window.Playground.openOverlay(shown, shown.indexOf(it), open);
      });
      list.appendChild(li);
      return li;
    });
    wireChips(tiles, () => list.classList.toggle("is-filtered", tiles.some((t) => t.hidden)));
    new IntersectionObserver(([e], io) => { if (e.isIntersecting) { list.classList.add("in"); io.disconnect(); } }, { threshold: 0.05 }).observe(list);
  }

  if (page === "writing") {
    setCount(document.querySelectorAll("[data-posts] .post").length);
  }

  if (page === "case") {
    // ── Case study as a long-form read: breadcrumb → hero → title and meta → sections, beside a sticky contents rail ──
    const n = PROJECTS.length;
    const id = Math.min(n, Math.max(1, parseInt(new URLSearchParams(location.search).get("case") || "1", 10) || 1));
    const p = PROJECTS[id - 1];
    const mount = document.querySelector("[data-cs-root]");
    document.body.dataset.caseId = id;
    document.title = `${p.name}: case study — Sambit Nayak`;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smooth = reduced ? "auto" : "smooth";
    const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const chev = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"/></svg>';

    // ── Blocks ──
    const statsEl = (stats) => { const g = el("div", "cs__stats" + (stats.length < 3 ? " cs__stats--big" : "")); stats.forEach(([v, l]) => { const d = el("div"); d.append(el("strong", "", v), el("span", "", l)); g.appendChild(d); }); return g; };
    // No infographics: tiles, charts and interface mocks are read as plain [title, line] rows, using the case's own words
    const markOf = (m) => (/[A-Za-z0-9]/.test(m) && m.length <= 3 ? m + " " : "");
    const tileRows = (t) => {
      const lab = t.label ? `${t.label}: ` : "";
      switch (t.k) {
        case "text": return [[lab + t.title, t.body]];
        case "num": return [[`${lab}${t.value}${t.unit ? " " + t.unit : ""}`, t.sub || ""]];
        case "donut": return [[`${lab}${t.value}`, t.sub || ""]];
        case "dial": return [[`${lab}${t.value}`, t.center]];
        case "bars": return [[t.label, t.bars.map(([l, a, b]) => (typeof b === "number" ? `${l} ${a}→${b}` : `${l} ${a}`)).join(", ") + (t.sub ? `. ${t.sub}` : "")]];
        case "keys": return [[t.label, t.keys.map(([g, c]) => `${g} ${c}`).join(", ")]];
        case "stack": return [[t.label, t.rows.map(([l, v, s]) => `${l} ${v}${s ? ` (${s})` : ""}`).join("; ")]];
        case "list": return [[t.title ? lab + t.title : t.label, t.rows.map(([m, l, r]) => `${markOf(m)}${l || m}${r ? ` (${r})` : ""}`).join("; ")]];
        case "timeline": return t.phases.map(([wk, name, status, , body]) => [`${wk} · ${name}`, `${status}: ${body}`]);
        default: return [];
      }
    };
    const dashRow = (v) => [`${v.label}: ${v.value}${v.chip ? ` (${v.chip})` : ""}`, [v.rows && v.rows.map(([l, , s]) => `${l} ${s}`).join(" vs "), v.note].filter(Boolean).join(". ")];
    const uiRows = (u) => u.kind === "tour" ? u.items.map(([, h, d]) => [h, d]) : u.kind === "checklist" ? u.steps.map(([h, tm, d]) => [`${h} (${tm})`, d]) : u.kind === "trio" ? u.cards.map((c) => [c.t, c.d]) : u.rows.map((r) => [`${r.tag}: ${r.t}`, r.d]);
    const plainRows = (sec) => [...((sec.bento && sec.bento.tiles) || []).flatMap(tileRows), ...(sec.dash || []).map(dashRow), ...(sec.ui && !sec.steps ? uiRows(sec.ui) : [])];
    const phId = (tag, k) => `C${id}-${tag}-${k + 1}`;
    const placeholder = (cap, ratio, pid, kind = "Image") => {
      const f = el("figure", "stph"); f.style.setProperty("--ar", ratio.replace(":", " / "));
      const frame = el("div", "stph__frame"); frame.append(el("span", "stph__tag", `${kind} · ${ratio}`), el("span", "stph__id", pid));
      f.append(frame, el("figcaption", "", cap)); return f;
    };
    // Explanatory diagrams built in code, for slots that would otherwise hold a placeholder (wording comes from the case itself)
    const diagramEl = (d) => {
      const f = el("figure", "sdia sdia--" + d.kind); f.appendChild(el("p", "study__cap", d.title));
      const node = (label, hi) => el("li", "sdia__node" + (hi ? " is-hi" : ""), label);
      if (d.kind === "flow") {
        const ol = el("ol", "sdia__flow" + (d.nodes.length > 5 ? " is-dense" : "")); ol.setAttribute("role", "list");
        d.nodes.forEach((label, i) => { const li = node(label, i === d.hi); li.dataset.i = pad2(i + 1); ol.appendChild(li); });
        f.appendChild(ol);
      } else if (d.kind === "merge") {
        const wrap = el("div", "sdia__merge"), ul = el("ul", "sdia__in"); ul.setAttribute("role", "list");
        d.inputs.forEach((label) => ul.appendChild(node(label)));
        const out = el("ul", "sdia__out"); out.setAttribute("role", "list"); out.appendChild(node(d.output, true));
        wrap.append(ul, el("span", "sdia__arrow", "→"), out); f.appendChild(wrap);
      } else if (d.kind === "slider") {
        const box = el("div", "sdia__ba" + (d.narrow ? " is-narrow" : "")); box.style.setProperty("--ar", d.ar || "16 / 10"); box.style.setProperty("--x", "50%");
        const mk = (src, alt, cls) => { const i = el("img", cls); i.src = src; i.alt = alt || ""; i.decoding = "async"; i.draggable = false; return i; };
        const knob = el("button", "sdia__knob"); knob.type = "button"; knob.setAttribute("role", "slider"); knob.setAttribute("aria-label", "Compare before and after"); knob.setAttribute("aria-valuemin", "0"); knob.setAttribute("aria-valuemax", "100"); knob.setAttribute("aria-valuenow", "50"); knob.setAttribute("aria-valuetext", "50% after");
        knob.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 7 4 12l5 5M15 7l5 5-5 5"/></svg>';
        box.append(mk(d.before, d.altBefore, "sdia__img"), mk(d.after, d.altAfter, "sdia__img sdia__img--after"), el("span", "sdia__tag sdia__tag--b", "Before"), el("span", "sdia__tag sdia__tag--a", "After"), knob);
        const set = (pct) => { pct = Math.max(0, Math.min(100, pct)); box.style.setProperty("--x", pct + "%"); knob.setAttribute("aria-valuenow", Math.round(pct)); knob.setAttribute("aria-valuetext", Math.round(pct) + "% before"); };
        const at = (e) => { const r = box.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); };
        box.addEventListener("pointerdown", (e) => {
          if (e.button > 0) return; try { box.setPointerCapture(e.pointerId); } catch {} box.classList.add("is-drag"); at(e);
          const mv = (ev) => at(ev), up = () => { box.classList.remove("is-drag"); box.removeEventListener("pointermove", mv); box.removeEventListener("pointerup", up); box.removeEventListener("pointercancel", up); };
          box.addEventListener("pointermove", mv); box.addEventListener("pointerup", up); box.addEventListener("pointercancel", up);
        });
        knob.addEventListener("keydown", (e) => { const cur = parseFloat(getComputedStyle(box).getPropertyValue("--x")) || 50, s = e.shiftKey ? 20 : 5; if (e.key === "ArrowLeft") { e.preventDefault(); set(cur - s); } else if (e.key === "ArrowRight") { e.preventDefault(); set(cur + s); } else if (e.key === "Home") { e.preventDefault(); set(0); } else if (e.key === "End") { e.preventDefault(); set(100); } });
        if (!reduced) { set(96); const io2 = new IntersectionObserver(([en], o) => { if (!en.isIntersecting) return; o.disconnect(); const t0 = performance.now(); const step = (now) => { const u = Math.min(1, (now - t0) / 1100), ease = 1 - Math.pow(1 - u, 3); if (!box.classList.contains("is-drag")) set(96 + (50 - 96) * ease); if (u < 1 && !box.classList.contains("is-drag")) requestAnimationFrame(step); }; requestAnimationFrame(step); }, { threshold: 0.5 }); io2.observe(box); }
        f.appendChild(box);
      } else if (d.kind === "swatches") {
        const row = el("ul", "sdia__sw"); row.setAttribute("role", "list");
        d.chips.forEach(([hex, name, role]) => { const li = el("li"), sq = el("i"); sq.style.background = hex; li.append(sq, el("b", "", name), el("small", "", `${hex} · ${role}`)); row.appendChild(li); });
        f.appendChild(row);
      } else if (d.kind === "specimen") {
        const col = el("div", "sdia__sp");
        d.lines.forEach(([label, fam, size, text], i) => { const r = el("div"), s = el("p", "sdia__spt" + (i === 2 ? " is-mono" : ""), text); s.style.fontFamily = fam; s.style.fontSize = size + "px"; r.append(el("small", "", label), s); col.appendChild(r); });
        f.appendChild(col);
      } else if (d.kind === "audit") {
        const ul = el("ol", "sdia__au"); ul.setAttribute("role", "list");
        const head = el("li", "sdia__auh"); head.append(el("span", "", "What I found"), el("span", "", "What I did")); ul.appendChild(head);
        d.rows.forEach(([a, b], i) => { const li = el("li"); li.append(el("span", "", a), el("span", "", b)); li.firstChild.dataset.n = String(i + 1).padStart(2, "0"); ul.appendChild(li); });
        f.appendChild(ul);
      } else {
        const g = el("div", "sdia__vs");
        d.cards.forEach((c) => {
          const card = el("div", "sdia__card" + (c.hi ? " is-hi" : "")), top = el("div", "sdia__top");
          top.appendChild(el("span", "sdia__tag", c.tag)); if (c.status) top.appendChild(el("span", "sdia__status", c.status));
          card.append(top, el("h4", "", c.title), el("p", "", c.body)); g.appendChild(card);
        });
        f.appendChild(g);
      }
      if (d.note) f.appendChild(el("p", "sdia__note", d.note));
      return f;
    };
    const studyMediaGrid = (items, layout) => {
      const n = items.length;
      const cls = ["study__media"];
      if (n < 2 && layout !== "stack") return cls.join(" ");
      cls.push("is-wide");
      const mode = layout || (n === 3 ? "hero-trio" : n === 4 ? "quad" : "duo");
      if (mode === "stack") cls.push("study__media--stack");
      else if (mode === "hero-trio") cls.push("study__media--hero-trio");
      else if (mode === "quad") cls.push("study__media--quad");
      else cls.push("study__media--duo");
      return cls.join(" ");
    };
    const mediaEl = (m, tag, k) => {
      if (m.diagram) return diagramEl(m.diagram);
      if (typeof m === "string" || m.ph) return placeholder(typeof m === "string" ? m : m.ph, (typeof m === "object" && m.ratio) || "16:10", phId(tag, k));
      if (m.video) {
        const f = el("figure", "shot shot--video"), tile = el("div", "shot__tile"), v = el("video");
        v.muted = true; v.loop = true; v.playsInline = true; v.preload = "none"; v.poster = m.poster || ""; v.setAttribute("aria-label", m.alt || m.cap || "Video");
        const src = el("source"); src.src = m.video; src.type = "video/mp4"; v.appendChild(src);
        if (reduced) v.controls = true;
        else new IntersectionObserver(([e]) => { e.isIntersecting && !document.hidden ? v.play().catch(() => {}) : v.pause(); }, { threshold: 0.45 }).observe(v);
        tile.appendChild(v); f.appendChild(tile); if (m.cap) f.appendChild(el("figcaption", "", m.cap)); return f;
      }
      const f = el("figure", "shot" + (m.wide ? " shot--wide" : "")), tile = el("button", "shot__tile"), img = el("img");
      tile.type = "button"; tile.setAttribute("aria-label", `Enlarge: ${m.cap || m.alt}`);
      img.alt = m.alt || m.cap || ""; img.loading = "lazy"; img.decoding = "async";
      img.addEventListener("load", () => img.classList.add("is-loaded")); img.src = m.src;
      if (img.complete) img.classList.add("is-loaded");
      tile.addEventListener("click", () => openLightbox(m.src, img.alt, tile));
      tile.appendChild(img); f.appendChild(tile);
      if (m.cap) f.appendChild(el("figcaption", "", m.cap));
      return f;
    };
    // Three-up items: a short title over a muted line, with an optional mono index
    const trio = (items, numbered) => {
      const two = items.length === 2 || items.length === 4, left = items.length % 3;
      const g = el("ul", "study__trio" + (two ? " study__trio--2" : left === 1 ? " study__trio--r1" : left === 2 ? " study__trio--r2" : "")); g.setAttribute("role", "list");
      items.forEach(([t, d], k) => { const li = el("li"); if (numbered) li.appendChild(el("span", "study__n", pad2(k + 1))); li.appendChild(el("h4", "", t)); if (d) li.appendChild(el("p", "", d)); g.appendChild(li); });
      return g;
    };
    const statementOf = (sec) => { const s = sec.statement || sec.title, k = s.indexOf(": "); const t = k > -1 && k < 48 ? s.slice(k + 2) : s; return t.charAt(0).toUpperCase() + t.slice(1); };
    const secs = p.cs.sections.map((sec, i) => ({ sec, i, id: slug(sec.title) || `section-${i + 1}` }));

    // Placeholders take the project's colour, not grey
    mount.style.setProperty("--ph-bg", p.photo ? `url("${p.photo.src}") ${p.photo.pos} / cover` : `radial-gradient(70% 90% at 18% 12%, ${p.tint[0]}, transparent 70%), radial-gradient(80% 80% at 88% 92%, ${p.tint[1]}, transparent 72%), ${p.tint[2]}`);
    const main = el("div", "study__main");

    // ── Breadcrumb ──
    const crumb = el("p", "study__crumb is-wide"), back = el("a"); back.href = "/#work";
    back.innerHTML = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8H3m4-4L3 8l4 4" stroke="currentColor" stroke-width="1.5"/></svg>Work';
    crumb.append(back, el("span", "study__sep", "/"), el("span", "", p.name));

    // ── Hero: the product video, or the project name on its tint ──
    const hero = el("div", "study__hero is-wide");
    if (p.thumb) {
      const v = el("video"); v.muted = true; v.loop = true; v.playsInline = true; v.preload = "metadata"; v.poster = p.thumb.poster; v.setAttribute("aria-label", p.thumb.alt);
      const src = el("source"); src.src = p.thumb.video; src.type = "video/mp4"; v.appendChild(src);
      if (reduced) v.controls = true;
      else new IntersectionObserver(([e]) => { e.isIntersecting && !document.hidden ? v.play().catch(() => {}) : v.pause(); }, { threshold: 0.3 }).observe(v);
      hero.appendChild(v);
    } else {
      hero.classList.add("study__hero--tint");
      p.tint.forEach((c, k) => hero.style.setProperty(`--g${k + 1}`, c));
      if (p.photo) { hero.classList.add("study__hero--photo"); hero.style.background = `url("${p.photo.src}") ${p.photo.pos} / cover`; }
      hero.appendChild(el("span", "study__heroname", p.name));
    }

    // ── Title and meta ──
    const head = el("header", "study__head");
    const h1 = el("h1", "", p.title); h1.id = "cs-title";
    const meta = el("dl", "study__meta");
    p.cs.meta.forEach(([k, v]) => { const d = el("div"); d.append(el("dt", "", k), el("dd", "", v)); meta.appendChild(d); });
    head.append(el("p", "study__eyebrow", `Case study ( ${pad2(id)} ) · ${p.org}`), h1, el("p", "study__lead", p.desc), meta);
    main.append(crumb, hero, head);

    // ── Sections ──
    secs.forEach(({ sec, i, id: sid }) => {
      main.appendChild(el("hr", "study__hr"));
      const s = el("section", "study__sec"); s.id = sid; s.setAttribute("aria-labelledby", `${sid}-t`);
      const h = el("h2", "study__t", statementOf(sec)); h.id = `${sid}-t`;
      s.append(el("p", "study__k", sec.title), h);
      (sec.text || []).forEach((t) => s.appendChild(el("p", "study__p", t)));

      if (sec.stats) s.appendChild(statsEl(sec.stats));
      const rows = plainRows(sec); if (rows.length) s.appendChild(trio(rows));
      if (sec.viz) s.appendChild(caseViz(sec.viz));
      if (sec.prototype) { const ap = arcadePrototype(sec.prototype); ap.classList.add("is-wide"); s.appendChild(ap); }
      if (sec.media && sec.media.length) {
        const g = el("div", studyMediaGrid(sec.media, sec.mediaLayout));
        sec.media.forEach((m, mk) => g.appendChild(mediaEl(m, sec.ph || pad2(i + 1), mk))); s.appendChild(g);
      }
      if (sec.steps) { s.appendChild(el("h3", "study__sub", sec.stepsTitle || "How it works")); s.appendChild(trio(sec.steps, true)); }
      (sec.trades || []).forEach((t) => {
        s.appendChild(el("h3", "study__sub", `${t.n}: ${t.t}`));
        const rich = !!(t.media || t.find);   // decisions with a real screen read top to bottom: screen, trade-off, evidence
        const gridOf = () => { if (!t.media) return; const g = el("div", studyMediaGrid(t.media, t.mediaLayout)); t.media.forEach((m, mk) => g.appendChild(mediaEl(m, t.n, mk))); s.appendChild(g); };
        if (rich) gridOf();
        const rows = trio(t.rows); if (rich) rows.classList.add("study__trio--facts"); s.appendChild(rows);
        if (!rich) gridOf();
        if (t.find) {
          const f = el("div", "study__find");
          t.find.forEach(([k, v]) => { const d = el("div"); d.append(el("span", "study__findk", k), el("p", "", v)); f.appendChild(d); });
          s.appendChild(f);
        }
        if (t.note) s.appendChild(el("p", "study__p study__note", t.note));
      });
      if (sec.cards) s.appendChild(trio(sec.cards));
      if (sec.quote) {
        const q = el("blockquote", "study__quote"); q.append(el("p", "", `“${sec.quote}”`), el("footer", "", sec.quoteBy || "Power user interview"));
        s.appendChild(q);
      }
      if (sec.cta) { const a = el("a", "study__btn"); a.href = sec.cta.href; a.target = "_blank"; a.rel = "noopener"; a.innerHTML = chev; a.prepend(sec.cta.label); s.appendChild(a); }
      main.appendChild(s);
    });

    // ── Previous and next ──
    main.appendChild(el("hr", "study__hr"));
    const pn = el("nav", "study__pn"); pn.setAttribute("aria-label", "More case studies");
    [[(id - 2 + n) % n, "Previous"], [id % n, "Next"]].forEach(([q, l]) => {
      const a = el("a"); a.href = PROJECTS[q].href;
      a.append(el("span", "study__k", `${l} case study`), el("b", "", PROJECTS[q].name), el("span", "", `${PROJECTS[q].metric.value} ${PROJECTS[q].metric.label}`));
      pn.appendChild(a);
    });
    main.appendChild(pn);

    // ── Contents rail: section links, the current one marked ──
    const toc = el("nav", "study__toc"); toc.setAttribute("aria-label", "Contents");
    const ol = el("ol"); ol.setAttribute("role", "list");
    const links = secs.map(({ sec, id: sid }) => {
      const li = el("li"), a = el("a", "", sec.title); a.href = `#${sid}`;
      a.addEventListener("click", (e) => { e.preventDefault(); document.getElementById(sid).scrollIntoView({ behavior: smooth, block: "start" }); history.replaceState(null, "", `#${sid}`); });
      li.appendChild(a); ol.appendChild(li); return a;
    });
    const book = el("a", "study__book"); book.href = BOOK_A_CALL; book.target = "_blank"; book.rel = "noopener"; book.innerHTML = chev; book.prepend("Book a call");
    toc.append(ol, book);
    const mark = (k) => links.forEach((a, j) => (j === k ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
    mark(0);
    const visible = new Set();
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      const first = secs.findIndex(({ id: sid }) => [...visible].some((v) => v.id === sid));
      if (first > -1) mark(first);
    }, { rootMargin: "-20% 0px -70% 0px" });
    main.querySelectorAll(".study__sec").forEach((s) => spy.observe(s));

    mount.append(toc, main);
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) requestAnimationFrame(() => t.scrollIntoView({ block: "start" })); }
  }
})();
