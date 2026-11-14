/* Hero wordmark marquee: GSAP drives a slow, constant left-to-right drift. The track holds four identical copies,
   so sliding it by one copy (25%) lands on the same picture and the loop has no seam. */
(() => {
  const track = document.querySelector(".headline__track");
  if (!track || !window.gsap) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { gsap.set(track, { xPercent: -12 }); return; }
  const tween = gsap.fromTo(track, { xPercent: -25 }, { xPercent: 0, duration: 70, ease: "none", repeat: -1, force3D: true });
  // Ease the drift to a gentle stop and back up, rather than snapping, when the tab is hidden or the pointer rests on it
  const head = track.parentElement;
  head.addEventListener("pointerenter", () => gsap.to(tween, { timeScale: 0, duration: 1.2, ease: "power2.out", overwrite: true }));
  head.addEventListener("pointerleave", () => gsap.to(tween, { timeScale: 1, duration: 1.6, ease: "power2.inOut", overwrite: true }));
})();
