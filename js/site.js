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
      meta: [["Role", "Product Designer (Apprentice)"], ["Timeline", "Aug 2025 – Apr 2026"], ["Skills", "Conversational UX, RAG workflows, power-user research, dashboard design"], ["Team", "Team of five with the Salesforce Trailhead product team"], ["Credit", "Team project with Cyril Stephen"]],
      sections: [
        { title: "Overview", statement: "Overview: built for the climb, and it loses experts at the top.",
          text: ["Trailhead is Salesforce's free online learning platform, taking millions of professionals from beginner to certified expert. It was built for the climb, and it loses the experts the moment they reach the top.",
            "Our team of five partnered with the Salesforce Trailhead product team to research, design, and build for the platform's most experienced users: the power users who built their careers on Trailhead and then quietly stopped coming back.",
            "This is a team project. The research, findings, prototype and media here are shared work with my teammate Cyril Stephen."],
          bento: { label: "Summary", tiles: [
            { k: "text", tone: "dark", w: 4, label: "Problem", title: "Experts took their questions elsewhere.", body: "Salesforce's most experienced users were taking their questions to ChatGPT and Slack instead of Trailhead's own community, and between milestones, nothing gave them a reason to come back." },
            { k: "text", tone: "soft", w: 4, label: "Solution", title: "Answers, plus prompts.", body: "Plain-language answers to real Salesforce problems inside Trailhead, paired with proactive prompts that surface what's relevant next without being asked." },
            { k: "num", tone: "ac", w: 4, label: "Outcome", value: "6/8", sub: "Given the same Salesforce question, 6 of 8 power users preferred Solve over ChatGPT.", bar: 75 }] },
          media: [{ video: "/assets/images/trailhead/video-trailhead-promo-web.mp4", poster: "/assets/images/trailhead/video-trailhead-promo-web-poster.webp", alt: "Promo video for the Trailhead Solve project", cap: "Project promo" }] },

        { title: "Problem", statement: "Problem: power users were quietly drifting.",
          text: ["Salesforce's most valuable power users were disengaging, and for a company built on community and advocacy, that is an expensive thing to lose.",
            "Salesforce's ecosystem runs on its community: experienced users who answer questions, mentor newcomers, and champion the platform. Those power users were the engine of it, and they were showing up less and contributing less.",
            "They weren't unhappy users churning, they were quietly drifting. So the problem we set out to solve was re-engagement, not retention: winning back the attention of the platform's most valuable advocates."] },

        { title: "Research", statement: "Research: opinion gave warmth. Behavior gave the pattern.",
          text: ["Research operations, led by Cyril Stephen, reached 650+ Salesforce professionals across the US, India, Canada, Europe, and the Middle East, qualified 72 as power users, and interviewed 12 across two rounds.",
            "Round one focused on opinion: how people felt about Trailhead and what would make it more inspiring. It gave us warm, agreeable answers and no real direction.",
            "Round two focused on behavior: what people actually do, where they drop off, whether they use the community and why not, whether certifications even matter to their goals. That is where the real pattern surfaced."],
          bento: { label: "Research reach", tiles: [
            { k: "num", tone: "ac", w: 4, label: "Reached", value: "650+", sub: "Salesforce professionals across the US, India, Canada, Europe and the Middle East." },
            { k: "num", tone: "dark", w: 4, label: "Qualified", value: "72", sub: "Power users." },
            { k: "num", tone: "light", w: 4, label: "Interviewed", value: "12", sub: "Across two rounds." },
            { k: "list", tone: "graphite", w: 12, label: "Two rounds", rows: [["R1", "Opinion: how people felt about Trailhead", "Warm, no direction"], ["R2", "Behavior: what people actually do", "The real pattern"]] }] } },

        { title: "Findings", statement: "Findings: engagement dropped where the certification path ended.",
          text: ["Power users dropped off right after milestones like certification. And between those moments, they took their questions to ChatGPT and YouTube for a faster answer, despite a community on the platform built for exactly those questions.", "Engagement drops off exactly where the certification path ends."],
          bento: { label: "Findings", tiles: [
            { k: "bars", tone: "white", w: 6, h: 2, label: "Share of power users", max: 100, bars: [["Post-milestone", 64], ["Workarounds", 45], ["Too shallow", 45], ["Personalization", 36]], sub: "Percent of interviewed power users." },
            { k: "num", tone: "ac", w: 3, label: "Post-milestone", value: "64%", unit: "", sub: "Disengaged after major milestones like certifications" },
            { k: "num", tone: "dark", w: 3, label: "Workarounds", value: "45%", sub: "Supplemented Trailhead with ChatGPT, YouTube, and Slack" },
            { k: "num", tone: "light", w: 3, label: "Depth", value: "45%", sub: "Found the content too shallow for their experience" },
            { k: "num", tone: "mid", w: 3, label: "Personalization", value: "36%", sub: "Were unhappy with the existing personalization" }] },
          media: [{ src: "/assets/images/trailhead/case-study-trailhead-5.webp", alt: "Graph comparing Trailhead engagement against the learner journey from certification to real-world problem solving.", cap: "Engagement against the learner journey, from certification to real-world problem solving" }] },

        { title: "Ideation", statement: "Ideation: two ideas, built to be killed.",
          text: ["Of everything we explored, two ideas stood out, so we skipped wireframes and vibe-coded them into working proofs of concept.",
            "We explored a wide range of directions for bringing power users back: community engagement, status, skill visibility. The two strongest earned a quick build, enough to try each idea for ourselves. Neither held up, and killing them shaped the two features we shipped."] },

        { title: "Exploration 1", statement: "Exploration 1: an AI version of themselves. Killed.",
          text: ["We almost gave power users an AI version of themselves to run their community presence. We killed it to protect Trailhead's trust.",
            "The idea was status plus leverage: power users become group leaders, and an AI trained on their posts answers community questions on their behalf.",
            "We took it down two paths, and both broke. Underneath all of it, our research was clear that these users didn't want to engage with the community anyway."],
          bento: { label: "Why it broke", tiles: [
            { k: "text", tone: "dark", w: 4, label: "Path 1", title: "Fully automated.", body: "Undisclosed AI speaking as a real person damages trust." },
            { k: "text", tone: "graphite", w: 4, label: "Path 2", title: "Disclosed or approve-first.", body: "Clashed with Trailhead's warm, human brand and real anti-AI anxiety. The approval version stopped saving anyone time, the entire point." },
            { k: "text", tone: "soft", w: 4, label: "Underneath", title: "They didn't want to.", body: "Our research was clear these users didn't want to engage with the community anyway." }] } },

        { title: "Exploration 2", statement: "Exploration 2: a public skill profile. Killed.",
          text: ["We designed a public skill profile meant to pressure power users into staying current, then killed it because it only worked if employers bought in.",
            "The idea borrowed from GitHub's contribution graph. Make someone's skill currency public, and the visibility itself pressures them to keep it up. A shareable Trailhead profile would show certifications, badges, and skill levels tied to how current your learning is, replacing the scattered cert posts people drop on LinkedIn. Keep it public, and people come back to keep it current."],
          bento: { label: "Why it was killed", tiles: [
            { k: "text", tone: "dark", w: 6, label: "Reason 1", title: "Adoption was out of our hands.", body: "It only works if the outside world treats the profile as a credential." },
            { k: "text", tone: "soft", w: 6, label: "Reason 2", title: "Engagement for its own sake.", body: "Even if it caught on, it would drive engagement for the sake of engagement, not a meaningful, lasting reason to return." }] },
          media: [{ src: "/assets/images/trailhead/case-study-trailhead-7.webp", alt: "Public skill profile concept UI showing certifications, badges and skill currency.", cap: "The shareable Trailhead profile showing certifications, badges, and skill currency, the idea we killed.", narrow: true }] },

        { title: "The bet", statement: "The bet: Salesforce's own data beats any general AI.",
          text: ["We bet that plain-language answers drawn from Salesforce's own data would beat any general AI tool, and shipped two connected experiences to prove it.",
            "ChatGPT runs on public data. Slack answers depend on whoever happens to reply. We bet Salesforce's proprietary knowledge could beat both. Access to that data, and to Agentforce, was never on the table, so we built on OpenAI with curated Salesforce documentation and focused on proving the experience.",
            "That bet became two features: Solve catches power users at the moment they would otherwise open ChatGPT, and a proactive system that resurfaces what's relevant next so returning is worth it. Neither works alone."],
          bento: { label: "Two connected features", tiles: [
            { k: "text", tone: "ac", w: 6, label: "01 · Solve", title: "Catch the ChatGPT moment.", body: "Plain-language answers to real Salesforce problems, grounded in curated documentation." },
            { k: "text", tone: "dark", w: 6, label: "02 · Proactive prompts", title: "Make returning worth it.", body: "Resurface what's relevant next, without being asked." }] } },

        { title: "Solve", statement: "Solution 01 · Solve: a plain-language answer, calibrated to you.",
          text: ["Solve answers a real Salesforce problem in plain language, on the spot, calibrated to your expertise and backed by sources you can check.",
            "That last point mattered to us. We designed for the moment the AI can't help, not just the moment it can."],
          steps: [["Ask in plain language", "Ask a problem in plain language and get a specific, actionable answer that cites Salesforce documentation."], ["Set the depth", "Choose Beginner, Intermediate, or Advanced, so you are never over-explained or underserved."], ["Never a dead end", "When Solve can't fully help, it drafts a ready-to-post Trailblazer Community question from your conversation, so you get an answer either way."]],
          media: [{ video: "/assets/images/trailhead/video-trailhead-chatbot.mp4", poster: "/assets/images/trailhead/video-trailhead-chatbot-poster.webp", alt: "Solve answering a Salesforce question in plain language", cap: "Solve answering" }] },

        { title: "Proactive prompts", statement: "Solution 02 · Proactive prompts: the platform does the noticing.",
          text: ["Without being asked, the system surfaces what's relevant to each expert: skill gaps against the market, follow-ups from their questions, and renewals before they lapse.",
            "None of this waits for a request. The platform does the noticing and brings the next step to the user."],
          steps: [["Renewals", "Before a certification lapses, it flags the renewal on its own, closing a notification gap users complained about."], ["Skill gaps", "Unprompted, it measures a user's skill profile against what the market is hiring for and builds a path to close the gap it finds."], ["Follow-ups", "It reads the questions they asked Solve and recommends what to learn next, so the follow-up finds them."]],
          media: [{ src: "/assets/images/trailhead/case-study-trailhead-4.webp", alt: "Personalised dashboard full view showing trending skills and personalized trail recommendations.", cap: "Dashboard full view: trending skills and personalized trail recommendations", narrow: true }] },

        { title: "The build", statement: "The build: from Figma to a working app, with no handoff.",
          text: ["Figma MCP took each component straight into Cursor and Claude Code, where we wired it to the OpenAI API and shipped Solve as a working app, not a mockup.",
            "After designing each component in Figma against Trailhead's design system, we built it one piece at a time, no handoff, no rebuild from a spec. Taking a concept from design to working software ourselves is what let us test it like a real product instead of a slideshow."],
          bento: { label: "The stack", tiles: [
            { k: "list", tone: "dark", w: 6, label: "What was running", rows: [["01", "React front end"], ["02", "Express and SQLite back end"], ["03", "OpenAI for responses"], ["04", "Voice input"], ["05", "Expertise calibration"], ["06", "Community-post drafting"]] },
            { k: "list", tone: "soft", w: 6, label: "Design to software", rows: [["1", "Design in Figma", "Trailhead design system"], ["2", "Figma MCP", "Component to code"], ["3", "Cursor, Claude Code", "Wired to OpenAI"], ["✓", "Shipped as a working app", "Not a mockup"]] }] } },

        { title: "Agentic testing", statement: "Agentic testing: 12 AI agents before real users.",
          text: ["Real power users were hard to get hold of, so we built 12 AI agents from our research data to catch the obvious problems before spending anyone's real time.",
            "We turned our research into 12 AI agents and ran them through the flows to surface usability problems first. By the time real users arrived, the rough edges were already smoothed, and their time went to what actually needed a person."],
          bento: { label: "Agentic testing", tiles: [
            { k: "num", tone: "ac", w: 4, label: "Built from our research", value: "12", unit: "agents", sub: "Run through the flows to surface usability problems first." },
            { k: "text", tone: "dark", w: 8, label: "Why", title: "Real users' time went to what needed a person.", body: "By the time real power users arrived, the rough edges were already smoothed." }] } },

        { title: "Impact", statement: "Impact: 6 of 8 power users preferred Solve.",
          text: ["Part I. We tested whether Solve could replace the reflex to open ChatGPT. Given the same Salesforce question, 6 of 8 power users preferred Solve. Each participant took a question about the Salesforce product they work with, asked it to both ChatGPT and Solve, and compared.",
            "Part II. The prototype pulled power users back into the content, lifting session duration 35% and cutting drop-off 22%. This was the half of the problem we most needed to prove: that experts who used to leave after a milestone would stay."],
          bento: { label: "Impact", tiles: [
            { k: "num", tone: "ac", w: 4, label: "Preferred Solve over ChatGPT", value: "6/8", sub: "Same Salesforce question, side by side.", bar: 75 },
            { k: "donut", tone: "light", w: 4, label: "Confidence in Solve's answers", value: "4.5/5", pct: 90 },
            { k: "num", tone: "dark", w: 4, label: "Session duration", value: "+35%", sub: "Power users stayed in the content." },
            { k: "num", tone: "graphite", w: 4, label: "Drop-off after milestones", value: "−22%", sub: "Experts who used to leave after a milestone stayed." },
            { k: "text", tone: "soft", w: 8, label: "Why it matters", title: "The half of the problem we most needed to prove.", body: "Experts who used to leave after a milestone would stay, and the prototype showed it." }] } },

        { title: "Learning", statement: "Learning: designing around code, then shipping it.",
          text: ["Using AI coding agents to build and ship a working product turned a limitation into something a designer can now do. This project left no room to design around code."],
          quote: "I had never been comfortable in code, and had never prototyped with it, so teaching myself to ship this as working software is the barrier I'm proudest of clearing.", quoteBy: "Cyril Stephen, teammate on this project" },
      ],
    },
  },
  {
    name: "CotonAI Modes", org: "CotonAI", area: "Agentic AI · Fashion", tags: ["AI Agents", "UX Design"],
    title: "Designing structured, mode-based UX in an AI platform for fashion teams.",
    desc: "End-to-end design of Modes at CotonAI: replacing prompt-heavy AI with structured entry points mapped to real fashion workflows.",
    metric: { value: "125%", label: "Feature adoption lift" }, href: "/case-study?case=2", tint: ["#9CB09E", "#E3EAE0", "#C9D5C8"],
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
  {
    name: "AI Studio", org: "AI Studio", area: "Creative tools", tags: ["0→1 Product", "AI Design"],
    title: "Reduced lead time by 3 months and accelerated end-to-end workflow with AI Studio.",
    desc: "A 0→1 AI design product for creative tools. This case study is password protected.",
    metric: { value: "3×", label: "Faster workflow" }, href: "/case-study?case=3", tint: ["#A9AE7F", "#DADBC4", "#C7CBAF"],
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
    name: "Arcade Control Plane", org: "Arcade.dev", area: "Take-home · Agent infrastructure", tags: ["Dev tools", "AI Agents"],
    title: "Turning Arcade from an infrastructure inventory into an agent deployment control plane.",
    desc: "A take-home redesign of Arcade.dev. I chose the problem, set the north star, scoped the build and shipped a working prototype of the path to a first authorized tool call.",
    metric: { value: "1", label: "North star: first authorized tool call" }, thumb: { video: "/assets/images/arcade/video-arcade-promo.mp4", poster: "/assets/images/arcade/video-arcade-promo-poster.webp", alt: "Arcade prototype video: picking a goal, running a task in the Playground and authorizing Linear mid-run", navPoster: "/assets/images/arcade/video-arcade-auth-poster.webp" }, href: "/case-study?case=4", tint: ["#F6A6CF", "#FFDDEE", "#FFF7FB"], accent: "#F0299B",
    cs: {
      meta: [["Role", "Product Designer, end to end"], ["Format", "Take-home challenge, solo"], ["Skills", "Product strategy, IA, onboarding, AI UX, prototyping"], ["Tools", "Figma, shadcn/ui, Cursor + Figma MCP, ChatGPT"]],
      sections: [
        { title: "Context", statement: "Context: Arcade wins when the first tool call works.",
          text: ["Arcade is the auth and tool-calling layer for AI agents. No PM, no spec: I owned the problem, the scope and how to measure it."],
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
          media: [{ src: "/assets/images/arcade/nav-old-new.jpg", alt: "Old Arcade sidebar with 18 ungrouped destinations next to the new sidebar grouped into Build, Roll out and Observe.", cap: "Old sidebar (left), redesign (right)", narrow: true }] },

        { title: "Onboarding", statement: "Onboarding: intent before infrastructure.",
          text: ["Ask what they want done, recommend the fastest path, keep expert paths one click away."],
          bento: { label: "Path to a first call", tiles: [
            { k: "list", tone: "graphite", w: 6, label: "Before", rows: [["1", "Land on a resource dashboard"], ["2", "Pick code, gateway or sandbox"], ["3", "Assemble docs, config, OAuth"], ["?", "Hope the first call works"]] },
            { k: "list", tone: "soft", w: 6, label: "After", rows: [["1", "Pick an outcome", "5 goals"], ["2", "Choose a path", "1 recommended"], ["3", "Connect & run", "Inline auth"], ["✓", "Trace, then Project Home"]] },
            { k: "keys", tone: "dark", w: 4, label: "Three paths", hi: 0, keys: [["▶", "Playground"], ["⇄", "MCP gateway"], ["</>", "SDK"], ["↗", "Explore first"]] },
            { k: "num", tone: "light", w: 4, label: "Expert wizards", value: "8", unit: "steps", sub: "Gateway and SDK each, with live status beside every step." },
            { k: "text", tone: "ac", w: 4, label: "Default", title: "Sandbox first.", body: "“Sandbox runs are safe to test. You can promote to production later.”" }] },
          media: [{ src: "/assets/images/arcade/onboarding-goal.jpg", alt: "Onboarding step one: What do you want to get done? with five outcome cards.", cap: "Step 1: pick an outcome" }, { src: "/assets/images/arcade/onboarding-path.jpg", alt: "Onboarding step two: choose Playground, MCP gateway or SDK, with the proposed tool bundle and its auth status.", cap: "Step 2: choose how to use it" }] },

        { title: "Playground", statement: "Playground: a runtime simulator, not a chat box.",
          text: ["Every run shows the same eight checks. When a tool needs access, the run pauses and asks in place."],
          bento: { label: "Execution visibility", tiles: [
            { k: "dial", tone: "graphite", w: 4, h: 2, label: "Checks per run", n: 8, at: 3, value: "8", center: "Paused at 3" },
            { k: "list", tone: "dark", w: 4, h: 2, label: "The trace", title: "Paused for one scope: issues:create.", rows: [["✓", "User intent"], ["✓", "Tool selected"], ["●", "Authorization", "Now"], ["○", "Scope check"], ["○", "Policy check"], ["○", "Tool execution"], ["○", "Result returned"], ["○", "Audit log saved"]] },
            { k: "num", tone: "ac", w: 4, label: "To authorize", value: "1", unit: "click", sub: "“Continue to Linear”, inside the run." },
            { k: "stack", tone: "mid", w: 4, label: "In the Playground", rows: [["Modes", "2", "Chat · Execute", "white"], ["Tools ready", "64", "Across 20+ apps", "light"]] }] },
          media: [{ src: "/assets/images/arcade/playground-chat.jpg", alt: "Playground chat with an execution map and an eight-step execution visibility rail.", cap: "Chat, execution map and trace rail" }, { src: "/assets/images/arcade/playground-auth.jpg", alt: "Playground paused at step three, authorization required, showing the user, required scope and a Continue to Linear button.", cap: "Authorization, at the moment it's needed" }] },

        { title: "Project Home", statement: "Project Home: one page, four states.",
          text: ["The dashboard follows the user's progress, and every blocker ships with its fix."],
          bento: { label: "Project Home", tiles: [
            { k: "keys", tone: "dark", w: 4, h: 2, label: "States", hi: 2, keys: [["0/3", "Empty"], ["1/3", "Needs auth"], ["3/4", "First run"], ["4/4", "Active"]] },
            { k: "num", tone: "ac", w: 4, label: "First run", value: "3/4", sub: "Setup done. Next: enable test users.", bar: 75 },
            { k: "donut", tone: "light", w: 4, label: "Success rate", value: "91%", pct: 91 },
            { k: "list", tone: "graphite", w: 8, label: "Blockers, ranked", rows: [["▲", "Salesforce auth expired", "Fix now"], ["▲", "Slack missing chat:write", "Reauthorize"], ["■", "Slack approval pending", "Review"], ["▼", "Gateway has no client", "Copy config"]] }] },
          media: [{ src: "/assets/images/arcade/dashboard-needs-auth.jpg", alt: "Dashboard in the Needs auth state, with a setup checklist and a single next action.", cap: "Needs auth: one next action" }, { src: "/assets/images/arcade/dashboard-active.jpg", alt: "Dashboard in the Active state with KPIs, project summary and a recent execution map.", cap: "Active: health, runs and blockers (prototype data)" }] },

        { title: "Measurement", statement: "Measurement: time to a safe agent in production.",
          text: ["Scale it if time to first call drops without new auth drop-off. Rethink it if users run but never open a trace."],
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
    name: "Gap 3D Fit", org: "Gap", area: "E-commerce · 3D sizing UX", tags: ["E-comm", "UX Design"],
    title: "Turning sizing uncertainty into a 61% add-to-bag decision.",
    desc: "Technical product designer and team lead on Gap's 3D Fit viewer: fit logic, UX flow, UI and testing across web and iOS.",
    metric: { value: "61%", label: "Add-to-bag lift" }, href: "/case-study?case=5", tint: ["#A4A6A3", "#E7E8E5", "#D6D7D4"],
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
        { title: "Impact", media: ["Results chart or before/after"], dash: [{ type: "kpi", w: 4, label: "Add-to-bag", value: "+61%", chip: "Lift", note: "Lift after the redesign" }], statement: "Impact: a 61% add-to-bag lift.",
          text: ["The strongest signal was not more 3D realism. It was reducing sizing ambiguity at the moment shoppers decided whether to trust a size and add to bag.", "The visual was not the product. Confidence was what shoppers believed, understood, and felt ready to do next. I would cut more today: every control should earn its place at the moment of doubt."],
          cards: [["Product", "Connected confidence to commerce signals"], ["Engineering", "Balanced 3D assets with mobile performance"], ["Research", "Mapped trust breakdowns"], ["Fit language", "Aligned product, research, and merchandising terms"]] },
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
  if (p.thumb) {
    // Product media instead of the metric: the video plays while visible; the small nav preview shows its poster frame
    el.classList.add("case__tile--media");
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
    const T = [["#F6C7D6", "#F8E2C8", "#F3EEE8"], ["#8FB0C8", "#EBDDD3", "#DCE7EE"], ["#E8B79B", "#F6EFE0", "#F1D8C4"], ["#A9AE7F", "#DADBC4", "#C7CBAF"], ["#BDCFDE", "#EBDAD3", "#E4EAEE"], ["#9CB09E", "#E3EAE0", "#C9D5C8"]];
    const LAB = [
      ["PROTO-01", "Connection onboarding", "Mobile · 2026", "Onboarding", "Connect your Spotify account to see your top artists and get personalized recommendations.", "prototype"],
      ["PROTO-02", "AI UX Studio", "Landing page", "Studio site", "A multidisciplinary practice designing intelligent, human-centered experiences at the intersection of AI technology and product design.", "prototype"],
      ["PROTO-03", "Jenyi", "AI journal · 2026", "Voice · Mobile editorial", "Your journal starts here. Speak freely and Jenyi turns voice into entries you'll actually revisit.", "prototype"],
      ["PROTO-04", "Intercom MCP", "Web · MCP · 2026", "Agent integration", "An MCP integration so agents can read and act on Intercom conversations with clear guardrails.", "prototype"],
      ["PROTO-05", "Payman AI", "Landing page · 2026", "Fintech · Agentic banking", "A redesign of paymanai.com, inspired by replay.ai: agentic banking for banks and credit unions.", "landing", "/payman", "/assets/images/playground/payman-thumb.jpg"],
      ["SUB-AMEX-01", "Membership App", "Concept", "Mobile · iOS", "Rewards flow & card management UI", "mobile"],
      ["SUB-LOG-07", "Brand System", "Shipped", "Print · B2B", "Business card system & identity touchpoints", "brand"],
      ["SUB-ICO-12", "Line Icon Set", "Library", "Design system", "4×8 minimal icon grid for product UI", "system"],
      ["SUB-APL-03", "Intelligence Stamp", "Exploration", "Brand · Physical", "Apple Intelligence postage stamp visual", "brand"],
      ["SUB-TIG-09", "Platform Branding", "In review", "Fintech · B2B", "Card system for intelligent finance platform", "brand"],
      ["SUB-AI-18", "Prompt Bar", "Prototype", "AI · Product UI", "Generative prompt bar & model controls", "ai"],
      ["SUB-MRC-04", "AI Recruiting", "Concept", "Landing · Web", "Hero narrative for global talent network", "landing"],
      ["SUB-VSW-11", "View Switcher", "Component", "Controls · iOS", "List/grid toggle with neumorphic affordance", "system"],
      ["SUB-MNU-06", "Menu Control", "Component", "Navigation", "Glass toggle track with glowing thumb", "system"],
      ["SUB-SLD-15", "Control Kit", "System", "Dark UI", "Sliders, palettes & export controls", "system"],
      ["SUB-IND-08", "Studio Follow-up", "Prototype", "Agent · CAD", "Follow-up card with CAD package delivery", "ai"],
      ["SUB-PLN-02", "Plant Health", "Concept", "Agtech · Web", "Crop diagnostics landing & data story", "landing"],
      ["SUB-MOD-21", "Material Studies", "Research", "3D · Architecture", "Stacked mood board: materials, light & form", "research"],
    ];
    setCount(LAB.length);
    const list = document.querySelector("[data-lab]");
    const tiles = LAB.map(([code, title, status, area, scope, tag, href, thumb], i) => {
      const li = el("li", "lab__tile grain");
      li.style.setProperty("--i", i);
      li.dataset.tag = tag;
      (thumb ? ["#3C9A98", "#C6E6DF", "#86C6C0"] : T[i % T.length]).forEach((c, k) => li.style.setProperty(`--t${k + 1}`, c));
      const top = el("div", "lab__top"); top.append(el("span", "", code), el("span", "", status));
      const bottom = el("div", "lab__bottom");
      bottom.append(el("h3", "lab__title", title), el("p", "lab__area", area), el("p", "lab__scope", scope));
      li.append(top);
      if (thumb) {
        // Contextual thumbnail: the page itself inside a small browser frame, cropped by the tile
        li.classList.add("lab__tile--shot");
        const shot = el("div", "lab__shot"), bar = el("div", "lab__shotbar"), img = el("img");
        bar.append(el("i"), el("i"), el("i"), el("span", "", href.replace(/^\//, "") === "payman" ? "paymanai.com" : ""));
        img.src = thumb; img.alt = `Preview of the ${title} page`; img.loading = "lazy"; img.decoding = "async";
        shot.append(bar, img); li.appendChild(shot);
      }
      li.append(bottom);
      if (href) { const a = el("a", "lab__cover"); a.href = href; a.setAttribute("aria-label", `Open ${title}`); li.appendChild(a); }
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
    document.body.dataset.caseId = id;
    p.tint.forEach((c, k) => root.style.setProperty(`--t${k + 1}`, c));
    root.style.setProperty("--ac", "#B7471D");
    document.title = `${p.name}: case study — Sambit Nayak`;
    document.querySelector("[data-cs-num]").textContent = pad2(id);
    document.querySelector("[data-cs-client]").textContent = `${p.org} · ${p.area}`;
    document.querySelector("[data-cs-title]").textContent = p.title;
    document.querySelector("[data-cs-desc]").textContent = p.desc;
    const hero = document.querySelector("[data-cs-tile]");
    hero.className = "cs__infographic";
    const outcome = el("div", "cs__poster cs__poster--orange");
    outcome.append(el("span", "cs__poster-label", p.org), el("strong", "cs__poster-value", p.metric.value), el("h2", "cs__poster-caption", p.metric.label));
    const map = el("div", "cs__poster cs__poster--dark");
    map.appendChild(el("span", "cs__poster-label", "Inside the case study"));
    const rings = svgEl("svg", { viewBox: "0 0 320 320", class: "cs__orbits", "aria-hidden": "true" });
    [138, 108, 78, 48].forEach((r, i) => rings.appendChild(svgEl("circle", { cx: 160, cy: 160, r, fill: "none", stroke: "currentColor", "stroke-width": 1.5, "stroke-dasharray": `${2 * Math.PI * r * .89} ${2 * Math.PI * r * .11}`, transform: `rotate(${i * 65 - 80} 160 160)` })));
    map.appendChild(rings);
    const contents = el("nav", "cs__poster-nav"); contents.setAttribute("aria-label", "Case study highlights");
    p.cs.sections.filter((sec) => !sec.title.startsWith("Exploration")).slice(0, 4).forEach((sec, i) => {
      const a = el("a", "", `${pad2(i + 1)} / ${sec.title}`);
      a.href = "#" + sec.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"); contents.appendChild(a);
    });
    map.appendChild(contents); hero.append(outcome, map);
    if (p.thumb) {
      const media = el("div", "case__tile cs__hero-media"); metricTile(p, media); hero.after(media);
    }

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
      if (sec.bento) c.appendChild(bento(sec.bento));
      if (sec.viz) c.appendChild(caseViz(sec.viz));
      if (sec.prototype) c.appendChild(arcadePrototype(sec.prototype));
      if (sec.media) {
        const shotItems = sec.media.filter((m) => typeof m !== "string");
        const cols = shotItems.length ? Math.min(shotItems.length, 3) : Math.min(sec.media.length, 3);
        const g = el("div", "cs__media cs__media--" + cols); sec.media.forEach((m) => {
        // A string is a placeholder; { src, alt, cap, narrow } is a real image
        if (typeof m === "string") { const f = el("figure", "ph"); f.append(el("span", "ph__tag", "Placeholder"), el("figcaption", "", m)); g.appendChild(f); return; }
        if (m.video) {
          // { video, poster, alt, cap }: muted looping clip that plays only while visible
          const f = el("figure", "shot shot--video"), tile = el("div", "shot__tile"), v = el("video");
          v.muted = true; v.loop = true; v.playsInline = true; v.preload = "none"; v.poster = m.poster || ""; v.setAttribute("aria-label", m.alt || m.cap || "Video");
          const src = el("source"); src.src = m.video; src.type = "video/mp4"; v.appendChild(src);
          if (matchMedia("(prefers-reduced-motion: reduce)").matches) v.controls = true;
          else new IntersectionObserver(([e]) => { e.isIntersecting && !document.hidden ? v.play().catch(() => {}) : v.pause(); }, { threshold: 0.45 }).observe(v);
          tile.appendChild(v); f.appendChild(tile); if (m.cap) f.appendChild(el("figcaption", "", m.cap)); g.appendChild(f); return;
        }
        const f = el("figure", "shot" + (m.narrow ? " shot--narrow" : "")), tile = el("button", "shot__tile"), img = el("img");
        tile.type = "button"; tile.setAttribute("aria-label", `Enlarge: ${m.cap || m.alt}`);
        img.alt = m.alt || m.cap || ""; img.loading = "lazy"; img.decoding = "async";
        img.addEventListener("load", () => img.classList.add("is-loaded")); img.src = m.src;
        if (img.complete) img.classList.add("is-loaded");
        tile.addEventListener("click", () => openLightbox(m.src, img.alt, tile));
        tile.appendChild(img); f.appendChild(tile);
        if (m.cap) { const fc = el("figcaption"); fc.append(el("span", "", m.cap), el("span", "", "Click to enlarge")); f.appendChild(fc); }
        g.appendChild(f);
      }); c.appendChild(g); }
      if (sec.quote) { const q = el("blockquote", "cs__quote"); q.append(el("p", "", `“${sec.quote}”`), el("footer", "", sec.quoteBy || "Power user interview")); c.appendChild(q); }
      if (sec.cards) { const ul = el("ul", "cs__cards cs__cards--2"); ul.setAttribute("role", "list"); sec.cards.forEach(([h, t]) => { const li = el("li"); li.append(el("h3", "", h), el("p", "", t)); ul.appendChild(li); }); c.appendChild(ul); }
      if (sec.trades) {
        const n = sec.trades.length;
        const cols = n === 1 ? 1 : n === 2 ? 2 : 3;
        const g = el("div", "cs__trades cs__trades--" + cols);
        sec.trades.forEach((t) => {
          const card = el("div", "cs__trade");
          card.append(el("span", "cs__trade-n", t.n), el("h3", "", t.t));
          const dl = el("dl");
          t.rows.forEach(([k, v]) => { const r = el("div"); r.append(el("dt", "", k), el("dd", "", v)); dl.appendChild(r); });
          card.appendChild(dl);
          if (t.note) card.appendChild(el("p", "cs__trade-note", t.note));
          g.appendChild(card);
        });
        c.appendChild(g);
      }
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
