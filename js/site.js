// Motion preference helper: loader.js defines the real one (OS setting + the site's Pause motion switch)
window.motionReduced ||= () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Looping muted videos play only while on screen, the tab is visible and the device isn't set to reduce motion.
// With reduced motion they show their poster; `manual` ones (case-study demos) get native controls instead.
const autoVideo = (v, threshold, manual = false) => {
  let visible = false;
  const sync = () => {
    const off = motionReduced();
    if (manual) v.controls = off;
    if (visible && !document.hidden && !off) v.play().catch(() => {}); else v.pause();
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold }).observe(v);
  document.addEventListener("visibilitychange", sync);
  addEventListener("motionchange", sync);
};

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
    title: "A tested AI re-engagement prototype for Trailhead power users.",
    desc: "A team prototype for Salesforce Trailhead: a RAG assistant and proactive prompts tested with 8 power users using public documentation.",
    seo: "Salesforce Trailhead Solve case study: an agentic AI RAG assistant and dashboard redesign built to win back power users who turn to ChatGPT.",
    metric: { value: "6/8", label: "Preferred Solve in prototype testing" }, thumb: { video: "/assets/images/trailhead/video-trailhead-promo-web.mp4", poster: "/assets/images/trailhead/video-trailhead-promo-web-poster.webp", alt: "Trailhead Solve product video: a power user asks a Salesforce question and gets a plain-language answer drawn from Trailhead's own knowledge", navPoster: "/assets/images/trailhead/video-trailhead-chatbot-poster.webp" }, slug: "trailhead-solve", href: "/work/trailhead-solve", tint: ["#BDCFDE", "#EBDAD3", "#E4EAEE"], accent: "#2F7DC4",
    cs: {
      meta: [["Role", "Product Designer (Apprentice)"], ["Timeline", "Aug 2025 – Apr 2026"], ["Skills", "Conversational UX, RAG workflows, power-user research, dashboard design"], ["Team", "Team of five with the Salesforce Trailhead product team"]],
      sections: [
        { title: "Overview / Background", statement: "Overview: built for the climb, and it loses experts at the top.",
          text: ["Trailhead is Salesforce's free learning platform, taking millions of professionals from beginner to certified expert. The Trailhead product team brought us one question: why are the platform's most experienced users showing up less?",
            "What we found changed the brief: power users weren't unhappy with Trailhead. They were taking their hardest questions to ChatGPT. We ran it like a product bet: kill ideas fast, ship working software, test with real experts. This was a team of five; the research, prototype and media are shared work."],
          cards: [["Problem: Experts took their questions elsewhere.", "Salesforce's most experienced users were taking their questions to ChatGPT and Slack instead of Trailhead's own community, and between milestones, nothing gave them a reason to come back."], ["Solution: Answers, plus prompts.", "Plain-language answers to real Salesforce problems inside Trailhead, paired with proactive prompts that surface what's relevant next without being asked."], ["Outcome: 6/8", "Given the same Salesforce question, 6 of 8 power users preferred Solve over ChatGPT."]],
          media: [{ video: "/assets/images/trailhead/video-trailhead-promo-web.mp4", poster: "/assets/images/trailhead/video-trailhead-promo-web-poster.webp", alt: "Promo video for the Trailhead Solve project", cap: "Project promo" }] },

        { title: "Defining the Problem", statement: "Problem: the certification path ended, and ChatGPT caught experts on the way out.",
          text: ["Experts weren't churning in anger. They were quietly drifting, and nothing on the platform noticed. Engagement fell exactly where certification ended, and experts took their hardest questions to ChatGPT. The question we carried into every decision: how might Trailhead become the first place an expert goes when they're stuck, not only when they're studying?"], board: { src: "/assets/images/trailhead/board-drift.webp", alt: "Flow from learning on Trailhead to certification to the gap between milestones, where experts went to ChatGPT, YouTube and Slack. 64% disengaged after major milestones, 45% supplemented Trailhead with ChatGPT, YouTube and Slack, 45% found the content too shallow for their experience, and 36% were unhappy with the existing personalization.", cap: "Where experts drifted, and what they said about it" },
          mediaLayout: "duo",
          media: [{ src: "/assets/images/trailhead/journey-engaged-disengaged.webp", alt: "Diagram of the engaged state (trails, badges, certifications) and the disengaged state, where a user runs into a Salesforce issue and turns to ChatGPT, Claude or Google. Temporary churn after certification is the engagement opportunity.", cap: "The journey: churn after certification, and the moment to win it back. Illustration: Advait Ramdasi" }, { src: "/assets/images/trailhead/engagement-over-time.webp", alt: "Graph of learner engagement growing with every step of the journey and peaking at a milestone, then falling away as a dashed post-milestone trend.", cap: "Engagement over time: it peaks at the milestone. Illustration: Advait Ramdasi" }],
        },

        { title: "Understanding your Users", statement: "Users: we reached 650+ power users and asked where they go instead.",
          text: ["A first round on opinion gave warm, useless answers, so we switched to behavior: where people drop off and where they go instead."], cards: [["Alex, the Architect · Confident Amplifier", "Opens ChatGPT first when a real problem hits. Certifications are tied to billing rates and performance reviews."], ["Jenny, the Developer · Focused Professional", "Certifications are tied to reviews. Pauses under workload and finds no clear way back in."]], board: { src: "/assets/images/trailhead/board-research.webp", alt: "Reached 650+ professionals across five regions, qualified 72 power users, interviewed 12 in two rounds. Round one asked for opinion and got warm, useless answers. Round two asked about behavior: where people drop off and where they go instead.", cap: "650+ reached, 72 qualified, 12 interviewed" },
           },

        { title: "Your Role and Responsibilities", statement: "Role: product designer on a team of five, working inside Trailhead's product team.",
          text: ["The research, the prototype and the media were shared work. We designed in Figma against Trailhead's design system, then took it into working software with Figma MCP, Cursor and Claude Code, so each of us could test what we designed."],
          cards: [["Product Designer (Apprentice)", "Conversational UX, RAG workflows, power-user research and dashboard design."], ["A team of five", "Worked alongside the Salesforce Trailhead product team."], ["Design to working code", "Figma, Figma MCP, Cursor and Claude Code, wired to OpenAI."]] },

        { title: "Scope and Constraints", statement: "Constraints: public documentation only, a brand that can't be faked, and eight real experts.",
          text: ["We built on OpenAI with curated public documentation and focused on proving the experience. Power users were scarce, so how we tested mattered as much as what we built."],
          cards: [["Success metric", "Preference over ChatGPT on a real question, confidence in the answer, and completion of the prototype task."], ["Guardrail", "Protect Trailhead's warm, human brand. No AI speaking on behalf of a real person."], ["Limits: data and people", "Curated public documentation, not Salesforce's proprietary data or Agentforce, and only 8 real power users."]] },

        { title: "Ideation Steps (The Solution)", statement: "Solution: kill two ideas on purpose, then ship the bet that held.",
          text: ["Kill the ideas that don't hold, ship the two features that do, then test them as working software instead of a slideshow."], board: { src: "/assets/images/trailhead/board-path.webp", alt: "Three explored ideas (community status, leverage, skill visibility) led to two vibe-coded proofs of concept, an AI version of themselves and a public skill profile, both killed. What shipped was Solve: plain-language answers to real Salesforce problems with proactive prompts. It was tested against ChatGPT with 8 power users, and 6 of 8 preferred Solve.", cap: "Kill, ship, test" },
          parts: [
        { title: "What we killed", statement: "What we killed: two ideas we built on purpose, so the real bet had room.",
          text: ["We explored community status, leverage and skill visibility, then skipped wireframes and vibe-coded the two strongest into working proofs of concept. Trying them ourselves was faster than debating them."],
          mediaLayout: "stack", media: [
            { wide: true, src: "/assets/images/trailhead/rejected-ai-twin.webp", alt: "Rejected A: an AI version of themselves. A Trailblazer Community group led by a power user, where an AI trained on their posts answers questions in their name, with a queue of AI replies to approve. Why it failed: fully automated, undisclosed replies in a real person's name damage trust; disclosed or approve-first versions clashed with Trailhead's warm, human brand, and approving every reply saved no time; and research showed these users didn't want to lead groups anyway. What survived: when Solve can't help, it drafts a community post that the person posts themselves.", cap: "A: an AI that spoke as a real person" },
            { wide: true, src: "/assets/images/trailhead/rejected-skill-profile.webp", alt: "Rejected B: a public skill profile, borrowed from GitHub's contribution graph, showing skill currency over twelve months, badges and a Share profile button. Why it failed: adoption was out of our hands, because it only works if employers treat the profile as a credential; and it was engagement for its own sake, with no lasting reason to return. What survived: skills measured against what the market is hiring for, turned into proactive prompts with a trailmix for each gap.", cap: "B: visibility without a reason to return" },
            { src: "/assets/images/trailhead/case-study-trailhead-7.webp", alt: "Public skill profile concept UI showing certifications, badges and skill currency.", cap: "The shareable profile we killed" },
            { src: "/assets/images/trailhead/trailhead-ideation-whiteboard.jpg", alt: "Hand-drawn whiteboard from the Trailhead ideation session: interview plan, engagement broken into why, how and when, learning problems such as consistency, and a motivation chart.", cap: "Whiteboard ideation session" },
            { src: "/assets/images/trailhead/trailhead-ideation-team.jpg", alt: "Four teammates working in an office during the ideation session, gathered around laptops while one stands beside a screen showing the interview measurement plan spreadsheet.", cap: "Team ideation session" }] },

        { title: "What we shipped", statement: "What we shipped: catch the ChatGPT moment, then give experts a reason to come back.",
          text: ["Solve catches power users at the moment they would otherwise open ChatGPT; proactive prompts make returning worth it."], media: [{"wide": true, "src": "/assets/images/trailhead/solve-home-mockup.webp", "alt": "A laptop showing the Trailhead home page with Solve front and centre: a greeting, How can I help, Alex?, and a prompt box over a mountain illustration.", "cap": "Solve on the Trailhead home page. Visual: Advait Ramdasi"}], board: {"src": "/assets/images/trailhead/board-bet.webp", "alt": "ChatGPT runs on public data and Slack depends on whoever happens to reply. The bet was Salesforce's own knowledge, in plain language, at the exact moment of friction, delivered by two features: Solve, which catches experts when they would open ChatGPT, and proactive prompts, which resurface what is relevant next. Neither works alone.", "cap": "The bet: proprietary knowledge, in plain language, at the moment of friction"},
          trades: [
            { n: "01 · Solve", t: "A plain-language answer, calibrated to you", rows: [["Ask in plain language", "A specific, actionable answer that cites Salesforce documentation."], ["Set the depth", "Beginner, Intermediate or Advanced, so you are never over-explained or underserved."], ["Never a dead end", "When Solve can't fully help, it drafts a ready-to-post Trailblazer Community question from your conversation."]],
              mediaLayout: "quad",
              media: [{ video: "/assets/images/trailhead/video-trailhead-chatbot.mp4", poster: "/assets/images/trailhead/video-trailhead-chatbot-poster.webp", alt: "Solve answering a Salesforce question in plain language", cap: "Solve answering" }, { src: "/assets/images/trailhead/trailhead-solve-1.webp", alt: "Solve main interface: a greeting, three suggested starting points and a message field.", cap: "Solve: the main interface" }, { src: "/assets/images/trailhead/trailhead-solve-2.webp", alt: "Solve answer listing the sources behind it: a community thread, a Trailhead module and developer docs.", cap: "Solve: the sources behind an answer" }, { src: "/assets/images/trailhead/trailhead-solve-3.webp", alt: "Solve offering Solved or Need more help, then a drafted post to the community.", cap: "Solve: never a dead end, with a drafted community post" }] },
            { n: "02 · Proactive prompts", t: "The platform does the noticing", rows: [["Renewals", "Flags a certification renewal before it lapses, closing a notification gap users complained about."], ["Skill gaps", "Measures a skill profile against what the market is hiring for and builds a path to close the gap."], ["Follow-ups", "Reads the questions asked in Solve and recommends what to learn next."]],
              mediaLayout: "hero-trio",
              media: [{ src: "/assets/images/trailhead/case-study-trailhead-4.webp", alt: "Personalised dashboard full view showing trending skills and personalized trail recommendations.", cap: "Dashboard full view: trending skills and personalized trail recommendations" }, { src: "/assets/images/trailhead/trailhead-trail-prompt.webp", alt: "A prompt showing progress towards a trail, three hours from completing it, with a Continue Trail button.", cap: "A prompt that builds on what you completed" }, { src: "/assets/images/trailhead/trailhead-skills.webp", alt: "Skills employers want: a radar chart of skills in demand against your skills, with tailored trailmixes for each deficient skill.", cap: "Skills employers want, with a tailored trailmix for each gap" }, { src: "/assets/images/trailhead/skill-demand-coverage.webp", alt: "Bar chart of skill demand against current coverage for a sample power-user profile: data modeling 90 against 30, LWC 85 against 25, architecture 88 against 35, integrations 75 against 45, security 70 against 55 and automation 65 against 50.", cap: "Skill demand against current coverage, for a sample power user. Visual: Advait Ramdasi" }] },
          ] },

        { title: "Build & test", statement: "Build & test: working software and synthetic users before we spent real people's time.",
          text: ["Each component was designed in Figma against Trailhead's design system, then taken through Figma MCP into Cursor and Claude Code and wired to OpenAI. No handoff, no rebuild from a spec: a working app, so we could test it like a product instead of a slideshow.",
            "Real power users were scarce, so we turned our research into 12 AI agents and ran them through the flows first. By the time 8 real power users arrived, the obvious rough edges were gone and their time went to what needed a person."],
          cards: [["What was running", "React front end, Express and SQLite back end, OpenAI for responses, voice input, expertise calibration and community-post drafting."], ["12 agents, then 8 users", "Synthetic users built from research data caught usability problems before real sessions."]] },

          ] },

        { title: "Outcomes and Takeaways", statement: "Outcomes: preferred over ChatGPT in a small prototype test, with honest limits on what we proved.",
          text: ["The honest limit: curated public documentation, not Salesforce's proprietary data or Agentforce, and 8 power users. The next step is a larger test on real support data, where the bet can be proven at scale."], parts: [{"title": "Learning", "statement": "Learning: the hardest part was finding authentic power users.", "cards": [["What worked", "Designing for users who'd already arrived gave every decision a clean test."], ["What was hard", "Recruiting authentic power users on a semester timeline."], ["What's next", "Scale testing globally, refine Solve's answer quality, and pitch a formal roadmap."]], "quote": "Power users don't disengage because Trailhead runs out of content. They disengage because it stops speaking to who they've become.", "quoteBy": "Advait Ramdasi, teammate"}],
          cards: [["6/8 preferred Solve over ChatGPT", "Same Salesforce question, side by side."], ["4.5/5 confidence", "In Solve's answers."], ["8 users", "A directional prototype study, not a scaled product metric."], ["Public-doc RAG", "Useful for experience testing, not proof of enterprise answer quality."]],
          quote: "I had never been comfortable in code, and had never prototyped with it, so teaching myself to ship this as working software is the barrier I'm proudest of clearing.", quoteBy: "Teammate on this project" },
      ],
    },
  },
  {
    name: "CotonAI Modes", org: "CotonAI", area: "Agentic AI · Fashion", tags: ["AI Agents", "UX Design"],
    title: "Designing structured, mode-based UX in an AI platform for fashion teams.",
    desc: "End-to-end design of Modes at CotonAI: replacing prompt-heavy AI with structured entry points mapped to real fashion workflows.",
    seo: "CotonAI Modes case study: end-to-end product design of structured, mode-based entry points that replace prompt-heavy AI in a fashion platform.",
    metric: { value: "225", label: "Mode adoption index, V1=100" }, thumbnail: { src: "/assets/images/cotonai-modes/canvas-hero.webp", alt: "The CotonAI canvas: a board of generated fashion looks with the Modes bar open beneath.", bleed: true }, slug: "cotonai-modes", href: "/work/cotonai-modes", tint: ["#9CB09E", "#E3EAE0", "#C9D5C8"], photo: { src: "/assets/images/case-bg-bloom.jpg", pos: "50% 38%" },
    cs: {
      meta: [["Role", "Founding Product Designer"], ["Timeline", "Aug 2025 – Present"], ["Skills", "Interaction architecture, AI UX, design systems, prototyping, analytics"], ["Team", "Co-founder, PM, engineering"]],
      sections: [
        { title: "Overview / Background", statement: "Overview: great AI visuals shouldn't require a prompting degree.",
          text: ["At CotonAI, I work as founding product designer on an AI workspace fine-tuned for fashion and adjacent industries. There was no brief. I owned the problem, the interaction model and the design system, working directly with the co-founder, PM and engineering.",
            "This is how a prompt box became Modes, structured entry points mapped to the way fashion teams actually work, and how that decision helped turn our MVP into a paid enterprise pilot."],
          media: [{ src: "/assets/images/cotonai-modes/canvas-hero.webp", alt: "The CotonAI canvas: a fashion board of generated looks with the Modes bar open at the bottom.", cap: "The CotonAI canvas, with the Modes bar open under a board of looks." }],
          cards: [["Problem: Prompting was a tax.", "Great visuals needed great prompts, and fashion designers aren't prompt engineers."], ["Solution: Modes, not better prompts.", "Edit, Render, Colourway and Studio, each mapped to a real workflow stage."], ["Outcome: adoption index 225", "Mode-bar adoption moved from an indexed V1 baseline of 100 to 225, alongside a paid enterprise pilot and 584 hours saved for one client."]] },
        { title: "Defining the Problem", ph: "01", media: [{ src: "/assets/images/cotonai-modes/mvp-wireframes.webp", alt: "Four grey wireframes exploring the canvas, toolbar and side panel.", cap: "Initial wireframes while ideating" }, { src: "/assets/images/cotonai-modes/mvp-shipped.webp", alt: "The shipped MVP: a garment on a dark canvas with a single prompt bar underneath.", cap: "The shipped MVP: a canvas and a prompt box" }], statement: "Problem: to get high-quality visuals, users need strong prompting skills.",
          text: ["Users who could write precise prompts got striking results. Everyone else got unpredictable images and stalled."], board: { src: "/assets/images/cotonai-modes/board-prompt-tax.webp", alt: "The MVP was a canvas and a prompt box. Precise prompts gave striking results, everyone else got unpredictable images and stalled, which raised the question of whether any fashion user could get a high-quality result without writing a prompt. Users don't know how to prompt, and too much prompting makes AI hallucinate.", cap: "Why prompting was a tax" },
           },
        { title: "Understanding your Users", ph: "02", media: [{ src: "/assets/images/cotonai-modes/prompt-templates.webp", alt: "The MVP prompt bar with suggested prompt chips such as re-design to a modern style.", cap: "Smarter prompt templates: less blank page, still language-precise" }, { src: "/assets/images/cotonai-modes/prompt-system-generated.webp", alt: "The MVP prompt bar pre-filled with a system-written prompt.", cap: "System-generated prompts: complexity hidden, not removed" }], statement: "Users: we shipped an MVP in 3 weeks and shadowed fashion teams to learn where it broke.",
          text: ["Our team has a combined 8 years of fashion industry experience, so we started from what we had observed and shipped an MVP in a record 3 weeks. Then we shadowed users on it and tested two ways of helping them prompt better. Both failed."], board: { src: "/assets/images/cotonai-modes/board-failed.webp", alt: "Shadowing showed users hesitating before typing and reusing vague prompts such as change color, Make this editorial and Change the Model. Two fixes were tried and both failed: smarter prompt templates still needed language precision and did not reduce hallucination, and system-generated prompts hid complexity, were hard to predict and left users unable to tell why results changed. The conclusion was to remove the need to prompt.", cap: "Two ways to help prompting, both failed" },
          cards: [["Fashion tools had broken user flows", "Hypothesis from our industry experience."], ["Adoption of new tech is lower", "Hypothesis from our industry experience."], ["Fashion pipelines are disconnected", "Hypothesis from our industry experience."]] },
        { title: "Your Role and Responsibilities", statement: "Role: founding designer with no brief, owning the problem as well as the screens.",
          text: ["That meant specifying the tokens with developers, defining flows as states before they were built, and using usage data to decide what shipped next."],
          cards: [["Founding Product Designer", "August 2025 to present."], ["Owned", "The problem, the interaction model and the design system."], ["Worked with", "The co-founder, PM and engineering."]] },

        { title: "Scope and Constraints", statement: "Constraints: AI should adapt to designer intent, with modes guiding the entry and nothing more.",
          text: ["The scope was deliberate. Modes guide where you start, and creativity stays open. Sub-modes exist only for very specific use cases, and an Open mode stays for advanced control."],
          stepsTitle: "Principles",
          steps: [["Intent over syntax", "Designers choose what they want to do, not how to phrase it."], ["Structure the entry, not the output", "Modes guide where you start. Creativity stays open."], ["Familiar before novel", "Borrow patterns fashion teams already know from design tools."], ["Every mode earns its place", "Instrument adoption so each iteration has a verdict."]] },
        { title: "Ideation Steps (The Solution)", ph: "03", media: [{ src: "/assets/images/cotonai-modes/workspace.webp", alt: "The CotonAI workspace with the Modes bar at the bottom of an empty board.", cap: "The workspace, with the Modes bar docked at the bottom" }, { src: "/assets/images/cotonai-modes/toolbar-v2.webp", alt: "Edit mode open: the selected garment beside Open, Combine, Upscale and Figure options.", cap: "Edit mode: options open alongside the edit" }, { diagram: { kind: "versus", title: "Figure submode", cards: [{ tag: "V1 · Editorial", title: "Try-on on a model", body: "Took 8 clicks and prompting.", status: "8 clicks" }, { tag: "V2 · Edit mode", title: "Figure submode", body: "No prompting needed.", status: "3 clicks", hi: true }] } }],
          ui: { kind: "tour", title: "Modes at CotonAI", items: [["Edit", "Edit, with options alongside", "Multiple options open next to your edit, so you compare without re-prompting."], ["Render", "Render a material or fabric", "Add the required material or fabric to your garment."], ["Colourway", "Change colour and prints", "A visual picker alongside hex input, so there are no codes to recall."], ["Studio", "Editorial photoshoots", "Create editorial-level shoots from a reference image."]] }, dash: [{ type: "trend", w: 6, label: "Mode-bar adoption index", value: "100 → 225", chip: "V1 → V2", points: [["V1", 100], ["V2", 225]], note: "Indexed to V1 = 100. Visual annotation helped users pick a mode faster." }, { type: "bars", w: 6, label: "Clicks to a try-on", value: "8 → 3", chip: "-5 clicks", rows: [["Editorial, V1", 8, "8"], ["Figure submode, V2", 3, "3"]], note: "No prompting needed in V2." }], statement: "Solution: we replaced the prompt box with modes.",
          text: ["Instead of helping users prompt better, I removed the need to. Modes became structured entry points into AI capability, reducing ambiguity while keeping creativity open. Each iteration was decided by usage data, not opinion."], board: { src: "/assets/images/cotonai-modes/board-system.webp", alt: "User intent feeds Modes, a semantic layer between intent and AI execution, which offers Edit (options alongside the edit), Render (add a material or fabric), Colourway (change colour and prints) and Studio (editorial photoshoots from a reference image). Mode logic runs as event, state, render for predictable outcomes, and an Open mode stays for advanced control.", cap: "Modes, a layer between intent and AI" },
          trades: [
            { n: "Decision 1", t: "Treat the canvas as a behavioural system", rows: [["Architecture", "Modes act as semantic layers between user intent and AI execution."], ["Flow", "Mode logic → event → state → render loop."], ["It helped", "Predictable outcomes, reduced hallucination, consistent visual logic."]] },
            { n: "Decision 2", t: "Toolbar design evolution", rows: [["Issue with V1", "Users struggled to decide which mode they wanted, and onboarding took a long time. We used PostHog and trigger.dev to find this out."], ["Hypothesis for V2", "Visual annotation will help users pick the desired mode faster."], ["Result", "Adoption index moved from 100 to 225. Absolute usage is shown in internal analytics, so I label the public number as indexed."]], media: [{ src: "/assets/images/cotonai-modes/toolbar-v1.webp", alt: "The V1 Modes bar: a plain row of text mode labels under the prompt field.", cap: "V1: modes as a text row" }, { src: "/assets/images/cotonai-modes/toolbar-v2.webp", alt: "The V2 Modes bar with visual annotation: each option previewed as a thumbnail.", cap: "V2: visual annotation on every option" }] },
            { n: "Decision 3", t: "Colourway redesign", rows: [["Issue with V1", "Users had access to hex codes but low recall and cognitive load caused hesitation and friction, so weekly adoption was low."], ["Hypothesis for V2", "A visual colour picker alongside hex input reduces cognitive load and matches familiar patterns from other design tools."], ["Result", "Significantly improved user feedback and feature adoption."]], media: [{ src: "/assets/images/cotonai-modes/colourway-v1.webp", alt: "The V1 Colourway mode: hex-code entry only.", cap: "V1: hex codes only" }, { src: "/assets/images/cotonai-modes/colourway-v2.webp", alt: "The V2 Colourway mode with a garment selected and a visual colour picker.", cap: "V2: a visual picker alongside hex input" }] },
            { n: "Decision 4", t: "Figure submode", rows: [["Issue with V1", "Creating a try-on on a model in Editorial took 8 clicks and prompting."], ["Change in V2", "A Figure submode inside Edit mode."], ["Result", "No prompting and 3 clicks to get results."]], note: "Sub-modes are for very specific use cases; they are not open-ended.", media: [{ src: "/assets/images/cotonai-modes/figure-v2.webp", alt: "The Figure submode inside Edit mode: a garment beside its on-model try-on.", cap: "V2: Figure submode inside Edit" }] },
            { n: "Decision 5", t: "Scaling the design system with AI", rows: [["Step 1", "Designed tokens in the Figma library."], ["Step 2", "Collaborated with dev to finalize the token specification, using shadcn as the base layer."], ["Step 3", "Created an .md file and pushed it as a UI library."], ["Result", "Every new custom UI pulls from the same GitHub repo, with no redesigning again and again."]], note: "The full system, and how a flow is specified before it is built, is case study 03.", media: [{ src: "/assets/images/cotonai-modes/tokens-workflow.webp", alt: "The token workflow: Figma library, token specification with the developer, then an md file pushed to GitHub, beside the mode buttons built from those tokens.", cap: "The token workflow, and the mode buttons it produces" }] },
            { n: "Decision 6", t: "Specify flows as states, not screens", rows: [["Flow", "In Editorial mode the user clicks + Look or + Reference, enters a temporary assignment state, and picks an image from the board or overlay. The system assigns it to the slot, shows the thumbnail, switches to Replace and exits with clear visual feedback."], ["Spec", "Each flow is defined as states, events, constraints and acceptance criteria, so selection logic, slot mapping and Generate gating stay predictable and error resistant."], ["Ship", "The spec goes into Cursor to prototype. A feature branch is created, slot state and overlay logic are implemented and pushed to GitHub, reviewed in check-in and finalized before merge."]], media: [{ src: "/assets/images/cotonai-modes/flow-1.webp", alt: "Editorial mode flow, part one: clicking Reference, the board entering assignment state, an image assigned to the slot.", cap: "Editorial mode: assign a look or reference" }, { src: "/assets/images/cotonai-modes/flow-2.webp", alt: "Editorial mode flow, part two: the thumbnail shown in the slot, the button switching to Replace, Generate unlocked.", cap: "Then the slot, Replace and Generate states" }] },
          ],
          parts: [
        { title: "Rejected designs", statement: "Rejected: three V1s the usage data voted down.",
          text: ["Each V1 shipped, was measured with PostHog and trigger.dev, and was replaced. These are the versions that failed, and why."],
          mediaLayout: "stack", media: [
            { wide: true, src: "/assets/images/cotonai-modes/rejected-toolbar.webp", alt: "Rejected A: the V1 Modes bar as a plain row of text labels (Open, Edit, Render, Colourway, Studio, Editorial) under the prompt field, with an onboarding coach mark reading Step 1 of 6. Why it failed: a name isn't a preview, so users struggled to decide which mode they wanted; and onboarding had to explain it, taking a long time, as PostHog and trigger.dev showed. What shipped: visual annotation on every option, and the mode-bar adoption index moved from 100 to 225.", cap: "A: labels became previews" },
            { wide: true, src: "/assets/images/cotonai-modes/rejected-colourway.webp", alt: "Rejected B: V1 Colourway with a selected garment and a panel of empty hex-code fields for body, trim and print. Why it failed: low recall of hex codes caused hesitation and friction; and choosing colour without seeing it added cognitive load, so weekly adoption stayed low. What shipped: a visual colour picker alongside hex input, the pattern teams know from design tools.", cap: "B: hex codes gained a visual picker" },
            { wide: true, src: "/assets/images/cotonai-modes/rejected-tryon.webp", alt: "Rejected C: a try-on through Editorial mode in eight steps, from choosing Editorial and adding a look and reference to picking a model and pose, writing a prompt and generating. Why it failed: eight clicks buried a common job inside a mode built for something else; and it still needed a prompt, the one thing Modes set out to remove. What shipped: a Figure submode inside Edit, 3 clicks and no prompting.", cap: "C: eight clicks became three" }] },
          ] },
        { title: "Outcomes and Takeaways", dash: [{ type: "kpi", w: 4, label: "Images generated", value: "6000+", note: "In editorial mode on CotonAI" }, { type: "kpi", w: 4, label: "Cost saved", value: "$5k+", note: "Deciding UX flows and which AI models to work with" }, { type: "kpi", w: 4, label: "Enterprise pilot", value: "Paid", chip: "Pilot", note: "Converted the MVP to a paid enterprise pilot" }, { type: "waffle", w: 8, label: "Client time saved", value: "584 hrs", cells: 80, filled: 73, note: "In one season, about 73 working days at 8 hours a day. Each square is one day." }, { type: "kpi", w: 4, label: "Mode adoption index", value: "225", chip: "V1=100", note: "After redesigning the Modes bar" }], statement: "Outcome: a paid pilot, 584 hours saved for a client, and a mode adoption index of 225.",

          parts: [
        { title: "Learning", statement: "Learning: shape the interaction model, not more controls.",
          text: ["Designing CotonAI shifted my perspective on AI interfaces from feature design to interaction architecture. The real challenge wasn't model capability, but how people translate intent into action. Modes were a strategic move to reduce ambiguity, stabilize outcomes, and align AI behavior with how designers already think visually.", "Successful AI products are not built by adding more controls, but by shaping interaction models that make complex technology feel predictable, trustworthy, and native to human workflows. The risks below are what I'm watching as Modes grow."],
          quote: "While building CotonAI, I realized designers can directly influence business decisions through human-centered thinking, amplified by AI.", quoteBy: "Sambit Nayak",
          cards: [["Risk: over-structuring", "Could reduce creative freedom. Mitigation: modes guide the entry point, not the output style."], ["Risk: power users feel constrained", "Mitigation: Open mode retained for advanced control."], ["Risk: mode explosion", "Could confuse users. Mitigation: submodes nested inside parent workflows."]] },
          ] },
      ],
    },
  },
  {
    name: "CotonAI Design System", org: "CotonAI", area: "Design systems · AI product", tags: ["Design Systems", "AI UX"],
    title: "One token file that Paper, code and AI agents all build from, with gates that stop it drifting.",
    desc: "CotonAI's UI took colour from two sources that disagreed. One token file now generates the code, Figma and Paper outputs, and a gate fails on low contrast.",
    seo: "CotonAI design system case study: one W3C token file that generates CSS, Tailwind and Figma tokens, a Paper library of 35 components and 13 patterns, and a gate that checks 250 contrast pairs against WCAG AA.",
    metric: { value: "250/250", label: "Contrast pairs meet WCAG AA in the token gate" }, thumb: { video: "/assets/images/cotonai-ds/video-cotonai-ds-cover.mp4", poster: "/assets/images/cotonai-ds/video-cotonai-ds-cover-poster.jpg", alt: "CotonAI Design System cover: the CotonAI mark over soft, out-of-focus yellow and orange flowers, then the title typed out", navPoster: "/assets/images/cotonai-ds/video-cotonai-ds-cover-poster.jpg", bleed: true }, slug: "cotonai-design-system", href: "/work/cotonai-design-system", tint: ["#8AA3AE", "#E3ECEE", "#C5D5DA"],
    cs: {
      meta: [["Role", "Founding Product Designer"], ["Timeline", "Aug 2025 – Present"], ["Owned", "Token source, Paper library, rules for agents"], ["Team", "Co-founder, PM, engineering"]],
      // This study follows its own flow, from context to measured impact (declared here and in STRUCTURE_BY_PAGE in tools/check-seo.cjs)
      structure: ["Context", "Diagnosis", "Design decisions", "System architecture", "Applied workflows", "Engineering validation", "Measured impact"],
      sections: [
        { statement: "Context: a fashion canvas where the interface has to stay out of the work's way.",
          text: ["CotonAI is an AI canvas for fashion teams. The work on the board is the product, so the interface around it has to stay quiet. I joined as founding product designer in August 2025 and took on the design system. Three groups build with it: designers in Paper, engineers in Tailwind, and AI agents that draft UI code."],
          cards: [["Problem: Two token sources that disagreed.", "1,411 raw hex values on top of them."], ["Solution: One file generates the rest.", "CSS, Tailwind, Figma and Paper."], ["Outcome: A gate, not a guideline.", "250 contrast pairs pass AA."]] },

        { statement: "Diagnosis: the interface was designed, but nothing enforced the design.",
          text: ["An audit of src/ on 11 November 2026 found a missing source: colour, size and controls were decided again in every file."],
          board: { src: "/assets/images/cotonai-ds/board-diagnosis.webp", alt: "What the audit of src/ found. 1,411 raw hex colours in 187 files, and the brand blue alone appears 269 times. 490 raw buttons, while only 5 files import the Button component. 669 arbitrary text sizes such as text-[13px]. 10 files build their own dialog, sheet or drawer. 7 shadcn components are imported nowhere, including select, tabs and switch. The old muted gray #888888 is 3.5:1 on white against the 4.5:1 AA needs. Root cause: two places defined colour and they disagreed, index.css with HSL variables for shadcn and boardUiTokens.ts with hex, imported by 106 files.", cap: "What the audit found in src/" } },

        { statement: "Decisions: generate the palette, pin the brand, and let contrast choose the blue.",
          text: ["Each decision is backed by a number a machine can check."],
          board: { src: "/assets/images/cotonai-ds/board-decisions.webp", alt: "Six design decisions. 1, palette: one neutral ramp gray/0 to 1000 and five hues generated in OKLCH with a fixed lightness per stop, with blue/500 #0C8CE9, red/500 #FF383C and purple/600 #8A38F5 pinned. 2, one blue with two jobs: white on #0C8CE9 is 3.53 to 1 and on #0076C7 it is 4.76 to 1, so filled actions use blue/600 while focus and selection keep the brand blue. 3, muted text moves to gray/650 #636360 in light and gray/450 #9F9E9C in dark, 4.96 to 1 on the selected row. 4, three radii 6, 12 and full, two control heights 32 and 28, and a 12px text floor. 5, old names stay as aliases of the new ones. 6, where index.css and boardUiTokens.ts disagreed, the values on the live board won, and there is one accent colour.", cap: "Six decisions, each one checkable" },
          parts: [
            { title: "What I replaced", statement: "Replaced: a token set that wrote the code down instead of correcting it.",
              text: ["The first token set (57 primitives, 48 aliases) was extracted from the code and described it as it was. The current set is generated and checked against contrast, so it says what the code should be."] },
          ] },

        { statement: "Architecture: one source, four layers, every output generated.",
          text: ["cotonai.tokens.json is the only file edited by hand. npm run tokens generates the CSS variables, Tailwind theme, TypeScript module and Figma import files, and the Paper library is re-pushed from the same JSON. Components use semantic tokens. Primitives only define them."],
          board: { src: "/assets/images/cotonai-ds/board-architecture.webp", alt: "cotonai.tokens.json, the single source of truth in W3C design-token format, feeds four layers: 97 primitives generated in OKLCH, 105 semantic tokens in two modes, component tokens, and 100 dimensions plus 7 effects. These generate tokens.css, tailwind-theme.ts, tokens.ts and one Figma tokens file per collection and mode. The Paper file has 7 Foundations boards, 35 component artboards, 13 pattern artboards and 1 Index page.", cap: "One file in, every output generated" },
          media: [{ demo: "dsLive", alt: "Live CotonAI components running on the real design tokens, with a Light and Dark switch. A generation tile moves through queued, running and done with a progress bar, skeleton and status pill. Buttons, a switch and a segmented control respond to hover, press and selection. A tooltip, a menu and a delete dialog open and close with the system's fade and zoom. An agent shows thinking, a streamed answer and status pills.", cap: "Live: the real components on the real tokens. Flip Light and Dark, press Generate, open the menu" },
            { wide: true, src: "/assets/images/cotonai-ds/paper-index.webp", alt: "The Index page of the CotonAI Paper file. It lists the pages in the file: Foundations with 7 boards, Components with 35 artboards and Patterns with 13 artboards. A table says which component to use for which job, across Controls, Display, Structure, Overlays and Canvas chrome. Three rules follow: Build, with tokens only and one accent colour. Check, with text at 4.5:1 and UI at 3:1 contrast and all states covered. Change, with one library owner who approves new tokens and components.", cap: "The Index page of the Paper file: which component for which job, and three rules" },
            { wide: true, src: "/assets/images/cotonai-ds/paper-tokens-primitives.webp", alt: "The Colour / Primitives board in the Paper file. Raw palette ramps that product code never uses directly. A 22-step warm-neutral gray ramp from gray-0 #FFFFFF to gray-1000 #000000, five hue ramps from 50 to 950 for blue (accent, info, with 500 #0C8CE9 and 600 #0076C7), green (success), amber (warning), red (danger) and purple (layer text, spread), and translucent alpha tokens shown on white and on gray-950.", cap: "Foundations: colour primitives, 97 raw values" },
            { wide: true, src: "/assets/images/cotonai-ds/paper-tokens-semantic.webp", alt: "The Colour / Semantic Light board in the Paper file. Role-based tokens used by product code in the light theme, each swatch showing the token name, the primitive it aliases and the resolved value. Groups are Background, Border, Text, Icon, Accent, Status for success, warning, danger and info, and component tokens for nav, tab, toggle, scrollbar, loader, media and canvas.", cap: "Foundations: semantic colour, light theme. Each role names the primitive it aliases" },
            { wide: true, src: "/assets/images/cotonai-ds/paper-tokens-type.webp", alt: "The Typography board in the Paper file. Inter for UI and JetBrains Mono for code, three weights (regular 400, medium 500, semibold 600), and thirteen sizes from the 11px hint to the 56px display-lg, each with its line height and tracking, for example text-md at 13 over 20 with -0.01em. Tracking tightens as type grows, from +0.1em for eyebrows to -0.04em for display-lg. Rules: 12px is the floor for anything read, use the role and not a raw size, and line heights only grow with size.", cap: "Foundations: type, in Inter and JetBrains Mono" },
            { wide: true, src: "/assets/images/cotonai-ds/paper-tokens-spacing.webp", alt: "The Spacing, Radius and Sizes board in the Paper file. A 2px-based spacing scale from 0 to 64. Radii: none 0, control 6px for buttons, fields and chips, panel 12px for panels, menus and dialogs, and full for pills and avatars. Control heights: xs and sm 28px, md and lg 32px, dense 28px for inspector fields, and a 32px icon square. Icon sizes from 12px to 24px. Panel and chrome measurements such as the 300px editor width and 45px top bar, and canvas measurements such as handle and hit sizes.", cap: "Foundations: spacing, radius and sizes" }],
          mediaLayout: "stack",
          parts: [
            { title: "Components", statement: "Components: 35, grouped by the job they do.",
              cards: [["Controls", "Button, Switch, Select, TextField and the rest. Never a bare button with color classes."], ["Overlays", "Dialog interrupts, Popover holds free content, Menu lists actions."], ["Canvas chrome", "Dock, ToolRail, PromptBar and UploadSlot for the board itself."]] },
            { title: "Documentation", statement: "Documentation: one Paper artboard per component.",
              cards: [["Variants, sizes, states", "Default, hover, pressed, focus and disabled are drawn, not described."], ["A one-line use for", "So the right component is a lookup, not a debate."], ["An AGENTS.md entry", "A component is not done until people and agents can both find it."]] },
          ] },

        { statement: "Workflows: a change goes through one owner, and an agent's draft goes through a person.",
          text: ["A change starts as an issue naming the two screens that need it. One library owner approves it, the JSON and Paper artboard change together, and an engineer checks it. Agents follow the same rules: they read AGENTS.md, produce a proposal, and a person reviews it."],
          board: { src: "/assets/images/cotonai-ds/board-workflow.webp", alt: "Two flows. A change to the system: 1, issue, with the problem, the two screens that need it and the nearest existing option; 2, owner approves or redirects; 3, the token JSON and the Paper artboard change together and AGENTS.md is updated; 4, an engineer checks tokens and all states. A change made with an agent: give it the rules and one artboard; get a proposal; a human decides; the fix becomes a new line in AGENTS.md. The agent rules are five lines: tokens never literals, semantic over primitive, reuse before you build, contrast is a gate, and agent output is a proposal.", cap: "How a change is made, by people and with an agent" },
          parts: [
            { title: "Challenge", statement: "Challenge: changing shapes touches about 106 files. Solution: stage it, and look after each stage.",
              stepsTitle: "Stages",
              steps: [["Stage 0, tooling: done", "Generator, token files, baseline."], ["Stage 1, colours: done", "124 raw hex gone from boardUiTokens.ts."], ["Stage 2, shapes and sizes", "Radii and control heights. Not started."], ["Stage 3, roles", "Credits to neutral, menu hover to grey. Not started."], ["Stage 4, the rest", "Sub-bars, then modals. Not started."]] },
          ] },

        { statement: "Validation: the gates fail the build, so contrast and drift are not opinions.",
          text: ["Run on 11 November 2026: the token build is current, every contrast pair passes, and raw colour sits on its baseline. Stage 1 also built with Vite."],
          board: { src: "/assets/images/cotonai-ds/board-gates.webp", alt: "Gates run on 11 November 2026. npm run tokens:check: 250 of 250 contrast pairs meet WCAG 2.2 AA, and it also fails if a generated file is stale. npm run lint:colors: 1,202 raw colour literals in 167 files, down from 1,326 in 168, and the check fails if the number goes up. Gate history: 166 pairs grew to 250 as text tiers, canvas chrome and tinted fills were added. What the gate caught: warning and danger text fail 4.5 to 1 on their pressed fill, so interactive warning and danger pills hover with a border instead of a fill. Not yet verified: how stage 1 looks in a browser.", cap: "The gates, as run" } },

        { dash: [{ type: "kpi", w: 4, label: "Raw colour", value: "−124", note: "1,326 to 1,202 literals, all from boardUiTokens.ts" }, { type: "kpi", w: 4, label: "Contrast gate", value: "250/250", note: "Pairs meet WCAG 2.2 AA, up from 166 checked" }, { type: "kpi", w: 4, label: "Colour source", value: "1 file", note: "Replaces two that disagreed" }],
          statement: "Impact: raw colour is falling and contrast passes everywhere it is checked. The rest is not measured yet.",
          text: ["Only stage 1 is applied, so these are stage 1 numbers."],
          parts: [
            { title: "Not measured yet", statement: "Not measured yet: adoption, time saved and the look in a browser.",
              cards: [["Adoption", "490 raw buttons unchanged. Stages 2 to 4 not started."], ["Time saved", "No before and after yet."], ["In a browser", "Stage 1 not yet verified."]] },
            { title: "Learning", statement: "Learning: a rule a machine can check outlasts a guideline.",
              text: ["Once contrast became a failing check, two colours had to change: the filled blue and the muted gray. A system is useful in proportion to what it can refuse.", "Limits: the library owner is not yet named, and dark mode in Paper is a token prefix."] },
          ] },
      ],
    },
  },
  {
    name: "Gap 3D Fit", org: "Gap", area: "E-commerce · 3D fit · Web and iOS", tags: ["E-comm", "UX Design"],
    title: "Turning sizing uncertainty into a 61% add-to-bag decision.",
    desc: "Gap Inc. acquired Drapr for its 3D fit. When the web launch moved up and testers ran out, I argued against waiting, rebuilt the flow from live session data and shipped on time. An A/B test showed +61% add-to-bag.",
    seo: "Gap 3D Fit case study: as technical product designer at Drapr, acquired by Gap Inc., I redesigned 3D fit for web and iOS. An A/B test showed +61% add-to-bag.",
    metric: { value: "+61%", label: "Add-to-bag lift, A/B tested" }, thumb: { video: "/assets/images/gap/video-gap-quickfit.mp4", poster: "/assets/images/gap/video-gap-quickfit-poster.jpg", navPoster: "/assets/images/gap/video-gap-quickfit-poster.jpg", alt: "Product demo of the Old Navy QuickFit Finder: the product page, three short questions, the 3D avatar turning with Waist, Hips and Calf fit, Why this recommendation, and Add to bag, closing on a 61% add-to-bag lift", bleed: true, full: true }, slug: "gap-3d-fit", href: "/work/gap-3d-fit", tint: ["#5D7A9C", "#FEFBF2", "#002B5C"],
    cs: {
      meta: [["Role", "Technical Product Designer"], ["Timeline", "6 months"], ["Owned", "Flow, fit logic, 3D performance budget · Web, iOS"], ["Team", "Me, 2 PMs, 1 UXR"]],
      structure: ["Final Designs", "Overview", "What Existed Today", "Understanding Users", "Design Process", "Outcomes and Reflection"],
      sections: [
        { title: "Final Designs", statement: "Final design: ask little, then prove the size.",
          text: ["Each step either sharpens the avatar or lets the shopper verify the size."],
          mediaLayout: "stack",
          media: [{ demo: "gapQuickFit", alt: "Interactive prototype of the full flow. It starts on the Old Navy product page for High-Waisted Wow Wide-Leg Jeans, where a QuickFit Finder button opens the finder: (1 of 3) how tall are you, (2 of 3) what size do you usually wear, and (3 of 3) optional measurements with the numbers shown. The result shows a recommended size and length on a 3D avatar you can drag to rotate, with Waist, Hips and Calf fit descriptors, a Why this recommendation panel and Add to bag, which returns to the product page with that size selected.", cap: "Try it. The interactive prototype." }, { board: true, wide: true, src: "/assets/images/gap/board-decisions.webp", alt: "Annotated board of the final QuickFit flow in six numbered steps. 01 Entry where doubt peaks: QuickFit Finder sits just above Add to Bag on the product page and is optional. 02 Ask one thing first: height is the only upfront question and the avatar resizes when you pick one. 03 Start from a size they know: the usual size, from any brand, calibrates the body, and Next stays off until there is an answer. 04 Keep the numbers visible: measurements stay in inches beside each control. 05 Reasons on request: Why this recommendation is one tap and never forced open. 06 Say what fit feels like: Waist, Hips and Calf each get a plain word, and the question mark defines tight, fitted and loose.", cap: "Why each step is the way it is." }],
          quotes: { title: "What testers said", items: [
            { q: "Seeing the inches next to each control made me trust it more than guessing by eye.", tag: "Tested: numbers" },
            { q: "I opened 'Why this recommendation' out of curiosity. The size felt less random after.", tag: "Tested: reasons" },
            { q: "The ? told me what 'fitted' and 'loose' actually feel like.", tag: "Tested: fit words" },
          ] },
        },

        { title: "Overview", statement: "Overview: what if a 3D avatar could make shoppers trust a size, not only see it?",
          text: ["Gap Inc. acquired Drapr, a Y Combinator 3D-fit startup, in 2021 and called fit “the number one point of friction for customers.” I led the 3D Fit redesign over six months, with two PMs and a UX researcher."],
          cards: [["Problem", "The avatar showed fit. Shoppers still didn't believe the size."], ["The bet", "Less 3D realism, more reasons."], ["Result", "+61% add-to-bag, shipped on the earlier date."]],
          parts: [
            { title: "Initial Observations", statement: "Observations: the old flow showed fit. Shoppers still felt risk.",
              text: ["Denim made sizing harder: one size had to explain multiple body zones without turning checkout into a long form."],
              insight: ["Working hypothesis", "A 3D avatar shows fit, but shoppers buy on trust."] },
          ] },
        { title: "What Existed Today", statement: "Existing tools: charts, diagrams and recommendations gave numbers, not confidence.",
          mediaLayout: "ratio",
          media: [{ ar: 1.16, src: "/assets/images/gap/problem-size-chart.webp", alt: "Gap size guide for women's jeans, with women's regular, petite and tall tabs and a table of waist and hip measurements in inches for each size from XXXS to S.", cap: "Size chart: precise, silent on comfort." }, { ar: 0.562, src: "/assets/images/gap/problem-denim-fit.webp", alt: "Model in a white top and mid-wash jeans, with five numbered measurement lines marked on her body: two across the torso, one at the hip, one running down the leg and one at the hem.", cap: "Denim fit: five body zones at once." }, { ar: 1.04, src: "/assets/images/gap/problem-recommendations.webp", alt: "A \"Customers Also Purchased\" carousel on a Gap product page: wide-leg jeans at $44.99 and two pairs of denim shorts on sale, each with an add-to-bag button, plus previous and next arrows.", cap: "Recommendations: a size with no evidence." }], },
        { title: "Understanding Users", statement: "Users: online denim shoppers who needed a reason to believe a size.",
          text: ["In month one I tested with 50 online denim shoppers, using our UX researcher's methods. Once recruiting stopped, I read live sessions in Microsoft Clarity."],
          quotes: { title: "In their words", items: [
            { q: "A chart gives me a number. I still can't tell if the jeans will fit me.", tag: "Need: credible sizing" },
            { q: "If it just says size 8, I'm guessing. Tell me why it picked 8.", tag: "Need: evidence" },
            { q: "Ten questions and I'm gone. I'll order the size I always wear.", tag: "Need: little effort" },
          ] } },

        { title: "Design Process", statement: "Process: the web launch moved up, and there were no testers left.",
          text: ["Fifty tested users were all we had, and the new date left no time to recruit more. Management proposed holding the launch. I argued we could prove the design another way: sessions showed shoppers dropping off as the inputs piled up, before they saw any value."],
          board: { src: "/assets/images/gap/board-timeline.webp", alt: "A timeline in two phases, relative and not to scale. Phase one, testing as planned: user testing with 50 users ran for the first month. Then management changes and the launch date moves up. More testing is struck through because there were no testers, and holding the launch was proposed but did not happen. Instead I reviewed Microsoft Clarity sessions, formed a hypothesis and redesigned, showed management the data, and tested with a few new users, ending at the web launch.", cap: "Constraint and timeline. Dashed bars were planned or proposed and did not happen." },
          insight: ["The bet", "Live session data could stand in for the testers we did not have."],
          parts: [
            { title: "Design decisions", statement: "Decisions: four layouts, one 3D viewer, and why each lost.",
              text: ["I held the 3D viewer constant and changed only how the flow asks for input. Each layout is scored against the three limits. Figures for the alternatives are illustrative; the 61% lift is measured."], board: { src: "/assets/images/gap/board-variations.webp", alt: "Five QuickFit layouts around the same 3D viewer, with illustrative figures. A, one long form: ten fields before any value; 38% completed, 94 seconds, size confidence 3.1 of 5; not selected. B, measurements first: most people do not know their waist or hips, so they guessed or stopped; 46% completed, 71 seconds, confidence 3.4; not selected. C, average body first: fastest at 82% completed and 18 seconds, but the body was not theirs and confidence was lowest at 2.6; not selected. D, a tight-to-loose slider on the 3D model: fit comes from the size, not a preference, so it promised looks the product cannot deliver; 58% completed, 63 seconds, confidence 3.5; not selected. E, three short steps, selected: 71% completed, 34 seconds, confidence 4.3, and a measured 61% lift in add-to-bag in the A/B test. Each layout is also scored against the three limits, too many inputs, too much rationale and too much fidelity (accuracy vs completion rate, explainability vs purchase velocity, fit fidelity vs mobile performance): A, B and D miss all three; C partly meets limits 1 and 3 and misses 2; E meets all three.", cap: "Four alternatives and the selected flow, each scored against the three limits. Dashed bars are illustrative, not measured." } },
          ] },

        { title: "Outcomes and Reflection", statement: "Outcome: an A/B test showed a 61% lift in add-to-bag.",
          dash: [{ type: "kpi", w: 12, label: "Add-to-bag", value: "+61%", chip: "A/B test", note: "New flow against the old flow" }],
          text: ["Shipped on the earlier date. The lift came from less sizing ambiguity, not more 3D realism."],
          parts: [
        { title: "Reflection", statement: "Reflection: I changed my mind about the job of 3D.",
          text: ["The visual was not the product. Confidence was.", "When testers run out, the product already holds the evidence."],
          cta: { label: "Book a call", href: BOOK_A_CALL } },
          ] },
      ],
    },
  },
  {
    name: "CotonAI Agent", org: "CotonAI", area: "Agent UX · Creative tools", tags: ["AI Agents", "0→1 Product"],
    title: "Designing an AI agent that understands how creative teams work.",
    desc: "Founding product designer at CotonAI: moving from an image generator to an agent that carries creative intent across the whole workflow.",
    seo: "CotonAI Agent case study: as founding product designer, I moved an image generator to an AI agent that carries creative intent across the fashion workflow.",
    metric: { value: "71%", label: "First-pass acceptance in the Steele pilot" }, thumb: { video: "/assets/images/cotonai/video-cotonai-agent.mp4", poster: "/assets/images/cotonai/video-cotonai-agent-poster.jpg", alt: "CotonAI Agent walkthrough: asking the agent about a board, selection and brand memory", navPoster: "/assets/images/cotonai/video-cotonai-agent-poster.jpg", bleed: true }, slug: "cotonai-agent", href: "/work/cotonai-agent", tint: ["#9CB09E", "#E3EAE0", "#C9D5C8"],
    cs: {
      meta: [["Role", "Founding Product Designer"], ["Timeline", "2025 – Present"], ["Scope", "Product strategy, user research, interaction design, agent UX, design systems"], ["Focus", "0→1 product design, human–AI interaction, creative tools"]],
      sections: [
        { title: "Overview / Background", statement: "Overview: from an image generator to an agent that remembers the brief.",
          text: ["As founding product designer at CotonAI, I owned product strategy as well as design. The question I kept bringing back to the team wasn't \u201chow do we generate better images?\u201d but \u201cwhy does every prompt start from zero?\u201d",
            "This is how that question moved CotonAI from a visual workspace toward an agent that carries creative intent across a whole collection."],
          cards: [["Problem: Every prompt started over.", "The AI forgot why a colour was rejected or which silhouette was approved."], ["Solution: The canvas is the context.", "An agent that plans, executes and returns work to the canvas, with designers approving each step."], ["Outcome: 71% first-pass", "Designs accepted without a revision in the Steele pilot."]] },
        { title: "Defining the Problem", media: [{ diagram: { kind: "merge", title: "Before CotonAI", inputs: ["Moodboards", "Spreadsheets", "Image generators", "Review threads"], output: "One collection", note: "Designers spent hours moving between them." } }], statement: "Problem: we didn't need another AI image generator.",
          text: ["The real problem wasn't creating an image. It was everything that happened before and after it. A designer could generate 20 variations in minutes, but the AI wouldn't remember why a color was rejected or which silhouette was approved. Every new prompt felt like starting over."],
          cards: [["No memory of decisions", "Rejected colors and approved silhouettes were lost between prompts."], ["Context scattered across tools", "References, material constraints, brand identity and feedback lived in different places."]] },
        { title: "Understanding your Users", statement: "Users: fashion teams ran on invisible context that no prompt could carry.",
          text: ["Working with fashion brands and production teams, we saw how much creative work depended on invisible context that no prompt could carry."], board: { src: "/assets/images/cotonai/board-context.webp", alt: "Reference images, material constraints, brand identity, previous decisions and feedback all feed one idea: the canvas becomes the context, so an agent works from the board, the selection, brand and memory and remembers the brief, including why a color was rejected and which silhouette was approved.", cap: "The invisible context behind a collection" } },

        { title: "Your Role and Responsibilities", statement: "Role: founding product designer, owning product strategy as well as design.",
          text: ["As founding product designer, I carried product strategy alongside design. The question I kept bringing back to the team was why every prompt starts from zero."],
          cards: [["Founding Product Designer", "2025 to present."], ["Owned", "Product strategy as well as design."], ["Scope", "Product strategy, user research, interaction design, agent UX and design systems."]] },

        { title: "Scope and Constraints", statement: "Constraints: the workspace is live, the agent is a proposal, and the designer stays in control.",
          text: ["The live workspace is the foundation. Persistent creative memory, multi-step orchestration and richer agent controls are the next product direction, so this study keeps what ran in the pilot apart from what is proposed."], board: { src: "/assets/images/cotonai/board-status.webp", alt: "Live: the collaborative workspace, where designers sketch, generate, edit, explore colorways and review together on a shared canvas, and where every pilot outcome comes from. Proposed: the agent architecture, with persistent creative memory, multi-step orchestration and richer agent controls. Designers stay creative directors, because autonomy is useful until an agent makes the wrong creative decision.", cap: "What is live, and what is proposed" },
           },

        { title: "Ideation Steps (The Solution)", statement: "Solution: the canvas becomes the context, and the agent works inside it.",
          text: ["We started CotonAI as a collaborative visual workspace where designers could sketch, generate, edit, explore colorways and review work together on a shared canvas. The bigger opportunity emerged from those workflows: the canvas shouldn't just hold the work. It should become the context through which an agent understands the work."],
          media: [{ diagram: { kind: "flow", title: "One shared canvas", nodes: ["Sketch", "Generate", "Edit", "Colourway", "Review"] } }, { diagram: { kind: "merge", title: "Canvas as context", inputs: ["Selected region", "Annotation", "Reference"], output: "Agent", note: "An image, sketch, annotation or selected region communicates intent." } }],
          parts: [
        { title: "Rejected designs", statement: "Rejected: three directions we didn't ship.",
          text: ["Each of these was a simpler way to put AI in the workflow. Each lost the context, the continuity or the control that the shipped agent keeps."],
          mediaLayout: "stack", media: [
            { wide: true, src: "/assets/images/cotonai/rejected-prompt.webp", alt: "Rejected A: a prompt-only chat where the designer types a long description of a linen midi dress, gets four images, then has to correct it with \"No, the sage from the March board\". Why it failed: intent had to be typed out instead of shown with a sketch or reference; every prompt started over, so the AI forgot which colour was rejected and which silhouette was approved; and outputs sat in a chat log away from the board the team reviewed. What shipped: context before conversation, where a selected region, sketch or reference carries the intent.", cap: "A: describing everything in a prompt" },
            { wide: true, src: "/assets/images/cotonai/rejected-oneshot.webp", alt: "Rejected B: a generator that returns a grid of 20 variations with only Download and Regenerate buttons and a done label. Why it failed: twenty images with no plan tying them to the brief or the collection; download and regenerate pushed work back into scattered tools; and the tool ended at one batch although a creative task rarely ends with one image. What shipped: execution, not just generation, where the agent plans steps and returns outputs to the canvas.", cap: "B: a generator that stops at one batch" },
            { wide: true, src: "/assets/images/cotonai/rejected-autopilot.webp", alt: "Rejected C: an agent panel that takes \"Refresh the spring line in the new palette\", shows only working, then reports Done, applied 9 changes to the board. Why it failed: one wrong creative decision hit the whole board; progress was a spinner, so designers could not see or stop the work; and changes landed with no version comparison or approval point. What shipped: visible progress, version comparison and approval checkpoints, so designers stay creative directors.", cap: "C: an agent on autopilot" }] },

        { title: "Solution", statement: "Solution: three product decisions for the agent experience.",
          ui: { kind: "trio", cards: [{ t: "Show the agent what you're working on", chips: ["Sketch", "Annotation", "Canvas region"], hi: 2, d: "An image, sketch, annotation or selected region communicates intent, so you don't have to describe it." }, { t: "Execution, not just generation", chips: ["Plan", "Execute", "Review"], hi: 1, d: "The agent plans steps, selects tools, generates alternatives and returns outputs to the canvas." }, { t: "Humans stay creative directors", chips: ["Compare versions", "Approve"], hi: 1, d: "Visible progress, contextual feedback and approval checkpoints keep creative judgment with the designer." }] },
          media: [{ video: "/assets/images/cotonai/video-cotonai-agent.mp4", poster: "/assets/images/cotonai/video-cotonai-agent-poster.jpg", alt: "The same walkthrough in context: the agent panel beside the canvas, answering with the board, the selection, brand and memory as context", cap: "The agent panel beside the canvas, using board, selection, brand and memory context." }],
          text: ["The proposed workflow became a loop the agent runs with the designer. The design challenge was making complex execution feel understandable, without exposing unnecessary technical complexity."], board: { src: "/assets/images/cotonai/board-loop.webp", alt: "The loop the agent runs with the designer: understand context, plan, execute, review, refine, remember. Designers approve each step, with visible progress, contextual feedback, version comparison and approval checkpoints keeping the agent understandable, controllable and useful inside real work.", cap: "The agent loop, with the designer in it" },
          trades: [
            { n: "Decision 1", t: "Context before conversation", rows: [["Before", "Designers had to explain everything through prompts."], ["Change", "An image, sketch, annotation, garment reference or selected canvas region can communicate intent."], ["Result", "From “describe exactly what you want” to “show the agent what you're working on.”"]] },
            { n: "Decision 2", t: "Execution, not just generation", rows: [["Before", "A creative task rarely ends with one image, but the tool did."], ["Change", "A harness for managing context, planning steps, selecting tools, generating alternatives and returning outputs to the canvas."], ["Result", "Multi-step work that stays understandable."]] },
            { n: "Decision 3", t: "Humans remain creative directors", rows: [["Risk", "Autonomy is useful until an agent makes the wrong creative decision."], ["Change", "Visible progress, contextual feedback, version comparison and approval checkpoints."], ["Result", "The agent handles repetitive execution. The designer keeps creative judgment."]] },
          ] },
          ] },

        { title: "Outcomes and Takeaways", dash: [{ type: "kpi", w: 4, label: "AI-assisted designs", value: "140+", note: "Steele pilot" }, { type: "kpi", w: 4, label: "Review comments", value: "188", note: "Left by teams on the shared canvas" }, { type: "donut", w: 4, label: "First-pass acceptance", value: "71%", pct: 71, note: "Designs accepted without a revision, Steele pilot" }, { type: "bars", w: 6, label: "Revisions per design", value: "3–5 → 1–2", chip: "Typical", rows: [["Before", 4, "3–5"], ["With CotonAI", 1.5, "1–2"]], note: "Typical revisions in the Steele pilot. Bars sit at the midpoint of each range." }, { type: "kpi", w: 6, label: "Visual assets per month", value: "~5,000", note: "Workflows supported through CreateNet" }],
          statement: "Outcome: early pilot outcomes validated the collaborative workflow.",
          text: ["These are early workspace and pilot outcomes, not evidence that the proposed autonomous agent architecture has already achieved the same results."],
          parts: [
        { title: "Learning", statement: "Learning: make intelligence understandable, controllable and useful inside real work.",
          text: ["The hardest part of designing AI products isn't making intelligence more powerful. It's making it understandable, controllable and useful inside real work.", "The live workspace established the foundation. Persistent creative memory, multi-step orchestration and richer agent controls are the next product direction: moving from AI that generates creative outputs toward AI that helps teams carry creative intent across an entire workflow."],
          quote: "That's the design problem I'm most interested in solving.", quoteBy: "Sambit Nayak" },
          ] },
      ],
    },
  },
  {
    name: "Gatherly", org: "Agency client", area: "Events · Mobile app · iOS", tags: ["Mobile", "UI/UX Design"],
    title: "Designing Gatherly, an events app, from brief to shipped MVP in three months.",
    desc: "An independent project for an agency: the UI and UX of an app to find events, get tickets and host your own, from a brief inspired by Airbnb. The MVP shipped.",
    seo: "Gatherly case study: an independent UI/UX design project for an agency, an events app for discovery, tickets and hosting, designed in three months from an Airbnb-inspired brief. The MVP shipped.",
    metric: { value: "3 mo", label: "From brief to a shipped MVP" }, thumbnail: { src: "/assets/images/gatherly/thumb-dark-home.webp", alt: "The Gatherly home screen in dark mode on a phone: a Find an event search bar, filter tabs, and Popular in San Francisco event cards for a rooftop sunset session and a founders breakfast.", bleed: true, full: true, hero: true }, slug: "gatherly", href: "/work/gatherly", tint: ["#7A5AF8", "#EEE8FF", "#6D4AFF"],
    cs: {
      meta: [["Role", "UI/UX Designer"], ["Timeline", "3 months"], ["Client", "An agency · independent project"], ["Shipped", "MVP · iOS, light and dark"]],
      layout: "tiles",
      structure: ["Final Designs", "Brief", "Key flows", "Design system", "Outcome"],
      sections: [
        { title: "Final Designs", statement: "Final designs: find an event, get a ticket, host your own.",
          tiles: [
            { span: 12, bg: "violet", cap: "Guest", shots: [{ src: "/assets/images/gatherly/l-explore.webp", alt: "Gatherly Explore: search bar, filter chips and event cards." }, { src: "/assets/images/gatherly/l-event.webp", alt: "Gatherly Event page for Rooftop Sunset Sessions." }, { src: "/assets/images/gatherly/l-tickets.webp", alt: "Gatherly Tickets list." }] },
            { span: 6, bg: "ink", cap: "Dark mode", shots: [{ src: "/assets/images/gatherly/d-explore.webp", alt: "Gatherly Explore in dark mode." }, { src: "/assets/images/gatherly/d-event.webp", alt: "Gatherly Event page in dark mode." }] },
            { span: 6, bg: "lilac", cap: "Host", shots: [{ src: "/assets/images/gatherly/l-host.webp", alt: "Gatherly Host dashboard: 214 registered, 86 spots left, $5.3k revenue, guest list and Scan tickets button." }, { src: "/assets/images/gatherly/l-payouts.webp", alt: "Gatherly Payouts." }] },
            { span: 12, bg: "canvas", cap: "Discover", shots: [{ src: "/assets/images/gatherly/l-search.webp", alt: "Gatherly Search." }, { src: "/assets/images/gatherly/l-filters.webp", alt: "Gatherly Filters." }, { src: "/assets/images/gatherly/l-calendar.webp", alt: "Gatherly Calendar of followed hosts." }] },
          ] },
        { title: "Brief", statement: "Brief: an events app in the spirit of Airbnb, designed in three months.",
          stats: [["3 mo", "Brief to shipped MVP"], ["47", "Screens"], ["2", "Themes, light and dark"]],
          cards: [["Independent project", "Designed for an agency"], ["Inspired by Airbnb", "The brief's reference point"], ["MVP", "Shipped"]] },
        { title: "Key flows", statement: "Flows: four journeys cover the whole product.",
          tiles: [
            { span: 12, bg: "canvas", cap: "Discover", shots: [{ src: "/assets/images/gatherly/l-search.webp", alt: "Gatherly Search." }, { src: "/assets/images/gatherly/l-filters.webp", alt: "Gatherly Filters." }, { src: "/assets/images/gatherly/l-city.webp", alt: "Gatherly City picker." }, { src: "/assets/images/gatherly/l-calendar.webp", alt: "Gatherly Calendar of followed hosts." }] },
            { span: 12, bg: "violet", cap: "Register and event day", shots: [{ src: "/assets/images/gatherly/l-register.webp", alt: "Gatherly Register: request to join with date, guests, total and payment." }, { src: "/assets/images/gatherly/l-confirmed.webp", alt: "Gatherly Registration confirmed." }, { src: "/assets/images/gatherly/l-ticket.webp", alt: "Gatherly Ticket with QR code." }, { src: "/assets/images/gatherly/l-live.webp", alt: "Gatherly iOS Live Activity on event day." }] },
            { span: 12, bg: "ink", cap: "Connect", shots: [{ src: "/assets/images/gatherly/l-messages.webp", alt: "Gatherly Messages." }, { src: "/assets/images/gatherly/l-eventchat.webp", alt: "Gatherly Event chat." }, { src: "/assets/images/gatherly/l-notifications.webp", alt: "Gatherly Notifications." }, { src: "/assets/images/gatherly/l-chat.webp", alt: "Gatherly Chat with a host." }] },
            { span: 6, bg: "lilac", cap: "Host: create", shots: [{ src: "/assets/images/gatherly/l-create.webp", alt: "Gatherly Create event." }, { src: "/assets/images/gatherly/l-create-tickets.webp", alt: "Gatherly Create event: tickets step." }] },
            { span: 6, bg: "canvas", cap: "Host: event day", shots: [{ src: "/assets/images/gatherly/l-scanner.webp", alt: "Gatherly Check-in scanner." }, { src: "/assets/images/gatherly/l-analytics.webp", alt: "Gatherly Analytics." }] },
          ] },
        { title: "Design system", statement: "System: one token set drives light and dark.",
          tiles: [
            { span: 12, fill: true, src: "/assets/images/gatherly/ds-color.webp", alt: "Gatherly design system, colour: light and dark neutrals, the violet brand scale and success, warning and danger colours.", cap: "Colour tokens" },
            { span: 12, fill: true, src: "/assets/images/gatherly/ds-components.webp", alt: "Gatherly design system, cards, lists and navigation in light and dark.", cap: "Cards, lists and navigation" },
          ] },
        { title: "Outcome", statement: "Outcome: the MVP shipped.",
          text: ["Three months from brief to a shipped MVP, in light and dark."],
          cta: { label: "Book a call", href: BOOK_A_CALL } },
      ],
    },
  },
  {
    name: "Arcade.dev", org: "Arcade.dev", area: "Agent infrastructure", tags: ["Dev tools", "AI agents"],
    title: "Arcade.dev: a web console and an iOS app for running agents with confidence.",
    desc: "Two UX case studies for Arcade.dev, an agent runtime: a web console redesigned around first success, then trust, then control, and an iOS app to approve, debug and cap spend from the phone.",
    seo: "Arcade.dev UX case studies: a web console for an agent runtime and an iOS companion app, covering first-call onboarding, approvals, status language, cost visibility and a design system.",
    metric: { value: "100", label: "Screens across the web console and the iOS app" }, thumbnail: { src: "/assets/images/arcade-dev/thumbnail.jpg", alt: "Three Arcade.dev screens stacked at an angle: the Playground with an Authorize GitHub card in front, the dashboard Authorize GitHub next step behind it, and the policy approval queue at the back", bleed: true, full: true, hero: true }, slug: "arcade-dev", href: "/work/arcade-dev", tint: ["#F3B7A3", "#FFE3D8", "#FFF6F2"], accent: "#E34927",
    cs: {
      layout: "tiles",
      variants: [
        { key: "web", label: "Web console", lead: "Arcade console. Run agents with confidence. The engine was there; the story wasn’t. I redesigned the console around three things, in order: first success. Then trust. Then control.",
          meta: [["Role", "Product designer"], ["Scope", "Web console, design system"], ["Delivered", "54 screens across six flows, tokens, status language"], ["Status", "Design concept, not yet user-tested"], ["Tools", "Paper"]],
          structure: ["Background", "My role", "The challenge", "Critical journeys", "First call", "Status language", "Govern", "Cost", "Design system", "Outcome"],
          sections: [
            { title: "Background", statement: "Background: A great engine. A console that hides it.", text: ["Arcade sits between AI agents and the systems they work in. It authorizes as the user, runs tools, and logs every call. The public prototype and docs covered setup well. The real dashboards sit behind a login, so I designed from the prototype, the docs and public feedback."] },
            { title: "My role", statement: "My role: Research. Flows. System.", cards: [["Research and framing", "Docs, prototype and public feedback turned into a gap list."], ["Flows and screens", "Six flows, every state: empty, error, blocked, conflict."], ["Design system", "Tokens, status language, verbs and nouns, agent icons."]] },
            { title: "The challenge", statement: "The challenge: Day one needs a win. Day ninety needs control.", text: ["The same console serves a developer on day one and a security lead on day ninety. The first needs a working call in minutes. The second needs approvals, rules she can test, and an audit trail. Showing both at once buries both."] },
            { title: "Critical journeys", statement: "Critical journeys: Get the highlights. Four moments, in the order people need them.", stepsTitle: "The four journeys", steps: [["Make a first call", "Role fork, Quickstart, detected first call."], ["Find why a run failed", "From a failed run to the cause and the fix."], ["Share tools by gateway", "Pick tools, create, connect a client."], ["Govern what agents do", "Draft rules, simulate, approve."]] },
            { title: "First call", statement: "First call: Lead with value. Reveal the rest.", text: ["The console starts with a role fork and a Quickstart that detects the first call. Navigation grows as you do: Governance unlocks after the first successful call. The dashboard then answers one question first: what needs me?"], media: [{ demo: "arcadeFeatures", set: "first-call", alt: "Feature explorer. Use the toggle to switch between four first-run screens: Role fork, Quickstart, First call detected and Empty dashboard." }, { demo: "arcadeDash", alt: "Interactive Arcade web dashboard. Hover or touch the Tool calls chart to scrub a crosshair through the days and read each count against the previous period, switch the range between one week, one month and three months, hover the outcomes bar, the top tools and the weekday and time-of-day grid to read them out.", cap: "Live: move across the charts. Scrub the Tool calls line, switch 1W, 1M or 3M, and hover outcomes, tools and the run-time grid." }] },
            { title: "Status language", statement: "Status language: One color, one meaning. Never decoration.", text: ["One data hue plus gray for charts. Status colors only when they carry meaning, always with an icon and a label. The same tokens run the console and the phone, so a held call looks the same everywhere. Verbs are fixed too: Authorize, Review, Retry, Replay."], tiles: [{ span: 12, fill: true, src: "/assets/images/arcade-dev/web-status.webp", alt: "Three status notes: three states with three tints, each with an icon and a word; one coral action per screen with Face ID for loosening a rule; one data hue and gray for every chart." }] },
            { title: "Govern", statement: "Govern: Test every rule. Before it goes live.", text: ["Policies are edited as drafts, simulated against live rules and the last seven days, and blocked from publishing while they conflict. The approval queue ranks what needs a person, with bulk review for the dull cases. Approvals are the part the public docs do not cover, so it got the most care."], media: [{ demo: "arcadeApprovals", alt: "Arcade approval queue: tool calls waiting for a person, with a held Slack post to #support-escalations, the rule that blocked it, the approvers, and a coral Approve and run action.", cap: "Live: the Approval queue, as designed. Pending tool calls on the left, the held call and its reason on the right." }, { demo: "arcadeFeatures", set: "govern", alt: "Feature explorer. Use the toggle to switch between three policy screens: Simulator, Rule conflict and Replay results." }] },
            { title: "Cost", statement: "Cost: Per-call pricing. Meet the speedometer.", text: ["Public feedback pointed at cost as the likeliest surprise. Usage and budget shows spend against a budget, the pace to month end, and the agent running hot, with a cap one click away. At the limit, new calls are held, not dropped."], media: [{ demo: "arcadeUsage", alt: "Arcade usage and budget: November spend against budget, the projected pace to month end, calls per day, and spend by agent with a cap control.", cap: "Live: scrub the Spend per day line, switch Month or Quarter, and hover the budget bar and each agent's share." }] },
            { title: "Design system", statement: "The design system: One language. Fifty-four screens.", text: ["Dark graphite surfaces, one coral action per view, Inter for the interface and a mono face for code. Fixed verbs and nouns, status pills with icons and labels, brand marks on white tiles. Built as tokens first so the console, the phone and the code can share them."], tiles: [{ span: 12, fill: true, src: "/assets/images/arcade-dev/web-system.webp", alt: "Arcade design system board: the shell, the status language, brand marks on white tiles, and the rules that keep screens consistent." }] },
            { title: "Outcome", statement: "Outcome: Built to change four things. Proven on none, yet.", text: ["A design concept, so these are targets to measure, not results. Nothing has been tested with users yet, and numbers on screens are placeholders.", "To test: how fast new workspaces reach a detected call, how often the simulator catches a rule mistake before it is published, and whether the 80% warning prevents bill surprises and held-call confusion."], stats: [["5 min", "To a first successful call"], ["0", "Rules published in conflict"], ["80%", "Warned before it is a bill"]] },
          ] },
        { key: "mobile", label: "iOS app", lead: "Arcade for iOS. Agents work on. So can you. An iPhone companion to approve changes, find what broke, and cap spend, from anywhere.",
          meta: [["Role", "Product designer"], ["Scope", "iOS app, agent icons, prototype"], ["Delivered", "46 screens, 11 flows, clickable iPhone prototype"], ["Status", "Design concept, not yet user-tested"], ["Tools", "Paper"]],
          structure: ["Background", "My role", "The challenge", "Critical journeys", "Put the phone to work", "Make cost visible", "One ring, five gestures", "The design system", "Outcome"],
          sections: [
            { title: "Background", statement: "Background: The agent works. You’re away from the desk.", text: ["Arcade runs agents that act in Slack, GitHub and Salesforce on a person's behalf. When one is held for approval or a login expires, the person is often not at a laptop. The docs and public prototype said nothing about mobile, so I worked from the console's flows and public feedback to decide what belongs on the phone."], tiles: [{ span: 12, fill: true, src: "/assets/images/arcade-dev/mob-inbox.webp", alt: "Four Arcade iPhone screens: the Inbox with Needs you, Held, Agents and Accounts, the Needs you list with a proposed rule change and an expired login, the review screen with Approve with Face ID, and the voice sheet hearing add GitHub and Slack to a new gateway." }] },
            { title: "My role", statement: "My role: Research. Flows. System. Prototype.", cards: [["Research and framing", "Read the docs, the prototype and public feedback. Wrote the gaps down as a to-do list I could design against."], ["Flows and screens", "Mapped eleven mobile flows, then designed every screen and state in Paper."], ["System and prototype", "Built tokens, status language and agent icons, then a clickable iPhone prototype of the whole app."]] },
            { title: "The challenge", statement: "The challenge: Control that feels quick. And calm.", text: ["Approvals were missing from the docs, nothing was designed for someone away from a laptop, and per-call pricing made cost a likely surprise. The phone had to answer three questions fast: what needs me, what broke, and what is it costing?"] },
            { title: "Critical journeys", statement: "Critical journeys: Four moments. Trust is decided in each.", text: ["I started from what a person is trying to do on a small screen, not from the console's feature list. Each journey got its own flow and success measure."], stepsTitle: "The four journeys", steps: [["Pair and protect", "Pair with the console, turn on Face ID and notifications."], ["Find why a run failed", "From a failed run to the cause and the fix, on one screen."], ["Decide when alerted", "A push arrives. Read what would change, approve with Face ID."], ["Control what agents can do", "Pause everything or cap spend in one tap."]], tiles: [{ span: 12, fill: true, src: "/assets/images/arcade-dev/mock-review.webp", alt: "An iPhone showing the Arcade review screen: Allow #support-escalations for Support Agent, the rule change as a diff, 4 of 1,284 calls would change, and a coral Approve with Face ID button." }] },
            { title: "Put the phone to work", statement: "Put the phone to work: No laptop? Still in charge.", text: ["The phone is not a shrunken console. It is an Inbox: what needs you, what is held, what broke. Chat is the main surface, answers come back as one fitting chart, and anything that loosens a rule needs Face ID. When a job needs a big screen, it hands off to the laptop."], tiles: [{ span: 12, fill: true, src: "/assets/images/arcade-dev/mob-trace.webp", alt: "Four Arcade iPhone screens: gateway ready, a run explained with the rule that held it, a lock screen alert, and failures grouped by cause." }, { span: 12, fill: true, src: "/assets/images/arcade-dev/mock-alert.webp", alt: "Close-up of an iPhone lock screen with two Arcade notifications: Needs your OK, allow #support-escalations for Support Agent with Review and Not now buttons, and Salesforce authorization expired, 5 runs are blocked for Jordan." }] },
            { title: "Make cost visible", statement: "Cost: Per-call pricing. Meet the speedometer.", text: ["Public feedback pointed at cost as the likeliest surprise. Spend shows the budget, the pace to month end and the agent running hot, with a cap one tap away. At the limit, new calls are held, not dropped."], tiles: [{ span: 12, fill: true, src: "/assets/images/arcade-dev/mob-spend.webp", alt: "Four Arcade iPhone screens: spend against budget, spend by agent, setting a budget, and the budget reached state." }] },
            { title: "One ring, five gestures", statement: "One ring, five gestures: Agents get faces. Lists read at a glance.", text: ["Letter tiles all looked alike. Each agent now has its own mark: one ring, one gesture. A split ring for triage, antennae for bugs, a turning arrow for updates, a tray for the inbox, a gradient spark for Arcade's own agent."], tiles: [{ span: 12, fill: true, src: "/assets/images/arcade-dev/mob-icons.webp", alt: "Five agent marks, each a ring with its own gesture: a split ring for triage, antennae for bugs, a turning arrow for updates, a tray for the inbox, and a gradient spark for the Arcade agent." }] },
            { title: "The design system", statement: "The design system: Airy. Dark. One action at a time.", text: ["The phone shares tokens with the console but spends them differently: 24 pt margins, large titles, rows without boxes, and a single coral button per screen. Every tap target is at least 44 pt, and sheets use the iOS grabber and corner radius."], tiles: [{ span: 12, fill: true, src: "/assets/images/arcade-dev/mob-system.webp", alt: "Arcade iOS design system board: color tokens, type and spacing, and component rules such as a two-line row without a box at 44 pt tall." }] },
            { title: "Outcome", statement: "Outcome: Built to change four things. Proven on none, yet.", text: ["This is a design concept, so these are targets I would measure, not results. Nothing here has been tested with users yet, and sample numbers on screens are placeholders.", "To test: where people drop off while pairing, how long it takes to decide from a push and how often people ask a question first, and whether the 80% warning, with new calls held and not dropped, prevents bill surprises."], stats: [["2 min", "To pair and protect the phone"], ["1 tap", "From alert to decision"], ["80%", "Warned before it is a bill"]] },
          ] },
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
    if (p.thumbnail.full) el.classList.add("case__tile--full");
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
    if (p.thumb.full) el.classList.add("case__tile--full");
    if (small) { const img = document.createElement("img"); img.className = "case__img"; img.src = p.thumb.navPoster || p.thumb.poster; img.alt = p.thumb.alt; el.appendChild(img); return; }
    const v = document.createElement("video");
    v.className = "case__vid"; v.muted = true; v.loop = true; v.playsInline = true; v.preload = "none"; v.poster = p.thumb.poster; v.setAttribute("aria-label", p.thumb.alt);
    const src = document.createElement("source"); src.src = p.thumb.video; src.type = "video/mp4"; v.appendChild(src);
    autoVideo(v, 0.4);
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
const DISPLAY_ORDER = ["CotonAI Modes", "CotonAI Agent", "CotonAI Design System", "Arcade.dev", "Gatherly", "Gap 3D Fit", "Trailhead Solve"];
const DISPLAY_PROJECTS = PROJECTS
  .filter((p) => DISPLAY_ORDER.includes(p.name))
  .sort((a, b) => DISPLAY_ORDER.indexOf(a.name) - DISPLAY_ORDER.indexOf(b.name));
const displayIndexOf = (p) => PROJECTS.indexOf(p);
document.querySelectorAll("[data-work-count]").forEach((el) => (el.textContent = pad(DISPLAY_PROJECTS.length)));

const list = document.querySelector(".cards");
// CotonAI's studies sit together as one row of three locked cards; their case ids stay tied to PROJECTS order
const LOCK_SVG = '<svg class="lockcard__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><g class="lockcard__shackle"><path d="M8 10V7.5a4 4 0 0 1 8 0V10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></g><rect x="5" y="10" width="14" height="10" rx="2.5" fill="currentColor"/><circle cx="12" cy="15" r="1.3" fill="var(--lock-dot, #fff)"/></svg>';
let lockGroup = null;
// What each project is filed under. date = when the work last moved (drives "Recent").
const WORK_META = {
  "Trailhead Solve": { sectors: ["Enterprise", "AI agents"], featured: false, date: "2026-04" },
  "CotonAI Modes": { sectors: ["Fashion & retail", "AI agents"], featured: true, date: "2026-10" },
  "CotonAI Design System": { sectors: ["Fashion & retail"], featured: true, date: "2026-10" },
  "Gap 3D Fit": { sectors: ["Fashion & retail"], featured: true, date: "2025-07" },
  "Gatherly": { sectors: ["Events & social"], featured: true, date: "2026-11" },
  "Arcade.dev": { sectors: ["Dev tools", "AI agents"], featured: true, date: "2026-11" },
  "CotonAI Agent": { sectors: ["Fashion & retail", "AI agents"], featured: true, date: "2026-10" },
};
// The caption under every tile, in the style of rachelchen.tech: project name / category and year
const makeCap = (p) => {
  const c = document.createElement("p"), m = WORK_META[p.name];
  c.className = "case__cap";
  const n = document.createElement("strong"), s = document.createElement("i"), t = document.createElement("span");
  n.textContent = p.name; s.textContent = "/"; s.setAttribute("aria-hidden", "true");
  t.textContent = [p.area.split(" · ")[0], m && m.date.slice(0, 4)].filter(Boolean).join(" ");
  c.append(n, s, t);
  return c;
};
const units = [];
if (list) DISPLAY_PROJECTS.forEach((p, displayI) => {
  const i = displayIndexOf(p);
  if (p.org === "CotonAI" && p.name !== "CotonAI Design System") {   // the design system study is open to everyone, so it is a normal card
    if (!lockGroup) {
      lockGroup = document.createElement("li");
      lockGroup.className = "case case--locked";
      const ids = DISPLAY_PROJECTS.map((q, k) => (q.org === "CotonAI" && q.name !== "CotonAI Design System" ? pad(k + 1) : null)).filter(Boolean).join(" · ");
      lockGroup.innerHTML = `<div class="case__label"><span class="card__index">Case studies ( ${ids} )</span><span class="case__client">CotonAI</span><span class="case__year">Passcode protected</span></div><ul class="lockgrid" role="list"></ul>`;
      list.appendChild(lockGroup);
      units.push({ li: lockGroup, group: true, members: [], ids });
    }
    let open = false; try { open = sessionStorage.getItem("samfolio-unlocked") === "1"; } catch {}
    const item = document.createElement("li");
    item.innerHTML = `<a class="lockcard${open ? " is-open" : ""}"><ul class="case__tags" role="list"></ul><div class="case__tile lockcard__tile"><img class="lockcard__img" alt="" loading="lazy" decoding="async"><span class="lockcard__badge">${LOCK_SVG}</span></div><span class="card__index">Case study ( ${pad(displayI + 1)} )</span><span class="case__kind lockcard__kind"></span><h3 class="lockcard__title"></h3><p class="card__desc lockcard__desc"></p><span class="case__cta">${open ? "View case study" : "Enter passcode"} <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"/></svg></span></a>`;
    const a = item.querySelector("a"), tile = item.querySelector(".case__tile"), img = tile.querySelector("img");
    if (p.thumb && p.thumb.video) {
      const v = document.createElement("video");
      v.className = "lockcard__vid"; v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.preload = "metadata"; v.poster = p.thumb.poster || "";
      v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-label", p.thumb.alt || p.name);
      const src = document.createElement("source"); src.src = p.thumb.video; src.type = "video/mp4"; v.appendChild(src);
      img.replaceWith(v);
      autoVideo(v, 0.25);
    } else {
      const th = p.thumbnail ? p.thumbnail.src : p.thumb && p.thumb.poster; if (th) { img.src = th; if (p.thumbnail && p.thumbnail.fit === "contain") tile.classList.add("lockcard__tile--contain"); } else { img.remove(); if (p.photo) tile.style.background = `url("${p.photo.src}") ${p.photo.pos} / cover`; }
    }
    a.appendChild(makeCap(p));
    a.href = p.href; p.tint.forEach((c, k) => tile.style.setProperty(`--t${k + 1}`, c));
    a.setAttribute("aria-label", `${p.name}, passcode protected case study`);
    item.querySelector(".lockcard__title").textContent = p.name;
    item.querySelector(".lockcard__kind").textContent = `${p.org} · ${p.area}`;
    item.querySelector(".lockcard__desc").textContent = p.desc;
    p.tags.forEach((t) => { const tag = document.createElement("li"); tag.textContent = t; item.querySelector(".case__tags").appendChild(tag); });
    lockGroup.querySelector(".lockgrid").appendChild(item);
    units.find((u) => u.group).members.push({ p, i, displayI, item });
    return;
  }
  const li = document.createElement("li");
  li.className = "case";
  li.innerHTML = `
    <div class="case__label">
      <span class="card__index">Case study ( ${pad(displayI + 1)} )</span>
      <span class="case__client"></span>
      <span class="case__year"></span>
    </div>
    <a class="case__link">
      <ul class="case__tags" role="list"></ul>
      <div class="case__tile"></div>
      <div class="case__text">
        <span class="case__kind"></span>
        <h3 class="card__title"></h3>
        <p class="card__desc"></p>
        <span class="case__cta">View case study <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"/></svg></span>
      </div>
    </a>`;
  metricTile(p, li.querySelector(".case__tile"));
  li.querySelector(".case__link").appendChild(makeCap(p));
  li.querySelector(".case__link").href = p.href;
  li.querySelector(".card__title").textContent = p.title;
  li.querySelector(".card__desc").textContent = p.desc;
  li.querySelector(".case__client").textContent = p.org;
  li.querySelector(".case__year").textContent = p.area;
  li.querySelector(".case__kind").textContent = `${p.org} · ${p.area}`;
  p.tags.forEach((t) => { const tag = document.createElement("li"); tag.textContent = t; li.querySelector(".case__tags").appendChild(tag); });
  list.appendChild(li);
  units.push({ li, members: [{ p, i, displayI }] });
});

// ── Work filter: Recent, Featured, then the sectors ──
if (list && units.length) {
  const meta = (p) => WORK_META[p.name] || { sectors: [], featured: false, date: "0000-00" };
  const sectors = [...new Set(DISPLAY_PROJECTS.flatMap((p) => meta(p).sectors))].sort((a, b) => DISPLAY_PROJECTS.filter((p) => meta(p).sectors.includes(b)).length - DISPLAY_PROJECTS.filter((p) => meta(p).sectors.includes(a)).length);
  const filters = [{ key: "recent", label: "Recent" }, { key: "featured", label: "Featured" }, ...sectors.map((x) => ({ key: x, label: x }))];
  const fits = (p, key) => key === "recent" || (key === "featured" ? meta(p).featured : meta(p).sectors.includes(key));
  const tabs = document.getElementById("work-tabs") || document.createElement("div"), unitDate = (u) => u.members.reduce((m, x) => (meta(x.p).date > m ? meta(x.p).date : m), "");
  const countEls = document.querySelectorAll(".work__eyebrow [data-work-count]");
  // Featured is the default so public work leads; the choice survives a trip into a case study and back
  const FILTER_KEY = "work-filter";
  let active = "featured";
  const render = (key) => {
    active = key;
    try { sessionStorage.setItem(FILTER_KEY, key); } catch (err) {}
    tabs.querySelectorAll(".work__tab").forEach((b) => { const on = b.dataset.key === key; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
    list.setAttribute("aria-labelledby", `work-tab-${filters.findIndex((f) => f.key === key) === 0 ? "recent" : key.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
    let shown = 0;
    const ordered = units.map((u, idx) => ({ u, idx })).sort((a, b) => (key === "recent" ? (unitDate(b.u) > unitDate(a.u) ? 1 : unitDate(b.u) < unitDate(a.u) ? -1 : 0) : (b.u.group ? 1 : 0) - (a.u.group ? 1 : 0)) || a.idx - b.idx);
    ordered.forEach(({ u }) => {
      const vis = u.members.filter((m) => fits(m.p, key));
      u.li.hidden = vis.length === 0;
      shown += vis.length;
      if (u.group) {
        u.members.forEach((m) => { m.item.hidden = !fits(m.p, key); m.item.classList.remove("is-wide"); });
        const v = u.members.filter((m) => !m.item.hidden);
        if (v.length === 1) v[0].item.classList.add("is-wide"); else if (v.length === 3) v[2].item.classList.add("is-wide");
        const lab = u.li.querySelector(".case__label .card__index"); if (lab) lab.textContent = `Case ${v.length === 1 ? "study" : "studies"} ( ${v.map((m) => pad(m.displayI + 1)).join(" · ")} )`;
      }
      list.appendChild(u.li);
    });
    countEls.forEach((el) => (el.textContent = pad(shown)));
  };
  // Sidebar: Recent and Featured on top, then Sectors as a nested group under a guide line
  const ICONS = { recent: '<svg class="side__icon" viewBox="0 0 10 9" aria-hidden="true" fill="currentColor" shape-rendering="crispEdges"><rect x="3" y="0" width="1" height="1"/><rect x="4" y="0" width="1" height="1"/><rect x="5" y="0" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/><rect x="2" y="1" width="1" height="1"/><rect x="7" y="1" width="1" height="1"/><rect x="1" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="8" y="2" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="4" y="3" width="1" height="1"/><rect x="9" y="3" width="1" height="1"/><rect x="0" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="5" y="4" width="1" height="1"/><rect x="9" y="4" width="1" height="1"/><rect x="0" y="5" width="1" height="1"/><rect x="9" y="5" width="1" height="1"/><rect x="1" y="6" width="1" height="1"/><rect x="8" y="6" width="1" height="1"/><rect x="2" y="7" width="1" height="1"/><rect x="7" y="7" width="1" height="1"/><rect x="3" y="8" width="1" height="1"/><rect x="4" y="8" width="1" height="1"/><rect x="5" y="8" width="1" height="1"/><rect x="6" y="8" width="1" height="1"/></svg>', featured: '<svg class="side__icon" viewBox="0 0 9 9" aria-hidden="true" fill="currentColor" shape-rendering="crispEdges"><rect x="4" y="0" width="1" height="1"/><rect x="4" y="1" width="1" height="1"/><rect x="3" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="5" y="2" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="1" y="3" width="1" height="1"/><rect x="2" y="3" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="4" y="3" width="1" height="1"/><rect x="5" y="3" width="1" height="1"/><rect x="6" y="3" width="1" height="1"/><rect x="7" y="3" width="1" height="1"/><rect x="8" y="3" width="1" height="1"/><rect x="1" y="4" width="1" height="1"/><rect x="2" y="4" width="1" height="1"/><rect x="3" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="5" y="4" width="1" height="1"/><rect x="6" y="4" width="1" height="1"/><rect x="7" y="4" width="1" height="1"/><rect x="2" y="5" width="1" height="1"/><rect x="3" y="5" width="1" height="1"/><rect x="4" y="5" width="1" height="1"/><rect x="5" y="5" width="1" height="1"/><rect x="6" y="5" width="1" height="1"/><rect x="2" y="6" width="1" height="1"/><rect x="3" y="6" width="1" height="1"/><rect x="5" y="6" width="1" height="1"/><rect x="6" y="6" width="1" height="1"/><rect x="1" y="7" width="1" height="1"/><rect x="2" y="7" width="1" height="1"/><rect x="6" y="7" width="1" height="1"/><rect x="7" y="7" width="1" height="1"/><rect x="0" y="8" width="1" height="1"/><rect x="8" y="8" width="1" height="1"/></svg>', sectors: '<svg class="side__icon" viewBox="0 0 9 7" aria-hidden="true" fill="currentColor" shape-rendering="crispEdges"><rect x="0" y="0" width="1" height="1"/><rect x="1" y="0" width="1" height="1"/><rect x="2" y="0" width="1" height="1"/><rect x="0" y="1" width="1" height="1"/><rect x="3" y="1" width="1" height="1"/><rect x="4" y="1" width="1" height="1"/><rect x="5" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="7" y="1" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/><rect x="8" y="2" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="8" y="3" width="1" height="1"/><rect x="0" y="4" width="1" height="1"/><rect x="8" y="4" width="1" height="1"/><rect x="0" y="5" width="1" height="1"/><rect x="8" y="5" width="1" height="1"/><rect x="0" y="6" width="1" height="1"/><rect x="1" y="6" width="1" height="1"/><rect x="2" y="6" width="1" height="1"/><rect x="3" y="6" width="1" height="1"/><rect x="4" y="6" width="1" height="1"/><rect x="5" y="6" width="1" height="1"/><rect x="6" y="6" width="1" height="1"/><rect x="7" y="6" width="1" height="1"/><rect x="8" y="6" width="1" height="1"/></svg>' };
  const mkTab = (f) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "work__tab"; b.dataset.key = f.key; b.setAttribute("role", "tab"); b.setAttribute("aria-controls", "work-cards"); b.id = `work-tab-${f.key === "recent" ? "recent" : f.key.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const n = DISPLAY_PROJECTS.filter((p) => fits(p, f.key)).length;
    if (ICONS[f.key]) b.insertAdjacentHTML("beforeend", ICONS[f.key]);
    const lab = document.createElement("span"); lab.className = "work__tablabel"; lab.textContent = f.label; b.appendChild(lab);
    const sup = document.createElement("sup"); sup.textContent = pad(n); b.appendChild(sup);
    b.addEventListener("click", () => render(f.key));
    return b;
  };
  const group = document.createElement("div"); group.className = "work__group"; group.setAttribute("role", "none");
  group.insertAdjacentHTML("beforeend", `<p class="work__grouphead" aria-hidden="true">${ICONS.sectors}<span class="work__tablabel">Sectors</span><sup>${pad(sectors.length)}</sup></p>`);
  const nest = document.createElement("div"); nest.className = "work__nest"; nest.setAttribute("role", "none"); group.appendChild(nest);
  filters.forEach((f) => { const b = mkTab(f); (f.key === "recent" || f.key === "featured" ? tabs : nest).appendChild(b); });
  tabs.appendChild(group);
  tabs.addEventListener("keydown", (e) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    const bs = [...tabs.querySelectorAll(".work__tab")], at = bs.findIndex((b) => b.dataset.key === active), fwd = e.key === "ArrowRight" || e.key === "ArrowDown";
    const next = e.key === "Home" ? bs[0] : e.key === "End" ? bs[bs.length - 1] : bs[(at + (fwd ? 1 : bs.length - 1)) % bs.length];
    next.focus(); next.scrollIntoView({ block: "nearest", inline: "nearest" }); render(next.dataset.key); e.preventDefault();
  });
  let saved = null;
  try { saved = sessionStorage.getItem(FILTER_KEY); } catch (err) {}
  render(document.getElementById("work-tabs") && filters.some((f) => f.key === saved) ? saved : "featured");
}

// ── Work: the rim glow under the hero follows the pointer and brightens on hover ──
(() => {
  const work = document.querySelector(".work");
  if (!work || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const reduced = motionReduced(), IDLE = 0.45;
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
  let fieldVisible = true;
  new IntersectionObserver(([e]) => { fieldVisible = e.isIntersecting; }, { threshold: 0 }).observe(field);
  setInterval(() => { if (fieldVisible && !document.hidden && !motionReduced()) lightRandom(); }, 1400);
}

// ── Hero globe: a horn torus of 48 wireframe loops on a 1440×509 artboard, turning one loop every 3.2s, ──
(function () {
  const cv = document.querySelector(".hero__globe");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const AW = 1440, AH = 509, LOOPS = 48, STEP = 3.2, SAMPLES = 160;
  // Camera fitted to the reference: eye height, distance, pitch, focal length (artboard px), horizon
  const EH = 1.5453, ED = 1.4286, PITCH = -0.7672, F = 580.32, CY = 515.45;
  const cp = Math.cos(PITCH), sp = Math.sin(PITCH);
  // loop index (fractional) + angle along the loop → artboard point; every loop meets the axis at phi = π
  const at = (index, phi) => {
    const th = (2 * Math.PI * index) / LOOPS, r = 1 + Math.cos(phi);
    const x = r * Math.cos(th), y = Math.sin(phi) - EH, z = r * Math.sin(th) - ED;
    const d = -(-y * sp + z * cp);
    return [AW / 2 + (F * x) / d, CY - (F * (y * cp + z * sp)) / d];
  };
  let W = 0, scale = 1, theme = "dark", t = 0, last = 0, lastDraw = -Infinity, scrollAt = -Infinity, raf = 0, visible = true;

  const size = () => {
    const r = cv.getBoundingClientRect();
    if (!r.width) return;
    const dpr = innerWidth < 768 ? 1 : Math.min(2, devicePixelRatio || 1);
    W = r.width; scale = (W / AW) * dpr;
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
  };
  const draw = (sec) => {
    if (!W) return;
    const light = document.documentElement.dataset.theme === "light";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    // The wire: one path, so crossings never double up
    const wire = new Path2D(), shift = sec / STEP;
    for (let k = 0; k < LOOPS; k++) {
      for (let j = 0; j < SAMPLES; j++) {
        const [x, y] = at(k - shift, Math.PI + (2 * Math.PI * j) / SAMPLES);
        j ? wire.lineTo(x, y) : wire.moveTo(x, y);
      }
      wire.closePath();
    }
    ctx.lineWidth = 2; ctx.lineJoin = "round";
    ctx.strokeStyle = light ? "#e6e4d8" : "#2e2825";
    ctx.stroke(wire);
  };
  addEventListener("scroll", () => { scrollAt = performance.now(); }, { passive: true });
  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    t += Math.min(now - last, 100) / 1000; last = now;
    // Phones: hold still while scrolling and cap at 30fps
    if ((matchMedia("(pointer: coarse)").matches || innerWidth < 768) && (now - scrollAt < 150 || now - lastDraw < 1000 / 30 - 1)) return;
    lastDraw = now; draw(t);
  };
  const sync = () => {
    cancelAnimationFrame(raf); raf = 0;
    if (motionReduced()) { t = 0; draw(0); return; }
    if (visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); }
  };
  size(); draw(0); cv.classList.add("is-on");
  new ResizeObserver(() => { size(); draw(t); }).observe(cv);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0 }).observe(cv);
  document.addEventListener("visibilitychange", sync);
  addEventListener("motionchange", sync);
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", sync);
  new MutationObserver(() => draw(t)).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  sync();
})();

// ── Theme tuner: a crossfader between dark (0) and light (1) ──
const root = document.documentElement;
const themeBtn = document.getElementById("theme");
const TUNE = {   // token: [dark, light]
  "--bg-page": ["rgb(17 16 16)", "rgb(255 254 242)"],
  "--surface-card": ["rgb(255 255 255 / .05)", "rgb(209 208 198 / .4)"],
  "--frost-nav": ["rgb(255 255 255 / .12)", "rgb(243 242 231 / .94)"],
  "--btn-bg": ["rgb(234 234 230)", "rgb(252 170 45)"],
  "--btn-fg": ["rgb(17 16 16)", "rgb(25 25 24)"],
  "--seg-hover": ["rgb(255 255 255 / .07)", "rgb(209 208 198 / .35)"],
  "--seg-active": ["rgb(255 255 255 / .14)", "rgb(209 208 198 / .6)"],
  "--pcard": ["rgb(28 27 27 / .94)", "rgb(243 242 231 / .94)"],
  "--pcard-active": ["rgb(46 45 45 / .92)", "rgb(227 226 216 / .95)"],
  "--thumb-bg": ["rgb(17 16 16)", "rgb(255 254 242)"],
  "--sec-bg": ["rgb(17 16 16)", "rgb(255 254 242)"],
  "--sec-line": ["rgb(255 255 255 / .12)", "rgb(227 226 216)"],
  "--sec-guide": ["rgb(255 255 255 / .45)", "rgb(25 25 24 / .4)"],
  "--sec-card": ["rgb(28 27 27)", "rgb(243 242 231)"],
  "--sec-card-hover": ["rgb(46 45 45 / .6)", "rgb(209 208 198 / .4)"],
  "--sec-tip": ["rgb(28 27 27 / .9)", "rgb(255 254 242 / .94)"],
};
// Backgrounds blend linearly. Text never blends: it switches at the lightness where white and ink read equally well on the mixed page (about 45%), and secondary text is strengthened near that point.
const FLIP = 0.45;
let level = 0, ownChange = false;
const applyLevel = (v) => {
  level = Math.max(0, Math.min(1, v));
  const t = level >= FLIP ? "light" : "dark";
  ownChange = true;
  root.dataset.theme = t;
  window.setThemeColor?.(t);
  ownChange = false;
  const style = root.style;
  if (level === 0 || level === 1) {
    root.classList.remove("tuned");
    Object.keys(TUNE).concat(["--text-primary", "--sec-fg", "--text-secondary", "--sec-muted", "--sec-faint"]).forEach((k) => style.removeProperty(k));
  } else {
    root.classList.add("tuned");
    const p = (level * 100).toFixed(1);
    const near = Math.max(0, 1 - Math.abs(level - FLIP) / 0.55);         // 1 at the flip, 0 at the ends
    const boost = (base, top) => (base + (top - base) * near).toFixed(3);
    const ink = t === "light" ? [25, 25, 24].map((v) => Math.round(v * (1 - near))).join(" ") : "255 255 255";   // ink deepens to black at the flip
    const sec = `rgb(${ink} / ${boost(t === "light" ? 0.6 : 0.69, 0.97)})`;
    const faint = `rgb(${ink} / ${boost(t === "light" ? 0.5 : 0.43, 0.9)})`;
    style.setProperty("--text-primary", `rgb(${ink})`); style.setProperty("--sec-fg", `rgb(${ink})`);
    style.setProperty("--text-secondary", sec); style.setProperty("--sec-muted", sec);
    style.setProperty("--sec-faint", faint);
    Object.entries(TUNE).forEach(([k, [d, l]]) => style.setProperty(k, `color-mix(in srgb, ${l} ${p}%, ${d})`));
  }
  themeBtn.style.setProperty("--lv", level.toFixed(3));
  themeBtn.setAttribute("aria-valuenow", Math.round(level * 100));
  themeBtn.setAttribute("aria-valuetext", level === 0 ? "Dark" : level === 1 ? "Light" : `${Math.round(level * 100)}% light`);
  try { localStorage.setItem("theme", t); localStorage.setItem("themeLevel", level.toFixed(3)); } catch (e) {}
};
(function () {
  themeBtn.innerHTML = '<span class="tuner__ticks" aria-hidden="true">' + "<i></i>".repeat(11) + '</span><span class="tuner__rail" aria-hidden="true"></span><span class="tuner__cap" aria-hidden="true"></span>';
  themeBtn.classList.add("tuner");
  themeBtn.setAttribute("role", "slider");
  themeBtn.setAttribute("aria-label", "Theme: dark to light");
  themeBtn.setAttribute("aria-valuemin", "0");
  themeBtn.setAttribute("aria-valuemax", "100");
  let saved = null, savedLevel = null;
  try { saved = localStorage.getItem("theme"); savedLevel = parseFloat(localStorage.getItem("themeLevel")); } catch (e) {}
  const start = Number.isFinite(savedLevel) && ((savedLevel >= FLIP) === (saved === "light")) ? savedLevel : (saved === "light" ? 1 : 0);
  applyLevel(start);

  const fromPointer = (e) => {
    const r = themeBtn.getBoundingClientRect(), left = 14, right = 14;
    return (e.clientX - r.left - left) / (r.width - left - right);
  };
  let drag = false;
  themeBtn.addEventListener("pointerdown", (e) => {
    drag = true; themeBtn.setPointerCapture(e.pointerId); root.classList.add("tuning");
    const v = fromPointer(e);
    applyLevel(v < 0.04 ? 0 : v > 0.96 ? 1 : v);
  });
  themeBtn.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const v = fromPointer(e);
    applyLevel(v < 0.04 ? 0 : v > 0.96 ? 1 : v);
  });
  const end = () => { drag = false; root.classList.remove("tuning"); };
  themeBtn.addEventListener("pointerup", end);
  themeBtn.addEventListener("pointercancel", end);
  themeBtn.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 0.25 : 0.05;
    const k = e.key;
    if (k === "ArrowRight" || k === "ArrowUp") applyLevel(level + step);
    else if (k === "ArrowLeft" || k === "ArrowDown") applyLevel(level - step);
    else if (k === "Home") applyLevel(0);
    else if (k === "End") applyLevel(1);
    else return;
    e.preventDefault();
  });
  // Another control (the Playground's own switch) flipped the theme: snap the fader to that end
  new MutationObserver(() => {
    if (ownChange) return;
    const t = root.dataset.theme;
    if ((level >= FLIP) !== (t === "light")) applyLevel(t === "light" ? 1 : 0);
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
})();


// ── Contact details (replace the placeholders with your own) ──
const CONTACT = {
  email: "sambitnayak.ux@gmail.com",
  linkedin: "https://www.linkedin.com/in/sambitnayakux/",
  linkedinLabel: "/in/sambitnayakux",
  github: "https://github.com/Samnayakx",
  githubLabel: "/Samnayakx",
  x: "https://x.com/sambit_nayak_",
  substack: "https://sambitnayak2.substack.com/",
  resume: "/assets/Sambit-Nayak-Resume.pdf",
  book: "https://cal.com/sambit-nayak/30min?overlayCalendar=true",
};

// ── Nav: Work panel (project list + live stripe thumbnail) ──
const navProjects = document.getElementById("nav-projects");
const navThumb = document.getElementById("nav-thumb");
const NAV_PROJECTS = [...DISPLAY_PROJECTS].sort((a, b) => (a.org === "CotonAI" ? 0 : 1) - (b.org === "CotonAI" ? 0 : 1));
const showThumb = (i, hot = true) => {
  const p = NAV_PROJECTS[i];
  navThumb.replaceChildren(); navThumb.style.background = "none"; metricTile(p, navThumb, true);
  navProjects.querySelectorAll("a").forEach((a, j) => a.classList.toggle("is-hot", hot && j === i));
};
NAV_PROJECTS.forEach((p, i) => {
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
  { label: "GitHub", title: "Code and experiments", value: CONTACT.githubLabel, href: CONTACT.github, glyph: "about", external: true },
  { label: "Résumé", title: "View my résumé", value: "PDF", href: CONTACT.resume, glyph: "writing", external: true },
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
  m.tab.addEventListener("click", (e) => {
    // Work is a real link to /work: a mouse click goes there (hover shows the menu); touch and keyboard still toggle the menu
    if (m.tab.id === "work-tab") {
      if (finePointer.matches && e.detail > 0) { openedByHover = false; closeAll(); return; }   // the page-transition handler navigates
      e.preventDefault();
    }
    // A click on a panel that hover just opened pins it open instead of closing it
    if (openMenu?.tab === m.tab && openedByHover) { openedByHover = false; return; }
    openedByHover = false;
    setOpen(m, openMenu?.tab !== m.tab);
  });
  const group = m.tab.closest(".navgroup");
  let t;
  // Hover opens a menu only from its own tab, so passing over the theme icon or a plain link does not pop a panel
  group.addEventListener("mouseenter", () => clearTimeout(t));
  m.tab.addEventListener("mouseenter", () => {
    if (!finePointer.matches || getComputedStyle(m.tab).display === "none") return;
    clearTimeout(t);
    if (openMenu?.tab !== m.tab) { setOpen(m, true); openedByHover = true; }
  });
  // Plain links and icons in the group (About, Writing, Playground, the clock, the theme icon) close a menu that hover opened
  group.querySelectorAll(".seg__item:not([aria-controls]):not(.seg__brand), .seg .icon-btn").forEach((n) => n.addEventListener("mouseenter", () => {
    if (!finePointer.matches || !openMenu || !openedByHover || openMenu.tab.closest(".navgroup") !== group) return;
    clearTimeout(t); setOpen(openMenu, false); openedByHover = false;
  }));
  group.addEventListener("mouseleave", () => {
    if (!finePointer.matches || openMenu?.tab !== m.tab) return;
    t = setTimeout(() => { if (openMenu?.tab === m.tab) setOpen(m, false); }, 180);
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && openMenu) { const tab = openMenu.tab; closeAll(); tab.focus(); }
});
document.addEventListener("click", (e) => {
  if (!openMenu || e.target.closest(".navgroup")) return;
  const { tab, panel } = openMenu;
  closeAll();
  if (panel.contains(document.activeElement)) tab.focus();   // focus was inside the panel: hand it back to the tab that opened it
});
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
    <div class="sf__sign">
      <a class="sf__mark" href="#top" aria-label="Sam.design, back to top"><span>Sam.design</span></a>
      <div class="sf__cols">
        <nav aria-label="Sitemap"><h3>Sitemap</h3><ul role="list"><li><a href="/">Home</a></li><li><a href="/work">Work</a></li><li><a href="/about">About</a></li><li><a href="/writing">Writing</a></li><li><a href="/playground">Playground</a></li></ul></nav>
        <nav aria-label="Social"><h3>Social</h3><ul role="list"><li><a href="${CONTACT.linkedin}" target="_blank" rel="noopener">LinkedIn</a></li><li><a href="${CONTACT.github}" target="_blank" rel="noopener">GitHub</a></li><li><a href="${CONTACT.x}" target="_blank" rel="noopener">X</a></li><li><a href="${CONTACT.substack}" target="_blank" rel="noopener">Substack</a></li></ul></nav>
        <div><h3>Contact</h3><ul role="list"><li><a href="mailto:${CONTACT.email}">${CONTACT.email}</a></li><li>San Francisco, California</li></ul></div>
        <div><h3>Work with me</h3><ul role="list"><li><a href="${CONTACT.book}" target="_blank" rel="noopener">Book a call</a></li><li><a href="${CONTACT.resume}" target="_blank" rel="noopener">Résumé (PDF)</a></li></ul></div>
      </div>
      <div class="sf__legal">
        <span>© 2026 Sambit Nayak</span>
        <span>San Francisco · <time data-clock>--:--</time></span>
        <a href="#top">Back to top ↑</a>
      </div>
    </div>`;

  // The wordmark is sized to fill the row exactly, and re-fitted when the width or the web font changes
  const mark = host.querySelector(".sf__mark"), markText = mark.firstElementChild;
  const fitMark = () => {
    const box = host.querySelector(".sf__sign").clientWidth;
    if (!box) return;
    mark.style.fontSize = "100px";
    const w = markText.getBoundingClientRect().width;
    if (w) mark.style.fontSize = `${(100 * box) / w}px`;
  };
  new ResizeObserver(fitMark).observe(host);
  if (document.fonts) document.fonts.ready.then(fitMark);
  fitMark();

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
    batUp: ["#.......#", "##.###.##", "#########", ".#######.", "..#...#.."],
    batDown: ["..#...#..", ".#######.", "#########", "##.###.##", "#.......#"],
  };
  // San Francisco skyline, in the same row-string format as the sprites: # is silhouette, o is the bridge's international orange.
  // Built from landmarks (Salesforce Tower, Transamerica Pyramid, Coit Tower, Sutro Tower, Golden Gate) between low filler blocks, and it tiles sideways.
  const SKYLINE = (() => {
    const W = 250, H = 46, g = Array.from({ length: H }, () => Array(W).fill("."));
    const put = (x, k, ch = "#") => { const y = H - 1 - k; if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = ch; };
    const col = (x, k0, k1, ch = "#") => { for (let k = k0; k < k1; k++) put(x, k, ch); };
    const box = (x0, w, k0, k1, ch = "#") => { for (let x = x0; x < x0 + w; x++) col(x, k0, k1, ch); };
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let x = 0; x < 172;) { const w = 3 + Math.floor(rnd() * 5); box(x, w, 0, 8 + Math.floor(rnd() * 14)); x += w + (rnd() < 0.3 ? 1 : 0); }
    const hill = (cx, r, h) => { for (let d = -r; d <= r; d++) col(cx + d, 0, Math.round(h * (1 - (d / r) ** 2)) + 1); };
    // Salesforce Tower: a tall shaft that rounds off at the top
    { const cx = 58, h = 43; for (let k = 0; k < h; k++) { const t = k / h, w = t < 0.86 ? 9 : Math.max(1, Math.round(9 * (1 - (t - 0.86) / 0.14))); box(cx - (w >> 1), w, k, k + 1); } }
    // Transamerica Pyramid: a spire, a taper, and the two wings
    { const cx = 98, h = 41; for (let k = 0; k < h; k++) { const w = k >= h - 7 ? 1 : 3 + Math.round(((h - 8 - k) * 10) / (h - 8)); box(cx - (w >> 1), w, k, k + 1); }
      col(cx - 5, 0, 29); col(cx - 4, 0, 29); col(cx + 4, 0, 29); col(cx + 5, 0, 29); }
    // Coit Tower on Telegraph Hill
    { const cx = 128; hill(cx, 14, 11); box(cx - 1, 3, 0, 29); box(cx - 2, 5, 25, 28); }
    // Sutro Tower: three legs and two crossbars on its hill
    { const cx = 176; hill(cx, 16, 9); for (let k = 9; k < 44; k++) { const sp = Math.round(3 * (1 - (k - 9) / 35) + 0.4); put(cx - sp, k); put(cx + sp, k); put(cx, k); }
      box(cx - 4, 9, 40, 41); box(cx - 3, 7, 34, 35); col(cx, 44, 46); }
    // Golden Gate Bridge: two towers, the deck, the main cable and its hangers
    { const t1 = 203, t2 = 237, mid = (t1 + t2) / 2 + 1.5, half = (t2 - t1) / 2;
      for (const t of [t1, t2]) { col(t, 0, 35, "o"); col(t + 3, 0, 35, "o"); box(t, 4, 22, 23, "o"); box(t, 4, 27, 28, "o"); box(t, 4, 32, 33, "o"); }
      box(188, 62, 7, 9, "o");
      for (let x = t1 + 1; x <= t2 + 2; x++) { const h = Math.round(11 + 24 * ((x - mid) / half) ** 2); put(x, Math.min(h, 34), "o"); if ((x - t1) % 4 === 0) col(x, 9, Math.min(h, 34), "o"); }
      for (let x = 188; x < t1; x++) put(x, Math.round(9 + 25 * ((x - 188) / (t1 - 188)) ** 1.6), "o");
      for (let x = t2 + 4; x < W; x++) put(x, Math.round(9 + 25 * ((W - 1 - x) / (W - 1 - t2 - 4)) ** 1.6), "o"); }
    return g.map((r) => r.join(""));
  })();
  const skyArt = { key: "", city: null, bridge: null };
  // The skyline is painted once per size and colour into two small canvases, then tiled
  const skyTiles = (s, fg) => {
    const key = `${s}|${fg}`;
    if (skyArt.key === key) return skyArt;
    const mk = (want) => {
      const c = document.createElement("canvas"); c.width = SKYLINE[0].length * s; c.height = SKYLINE.length * s;
      const x = c.getContext("2d"); x.fillStyle = want === "o" ? "#C0362C" : fg;
      SKYLINE.forEach((row, r) => { for (let i = 0; i < row.length; i++) if (row[i] === want) x.fillRect(i * s, r * s, s, s); });
      return c;
    };
    Object.assign(skyArt, { key, city: mk("#"), bridge: mk("o") });
    return skyArt;
  };
  // Obstacle kinds. Sizes and hitboxes are in sprite units (u); fy is the float height above the ground.
  const OBS = {
    bug: { w: 7, hx0: 1, hx1: 6, y0: 0, y1: 5, fy: 0 },
    tall: { w: 7, hx0: 1, hx1: 6, y0: 0, y1: 11, fy: 0 },
    bat: { w: 9, hx0: 1, hx1: 8, y0: 1, y1: 4, fy: 14 }, // flies at head height: jumping into it hurts, so stay low
  };
  // Patterns are [kind, seconds of travel since the previous obstacle ended]. Gaps scale with speed, so they stay fair.
  const PATTERNS = {
    single: [["bug", 0]],
    pair: [["bug", 0], ["bug", 0.16]],
    triple: [["bug", 0], ["bug", 0.16], ["bug", 0.16]],
    tall: [["tall", 0]],
    tallpair: [["tall", 0], ["tall", 0.2]],
    bat: [["bat", 0]],
    hopwait: [["bug", 0], ["bat", 0.9]],
    waithop: [["bat", 0], ["bug", 0.7]],
    stair: [["bug", 0], ["bug", 0.8], ["tall", 0.8]],
    gauntlet: [["bug", 0], ["bug", 0.75], ["bat", 0.9], ["bug", 0.7], ["tall", 0.75]],
  };
  const LEVELS = [
    { name: "Warm-up", pool: ["single", "single", "pair"] },
    { name: "Rush hour", pool: ["single", "pair", "tall", "tall"] },
    { name: "Peak load", pool: ["pair", "triple", "tall", "bat", "waithop", "hopwait"] },
    { name: "Overclocked", pool: ["triple", "tallpair", "bat", "waithop", "hopwait", "stair"] },
    { name: "Meltdown", pool: ["tallpair", "triple", "stair", "gauntlet", "hopwait", "waithop", "bat"] },
  ];
  const LEVEL_LEN = 280; // score points per level
  const levelAt = (score) => 1 + Math.floor(score / LEVEL_LEN);
  const levelDef = (lv) => LEVELS[Math.min(lv, LEVELS.length) - 1];
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
    cam: 0, t: 0, y: 0, vy: 0, onGround: true, obs: [], nextSpawn: 0, score: 0, overAt: 0, lastHour: -1, level: 1, speed: 0, banner: 0, lastPat: "",
    W: 0, H: 0, HEAD: 0, u: 3, pitch: 1, bw: 1, mx: 0, vis: false, last: 0, blink: 0,
  };
  const jit = (d) => (d === 0 ? 0 : (((Math.sin(d * 91.7) * 43758.5453) % 1 + 1) % 1 - 0.5) * 0.16);
  const colData = (col) => data[((col % BARS) + BARS) % BARS];
  const barH = (col) => Math.min(0.9, colData(col).total * (1 + jit(Math.floor(col / BARS)))) * game.H;
  const groundAt = (wx) => barH(Math.floor(wx / game.pitch));
  const fmtScore = (n) => String(n).padStart(5, "0");
  const targetSpeed = (g) => Math.min(112, 46 + 9 * (g.level - 1) + 5 * ((g.score % LEVEL_LEN) / LEVEL_LEN)) * g.u;

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
    Object.assign(g, { cam: 0, t: 0, vy: 0, onGround: true, obs: [], score: 0, lastHour: -1, level: 1, banner: 0, lastPat: "" });
    g.speed = targetSpeed(g);
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
    g.speed += (targetSpeed(g) - g.speed) * Math.min(1, dt * 1.5);
    const speed = g.speed;
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
      const pool = levelDef(g.level).pool.filter((n) => n !== g.lastPat);
      g.lastPat = pool[Math.floor(Math.random() * pool.length)];
      let x = g.nextSpawn;
      for (const [kind, gap] of PATTERNS[g.lastPat]) {
        x += speed * gap;
        g.obs.push({ x, kind });
        x += OBS[kind].w * u;
      }
      g.nextSpawn = x + speed * (Math.max(0.95, 1.5 - g.level * 0.1) + Math.random() * 0.6) + 16 * u;
    }
    g.obs = g.obs.filter((o) => o.x - g.cam > -10 * u);
    for (const o of g.obs) {
      const d = OBS[o.kind], sx = o.x - g.cam;
      const gb = groundAt(o.x + (d.w / 2) * u);
      if (sx + d.hx1 * u > g.mx + 2 * u && sx + d.hx0 * u < g.mx + 10 * u
        && g.y + 0.5 * u < gb + (d.fy + d.y1) * u && g.y + 8 * u > gb + (d.fy + d.y0) * u) return gameOver();
    }
    g.score = Math.floor(g.cam / (5 * u));
    const lv = levelAt(g.score);
    if (lv !== g.level) { g.level = lv; g.banner = g.t; }
    const hr = Math.floor((g.cam + g.mx) / g.pitch / PER_HOUR) % 24;
    if (hr !== g.lastHour) { g.lastHour = hr; labels.forEach((l, j) => l.classList.toggle("is-hot", j === hr)); }
  }
  function gameOver() {
    const g = game;
    g.overAt = performance.now();
    if (g.score > hi) { hi = g.score; try { localStorage.setItem("sf-hi", String(hi)); } catch (e) {} }
    const day = Math.floor((g.cam + g.mx) / g.pitch / BARS) + 1;
    msg.innerHTML = `<strong>Game over</strong><span>Level ${g.level} · Day ${day} · score ${fmtScore(g.score)}</span><span>Space / tap to retry · Esc to exit</span>`;
    setState("over");
  }

  let themeFg = "#000";
  function draw(now) {
    const g = game, u = g.u, ctxH = g.H + g.HEAD;
    ctx.clearRect(0, 0, g.W, ctxH);
    const toY = (h) => Math.round(ctxH - h);
    if (g.state !== "idle") {
      // backdrop: the SF skyline drifting at a fraction of the speed, behind the terrain. It stands on a raised horizon
      // and is filled in solid below it, so it reads as a distant city that the terrain rolls in front of.
      const ss = u, art = skyTiles(ss, themeFg), tw = art.city.width, sx0 = -((g.cam * 0.22) % tw), hz = Math.round(ctxH - g.H * 0.4);
      for (let x = sx0; x < g.W; x += tw) {
        const dx = Math.round(x);
        ctx.globalAlpha = 0.16; ctx.fillStyle = themeFg;
        ctx.drawImage(art.city, dx, hz - art.city.height);
        ctx.fillRect(dx, hz, tw, ctxH - hz);
        ctx.globalAlpha = 0.55; ctx.drawImage(art.bridge, dx, hz - art.bridge.height);
      }
      ctx.globalAlpha = 1;
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
      for (const o of g.obs) {
        const d = OBS[o.kind], sx = Math.round(o.x - g.cam);
        if (sx > g.W || sx < -10 * u) continue;
        const gb = groundAt(o.x + (d.w / 2) * u);
        if (o.kind === "bat") sprite(Math.floor(now / 160) % 2 ? U_SPRITE.batUp : U_SPRITE.batDown, sx, toY(gb + (d.fy + 5) * u), u, themeFg);
        else {
          sprite(U_SPRITE.bug, sx, toY(gb + 6 * u), u, themeFg);
          if (o.kind === "tall") sprite(U_SPRITE.bug, sx, toY(gb + 12 * u), u, themeFg);
        }
      }
      // level banner
      const age = g.t - g.banner;
      if (g.state === "run" && g.level > 1 && age < 2) {
        ctx.save();
        ctx.globalAlpha = age < 1.4 ? 1 : (2 - age) / 0.6;
        ctx.fillStyle = themeFg; ctx.textAlign = "center";
        ctx.font = "600 14px ui-monospace, Menlo, monospace";
        ctx.fillText(`LEVEL ${g.level} · ${levelDef(g.level).name.toUpperCase()}`, g.W / 2, 44);
        ctx.restore();
      }
    }
    // mascot
    const run = g.state === "run";
    const legsB = run && g.onGround && Math.floor(g.t * 12) % 2 === 1;
    const rows = U_SPRITE.mascot.map((r, i) => (i >= 6 && legsB ? U_SPRITE.legsB[i - 6] : r));
    const blink = g.state === "idle" && now % 3200 < 140;
    const dead = g.state === "over";
    sprite(rows, Math.round(g.mx), toY(g.y + 8 * u), u, dead ? "#9a8a82" : CLAUDE, { eyesOff: blink });
    hud.textContent = g.state === "idle" ? "Space / tap the graph to play" : `LV ${g.level}  HI ${fmtScore(hi)}  ${fmtScore(g.score)}`;
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
  if (!motionReduced()) {
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
      { code: "INT-24", title: "Story Reactions", status: "Interaction · Social", area: "Stories · Commerce", tag: "interaction", demo: "storyReactions", bg: "#F9DCE4", ptr: "hover", bare: true, bleed: true,
        scope: "A stack of stories with live progress. Tap the right of a story to move on and the left to go back; hold to pause. Double-tap or press the heart for a burst of hearts and a comment arriving; tap the reply bar and pick an emoji, and it flies up into the reaction bubble. On the board a scripted cursor shows it all; your pointer takes over.",
        hint: "Tap left or right on the front story, double-tap it, press the heart, tap the reply bar and choose an emoji. Hold to pause.", tags: ["GSAP", "Stories", "Reactions", "Stageshow"] },
      { code: "INT-23", title: "Archive Search", status: "Interaction · Search", area: "Gallery · Discovery", tag: "interaction", demo: "archiveSearch", bg: "#F3F2EE", ptr: "hover", bare: true, bleed: true,
        scope: "A globe of image tiles with a frosted search bar. Type a word and the tiles that match stay lit while the rest fall back, and the globe turns to bring the first match to the front. Drag the globe to spin it, tap a small tile to search its tag, and press the dots to give it a full turn.",
        hint: "Click the bar and type leather, bag, knit, coat, loafer, bomber, navy, orange or purple. Drag the globe. Tap one of the small tiles around it.", tags: ["GSAP", "3D", "Search", "Gallery"] },
      { code: "INT-21", title: "Media Tray", status: "Interaction · Component", area: "Mobile · Media", tag: "interaction", demo: "mediaTray", bg: "linear-gradient(180deg, #2A0A4A 0%, #14125E 30%, #3B4DFF 58%, #A9B8FF 76%, #F3D3C8 92%, #FDE7B8 100%)", ptr: "hover", bare: true, bleed: true,
        scope: "A tray of recent items. The stack fans open under your pointer, a tapped card lifts to the front, the voice memo plays with a moving waveform and progress, and + sends a new card flying in from the button. When the tray is full the oldest card leaves.",
        hint: "Hover the stack to open it. Tap a card to lift it, tap the voice memo to play it, and press + to add a card.", tags: ["GSAP", "Stack", "Audio", "Component"] },
      { code: "INT-22", title: "Word Wheel", status: "Interaction · Picker", area: "Type · Status", tag: "interaction", demo: "wordWheel", bg: "#AFC9E6", ptr: "hover", bare: true, bleed: true,
        scope: "A vertical picker for what the product is doing: the centre card is large and in focus, the rest recede and fade. It ticks along by itself; drag it and let go to throw it with momentum, or tap any card to bring it to the centre.",
        hint: "Drag up or down, or tap a card. In this view the mouse wheel and the arrow keys also work.", tags: ["GSAP", "Picker", "Momentum", "Type"] },
      { code: "INT-20", title: "Armillary Sphere", status: "Interaction · Motion", area: "Brand · Landing", tag: "interaction", demo: "armillary", bg: "#FFFFFF", ptr: "hover", bare: true, bleed: true,
        scope: "A wireframe globe that turns on its own. Drag it to spin it and let go: it keeps its momentum, then settles back to the slow turn. Dots and ticks under the pointer darken and grow, and the line on the card changes every few seconds.",
        hint: "Drag the sphere, let go, and move the pointer across it. In this view, click the card to change its line.", tags: ["Canvas", "3D", "Drag", "Momentum"] },
      { code: "INT-18", title: "The Box", status: "Interaction · Motion", area: "Brand · Launch", tag: "interaction", demo: "theBox", bg: "#000", dark: true, bleed: true, ptr: "none",
        scope: "A title card where image tiles shoot in from outside the frame and then settle: very fast at the start, suddenly slow at the end. Built with GSAP, using one expo ease and a random stagger.",
        hint: "Watch the loop, or click to replay it.", tags: ["GSAP", "Easing", "Launch film"] },
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
      { code: "INT-13", title: "Compose Bar", status: "Interaction · Input", area: "Mobile · Writing", tag: "interaction", demo: "composeBars", bg: "#1E1E1E", dark: true, ptr: "none", tall: true,
        scope: "A compose bar on a real iPhone-sized screen, with 44pt targets and 17pt text. Type, refine the text, dictate, then send, and the message slides into the feed above. A switch under the phone changes the look between dark, light and dusk.",
        hint: "Type and press Enter or the arrow. The ring tidies your text, the mic dictates sample words, the bin clears. Use the switch under the phone to change the look.", tags: ["Input", "Themes", "Dictation"] },
      { code: "INT-15", title: "Empty Sessions", status: "Interaction · Empty state", area: "Dev tools", tag: "interaction", demo: "emptySessions", bg: "#0C0C0C", dark: true, ptr: "none", tall: true,
        scope: "An empty state with some life in it: the windows fan out on hover, the pixel glyphs drift against the pointer, and clicking the stack shuffles it.",
        hint: "Move the pointer over the card, hover a glyph, and click the stack of windows.", tags: ["Empty state", "Parallax", "Pixel art"] },
      { code: "UI-01", title: "Profile Collections", status: "Interface study", area: "Web design", tag: "ui", demo: "profileCollections", ptr: "hover", ar: "1024 / 768", alt: "A profile screen with a collections list, a hover card and a grid of photographs and a video thumbnail.", pos: "50% 50%", cover: true, bg: "#DCDBD3",
        scope: "A profile screen with a collections list, a hover card and a grid of photographs and a video thumbnail.", tags: ["Interface", "Web design"] },
      { code: "UI-02", title: "Balance Chart", status: "Interface study", area: "Product design", tag: "ui", demo: "balanceChart", ptr: "hover", ar: "1199 / 872", alt: "A dark balance dashboard with a stacked area chart by asset, avatar markers and a seven-day range selector.", pos: "50% 50%", cover: true, bg: "#111111",
        scope: "A dark balance dashboard with a stacked area chart by asset, avatar markers and a seven-day range selector.", tags: ["Interface", "Product design"] },
      { code: "UI-03", title: "Design Guidelines", status: "Interface study", area: "Brand", tag: "ui", demo: "designGuidelines", ptr: "hover", ar: "1200 / 800", alt: "A design system site with a dark header and a white logotype guidelines page showing construction grids.", pos: "50% 40%", cover: true, bg: "#E8E8E8",
        scope: "A design system site with a dark header and a white logotype guidelines page showing construction grids.", tags: ["Interface", "Brand"] },
      { code: "UI-04", title: "Timeline Chart", status: "Interface study", area: "Product design", tag: "ui", demo: "timelineChart", ptr: "hover", ar: "736 / 832", alt: "A translucent timeline chart of three days over a dark organic texture, with pink and yellow areas.", pos: "50% 30%", cover: true, bg: "#433A2D",
        scope: "A translucent timeline chart of three days over a dark organic texture, with pink and yellow areas.", tags: ["Interface", "Product design"] },
      { code: "UI-05", title: "Email Stats", status: "Interface study", area: "Web design", tag: "ui", demo: "emailStats", ptr: "hover", ar: "1200 / 720", alt: "A card with three columns of email stats: delivered, engaged and complaints, with advice under each.", pos: "50% 50%", cover: true, bg: "#E7E7E5",
        scope: "A card with three columns of email stats: delivered, engaged and complaints, with advice under each.", tags: ["Interface", "Web design"] },
      { code: "UI-06", title: "Contents Spread", status: "Interface study", area: "Brand", tag: "ui", demo: "contentsSpread", ptr: "hover", ar: "1199 / 782", alt: "A book contents spread with four seasonal photographs and page numbers.", pos: "50% 50%", cover: true, bg: "#FDFDFD",
        scope: "A book contents spread with four seasonal photographs and page numbers.", tags: ["Interface", "Brand"] },
      { code: "UI-07", title: "Lens Picker", status: "Interface study", area: "Web design", tag: "ui", demo: "lensPicker", ptr: "hover", ar: "736 / 736", alt: "A dark pill-shaped lens picker showing 24 millimetres with a yellow indicator.", pos: "50% 50%", cover: true, bg: "#1A1A1A",
        scope: "A dark pill-shaped lens picker showing 24 millimetres with a yellow indicator.", tags: ["Interface", "Web design"] },
      { code: "UI-08", title: "Workout App", status: "Interface study", area: "Product design", tag: "ui", demo: "workoutApp", ptr: "hover", ar: "1200 / 1533", alt: "A phone showing a workout summary with heart rate zones and a chart on a cream ground.", pos: "50% 22%", cover: true, bg: "#FCF0E6",
        scope: "A phone showing a workout summary with heart rate zones and a chart on a cream ground.", tags: ["Interface", "Product design"] },
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
        if (it.bare) li.classList.add("lab__tile--bare");
        if (it.cover) li.classList.add("lab__tile--cover");   // a rebuilt interface keeps the shape of the screen it came from
        if (it.ar) li.style.setProperty("--ar", it.ar);
        li.style.setProperty("--ix-bg", it.bg);
        const stage = el("div", "lab__stage"); li.appendChild(stage);
        if (it.ptr !== "hover") stage.inert = true;   // the cover button owns the tile; controls inside the loop must not be tabbable or announced twice
        window.Playground && window.Playground.DEMOS[it.demo] && window.Playground.DEMOS[it.demo](stage, { auto: true });
      } else if (it.image) {
        // Branding: the artwork itself, contained on a tint taken from it
        li.classList.add("lab__tile--ix", "lab__tile--noptr"); li.style.setProperty("--ix-bg", it.bg);
        if (it.cover) li.classList.add("lab__tile--bleed", "lab__tile--cover");
        if (it.ar) li.style.setProperty("--ar", it.ar);   // an interface screenshot fills the tile edge to edge
        const stage = el("div", "lab__stage lab__stage--img"), img = el("img");
        img.src = it.image; img.alt = it.alt || it.title; img.loading = "lazy"; img.decoding = "async"; if (it.pos) img.style.objectPosition = it.pos; stage.appendChild(img); li.appendChild(stage);
      } else if (it.thumb) {
        // Contextual thumbnail: the page itself inside a small browser frame, cropped by the tile
        li.classList.add("lab__tile--shot", "grain");
        ["#3C9A98", "#C6E6DF", "#86C6C0"].forEach((c, k) => li.style.setProperty(`--t${k + 1}`, c));
        const shot = el("div", "lab__shot"), bar = el("div", "lab__shotbar"), img = el("img");
        bar.append(el("i"), el("i"), el("i"), el("span", "", it.host || ""));
        img.src = it.thumb; img.alt = `Preview of the ${it.title} page`; img.loading = "lazy"; img.decoding = "async";
        shot.append(bar, img); li.appendChild(shot);
        li.addEventListener("pointermove", (e) => {
          const r = li.getBoundingClientRect();
          li.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
          li.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
        });
      }
      if (it.wide) li.classList.add("lab__tile--wide");
      if (it.tall) li.classList.add("lab__tile--tall");
      li.append(bottom);
      const open = el("button", "lab__cover"); open.type = "button"; open.setAttribute("aria-label", `Open ${it.title}`);
      li.appendChild(open);
      li.addEventListener("click", (e) => {
        if (e.target.closest("a, input")) return;
        // A whole project rather than a study: it gets its own page, through the same fade as every other link
        if (it.page) { const go = el("a"); go.href = it.href; go.hidden = true; document.body.appendChild(go); go.click(); go.remove(); return; }
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
    const posts = document.querySelector("[data-posts]");
    if (posts && posts.classList.contains("posts--curated")) {
      posts.querySelectorAll(".post").forEach((post, i) => { post.hidden = i > 1; });
      setCount(2);
    } else {
      setCount(document.querySelectorAll("[data-posts] .post").length);
    }
  }

  if (page === "case") {
    // ── Case study as a long-form read: breadcrumb → hero → title and meta → sections, beside a sticky contents rail ──
    const n = PROJECTS.length;
    const bySlug = PROJECTS.findIndex((x) => x.slug === location.pathname.replace(/\.html$/, "").replace(/\/+$/, "").split("/").filter(Boolean).pop());
    const id = bySlug >= 0 ? bySlug + 1 : Math.min(n, Math.max(1, parseInt(new URLSearchParams(location.search).get("case") || "1", 10) || 1));
    const p = PROJECTS[id - 1];
    const visibleCase = DISPLAY_PROJECTS.includes(p);
    const displayId = visibleCase ? DISPLAY_PROJECTS.indexOf(p) + 1 : id;
    const mount = document.querySelector("[data-cs-root]");
    document.body.dataset.caseId = id;
    // Prerendered studies already carry the title, description and social tags in the HTML.
    // Google runs this script, so rewriting them here would throw away those titles.
    if (bySlug < 0) {
    document.title = (`${p.name} case study | Sambit Nayak, Product Designer`.length <= 60 ? `${p.name} case study | Sambit Nayak, Product Designer` : `${p.name} case study | Sambit Nayak`);
    // Per-case SEO: canonical, description, social tags and Article structured data (set at load; Google renders JS)
    {
      const origin = "https://www.sambitnayak.com", url = `${origin}/work/${p.slug}`, title = document.title;
      const img = origin + ((p.thumb && (p.thumb.poster || p.thumb.navPoster)) || (p.thumbnail && p.thumbnail.src) || (p.photo && p.photo.src) || "/assets/og-image.jpg");
      const put = (sel, make, val) => { let t = document.head.querySelector(sel); if (!t) { t = document.createElement(make[0]); make[1].forEach(([k, v]) => t.setAttribute(k, v)); document.head.appendChild(t); } t.setAttribute(make[2], val); };
      put('link[rel="canonical"]', ["link", [["rel", "canonical"]], "href"], url);
      put('meta[name="description"]', ["meta", [["name", "description"]], "content"], p.seo || p.desc);
      [["og:type", "article"], ["og:site_name", "Sambit Nayak"], ["og:title", title], ["og:description", p.seo || p.desc], ["og:url", url], ["og:image", img]].forEach(([k, v]) => put(`meta[property="${k}"]`, ["meta", [["property", k]], "content"], v));
      [["twitter:card", "summary_large_image"], ["twitter:title", title], ["twitter:description", p.seo || p.desc], ["twitter:image", img]].forEach(([k, v]) => put(`meta[name="${k}"]`, ["meta", [["name", k]], "content"], v));
      document.head.querySelectorAll("script[data-cs-ld]").forEach((x) => x.remove());
      const ld = document.createElement("script"); ld.type = "application/ld+json"; ld.dataset.csLd = "";
      ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: p.title, name: `${p.name}: case study`, description: p.seo || p.desc, url, mainEntityOfPage: url, image: img, author: { "@type": "Person", name: "Sambit Nayak", url: origin + "/" } });
      document.head.appendChild(ld);
      const bc = document.createElement("script"); bc.type = "application/ld+json"; bc.dataset.csLd = "";
      bc.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [["Home", "/"], ["Work", "/work"], [p.name, `/work/${p.slug}`]].map(([name, u], i) => ({ "@type": "ListItem", position: i + 1, name, item: origin + u })) });
      document.head.appendChild(bc);
    }
    }
    const reduced = motionReduced();
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
    const phId = (tag, k) => `C${displayId}-${tag}-${k + 1}`;
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
      else if (mode === "ratio") cls.push("study__media--ratio");
      else cls.push("study__media--duo");
      return cls.join(" ");
    };
    const mediaEl = (m, tag, k) => {
      if (m.diagram) return diagramEl(m.diagram);
      if (m.demo) { // an authored product animation, mounted by js/case-demos.js
        const f = el("figure", "shot shot--wide shot--demo"), d = el("div", "cs-demo");
        d.dataset.caseDemo = m.demo; if (m.set) d.dataset.set = m.set; d.setAttribute("role", "region"); d.setAttribute("aria-label", m.alt || m.cap || "Product demo");
        f.appendChild(d); if (m.cap) f.appendChild(el("figcaption", "", m.cap)); return f;
      }
      if (typeof m === "string" || m.ph) return placeholder(typeof m === "string" ? m : m.ph, (typeof m === "object" && m.ratio) || "16:10", phId(tag, k));
      if (m.video) {
        const f = el("figure", "shot shot--video"), tile = el("div", "shot__tile"), v = el("video");
        v.muted = true; v.loop = true; v.playsInline = true; v.preload = "none"; v.poster = m.poster || ""; v.setAttribute("aria-label", m.alt || m.cap || "Video");
        const src = el("source"); src.src = m.video; src.type = "video/mp4"; v.appendChild(src);
        autoVideo(v, 0.45, true);
        tile.appendChild(v); f.appendChild(tile); if (m.cap) f.appendChild(el("figcaption", "", m.cap)); return f;
      }
      const f = el("figure", "shot" + (m.wide ? " shot--wide" : "") + (m.board ? " shot--board" : "")), tile = el(m.board ? "div" : "button", "shot__tile"), img = el("img");
      if (m.ar) f.style.setProperty("--ar", m.ar); // width : height, so a ratio row shares one height
      // A board is read in place (and scrolls sideways on a phone), so its tile is a focusable region rather than an enlarge button
      if (m.board) { tile.tabIndex = 0; tile.setAttribute("role", "region"); tile.setAttribute("aria-label", m.cap || "Diagram"); }
      else { tile.type = "button"; tile.setAttribute("aria-label", `Enlarge: ${m.cap || m.alt}`); }
      img.alt = m.alt || m.cap || ""; img.loading = "lazy"; img.decoding = "async";
      img.addEventListener("load", () => img.classList.add("is-loaded")); img.src = m.src;
      if (img.complete) img.classList.add("is-loaded");
      if (!m.board) tile.addEventListener("click", () => openLightbox(m.src, img.alt, tile));
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
    // Showcase tiles (layout: "tiles"): coloured panels with big screens rising from the bottom edge, in a 12-column grid
    const tilesEl = (tiles) => {
      const g = el("div", "study__tiles is-wide");
      tiles.forEach((t) => {
        const d = el("figure", "tile" + (t.fill ? " tile--fill" : "")); d.style.setProperty("--span", t.span || 12); d.dataset.bg = t.bg || "ink";
        if (t.video) {
          // A screen recording of a flow: muted, looping, plays only while it is on screen
          d.classList.add("tile--fill", "tile--video");
          const v = el("video"); v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.preload = "none"; v.poster = t.poster; v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-label", t.alt);
          const src = el("source"); src.src = t.video; src.type = "video/mp4"; v.appendChild(src); d.appendChild(v); autoVideo(v, 0.35, true);
        }
        else if (t.fill) { const im = el("img"); im.src = t.src; im.alt = t.alt; im.loading = "lazy"; im.decoding = "async"; d.appendChild(im); }
        else { d.style.setProperty("--n", t.shots.length); t.shots.forEach((m) => { const im = el("img"); im.src = m.src; im.alt = m.alt; im.loading = "lazy"; im.decoding = "async"; d.appendChild(im); }); }
        if (t.cap) d.appendChild(el("figcaption", "", t.cap));
        g.appendChild(d);
      });
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.querySelectorAll("img").forEach((im) => im.classList.add("is-in")); io.unobserve(e.target); } }), { threshold: 0.15 });
      g.querySelectorAll(".tile").forEach((t) => io.observe(t));
      return g;
    };
    const statementOf = (sec) => { const s = sec.statement || sec.title, k = s.indexOf(": "); const t = k > -1 && k < 48 ? s.slice(k + 2) : s; return t.charAt(0).toUpperCase() + t.slice(1); };
    // Every study tells its story in the same seven sections, in this order. A section's own `title` is optional;
    // `parts` hold the extra beats (what we killed, what we shipped, one per surface) that sit under a section.
    // Every study reads in the same five beats: Overview, Problem, Hypothesis, Solution, Learning. Each study keeps its own sections as
    // written; FIVE_MAP says which of them sit under which beat (numbers index `sections`; an object is a beat written for the map).
    // The first section in a group becomes the beat, the rest become labelled sub-parts under it, so nothing is dropped.
    // Hypotheses are drafted from what each study already claims, and should be confirmed by the author.
    const FIVE = ["Overview", "Problem", "Hypothesis", "Solution", "Learning"];
    const FIVE_MAP = {
      "trailhead-solve": { five: [[0, 3], [1, 2], ["h", 4], [5], [6]], h: { statement: "Hypothesis: catch the ChatGPT moment, and experts come back.", text: ["If Trailhead answers an expert's hardest question at the moment they would otherwise open ChatGPT, and gives them a reason to return between milestones, it can become the first place they go when they are stuck."] } },
      "cotonai-modes": { five: [[0, 3], [1, 2], ["h", 4], [5], [6]], h: { statement: "Hypothesis: remove the need to prompt, and more people get a good first result.", text: ["Two ways of helping users prompt better had already failed. The bet was to stop teaching prompting and give each stage of fashion work a structured entry point, so ambiguity drops while creativity stays open.", "Every iteration was judged on usage data, not opinion."] } },
      "cotonai-agent": { five: [[0, 3], [1, 2], ["h", 4], [5], [6]], h: { statement: "Hypothesis: if the canvas carries the context, a prompt stops starting from zero.", text: ["The canvas shouldn't only hold the work. It should be the context an agent understands the work through: why a color was rejected, which silhouette was approved, what the brief asked for.", "The agent plans and executes while the designer approves each step. Only the live workspace has run in a pilot; the agent itself is still a proposal."] } },
      "gap-3d-fit": { five: [[1], [2, 3], ["h"], [0, 4], [5]], h: { statement: "Hypothesis: shoppers need less sizing ambiguity, not more 3D realism.", text: ["Hold the 3D viewer constant and change only how the flow asks for input: ask little, then let the shopper verify the size.", "Sessions showed shoppers dropping off as the inputs piled up, before they saw any value. The test was whether cutting that friction would lift add-to-bag."] } },
      "cotonai-design-system": { five: [[0], [1], ["h"], [2, 3, 4], [6, 5]], h: { statement: "Hypothesis: one generated source, with gates that fail the build, stops the system drifting.", text: ["An audit found that nothing enforced the design: colour, size and controls were decided again in every file. If one file generates every output and machines check the numbers, consistency stops depending on people remembering the rules.", "Only stage 1 is applied, so everything measured is a stage 1 number."] } },
      "gatherly": { five: [[1], [{ title: "Problem", statement: "Problem: one events app has to serve people who go and people who host.", text: ["The brief was an events app in the spirit of Airbnb, designed for an agency in three months. Someone had to be able to find an event and get a ticket, and someone else to host their own."] }], ["h"], [0, 2, 3], [4]], h: { statement: "Hypothesis: four journeys and one token set are enough for the whole product.", text: ["Cover the product with four key flows, and drive light and dark from a single token set, so a three-month MVP stays consistent."] } },
      "arcade-dev": {
        web: { five: [[0, 1], [2, 3], ["h"], [4, { title: "Connect", statement: "Connect: Authorize where the work happens. Not on a settings page.", text: ["Per-user authorization is handled where it happens, inside the Playground conversation, instead of sending someone to a settings page. Connected accounts show their status with the fix beside it, and a gateway publishes one MCP URL that clients connect to."], media: [{ demo: "arcadeFeatures", set: "connect", alt: "Feature explorer. Use the toggle to switch between four screens: Tool catalog, Playground, Accounts and Gateway builder." }] }, { title: "Debug a run", statement: "Debug a run: Why it failed. And what to do next.", text: ["A failed run opens on a trace that says what stopped it. A held call and an expired login are different problems, so each gets its own state and its own verb: Review for a call that needs a person, Re-authorize for access that expired."], media: [{ demo: "arcadeFeatures", set: "debug", alt: "Feature explorer. Use the toggle to switch between three trace screens: Policy blocked, Auth expired and All failure states." }] }, 5, 6, 7, { title: "Arcade Agent", statement: "Arcade Agent: Reads the page. Drafts the change. Waits for approval.", text: ["A toggle in every top bar, or the keyboard shortcut, summons it. It reads the current page and drafts changes, and changes to rules, accounts or keys always wait for an approval card."], media: [{ demo: "arcadeFeatures", set: "agent", alt: "Feature explorer. Use the toggle to switch between four Arcade Agent screens: Summoned, Docked panel, Agent-first home and Charts." }] }, 8], [9]], h: { statement: "Hypothesis: First call first. Control as you grow.", text: ["The same console serves a developer on day one and a security lead on day ninety, and showing both at once buries both. The bet: start with a working call in minutes, and let navigation, rules and approvals appear as the person needs them.", "None of it has been tested with users yet. The last section lists what to measure."] } },
        mobile: { five: [[0, 1], [2, 3], ["h"], [4, 5, 6, 7], [8]], h: { statement: "Hypothesis: Three questions, answered fast. The rest goes to the laptop.", text: ["The phone has to answer what needs me, what broke, and what it is costing. The bet: an Inbox and a chat, not a shrunken console, with Face ID for anything that loosens a rule and a handoff to the laptop for big jobs.", "It is a design concept, so this is a hypothesis to test, not a result."] } },
      },
    };
    const toFive = (v, map) => {
      if (!map) return v;
      const pick = (x) => (x === "h" ? { title: "Hypothesis", ...map.h } : typeof x === "number" ? v.sections[x] : x);
      // A merged section keeps its own label: its title, or the word before the colon in its statement when the title is the generic one
      const label = (sec) => (sec.title && !CS_STRUCTURE.includes(sec.title) ? sec.title : (sec.statement || "").split(": ")[0] || sec.title);
      const sections = map.five.map((group) => {
        const [first, ...rest] = group.map(pick), parts = [...(first.parts || [])];
        rest.forEach(({ parts: more, ...sec }) => { parts.push({ ...sec, title: label(sec) }); parts.push(...(more || [])); });
        return { ...first, parts };
      });
      return { ...v, sections, structure: FIVE };
    };
    const CS_STRUCTURE = ["Overview / Background", "Defining the Problem", "Understanding your Users", "Your Role and Responsibilities", "Scope and Constraints", "Ideation Steps (The Solution)", "Outcomes and Takeaways"];
    // A study can carry its own `structure` (Gap 3D Fit follows a research-led flow); otherwise it uses the seven above
    // A study can also carry `variants` (Arcade.dev: Web console and iOS app): each has its own lead, meta, structure and sections,
    // and a switch under the title shows one at a time. Section ids get the variant key as a prefix so they stay unique.
    const variants = (p.cs.variants || [{ key: "", label: "", lead: p.desc, meta: p.cs.meta, structure: p.cs.structure, sections: p.cs.sections }])
      .map((v) => { const m = FIVE_MAP[p.slug]; return toFive(v, m && (v.key ? m[v.key] : m)); });
    const vsecs = variants.map((v) => {
      const STRUCT = v.structure || CS_STRUCTURE;
      if (v.sections.length !== STRUCT.length) console.warn(`${p.name}: expected ${STRUCT.length} sections, found ${v.sections.length}`);
      return v.sections.map((sec, i) => { const title = STRUCT[i] || sec.title; return { sec, i, title, id: (v.key ? v.key + "-" : "") + (slug(title) || `section-${i + 1}`) }; });
    });
    let active = Math.max(0, variants.findIndex((v) => v.key && (new URLSearchParams(location.search).get("view") === v.key || location.hash.startsWith(`#${v.key}-`))));

    // Placeholders take the project's colour, not grey
    mount.style.setProperty("--ph-bg", p.photo ? `url("${p.photo.src}") ${p.photo.pos} / cover` : `radial-gradient(70% 90% at 18% 12%, ${p.tint[0]}, transparent 70%), radial-gradient(80% 80% at 88% 92%, ${p.tint[1]}, transparent 72%), ${p.tint[2]}`);
    const main = el("div", "study__main" + (p.cs.layout === "tiles" ? " study__main--tiles" : ""));

    // ── Breadcrumb ──
    const crumb = el("p", "study__crumb is-wide"), back = el("a"); back.href = "/work";
    back.innerHTML = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8H3m4-4L3 8l4 4" stroke="currentColor" stroke-width="1.5"/></svg>Work';
    crumb.append(back, el("span", "study__sep", "/"), el("span", "", p.name));

    // ── Hero: the product video, or the project name on its tint ──
    const hero = el("div", "study__hero is-wide");
    if (p.thumb) {
      const v = el("video"); v.muted = true; v.loop = true; v.playsInline = true; v.preload = "metadata"; v.poster = p.thumb.poster; v.setAttribute("aria-label", p.thumb.alt);
      const src = el("source"); src.src = p.thumb.video; src.type = "video/mp4"; v.appendChild(src);
      autoVideo(v, 0.3, true);
      hero.appendChild(v);
    } else if (p.thumbnail && p.thumbnail.hero) {
      const im = el("img"); im.src = p.thumbnail.src; im.alt = p.thumbnail.alt; im.decoding = "async"; im.fetchPriority = "high";
      hero.appendChild(im);
    } else {
      hero.classList.add("study__hero--tint");
      p.tint.forEach((c, k) => hero.style.setProperty(`--g${k + 1}`, c));
      if (p.photo) { hero.classList.add("study__hero--photo"); hero.style.background = `url("${p.photo.src}") ${p.photo.pos} / cover`; }
      hero.appendChild(el("span", "study__heroname", p.name));
    }

    // ── Title and meta ──
    const head = el("header", "study__head");
    const h1 = el("h1", "", p.title); h1.id = "cs-title";
    head.append(el("p", "study__eyebrow", `Case study ( ${pad2(displayId)} ) · ${p.org}`), h1);
    const vheads = variants.map((v) => {
      const w = el("div", "study__vhead"), meta = el("dl", "study__meta");
      v.meta.forEach(([k, val]) => { const d = el("div"); d.append(el("dt", "", k), el("dd", "", val)); meta.appendChild(d); });
      w.append(el("p", "study__lead", v.lead), meta); return w;
    });
    let switchBtns = [];
    if (variants.length > 1) {
      const sw = el("div", "study__switch"); sw.setAttribute("role", "group"); sw.setAttribute("aria-label", "Choose a case study");
      switchBtns = variants.map((v, k) => { const b = el("button", "", v.label); b.type = "button"; b.addEventListener("click", () => show(k, true)); sw.appendChild(b); return b; });
      head.appendChild(sw);
    }
    vheads.forEach((w) => head.appendChild(w));
    main.append(crumb, hero, head);

    // ── Sections ──
    // A section and each of its parts fill the same way: text, stats, rows, media, steps, decisions, cards, quote, button
    const fillSection = (s, sec, ph) => {
      (sec.text || []).forEach((t) => s.appendChild(el("p", "study__p", t)));
      // A flat explainer board (see tools/case-boards/ref-boards): one wide image that carries what the text would otherwise say
      if (sec.board) { const g = el("div", "study__media study__media--stack is-wide"); g.appendChild(mediaEl({ ...sec.board, board: true, wide: true }, ph, 0)); s.appendChild(g); }

      if (sec.tiles) s.appendChild(tilesEl(sec.tiles));
      if (sec.stats) s.appendChild(statsEl(sec.stats));
      const rows = plainRows(sec); if (rows.length) s.appendChild(trio(rows));
      if (sec.viz) s.appendChild(caseViz(sec.viz));
      if (sec.prototype) { const ap = arcadePrototype(sec.prototype); ap.classList.add("is-wide"); s.appendChild(ap); }
      if (sec.media && sec.media.length) {
        const g = el("div", studyMediaGrid(sec.media, sec.mediaLayout));
        sec.media.forEach((m, mk) => g.appendChild(mediaEl(m, ph, mk))); s.appendChild(g);
      }
      if (sec.steps) { s.appendChild(el("h3", "study__sub", sec.stepsTitle || "How it works")); s.appendChild(trio(sec.steps, true)); }
      (sec.trades || []).forEach((t) => {
        s.appendChild(el("h3", "study__sub", `${t.n}: ${t.t}`));
        const rich = !!(t.media || t.find);   // decisions with a real screen read top to bottom: screen, trade-off, evidence
        const gridOf = () => { if (!t.media) return; const g = el("div", studyMediaGrid(t.media, t.mediaLayout)); t.media.forEach((m, mk) => g.appendChild(mediaEl(m, t.n, mk))); s.appendChild(g); };
        if (rich) gridOf();
        if (t.rows) { const rows = trio(t.rows); if (rich) rows.classList.add("study__trio--facts"); s.appendChild(rows); }
        if (!rich) gridOf();
        if (t.find) {
          const f = el("div", "study__find");
          t.find.forEach(([k, v]) => { const d = el("div"); d.append(el("span", "study__findk", k), el("p", "", v)); f.appendChild(d); });
          s.appendChild(f);
        }
        if (t.note) s.appendChild(el("p", "study__p study__note", t.note));
      });
      if (sec.cards) s.appendChild(trio(sec.cards));
      // Testimonial cards: a row of short quotes in dark / accent / light tiles, with a line saying how they were sourced
      if (sec.quotes) {
        const w = el("div", "study__qs is-wide"), v = ["dark", "accent", "light"];
        w.appendChild(el("h3", "study__sub", sec.quotes.title || "In their words"));
        const ul = el("ul", "study__qcards"); ul.setAttribute("role", "list");
        sec.quotes.items.forEach((it, k) => {
          const li = el("li", "qc qc--" + v[k % 3]), f = el("footer");
          f.append(el("span", "", it.who || "Participant"), el("span", "qc__tag", it.tag || ""));
          li.append(el("p", "", `“${it.q}”`), f); ul.appendChild(li);
        });
        w.appendChild(ul);
        if (sec.quotes.cap) w.appendChild(el("p", "study__qcap", sec.quotes.cap));
        s.appendChild(w);
      }
      if (sec.quote) {
        const q = el("blockquote", "study__quote"); q.append(el("p", "", `“${sec.quote}”`), el("footer", "", sec.quoteBy || "Power user interview"));
        s.appendChild(q);
      }
      // A hypothesis or finding worth stopping on, then the question it leaves us with
      if (sec.insight) { const d = el("div", "study__insight"); d.append(el("span", "study__k", sec.insight[0]), el("p", "", sec.insight[1])); s.appendChild(d); }
      if (sec.hmw) { const d = el("p", "study__hmw"); d.append(el("span", "study__k", "The question"), "How might we " + sec.hmw); s.appendChild(d); }
      if (sec.cta) { const a = el("a", "study__btn"); a.href = sec.cta.href; a.target = "_blank"; a.rel = "noopener"; a.innerHTML = chev; a.prepend(sec.cta.label); s.appendChild(a); }
    };
    const wraps = vsecs.map((secs, vi) => {
      const wrap = el("div", "study__variant"); main.appendChild(wrap);
      secs.forEach(({ sec, i, title, id: sid }) => {
      wrap.appendChild(el("hr", "study__hr"));
      const s = el("section", "study__sec"); s.id = sid; s.setAttribute("aria-labelledby", `${sid}-t`);
      const h = el("h2", "study__t", statementOf(sec)); h.id = `${sid}-t`;
      const k = el("p", "study__k"); k.append(el("span", "study__num", pad2(i + 1)), title);
      s.append(k, h);
      fillSection(s, sec, sec.ph || pad2(i + 1));
      (sec.parts || []).forEach((part) => {
        const ph3 = el("h3", "study__sub");   // the mono label sits inside the heading, so label and claim read as one
        if (part.statement) ph3.append(el("span", "study__k", part.title), statementOf(part)); else ph3.append(part.title);
        s.appendChild(ph3);
        fillSection(s, part, part.ph || sec.ph || pad2(i + 1));
      });
      wrap.appendChild(s);
      });
      return wrap;
    });

    // ── Previous and next ──
    main.appendChild(el("hr", "study__hr"));
    const pn = el("nav", "study__pn"); pn.setAttribute("aria-label", "More case studies");
    const caseNav = visibleCase ? DISPLAY_PROJECTS : PROJECTS;
    const atCase = caseNav.indexOf(p);
    [[(atCase - 1 + caseNav.length) % caseNav.length, "Previous"], [(atCase + 1) % caseNav.length, "Next"]].forEach(([q, l]) => {
      const nextProject = caseNav[q];
      const a = el("a"); a.href = nextProject.href;
      a.append(el("span", "study__k", `${l} case study`), el("b", "", nextProject.name), el("span", "", `${nextProject.metric.value} ${nextProject.metric.label}`));
      pn.appendChild(a);
    });
    main.appendChild(pn);

    // ── Contents rail: section links, the current one marked ──
    const toc = el("nav", "study__toc"); toc.setAttribute("aria-label", "Contents");
    const tocs = vsecs.map((secs) => {
      const ol = el("ol"); ol.setAttribute("role", "list");
      const links = secs.map(({ i, title, id: sid }) => {
        const li = el("li"), a = el("a"); a.append(el("span", "study__num", pad2(i + 1)), title); a.href = `#${sid}`;
        a.addEventListener("click", (e) => { e.preventDefault(); document.getElementById(sid).scrollIntoView({ behavior: smooth, block: "start" }); history.replaceState(null, "", `#${sid}`); });
        li.appendChild(a); ol.appendChild(li); return a;
      });
      return { ol, links };
    });
    const book = el("a", "study__book"); book.href = BOOK_A_CALL; book.target = "_blank"; book.rel = "noopener"; book.innerHTML = chev; book.prepend("Book a call");
    toc.append(...tocs.map((t) => t.ol), book);
    // ── Bottom dock: the same sections as a floating pill, the current one filled. Follows the active variant; a study with a `live` link leads with it ──
    document.querySelectorAll(".study__dock").forEach((d) => d.remove());
    const dock = el("nav", "study__dock"); dock.setAttribute("aria-label", "Jump to section");
    const live = p.cs.live || p.live;
    if (live) { const a = el("a", "study__dock-live"); a.href = live.href; a.target = "_blank"; a.rel = "noopener"; a.append(live.label || "Live website"); dock.appendChild(a); }
    const docks = vsecs.map((secs) => {
      const row = el("div", "study__dock-row"); row.setAttribute("role", "list");
      const links = secs.map(({ title, id: sid }) => {
        const a = el("a", "", title); a.href = `#${sid}`; a.setAttribute("role", "listitem");
        a.addEventListener("click", (e) => { e.preventDefault(); document.getElementById(sid).scrollIntoView({ behavior: smooth, block: "start" }); history.replaceState(null, "", `#${sid}`); });
        row.appendChild(a); return a;
      });
      return { row, links };
    });
    // Soft fades on whichever end has more sections hidden
    const fades = (r) => { r.classList.toggle("has-l", r.scrollLeft > 4); r.classList.toggle("has-r", r.scrollLeft + r.clientWidth < r.scrollWidth - 4); };
    docks.forEach((d) => d.row.addEventListener("scroll", () => fades(d.row), { passive: true }));
    addEventListener("resize", () => docks.forEach((d) => fades(d.row)));
    dock.append(...docks.map((d) => d.row)); document.body.appendChild(dock); requestAnimationFrame(() => docks.forEach((d) => fades(d.row)));
    const markDock = (k) => docks[active].links.forEach((a, j) => {
      if (j === k) { a.setAttribute("aria-current", "true"); const r = docks[active].row; r.scrollTo({ left: a.offsetLeft - (r.clientWidth - a.offsetWidth) / 2, behavior: motionReduced() ? "auto" : "smooth" }); }
      else a.removeAttribute("aria-current");
    });
    // Show it once the reader is past the title and before the previous / next links
    const pnEl = main.querySelector(".study__pn"), lead = main.querySelector(".study__sec");
    const dockOn = () => { const top = lead ? lead.getBoundingClientRect().top : 0, end = pnEl ? pnEl.getBoundingClientRect().top : Infinity; dock.classList.toggle("is-on", top < innerHeight * 0.5 && end > innerHeight * 0.92); };
    addEventListener("scroll", dockOn, { passive: true }); addEventListener("resize", dockOn); requestAnimationFrame(dockOn);
    const mark = (k) => { tocs[active].links.forEach((a, j) => (j === k ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"))); markDock(k); };
    const visible = new Set();
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      const first = vsecs[active].findIndex(({ id: sid }) => [...visible].some((v) => v.id === sid));
      if (first > -1) mark(first);
    }, { rootMargin: "-20% 0px -70% 0px" });
    main.querySelectorAll(".study__sec").forEach((s) => spy.observe(s));
    // Show one variant at a time; the contents rail, the lead and the meta follow it
    function show(k, user) {
      active = k; visible.clear();
      wraps.forEach((w, j) => { w.hidden = j !== k; });
      vheads.forEach((w, j) => { w.hidden = j !== k; });
      tocs.forEach((t, j) => { t.ol.hidden = j !== k; });
      docks.forEach((d, j) => { d.row.hidden = j !== k; });
      switchBtns.forEach((b, j) => b.setAttribute("aria-pressed", String(j === k)));
      mark(0);
      if (user) {
        const u = new URL(location.href); u.hash = ""; u.searchParams.set("view", variants[k].key); history.replaceState(null, "", u);
        const top = main.querySelector(".study__switch"); if (top) { const y = top.getBoundingClientRect().top + window.scrollY - 24; if (y < window.scrollY) window.scrollTo({ top: y, behavior: "auto" }); }
      }
    }
    show(active, false);

    mount.replaceChildren(toc, main); // replaces the prerendered copy (tools/prerender-case-studies.cjs) on hydrate
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) requestAnimationFrame(() => t.scrollIntoView({ block: "start" })); }
  }
})();

// ── Motion, after bymonolog.com: fade-to-black page transitions, headlines rising line by line out of masks,
//    supporting copy and media arriving in order, and section headings and case tiles revealing on scroll ──
(() => {
  const reduced = motionReduced();
  const html = document.documentElement;
  const cover = document.querySelector(".pt-cover") || document.body.appendChild(Object.assign(document.createElement("div"), { className: "pt-cover" }));
  const done = (el, cls, ms) => setTimeout(() => el.classList.remove(...cls), ms);   // hand elements back to their own styles once revealed
  if (reduced) { html.classList.remove("pt-pending", "pt-in"); return; }

  // Wrap each word in a mask, leaving links and other inline markup where they are
  const split = (el) => {
    if (!el.dataset.split) {
      const walk = (node) => [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          // Punctuation right after a link or other inline element joins that element's last word, so a line can't break before it
          const tail = n.previousSibling && n.previousSibling.nodeType === 1 && [...n.previousSibling.querySelectorAll(".w > span")].pop();
          let first = true;
          n.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.append(p); first = false; return; }
            if (first && tail && /^[.,;:!?)\]”’…]+$/.test(p)) { tail.append(p); first = false; return; }
            first = false;
            const w = document.createElement("span"), i = document.createElement("span");
            w.className = "w"; i.textContent = p; w.append(i); frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.matches(".mx")) {
          const w = document.createElement("span"), i = document.createElement("span");   // mixed-type word: one mask around the whole word
          w.className = "w"; n.replaceWith(w); i.append(n); w.append(i);
        } else if (n.nodeType === 1 && !n.matches("svg, img, br, .w")) walk(n);
      });
      walk(el); el.dataset.split = "1";
    }
    // Words on the same line move together; each line follows the one above
    const words = [...el.querySelectorAll(".w")], tops = [];
    words.forEach((w) => { const t = w.offsetTop; let li = tops.findIndex((x) => Math.abs(x - t) < 6); if (li < 0) { tops.push(t); li = tops.length - 1; } w.firstChild.style.setProperty("--d", `${li * 80}ms`); });
    return el;
  };
  const showHeading = (el, delay = 0) => {
    split(el).classList.add("rvh");
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => el.classList.add("in"), delay)));
  };
  const inView = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; };

  // ── Entrance: headline first, then the copy around it in page order, media, and the nav last ──
  const LEAD = ".eyebrow, .welcome, .intro__about, .intro .btn, .status, .about-intro__lede, .facts, .portrait, .work__eyebrow, .work__sub, .chips, .study__crumb, .study__eyebrow, .study__lead, .study__meta";
  const enter = (fromNav) => {
    const h1 = document.querySelector("main h1, .study__head h1");
    if (h1 && inView(h1)) showHeading(h1);
    let k = 0;
    document.querySelectorAll(LEAD).forEach((el) => {
      if (!inView(el)) return;
      el.classList.add("rvf"); el.style.setProperty("--d", `${140 + k++ * 70}ms`);
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("in")));
      done(el, ["rvf", "in"], 1800 + k * 70);
    });
    document.querySelectorAll(".study__hero").forEach((el) => { if (inView(el)) media([el], 260); });
    if (fromNav) {
      const nav = document.querySelectorAll(".header .seg");
      nav.forEach((el, i) => { el.classList.add("rvf", "rvf--down"); el.style.setProperty("--d", `${380 + i * 60}ms`); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("in"))); done(el, ["rvf", "rvf--down", "in"], 1700); });
    }
  };

  // ── Media rise out of a mask, a little zoomed, and settle ──
  const media = (els, base = 0) => els.forEach((el, i) => {
    el.classList.add("rvm"); el.style.setProperty("--d", `${base + i * 100}ms`);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("in")));
    done(el, ["rvm", "in"], 1700 + base + i * 100);
  });

  // ── Scroll: section headings and case tiles reveal as they arrive ──
  const scrollReveal = () => {
    const heads = [...document.querySelectorAll(".work__title, .study__t, .cs__label h2, .post__title")].filter((h) => !h.closest("main h1") && h.tagName !== "H1");
    const tiles = [...document.querySelectorAll(".case__tile, .lockcard__tile")];
    // A tile clipped to nothing never counts as visible, so each tile is watched through its unclipped parent
    const holder = new Map();
    const io = new IntersectionObserver((entries) => {
      const batch = [];
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        if (holder.has(e.target)) batch.push(holder.get(e.target)); else e.target.classList.add("in");
      });
      if (batch.length) media(batch);
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    heads.forEach((h) => { if (inView(h)) showHeading(h, 320); else { split(h).classList.add("rvh"); io.observe(h); } });
    tiles.forEach((t) => { if (inView(t)) return; t.classList.add("rvm"); holder.set(t.parentElement, t); io.observe(t.parentElement); });
  };

  // ── Page transitions: same-site links fade the page to black, then navigate ──
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== "_self" || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
    if (url.pathname === location.pathname && url.search === location.search) return;   // in-page anchors scroll as before
    e.preventDefault();
    cover.classList.add("is-on");
    try { sessionStorage.setItem("pt", "1"); } catch (err) {}
    setTimeout(() => (location.href = url.href), 140);
    setTimeout(() => cover.classList.remove("is-on"), 2500);   // navigation cancelled or failed: never leave the page black
  });
  // Coming back through the back button restores the page as it was left; lift the cover
  addEventListener("pageshow", (e) => { if (e.persisted) { cover.classList.remove("is-on"); html.classList.remove("pt-in", "pt-pending"); } });

  const start = () => {
    const fromNav = html.classList.contains("pt-in");
    enter(fromNav);
    scrollReveal();
    html.classList.remove("pt-pending");   // everything that animates is in its start state now
    if (fromNav) {
      // Arriving from another page: the cover is already black; lift it as the headline starts to rise
      cover.classList.add("is-lift"); html.classList.remove("pt-in");
      setTimeout(() => cover.classList.remove("is-lift"), 600);
    }
  };
  // Wait briefly for web fonts so lines split where they will settle, but never hold the black cover for long
  const ready = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 200))]);
  if (document.getElementById("loader")) addEventListener("loader:done", () => ready.then(start), { once: true });
  else ready.then(start);
})();

// ── Writing reader: highlight the section in view in the left index ──
(() => {
  const toc = document.querySelector("[data-reader] .rd__toc");
  if (!toc || !("IntersectionObserver" in window)) return;
  const links = new Map([...toc.querySelectorAll("a")].map((a) => [a.getAttribute("href").slice(1), a]));
  const heads = [...links.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  const set = (id) => links.forEach((a, k) => a.classList.toggle("is-active", k === id));
  const io = new IntersectionObserver((es) => {
    const seen = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (seen) set(seen.target.id);
  }, { rootMargin: "-10% 0px -75% 0px" });
  heads.forEach((h) => io.observe(h));
})();

// ── Ruler border: number scale on the top and left edges, drawn on canvas (desktop only) ──
(() => {
  const mq = matchMedia("(min-width: 768px)");
  const SIZE = 24, FONT = "9px 'Geist Mono', ui-monospace, monospace";
  let cx, cy, gx, gy, raf = 0, t0 = 0, colors;

  const readColors = () => {
    // Resolve the CSS variables (rgb with alpha) to concrete colours once per theme change
    const probe = document.createElement("i");
    document.body.append(probe);
    const get = (v) => { probe.style.color = `var(${v})`; return getComputedStyle(probe).color; };
    colors = { bg: get("--ruler-bg"), line: get("--ruler-line"), tick: get("--ruler-tick"), label: get("--ruler-label") };
    probe.remove();
  };

  const size = () => {
    const dpr = devicePixelRatio || 1, w = innerWidth, h = innerHeight;
    cx.width = w * dpr; cx.height = SIZE * dpr; cy.width = SIZE * dpr; cy.height = h * dpr;
    cx.style.width = "100%"; cy.style.height = "100%";
    gx.setTransform(dpr, 0, 0, dpr, 0, 0); gy.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = () => {
    const w = innerWidth, h = innerHeight, sx = scrollX, sy = scrollY;
    // Intro sweep: the scale draws itself in over 1.5s, skipped under reduced motion
    const p = motionReduced() ? 1 : Math.min(1, (performance.now() - t0) / 1500), e = 1 - (1 - p) ** 4;
    const ex = e * (w + sx), ey = e * (h + sy);

    gx.clearRect(0, 0, w, SIZE);
    gx.fillStyle = colors.bg; gx.fillRect(0, 0, w, SIZE);
    gx.fillStyle = colors.line; gx.fillRect(0, SIZE - .5, Math.min(w, ex - sx), .5);
    gx.font = FONT; gx.textAlign = "center"; gx.textBaseline = "middle";
    for (let v = 10 * Math.floor(sx / 10); v <= sx + w && v <= ex; v += 10) {
      const major = v % 100 === 0, len = major ? 10 : 4;
      gx.globalAlpha = Math.min(1, (ex - v) / 200);
      gx.fillStyle = colors.tick; gx.fillRect(v - sx, SIZE - len, .5, len);
      if (major) { gx.fillStyle = colors.label; gx.fillText(String(v), v - sx, 12); }
    }

    gy.clearRect(0, 0, SIZE, h);
    gy.globalAlpha = 1;
    gy.fillStyle = colors.bg; gy.fillRect(0, 0, SIZE, h);
    gy.fillStyle = colors.line; gy.fillRect(SIZE - .5, 0, .5, Math.min(h, ey - sy));
    for (let v = 10 * Math.floor(sy / 10); v <= sy + h && v <= ey; v += 10) {
      const major = v % 100 === 0, len = major ? 10 : 4, y = v - sy;
      gy.globalAlpha = Math.min(1, (ey - v) / 200);
      gy.fillStyle = colors.tick; gy.fillRect(SIZE - len, y, len, .5);
      if (major) {
        gy.save(); gy.fillStyle = colors.label; gy.font = FONT; gy.textAlign = "center"; gy.textBaseline = "middle";
        gy.translate(12, y); gy.rotate(-Math.PI / 2); gy.fillText(String(v), 0, 0); gy.restore();
      }
    }
    gx.globalAlpha = gy.globalAlpha = 1;
    raf = p < 1 && !document.hidden ? requestAnimationFrame(draw) : 0;
  };
  const queue = () => { if (!raf && cx) raf = requestAnimationFrame(draw); };

  const mount = () => {
    if (cx) return;
    const mk = (cls) => { const c = document.createElement("canvas"); c.className = `ruler ${cls}`; c.setAttribute("aria-hidden", "true"); return c; };
    const x = mk("ruler--x"), y = mk("ruler--y"), corner = document.createElement("div");
    corner.className = "ruler ruler--corner"; corner.setAttribute("aria-hidden", "true");
    document.body.append(x, y, corner);
    cx = x; cy = y; gx = x.getContext("2d"); gy = y.getContext("2d");
    document.documentElement.classList.add("has-ruler");
    readColors(); size(); t0 = performance.now(); queue();
  };
  const unmount = () => {
    if (!cx) return;
    document.querySelectorAll(".ruler").forEach((n) => n.remove());
    document.documentElement.classList.remove("has-ruler");
    cancelAnimationFrame(raf); raf = 0; cx = cy = gx = gy = null;
  };
  const sync = () => (mq.matches ? mount() : unmount());

  mq.addEventListener("change", sync);
  addEventListener("resize", () => { if (cx) { size(); queue(); } });
  addEventListener("scroll", queue, { passive: true });
  document.addEventListener("visibilitychange", queue);
  new MutationObserver(() => { if (cx) { readColors(); queue(); } }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  sync();
})();
