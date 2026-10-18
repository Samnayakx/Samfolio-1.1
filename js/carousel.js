// Carousel, after Bencho's (MIT, bencho.dev/licence). Ported from React to plain DOM for this site:
// the structure, the numbers and the comments are Bencho's. Where a note talks about React state,
// hooks or renders, the port keeps the same split by hand — refs became plain variables, a hook
// became a small Spring object, and the component became `Carousel.mount(el, options)`.
(() => {
  /* ── inlined from lab/spring ──────────────────────── */
  /* ── one spring, for everything that settles ───────────────
     The maths was already on this bench twice, copied by hand:
     Humidity's wheel and Brightness's column both accumulate
     velocity toward a target, damp it, and snap when both the
     delta and the velocity fall under 0.02. Two copies is a
     coincidence; five would be a policy, so it comes out here
     before the elastic blocks are written against it.

     The two shipped copies are deliberately NOT refactored onto
     this. They work, they are tuned, and rewriting the innards
     of two live components to prove a point about duplication
     is how a good afternoon becomes a bad one. This is the one
     new code uses.

     Frames, not milliseconds. `dt` is expressed in sixtieths of
     a second and the damping is RAISED to it rather than
     multiplied by it, so a dropped frame decays the same amount
     of energy as the two frames it replaced. Multiplying is the
     version that makes a spring behave differently on a busy
     page, which is the hardest kind of bug to see.

     The loop parks itself the moment the value has settled.
     CLAUDE.md is not complimentary about the one permanent
     requestAnimationFrame already on this bench and there is no
     case for five more. */

  /* 0..100 into the two numbers a spring actually has.

     50 is what Humidity and Brightness were tuned at, which is
     the rule every elastic knob on this bench follows — see
     lab/motion. Turn the panel to the middle and nothing has
     changed.

     Both ends have to be usable, which is what fixes the range:
     at 0 it is slow and heavy and still arrives, at 100 it is
     quick with a visible overshoot, and nowhere in between does
     it ring for longer than it takes to read. */
  /* The pair is chosen by DAMPING RATIO and then written back
     as stiffness and decay, because the ratio is the thing a
     person is actually setting and the two numbers on their own
     do not say what they add up to.

       zeta = -ln(d) / (2 * sqrt(k))

     The first version of this ran 0.06..0.26 stiffness against
     0.93..0.74 decay, which reads as a sensible spread and is
     not one: it puts zeta between 0.15 and 0.16 across the
     WHOLE range, so every setting overshot by about sixty per
     cent and the knob only changed how fast it did it. Pull's
     return went 130px past its own resting position and lifted
     the content off the top of the card.

       0   → zeta ~0.85, heavy, arrives without a ring
       50  → zeta ~0.41, near where Humidity and Brightness sit
       100 → zeta ~0.20, lively, two visible rebounds

     Both ends shippable, which is the constraint that fixed the
     numbers rather than taste. */
  const springOf = (tune) => ({
    /* stiffness: how hard it is pulled toward the target */
    k: 0.08 + (tune / 100) * 0.16,
    /* decay, per frame: how much of the velocity survives */
    d: 0.62 + (tune / 100) * 0.2,
  });

  /* Units matter. The snap threshold is absolute, so a caller
     works in pixels or in 0..100 — a spring driven over 0..1
     would be "settled" before it had visibly moved.

     [port] `useSpring` as an object: `to(target)` is the effect
     re-running on a new target, and `onChange` stands in for the
     state setter. Restarting reads `cur` and `vel`, which were the
     refs, so a new target mid-flight continues rather than snaps. */
  function Spring(target, tune = 50, instant = false, onChange = () => {}) {
    let cur = target, vel = 0, raf = 0, goal = target;
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const to = (t) => {
      goal = t;
      stop();
      if (instant) { cur = t; vel = 0; onChange(cur); return; }
      if (cur === t && vel === 0) return;
      const { k, d } = springOf(tune);
      let prev = 0;
      const tick = (now) => {
        const dt = prev ? clamp((now - prev) / 16.67, 0, 2.5) : 1;
        prev = now;
        vel += (goal - cur) * k * dt;
        vel *= Math.pow(d, dt);
        cur += vel * dt;
        if (Math.abs(goal - cur) < 0.02 && Math.abs(vel) < 0.02) {
          cur = goal; vel = 0; raf = 0; onChange(cur);
          return;
        }
        onChange(cur);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    return { to, stop, get: () => cur };
  }

  /* Read once, the way the wheel and the pill nav do. A
     preference, not a live input. */
  const stillness = () =>
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  /* ── inlined from lab/motion ──────────────────────── */
  /* ── elastic, as numbers a person can hold ─────────────────
     Several blocks here are the same idea in different clothes:
     something travels, stretches on the way, and overshoots
     when it lands. Their character lives in a duration and in
     one control point of a bezier — which is exactly the kind
     of thing nobody should have to name in order to tune.

     So the outside of every elastic knob is 0..100 and the
     inside is real units, and **50 is always what the component
     was already tuned to**. Turn every knob on the bench to the
     middle and nothing has changed. That is what makes these
     safe to expose: the default is not a number somebody has to
     remember, it is the middle of the slider.

     Both ends have to be shippable, which is the constraint
     that actually shapes these curves. The ranges below stop
     where the effect stops being the thing it is — a bar that
     moves in 40ms still reads as a bar snapping to a slot; one
     that moves in 20ms reads as broken. */

  /* How long it takes, slower to faster, as a multiplier on
     whatever the component's own tuned duration is. 0 is a
     little over half again as slow, 100 is two and a half times
     as fast, 50 is exactly 1. */
  const rate = (speed) => 1.6 - (speed / 100) * 1.2;

  /* SHOTS was Bencho's own pictures, which is not licensed
     to travel. Point this at yours.

     [port] Until there are photographs, each card is a coloured
     face with a word on it — what the ring was before it carried
     pictures. Give an entry a `src` and that card becomes the photo. */
  const SHOTS = [
    { name: "cities", label: "New cities", tone: "#E5633A" },
    { name: "coastlines", label: "Coastlines", tone: "#3D9FE0" },
    { name: "sketches", label: "Side-project sketches", tone: "#FCAA2D" },
    { name: "maps", label: "Maps & posters", tone: "#8B6FD6" },
    { name: "artifacts", label: "Odd artifacts", tone: "#3C9A78" },
  ];

  /* ══ Carousel ═════════════════════════════════════════════
     Cards on a turntable that drift at rest, give under the
     pointer, and can be swiped round.

     NOTHING EVER LEAVES THE FRAME, and that is the whole
     arrangement. This was a row twice — cards in a line, with
     the ones at the ends either dissolving into a mask or being
     cut by the edge of a box — and both are answers to the same
     question: what happens to a card when it runs out of block?
     A ring does not ask it. The cards go ROUND: out to one
     side, back and small, round to the other side, forward
     again. The furthest a card ever gets is the radius, which
     is a number this component chose, so there is no edge to
     treat and no box to put it in.

     IT IS THEREFORE ENDLESS. A row has a first card and a last
     one and has to decide what to do at each; a ring has
     neither, so the swipe never runs out and never rubber-bands.
     Swipe once and the front card shrinks and goes to the back
     while the next one comes forward — which is the motion he
     described, and it falls out of the geometry rather than
     being animated on top of it.

     THE ANGLE IS NOT TAKEN MODULO ANYTHING. `turn` counts up
     and down without limit and the angle is `(i - turn) * step`.
     Wrapping it to 0..360 would send a card the long way round
     the moment it crossed the seam, which is the one visible bug
     this arrangement can have — the same note the Pro sheet's
     reel carries, for the same reason.

     THREE MOTIONS, THREE ELEMENTS, ONE TRANSFORM EACH. The slot
     carries where the card is on the ring, the floater carries
     the drift, the card carries the tilt. They are nested rather
     than composed into one string because they are owned by
     three different things — the drag, a CSS animation and a
     pair of springs — and a single element cannot be written by
     three authors without one of them losing. */

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const mix = (a, b, t) => a + (b - a) * t;

  /* the card is the PICTURES' own ratio, near enough — 160x226
     is 0.708 against their 2:3, so `cover` trims about six per
     cent off the height. These are photographs with nothing at
     their top or bottom edge, and the card reading as a card
     rather than as a slat is worth the last few rows. */
  const CARD_W = 206;
  const CARD_H = 292;

  /* ── the frame, and it is only a frame ─────────────────────
     No box, no clip, no mask. Nothing here hides its overflow,
     which is what makes the next decision affordable.

     ── SIZED FOR THE DEFAULT, NOT FOR THE EXTREMES ───────────
     This is the decision that matters on the wall. Sized to
     hold Spread 150 with Depth 0 and Float 100 — the widest the
     knobs can make the ring — the frame came to 520x404, and at
     the arrangement it actually SHIPS at that left 40px of air
     either side and 50 top and bottom. Measured. That is dead
     space the wall pays for on every card: a block is fitted to
     its column by its bounding BOX, so air inside the box is
     the block being drawn smaller.

     476x340 is the shipping ring plus about eighteen pixels of
     margin. The card is 37% of the frame where it was 28.6%,
     and the overlay draws it 9% bigger as well, because the fit
     there is LOCK over the larger side.

     What it costs: at the far corners of the knobs the ring
     paints a little outside the frame. Nothing clips, so it
     simply overlaps the padding the wall card keeps around a
     block, and only when Spread, Depth and Float are all at
     once at settings nobody ships. The same trade the Balance
     card makes when it stretches past its own measured box.

     The cards also keep growing faster than the frame, for the
     same reason: 160x226 in 440x340 was 24% of the frame in
     card, 188x266 in 474x384 was 27%, 206x292 in 476x340 is
     37%.

     Fixed at these two numbers, because a frame that grew with
     a knob would rescale the whole block every time one moved —
     which is the thing the ResizeObserver on the wall and the
     overlay would both do. */
  const STAGE_W = 476;
  const STAGE_H = 340;

  const ORBIT = 138;
  /* ── how much smaller the back of the ring is ──────────────
     Read as a percentage of the way to half size: 100 puts the
     card at the back at 0.5, which is where this sits. The knob
     runs to 150 — 0.25 — because the ceiling was the default's
     own value and that is a knob with nothing above it, so
     every setting was a step DOWN from where it shipped.

     `1 - depth / 200` rather than the arithmetic it replaced,
     which said the same thing with a 0.5 buried in it. */
  const DEPTH = 100;
  const DEPTH_MAX = 150;
  const CORNER = 20;
  const FLOAT = 15;
  const SINK = 50;
  const SETTLE = 50;

  /* ── how far back the ring leans ───────────────────────────
     A card at the back sits this much higher than one at the
     front. Scale alone says smaller, which the eye can read as
     further away OR as literally smaller; a card that also
     rides UP as it recedes is unmistakably going back, because
     that is what a ring seen from slightly above does. It costs
     one term and it is most of what makes the depth read.

     38 rather than 22 for a second reason: at 22 the card at
     the very back was invisible — 226 tall drawn at 0.75 and
     lifted 22 puts its top edge 6px BELOW the front card's, so
     one of the four was hidden completely at rest. At 38 it
     clears by ten, and seeing something behind is what tells
     you the ring goes round. */
  const LEAN = 38;

  /* how many px of drag turn the ring one position */
  const PULL = 140;

  /* how far ahead of the release the throw looks, in ms of
     travel. It is what makes a short fast flick move a card:
     without it a swipe is judged on distance alone and a quick
     one that barely moved counts for nothing. */
  const TOSS = 150;
  /* and how many it may skip. A flick can carry two; past that
     the ring blurs and you have lost your place on it. */
  const MOST = 2;

  const BASE = 620;

  /* ── the pictures ARE the count ────────────────────────────
     It was a 3..6 knob while the cards were coloured faces,
     which is a knob you can only have when the cards carry
     nothing: with photographs, one more card than pictures has
     to be one of them a second time, and the same picture twice
     on one ring reads as a bug rather than as a setting. So the
     number of cards is `SHOTS.length` and nothing else —
     add a file, run the script, and the ring has another
     position. Five today.

     Five is also the better ring. With four, one card sits at
     180 degrees, which is directly behind the front one and out
     of sight; at 72-degree steps nothing is ever exactly
     behind anything, so every card is at least partly visible
     at rest and the ring reads as a ring rather than as three
     cards and a rumour.

     They are inlined by scripts/carousel.sh — drop new files in
     src/assets/carousel and run it. The order is the filenames
     sorted, so renaming one moves it.

     [port] There is no script here: SHOTS above is the list, in
     the order written. */
  const N = SHOTS.length;

  /* ── which one is at the front when it opens ───────────────
     BY NAME, not by index. The order is whatever the filenames
     sort to, so an index here would be a number that silently
     means a different picture the day somebody adds a file —
     and "the card it opens on" is a decision, not an accident
     of the alphabet. Falls back to the middle of the ring if
     the name is not there, which is where it used to open. */
  const FRONT = "coastlines";
  const OPENS_ON = (() => {
    const i = SHOTS.findIndex((s) => s.name === FRONT);
    return i < 0 ? Math.floor((N - 1) / 2) : i;
  })();

  /* ── every card sits at its own angle ──────────────────────
     Numbers that are not a pattern: no two the same, no
     symmetry to spot, and they do not alternate. A ring where
     the angles went -4, +4, -4, +4 is an arrangement somebody
     made; numbers that are merely different are a handful of
     photographs somebody put down.

     There is one per picture. It has to be — `i % ANGLE.length`
     would wrap a fifth card onto the first card's angle, and
     two of five sharing an angle is the pattern this list
     exists to avoid.

     They can be this generous again now the cards are on a
     ring. On a row an angle cost width — a turned card sweeps
     its corner sideways into its neighbour's air — and the
     spread knob's floor had to pay for it. Cards at different
     depths are allowed to overlap; that is what depth looks
     like. */
  const ANGLE = [-4.2, 2.6, -1.4, 3.8, 1.7];

  /* the drift's periods, deliberately awkward so no two cards
     are ever doing the same thing. See the note in index.css. */
  const PERIOD = [4.7, 5.9, 6.7, 5.3, 7.1, 6.1];

  /* ── where a card sits, given where the ring is ────────────
     ONE function, read by the first paint and by the drag both.
     The drag writes transforms straight to the nodes — a render
     per pointermove and the ring visibly trails the finger — so
     there are two callers, and if they were two pieces of code
     they would drift apart the first time the geometry changed.

     `f` is the whole of it: 1 at the front, 0 at the back, and
     it drives the size, the lean and the paint order together.
     Position from the ANGLE rather than from a table of four
     places is what makes the transitions free — the card
     leaving swings out and back, the card arriving swings in
     and forward, and the one behind crosses without any of them
     knowing about the others. */
  const spotOf = (i, turn, orbit, depth) => {
    const th = (i - turn) * ((Math.PI * 2) / N);
    const f = (Math.cos(th) + 1) / 2;
    return {
      x: Math.sin(th) * orbit,
      y: -(1 - f) * LEAN,
      s: mix(1 - clamp(depth, 0, DEPTH_MAX) / 200, 1, f),
      /* ── paint order is a z-index, by hand ──────────────
         Everything here is 2D — scale and offset, not
         translateZ — so nothing sorts itself and a card would
         otherwise paint in DOM order and sit over the one in
         front of it. `f` already knows which is nearer. */
      z: Math.round(f * 100),
    };
  };

  const write = (el, sp, angle) => {
    /* NO OPACITY IS WRITTEN HERE. The cards used to fade with
       distance, which meant dragging dimmed and lit every one of
       them — the whole block pulsed on a gesture that should
       only move things round. Size, lean and paint order say
       which is in front; none of them touch the picture. */
    el.style.transform = `translate(-50%, -50%) translate(${sp.x.toFixed(2)}px, ${sp.y.toFixed(2)}px) rotate(${angle}deg) scale(${sp.s.toFixed(4)})`;
    el.style.zIndex = String(sp.z);
  };

  const out = (t) => 1 - (1 - t) ** 4;

  function mount(host, {
    /* how far out to the sides the ring reaches, in px */
    orbit = ORBIT,
    /* how much smaller the back of the ring is, 0..100 */
    depth = DEPTH,
    corner = CORNER,
    /* how much they drift at rest, 0..100 — 0 is a still ring,
       which is a real setting and not a broken one */
    float = FLOAT,
    /* how deep the pointer presses, 0..100 */
    sink = SINK,
    /* how quickly a swipe settles, 0..100 */
    settle = SETTLE,
    /* ── seconds for one whole turn of the ring ──────────────
       0 is off, and off is the default: on the bench this ring
       is a thing you push, and one that also drifts round on its
       own would be answering a gesture nobody made. It is here
       for the places the carousel is a PICTURE rather than a
       control — the Pro sheet, today — where it has to carry
       itself because nobody is going to touch it. */
    spin = 0,
    label = "Card carousel",
  } = {}) {
    const still = stillness();
    const r = clamp(corner, 0, 40);

    const root = document.createElement("div");
    root.className = "car";
    root.style.width = `${STAGE_W}px`;
    root.style.height = `${STAGE_H}px`;
    const track = document.createElement("div");
    track.className = "car-track";
    track.dataset.held = "false";
    track.setAttribute("role", "group");
    track.setAttribute("aria-label", label);
    track.setAttribute("aria-roledescription", "carousel");
    track.tabIndex = 0;
    root.appendChild(track);

    /* ── where the ring is, and it is a REF ──────────────────
       A continuous position in card-steps: 0 puts the first
       card at the front, 1.5 is halfway between the second and
       third. It changes every frame of a drag, which is exactly
       the value that must not be state — React renders when a
       knob moves, the ring is painted.

       It is NOT clamped and NOT wrapped. See the note at the
       top: this is the number a modulo would ruin. */
    let turn = OPENS_ON;
    let raf = 0;
    let drag = null;
    let held = false;

    const cards = SHOTS.map((shot, i) => {
      const slot = document.createElement("div");
      slot.className = "car-slot";
      slot.style.width = `${CARD_W}px`;
      slot.style.height = `${CARD_H}px`;
      /* ── the drift ─────────────────────────────────
         Its own element, so the keyframes own this
         transform outright and neither the ring nor the
         tilt ever writes it. The period is per card and
         the amplitudes are the knob. */
      const floater = document.createElement("div");
      floater.className = "car-float";
      /* at Float 0 the keyframes come off rather than
         running at zero amplitude. Identical to look
         at, and one of them holds a compositor layer
         per card for a motion the knob has just
         turned off. */
      if (float <= 0) floater.style.animationName = "none";
      floater.style.animationDuration = `${PERIOD[i % PERIOD.length]}s`;
      floater.style.setProperty("--lift", `${((clamp(float, 0, 100) / 100) * 16).toFixed(2)}px`);
      floater.style.setProperty("--sway", `${((clamp(float, 0, 100) / 100) * 1.4).toFixed(2)}deg`);
      const card = Card(shot, r, sink, still);
      floater.appendChild(card.el);
      slot.appendChild(floater);
      track.appendChild(slot);
      return { slot, card };
    });

    const paint = () => {
      cards.forEach(({ slot }, i) => write(slot, spotOf(i, turn, orbit, depth), ANGLE[i % ANGLE.length]));
    };
    /* placed on mount, and again whenever a knob changes the
       arithmetic under it */
    paint();

    /* a card under a finger that is turning the
       ring is not being pressed, it is being
       carried — and two gestures fighting for one
       transform is the one way this can look
       broken */
    const setHeld = (v) => {
      held = v;
      track.dataset.held = String(v);
      cards.forEach(({ card }) => card.setOff(v || still));
      spinning();
    };

    /* ── the ring turning itself ─────────────────────────────
       Its own frame loop and its own handle, deliberately not
       `raf` — that one belongs to the settle after a swipe, and
       the two sharing it would mean whichever started last
       cancelled the other.

       It advances `turn` by time rather than stepping between
       whole positions: a ring that clicks from card to card is
       reading as a slideshow, and the whole point of this one is
       that it is a continuous ring you are looking at side on.

       Held pauses it. Nothing on the Pro sheet can grab it —
       that reel is pointer-events: none — but the pause costs a
       line and means the prop is safe anywhere. */
    let spinId = 0;
    function spinning() {
      cancelAnimationFrame(spinId); spinId = 0;
      if (!spin || still || held) return;
      let prev = 0;
      const step = (t) => {
        /* N cards over `spin` seconds is one whole revolution */
        if (prev) turn += ((t - prev) / 1000) * (N / spin);
        prev = t;
        paint();
        spinId = requestAnimationFrame(step);
      };
      spinId = requestAnimationFrame(step);
    }
    spinning();

    /* ── the settle ──────────────────────────────────────────
       Quart-out from wherever the ring currently is to a whole
       position. It reads its start from the live value rather
       than from where the drag began, so a second swipe during
       one turns the ring further instead of snapping it back. */
    const glide = (to) => {
      cancelAnimationFrame(raf);
      const from = turn;
      if (still || from === to) {
        turn = to;
        paint();
        return;
      }
      const ms = BASE * rate(clamp(settle, 0, 100));
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / ms);
        turn = mix(from, to, out(p));
        paint();
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const go = (d) => glide(Math.round(turn) + d);

    track.addEventListener("pointerdown", (e) => {
      cancelAnimationFrame(raf);
      drag = { x0: e.clientX, t0: turn, last: e.clientX, t: e.timeStamp, vx: 0, moved: false };
      setHeld(true);
      try { track.setPointerCapture(e.pointerId); } catch { /* not a live pointer */ }
    });

    track.addEventListener("pointermove", (e) => {
      const g = drag;
      if (!g) return;
      const dx = e.clientX - g.x0;
      if (!g.moved && Math.abs(dx) > 3) g.moved = true;

      /* px per ms, smoothed against the previous reading so one
         jittery frame cannot fake a flick — and measured from
         the LAST position rather than from the grab, because the
         speed at release is the only part of a swipe that says
         how far it meant to go */
      const dt = Math.max(1, e.timeStamp - g.t);
      g.vx = (g.vx + (e.clientX - g.last) / dt) / 2;
      g.last = e.clientX;
      g.t = e.timeStamp;

      /* ── no rubber band, because there is no end ─────────
         A row had to give at its first and last card, or it read
         as broken input. A ring has neither, so the drag is a
         plain one-to-one and keeps going as long as you do.

         [port] Divided by the ring's drawn scale, so a phone
         that shows it smaller still turns it under the finger. */
      turn = g.t0 - dx / (PULL * scale());
      paint();
    });

    const up = () => {
      const g = drag;
      if (!g) return;
      drag = null;
      setHeld(false);
      /* where it would come to rest if it kept going, capped so
         a hard flick cannot spin the ring past where you can
         follow it */
      const carry = clamp((-g.vx * TOSS) / (PULL * scale()), -MOST, MOST);
      const to = Math.round(turn + carry);
      glide(to);
    };
    track.addEventListener("pointerup", up);
    track.addEventListener("pointercancel", up);

    track.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      go(d);
    });

    /* [port] The frame is fixed at 476x340 and the wall scaled the
       block to its column; here the host does that. Never larger
       than drawn, only smaller, and the host takes the scaled
       height so nothing below it is overlapped. */
    let s = 1;
    const scale = () => s;
    const fitTo = () => {
      s = Math.min(1, host.clientWidth / STAGE_W) || 1;
      root.style.transform = s < 1 ? `scale(${s})` : "";
      host.style.height = `${Math.round(STAGE_H * s)}px`;
    };
    host.appendChild(root);
    fitTo();
    const ro = new ResizeObserver(fitTo);
    ro.observe(host);

    return () => {
      cancelAnimationFrame(raf); cancelAnimationFrame(spinId); ro.disconnect();
      cards.forEach(({ card }) => card.stop());
      root.remove();
    };
  }

  /* ── one card, and the press is its own ───────────────────
     A component per card rather than a loop, because the tilt is
     a pair of springs and a hook cannot be called n times from
     the parent. It costs nothing at rest: a spring at its target
     runs no loop at all.

     [port] Each card owns its three Springs and repaints itself
     when any of them moves. */
  function Card(shot, corner, sink, startOff) {
    const el = document.createElement("div");
    el.className = "car-card";
    const sheen = document.createElement("span");
    sheen.className = "car-sheen";
    sheen.setAttribute("aria-hidden", "true");
    el.appendChild(sheen);
    if (shot.src) el.style.backgroundImage = `url(${shot.src})`;
    else {
      el.style.backgroundColor = shot.tone;
      const cap = document.createElement("span");
      cap.className = "car-face";
      cap.textContent = shot.label;
      el.insertBefore(cap, sheen);
    }
    el.style.borderRadius = `${corner}px`;
    sheen.style.borderRadius = `${corner}px`;
    /* ── ONE SHADOW, AND IT DOES NOT MOVE ─────────────
       It tightened as the card sank, which is the honest
       physics, and on four cards it was four shadows
       resizing as the pointer crossed them — the ring
       flickering rather than one card being touched. The
       dent and the rim say the card went back; the shadow
       only has to say it is off the ground. */
    el.style.boxShadow = "0 12px 28px -10px rgba(var(--shadow-rgb), 0.28)";

    const still = stillness();
    let pt = { x: 0, y: 0 }, on = false, off = startOff;

    /* ── the state, and there is only this ───────────────────
       Where the pointer is, as -1..1 on each axis, sprung. The
       spring is on the POSITION rather than on the rotation, so
       the transform and both gradients are three readings of one
       number instead of three things animating toward the same
       place. */
    let x = 0, y = 0, l = 0;
    const render = () => {
      const deep = clamp(sink, 0, 100) / 100;
      const max = deep * 13;
      /* IT SINKS, IT DOES NOT LIFT — the tilt card's rule. The
         point you are over goes AWAY and the far side comes up, so
         the card is being touched rather than displayed. */
      const rx = -y * max;
      const ry = x * max;

      /* the pointer in the card's own terms, as a PERCENTAGE. The
         wall, the overlay and the Pro sheet all draw this card at
         their own scale, and a gradient placed in pixels would
         land somewhere else in each of them. */
      const px = ((x + 1) / 2) * 100;
      const py = ((y + 1) / 2) * 100;
      const dark = deep * 0.5 * l;
      /* the rim is a hint, not a highlight: at the tilt card's own
         0.34 a white wash slides across the photograph and reads
         as a sheen laid ON the picture rather than as the far edge
         of a dented surface catching light */
      const rim = deep * 0.16 * l;

      /* translateZ FIRST, so the retreat is measured in the
         room's axes rather than in the card's own — after a
         rotation the card's z points off to one side and
         "back" stops meaning back */
      el.style.transform = `translateZ(${(-10 * deep * l).toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      /* the dent, and the rim opposite it. The shadow pools
         where the surface is deepest, which is under the
         pointer, and the light catches the far edge that has
         risen — so the two are placed at mirrored points and
         neither is centred on anything. This layer is what
         makes the transform read as a press. */
      sheen.style.backgroundImage = `radial-gradient(44% 36% at ${px.toFixed(1)}% ${py.toFixed(1)}%, rgba(9, 14, 28, ${dark.toFixed(3)}) 0%, rgba(9, 14, 28, 0) 100%), radial-gradient(54% 44% at ${(100 - px).toFixed(1)}% ${(100 - py).toFixed(1)}%, rgba(255, 255, 255, ${rim.toFixed(3)}) 0%, rgba(255, 255, 255, 0) 100%)`;
    };
    const sx = Spring(0, 50, still, (v) => { x = v; render(); });
    const sy = Spring(0, 50, still, (v) => { y = v; render(); });
    const lit = Spring(0, 50, still, (v) => { l = v; render(); });
    const aim = () => {
      const live = on && !off;
      sx.to(live ? pt.x : 0); sy.to(live ? pt.y : 0); lit.to(live ? 1 : 0);
    };
    render();

    el.addEventListener("pointermove", (e) => {
      const b = el.getBoundingClientRect();
      pt = {
        x: clamp(((e.clientX - b.left) / b.width) * 2 - 1, -1, 1),
        y: clamp(((e.clientY - b.top) / b.height) * 2 - 1, -1, 1),
      };
      on = true;
      aim();
    });
    /* `out` with a containment test rather than `leave` — the
       rehearsal's scripted pointer walks off carrying
       `relatedTarget: null`, which React does not synthesise
       a leave from, and the card would finish the demo still
       sunk under a cursor that had gone. */
    el.addEventListener("pointerout", (e) => {
      const to = e.relatedTarget;
      if (!to || !el.contains(to)) { on = false; aim(); }
    });
    el.addEventListener("pointercancel", () => { on = false; aim(); });

    return {
      el,
      setOff: (v) => { off = v; aim(); },
      stop: () => { sx.stop(); sy.stop(); lit.stop(); },
    };
  }

  window.Carousel = { mount, SHOTS };
  document.querySelectorAll("[data-carousel]").forEach((host) => mount(host, { label: host.dataset.carouselLabel || undefined }));
})();
