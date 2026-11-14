// Case-study demos: interactive product prototypes that mount inside a study's media.
// js/site.js renders <div data-case-demo="name">; this file finds them and mounts each one.
(() => {
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  // Scale a fixed design size to the container's width, switching to a compact layout in a phone column
  function fitStage(host, stage, W, H, CW, CH, onMode) {
    let mode = "";
    const ro = new ResizeObserver(() => {
      const w = host.clientWidth, compact = w < 560, dw = compact ? CW : W, dh = compact ? CH : H;
      host.style.aspectRatio = `${dw} / ${dh}`;
      stage.style.width = dw + "px"; stage.style.height = dh + "px"; stage.style.transform = `scale(${w / dw})`;
      const m = compact ? "compact" : "wide"; if (m !== mode) { mode = m; onMode?.(m); }
    });
    ro.observe(host);
    return () => ro.disconnect();
  }

  let threeP = null;
  const loadThree = () => threeP || (threeP = new Promise((res) => {
    if (window.THREE) return res(window.THREE);
    const s = document.createElement("script"); s.src = "/js/vendor/three.min.js";
    s.onload = () => res(window.THREE || null); s.onerror = () => res(null); document.head.appendChild(s);
  }));

  // Reads the compact model format written by tools/build-gap-models.py: indexed triangles with positions
  // quantised to uint16 over each mesh's bounds, int8 normals and uint16 UVs. Returns a Group of meshes.
  const loadModel = (THREE, url) => fetch(url).then((r) => { if (!r.ok) throw new Error(url); return r.arrayBuffer(); }).then((buf) => {
    if (new TextDecoder().decode(new Uint8Array(buf, 0, 4)) !== "GQM1") throw new Error("Not a GQM1 model");
    const hl = new DataView(buf).getUint32(4, true), base = 8 + hl;
    const { meshes } = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, hl)));
    const group = new THREE.Group();
    for (const m of meshes) {
      const g = new THREE.BufferGeometry(), n = m.count;
      const q = new Uint16Array(buf, base + m.pos, n * 3), pos = new Float32Array(n * 3);
      for (let i = 0; i < n * 3; i++) { const k = i % 3; pos[i] = m.min[k] + (q[i] / 65535) * (m.max[k] - m.min[k]); }
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      if (m.nrm != null) {
        const qn = new Int8Array(buf, base + m.nrm, n * 3), nrm = new Float32Array(n * 3);
        for (let i = 0; i < n * 3; i++) nrm[i] = qn[i] / 127;
        g.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
        const qu = new Uint16Array(buf, base + m.uv, n * 2), uv = new Float32Array(n * 2);
        for (let i = 0; i < n * 2; i++) { const k = i % 2; uv[i] = m.uvMin[k] + (qu[i] / 65535) * (m.uvMax[k] - m.uvMin[k]); }
        g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      }
      g.setIndex(new THREE.BufferAttribute(m.idx32 ? new Uint32Array(buf, base + m.idx, m.indices) : new Uint16Array(buf, base + m.idx, m.indices), 1));
      const mesh = new THREE.Mesh(g); mesh.name = m.name; group.add(mesh);
    }
    return group;
  });

  // ── Gap · QuickFit Finder ────────────────────────────────────────────────
  // The flow starts where shoppers met it: an Old Navy product page (High-Waisted Wow Wide-Leg Jeans,
  // numeric sizes, Short / Regular / Long). QuickFit asks height, then usual size, then optional
  // measurements, and returns a size on a 3D avatar with fit by zone and a reason on request.

  const SIZES = ["00", "0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20"];
  // Body measurements each size is designed for (inches)
  const CHART_W = [24.5, 25.5, 26.5, 27.5, 28.5, 29.5, 30.5, 32, 33.5, 35, 37, 39];
  const CHART_H = [34, 35, 36, 37, 38, 39, 40, 41.5, 43, 44.5, 46.5, 48.5];
  const LENGTHS = [{ id: "Short", inseam: 28 }, { id: "Regular", inseam: 30 }, { id: "Long", inseam: 32 }];
  const HEIGHTS = Array.from({ length: 17 }, (_, i) => 58 + i); // 4′10″ … 6′2″
  // Old Navy lists one colorway for this style, so that is all the prototype offers
  const COLORS = [
    { id: "Medium Wash", hex: "#5D7A9C", rgb: [1.3, 1.38, 1.55], under: 0x30476f },
  ];
  // Old Navy's own photos of this style in Medium Wash (oldnavy.gap.com, pid 732609002), in the order of its gallery
  const PHOTOS = [
    { alt: "Model in a taupe button-front cardigan and High-Waisted Wow Wide-Leg Jeans in Medium Wash, front view, with white boots" },
    { alt: "Close-up of the High-Waisted Wow Wide-Leg Jeans in Medium Wash from the waist down, front view" },
    { alt: "Model in a taupe cardigan, back view of the High-Waisted Wow Wide-Leg Jeans in Medium Wash, showing the back pockets" },
    { alt: "Model in a red-and-white striped shirt and the High-Waisted Wow Wide-Leg Jeans in Medium Wash, front view, with flats" },
    { alt: "Model in a red-and-white striped shirt, back view of the High-Waisted Wow Wide-Leg Jeans in Medium Wash" },
  ];
  const FIT = {
    Waist: { Tight: "Unlikely to fit", Fitted: "Desired fit", Loose: "May require a belt" },
    Hips: { Tight: "Unlikely to fit", Fitted: "Some pressure on hips", Loose: "No pressure on hips" },
    Calf: { Tight: "Unlikely to fit", Fitted: "Pressure on calves", Loose: "No pressure on calves" },
  };
  const MEAS = [["waist", "Waist"], ["hips", "Hips"], ["inseam", "Inseam"], ["thigh", "Thigh"], ["calf", "Calf"]];

  const r05 = (n) => Math.round(n * 2) / 2;
  const ftIn = (n) => `${Math.floor(n / 12)}′${n % 12}″`;
  const inch = (n) => `${Number.isInteger(n) ? n : n.toFixed(1)}″`;
  const baseBody = (height, si) => ({
    waist: CHART_W[si], hips: CHART_H[si], inseam: r05(height * 0.45),
    thigh: r05(CHART_H[si] * 0.56), calf: r05(13 + si * 0.35),
  });
  // A loose, straight leg: roomier hips, thigh and calf than the chart; the waist is cut to the chart
  const garment = (i) => ({ waist: CHART_W[i], hips: CHART_H[i] + 1.5, thigh: CHART_H[i] * 0.56 + 1.5, calf: 15 + i * 0.4 });
  const zoneFit = (body, i) => {
    const g = garment(i);
    const dW = g.waist - body.waist, dH = Math.min(g.hips - body.hips, g.thigh - body.thigh), dC = g.calf - body.calf;
    return {
      Waist: dW < -0.5 ? "Tight" : dW <= 0.75 ? "Fitted" : "Loose",
      Hips: dH < -0.5 ? "Tight" : dH <= 2 ? "Fitted" : "Loose",
      // A loose leg has room to spare, so the calf only rules a size out when it is well over
      Calf: dC < -1.5 ? "Tight" : dC < 1.5 ? "Fitted" : "Loose",
      dW, dH, dC,
    };
  };
  // The smallest size nothing is tight in, preferring a fitted waist: how the item was designed to fit
  const recommend = (body) => {
    const ok = SIZES.map((_, i) => ({ i, f: zoneFit(body, i) })).filter(({ f }) => f.Waist !== "Tight" && f.Hips !== "Tight" && f.Calf !== "Tight");
    if (!ok.length) return SIZES.length - 1;
    return (ok.find(({ f }) => f.Waist === "Fitted") || ok[0]).i;
  };
  const recLength = (body) => LENGTHS.findIndex((l) => l.inseam >= body.inseam - 0.5) === -1 ? 2 : LENGTHS.findIndex((l) => l.inseam >= body.inseam - 0.5);

  // ── 3D viewer ──
  // The jeans face +Z and the body OBJ faces −Z, so the body is turned 180° to match. The jeans come from
  // a different rig: they are scaled, then nudged per height (tables measured from both meshes) to sit on the body.
  const CAMS = {
    Full: { pos: [0, 1.02, 4.3], look: [0, 1.0, 0] },
    Front: { pos: [0, 0.78, 2.75], look: [0, 0.7, 0] },
    Waist: { pos: [0, 1.08, 1.3], look: [0, 1.02, 0] },
    Ankles: { pos: [0, 0.32, 1.2], look: [0, 0.16, 0] },
  };
  const TABS = { Front: { cam: "Front", angle: 0 }, Waist: { cam: "Waist", angle: 0 }, Ankles: { cam: "Ankles", angle: 0 }, Back: { cam: "Front", angle: Math.PI } };
  const Z_SHIFT = [[0, 0.09], [0.1, 0.088], [0.2, 0.06], [0.3, 0.036], [0.4, 0.001], [0.5, -0.014], [0.6, -0.01], [0.7, -0.003], [0.8, 0.004], [1.0, -0.017], [1.1, -0.02]];
  const LEG_IN = [[0, -0.07], [0.1, -0.065], [0.2, -0.055], [0.3, -0.053], [0.4, -0.04], [0.5, -0.028], [0.6, -0.022], [0.7, -0.017], [0.78, -0.008], [0.85, 0]];
  const lerpT = (t, y) => {
    if (y <= t[0][0]) return t[0][1];
    for (let i = 1; i < t.length; i++) if (y <= t[i][0]) { const [y0, a] = t[i - 1], [y1, b] = t[i]; return a + (b - a) * (y - y0) / (y1 - y0); }
    return t[t.length - 1][1];
  };
  const JEANS_SCALE = 0.188, HEM_Y0 = -0.007, KNEE_Y = 0.55;
  // A high-waisted women's rise: the mesh's waistband (y ≈ 1.07, on the hip bone) is lifted to sit just below
  // the navel (y ≈ 1.25). The rise is lengthened in the plain denim between crotch and pockets, so the
  // pockets, fly and waistband keep their proportions and just move up.
  const RAW_TOP = 1.068, WAIST_Y = 1.19, RISE0 = 0.7, RISE1 = 0.93, DY = WAIST_Y - RAW_TOP;
  const riseY = (y) => y <= RISE0 ? y : y >= RISE1 ? y + DY : RISE0 + (y - RISE0) * (RISE1 + DY - RISE0) / (RISE1 - RISE0);
  // How much the body is pulled in under the jeans: full size at the ankle and above the waistband
  const tuck = (y) => y <= 0.05 || y >= 1.25 ? 1 : y < 0.12 ? 1 - 0.1 * (y - 0.05) / 0.07 : y < 0.95 ? 0.9 : y < 1.15 ? 0.9 + 0.05 * (y - 0.95) / 0.2 : 0.95 + 0.05 * (y - 1.15) / 0.1;
  // Cross-section of a mesh per 1 cm slice (half-width, front and back): an envelope over ±2 cm, since the
  // meshes are sparse in places, with empty slices filled from their neighbours
  const profile = (arrays, flipZ, y0, y1) => {
    const n = Math.round((y1 - y0) / 0.01) + 1, raw = Array.from({ length: n }, () => null);
    for (const a of arrays) for (let i = 0; i < a.length; i += 3) {
      const x = a[i], y = a[i + 1], z = flipZ ? -a[i + 2] : a[i + 2];
      if (y < y0 || y > y1 || Math.abs(x) > 0.3) continue;
      const k = Math.round((y - y0) / 0.01), r = raw[k] || (raw[k] = { hw: 0, z0: z, z1: z });
      r.hw = Math.max(r.hw, Math.abs(x)); r.z0 = Math.min(r.z0, z); r.z1 = Math.max(r.z1, z);
    }
    const env = raw.map((_, k) => {
      const near = raw.slice(Math.max(0, k - 2), k + 3).filter(Boolean);
      return near.length ? { hw: Math.max(...near.map((r) => r.hw)), z0: Math.min(...near.map((r) => r.z0)), z1: Math.max(...near.map((r) => r.z1)) } : null;
    });
    const known = env.map((r, i) => (r ? i : -1)).filter((i) => i >= 0);
    for (let i = 0; i < n; i++) if (!env[i]) env[i] = env[known.reduce((b, k) => (Math.abs(k - i) < Math.abs(b - i) ? k : b), known[0])];
    return (y) => {
      const f = Math.min(n - 1, Math.max(0, (y - y0) / 0.01)), i = Math.floor(f), j = Math.min(n - 1, i + 1), t = f - i;
      const L = (key) => env[i][key] + (env[j][key] - env[i][key]) * t;
      return { hw: L("hw"), z0: L("z0"), z1: L("z1") };
    };
  };
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  function mountViewer(canvas, THREE, onAngle) {
    // Retina screens are already sharp, so skip MSAA there; never render more than 2× pixels
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: devicePixelRatio < 2, alpha: true, powerPreference: "default" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 40);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8dce4, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 0.72); key.position.set(1.4, 2.2, 2.4); scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.3); fill.position.set(-1.8, 1.2, 1.4); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.35); rim.position.set(0, 1.6, -2.4); scene.add(rim);

    const avatar = new THREE.Group(); scene.add(avatar);
    // Soft contact shadow so the avatar stands on something
    const sc = document.createElement("canvas"); sc.width = sc.height = 128;
    const g2 = sc.getContext("2d"), grd = g2.createRadialGradient(64, 64, 4, 64, 64, 64);
    grd.addColorStop(0, "rgba(0,0,0,.22)"); grd.addColorStop(1, "rgba(0,0,0,0)"); g2.fillStyle = grd; g2.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, 0.002, 0.04); shadow.scale.set(0.9, 0.5, 1); scene.add(shadow);

    let body = null, jeans = null, jeansMat = null, parts = [], skinMat = null, dressedMat = null, under = [];
    let angle = 0, angleTo = null, vel = 0, dragging = false, dirty = true, raf = 0, disposed = false, lastMove = 0;
    let camName = "Full", camScale = 1, camT = 1, hemY = 0.02;
    const look = new THREE.Vector3(), from = { p: new THREE.Vector3(), l: new THREE.Vector3() }, to = { p: new THREE.Vector3(), l: new THREE.Vector3() };
    const target = (name) => {
      const c = CAMS[name], s = name === "Full" ? 1 : camScale;
      return { p: new THREE.Vector3(...c.pos).multiplyScalar(s), l: new THREE.Vector3(...c.look).multiplyScalar(s) };
    };
    { const t = target("Full"); camera.position.copy(t.p); look.copy(t.l); camera.lookAt(look); }

    const resize = () => {
      const w = canvas.clientWidth, hh = canvas.clientHeight;
      if (!w || !hh) return;
      renderer.setSize(w, hh, false); camera.aspect = w / hh; camera.updateProjectionMatrix(); dirty = true;
    };
    const setAngle = (a) => { angle = a; avatar.rotation.y = a; dirty = true; onAngle?.(a); };

    const tick = () => {
      if (disposed) return;
      raf = requestAnimationFrame(tick);
      if (camT < 1) {
        camT = Math.min(1, camT + 0.06);
        const e = 1 - Math.pow(1 - camT, 3);
        camera.position.lerpVectors(from.p, to.p, e); look.lerpVectors(from.l, to.l, e); camera.lookAt(look); dirty = true;
      }
      if (angleTo !== null) {
        const d = angleTo - angle;
        if (Math.abs(d) < 0.002) { setAngle(angleTo); angleTo = null; } else setAngle(angle + d * 0.14);
      } else if (!dragging && Math.abs(vel) > 0.0005) { setAngle(angle + vel); vel *= 0.92; }
      if (dirty) { renderer.render(scene, camera); dirty = false; }
    };

    // Height the hem must clear over the feet, on an 8 mm grid (filled once the body loads)
    const FOOT_N = 76, FOOT_S = 0.008, FOOT_O = -0.3, footTop = new Float32Array(FOOT_N * FOOT_N);
    const footAt = (x, z) => { // blended between cells, so the hem edge stays smooth
      const fx = (x - FOOT_O) / FOOT_S - 0.5, fz = (z - FOOT_O) / FOOT_S - 0.5, i = Math.floor(fx), j = Math.floor(fz), tx = fx - i, tz = fz - j;
      const at = (a, b) => (a < 0 || b < 0 || a >= FOOT_N || b >= FOOT_N ? 0 : footTop[b * FOOT_N + a]);
      return (at(i, j) * (1 - tx) + at(i + 1, j) * tx) * (1 - tz) + (at(i, j + 1) * (1 - tx) + at(i + 1, j + 1) * tx) * tz;
    };
    const applyHem = () => {
      // Pull the lower leg up from the knee so the hem lands where this length would on this body. Then let the
      // hem rest on the feet instead of passing through them: wherever the foot is higher than the hem, the
      // denim is lifted onto it, and the extra length bunches up gradually above (the "break") rather than
      // folding through itself. Over the floor beside and behind the foot, the hem falls to its full length.
      for (const { geo, base } of parts) {
        const pos = geo.attributes.position.array;
        for (let i = 0; i < base.length; i += 3) {
          let y = base[i + 1];
          if (y < KNEE_Y) y = hemY + (y - HEM_Y0) * (KNEE_Y - hemY) / (KNEE_Y - HEM_Y0);
          if (y < 0.3) {
            const lift = Math.max(0, footAt(base[i], base[i + 2]) + 0.006 - hemY);
            if (lift) y += lift * (1 - Math.min(1, Math.max(0, (y - hemY) / Math.max(0.12, lift * 1.6))));
          }
          pos[i + 1] = y;
        }
        geo.attributes.position.needsUpdate = true; geo.computeBoundingSphere();
      }
      dirty = true;
    };

    const texLoader = new THREE.TextureLoader();
    const loadTex = (url, srgb) => new Promise((resolve) => texLoader.load(url, (t) => { if (srgb) t.encoding = THREE.sRGBEncoding; resolve(t); }, undefined, () => resolve(null)));
    const ready = Promise.all([
      loadModel(THREE, "/assets/models/gap/body.v1.bin"),
      loadModel(THREE, "/assets/models/gap/jeans.v1.bin"),
      loadTex("/assets/models/gap/jeans-albedo.v1.webp", true),
      loadTex("/assets/models/gap/jeans-normal.v1.webp", false),
      loadTex("/assets/models/gap/jeans-roughness.v1.webp", false),
    ]).then(([bodyObj, jeansObj, albedo, normal, roughness]) => {
      if (disposed) return;
      // Bare skin for the avatar steps; once dressed, the skin under the jeans takes the wash's shadow tone so
      // the pocket openings (the mesh has no pocket bags) read as denim instead of showing the body through them
      skinMat = new THREE.MeshStandardMaterial({ color: 0xe9e5e0, roughness: 0.9, metalness: 0 });
      dressedMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0, vertexColors: true });
      const bodyMat = skinMat;
      // The body's real shape (turned to face +Z), measured before it is tucked, is what the jeans are cut to
      const bodyArrays = []; bodyObj.traverse((c) => { if (c.isMesh) bodyArrays.push(c.geometry.attributes.position.array); });
      const bodyAt = profile(bodyArrays, true, 0.76, 1.26);
      bodyObj.traverse((c) => {
        if (!c.isMesh) return;
        c.material = bodyMat;
        {
          const p = c.geometry.attributes.position.array, col = new Float32Array(p.length);
          const w = new Float32Array(p.length / 3);
          for (let i = 0; i < w.length; i++) { const y = p[i * 3 + 1]; w[i] = smooth(0.26, 0.3, y) * (1 - smooth(WAIST_Y - 0.035, WAIST_Y - 0.015, y)); }
          const sk = new THREE.Color(0xe9e5e0).convertSRGBToLinear();
          for (let i = 0; i < col.length; i += 3) { col[i] = sk.r; col[i + 1] = sk.g; col[i + 2] = sk.b; }
          c.geometry.setAttribute("color", new THREE.BufferAttribute(col, 3));
          under.push({ attr: c.geometry.attributes.color, w });
        }
        // Tuck the body inside the jeans wherever they cover it, so skin never shows through the denim.
        // Each 2 cm slice shrinks toward its own centre (one per leg below the crotch), easing back to
        // full size just above the waistband so the visible waist still reads naturally.
        const pos = c.geometry.attributes.position.array, ctr = new Map();
        const key = (x, y) => `${Math.floor(y / 0.02)}${y < 0.84 ? (x < 0 ? "L" : "R") : "T"}`;
        for (let i = 0; i < pos.length; i += 3) {
          const x = pos[i], y = pos[i + 1], z = pos[i + 2];
          if (y <= 0.05 || y >= 1.25) continue;
          const k = key(x, y), b = ctr.get(k) || { x0: x, x1: x, z0: z, z1: z };
          b.x0 = Math.min(b.x0, x); b.x1 = Math.max(b.x1, x); b.z0 = Math.min(b.z0, z); b.z1 = Math.max(b.z1, z); ctr.set(k, b);
        }
        for (let i = 0; i < pos.length; i += 3) {
          const y = pos[i + 1], s = tuck(y);
          if (s === 1) continue;
          const b = ctr.get(key(pos[i], y)), cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2;
          pos[i] = cx + (pos[i] - cx) * s; pos[i + 2] = cz + (pos[i + 2] - cz) * s;
        }
        c.geometry.computeVertexNormals(); // the body ships without normals; smooth ones from the final shape
      });
      body = bodyObj; body.rotation.y = Math.PI; avatar.add(body);
      // Map the top of each foot (body turned 180°, so x and z flip). Only the foot itself counts: the ankle
      // column above 11 cm is left out, and each cell takes its neighbours' max so the hem clears the edges.
      {
        const raw = new Float32Array(FOOT_N * FOOT_N);
        bodyObj.traverse((c) => {
          if (!c.isMesh) return;
          const p = c.geometry.attributes.position.array;
          for (let k = 0; k < p.length; k += 3) {
            if (p[k + 1] > 0.11) continue;
            const i = Math.floor((-p[k] - FOOT_O) / FOOT_S), j = Math.floor((-p[k + 2] - FOOT_O) / FOOT_S);
            if (i >= 0 && j >= 0 && i < FOOT_N && j < FOOT_N) raw[j * FOOT_N + i] = Math.max(raw[j * FOOT_N + i], p[k + 1]);
          }
        });
        // Spread it into a soft tent (falling 1.8 cm per cm away from the foot, out to 5 cm) so the hem rests over
        // the foot in a smooth arch, the way fabric does, instead of notching around its outline
        const R = 7;
        for (let j = 0; j < FOOT_N; j++) for (let i = 0; i < FOOT_N; i++) {
          let m = 0;
          for (let dj = -R; dj <= R; dj++) for (let di = -R; di <= R; di++) {
            const a = i + di, b = j + dj;
            if (a < 0 || b < 0 || a >= FOOT_N || b >= FOOT_N || !raw[b * FOOT_N + a]) continue;
            const d = Math.hypot(di, dj) * FOOT_S;
            if (d <= 0.056) m = Math.max(m, raw[b * FOOT_N + a] - 1.8 * Math.max(0, d - FOOT_S));
          }
          footTop[j * FOOT_N + i] = m;
        }
        // Soften twice with a 3×3 average so the arch has no ridges
        for (let pass = 0; pass < 2; pass++) {
          const src = footTop.slice();
          for (let j = 0; j < FOOT_N; j++) for (let i = 0; i < FOOT_N; i++) {
            let sum = 0, n = 0;
            for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
              const a = i + di, b = j + dj;
              if (a >= 0 && b >= 0 && a < FOOT_N && b < FOOT_N) { sum += src[b * FOOT_N + a]; n++; }
            }
            footTop[j * FOOT_N + i] = Math.max(src[j * FOOT_N + i] * 0.6, sum / n);
          }
        }
      }

      jeansMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: albedo, normalMap: normal, roughnessMap: roughness, roughness: 0.85, metalness: 0 });
      if (normal) jeansMat.normalScale = new THREE.Vector2(0.65, 0.65);
      const meshes = [];
      jeansObj.traverse((c) => { if (c.isMesh) { c.material = jeansMat; meshes.push(c); } });
      // The main denim panel is the biggest mesh; everything else is trim (back pockets, coin pocket, rivets,
      // button, belt loops). Only the panel is reshaped; trims keep their own shape and are pinned onto it after.
      const panel = meshes.reduce((a, c) => (c.geometry.attributes.position.count > a.geometry.attributes.position.count ? c : a));
      const trims = meshes.filter((c) => c !== panel), P = panel.geometry.attributes.position.array;
      // Scale, and seat the legs on the body's legs
      for (const c of meshes) {
        const pos = c.geometry.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3) {
          let x = pos[i] * JEANS_SCALE; const y = pos[i + 1] * JEANS_SCALE; let z = pos[i + 2] * JEANS_SCALE;
          if (y < 0.85) x += Math.sign(x) * lerpT(LEG_IN, y);
          z += lerpT(Z_SHIFT, y);
          pos[i] = x; pos[i + 1] = y; pos[i + 2] = z;
        }
      }
      const panelBefore = profile([P], false, 0.7, RAW_TOP + 0.01);
      // Lengthen the rise (panel only)
      for (let i = 1; i < P.length; i += 3) P[i] = riseY(P[i]);
      // A relaxed, straight women's leg (a relaxed straight leg, not the full wide leg of the photos): fitted through the thigh, opening out from the knee
      // so the hem falls straight rather than tapering like a skinny jean. Each leg widens about its own centre.
      const legC = new Map(), legKey = (x, y) => `${Math.floor(y / 0.02)}${x < 0 ? "L" : "R"}`;
      for (let i = 0; i < P.length; i += 3) {
        const x = P[i], y = P[i + 1], z = P[i + 2];
        if (y > 0.66) continue;
        const k = legKey(x, y), r = legC.get(k) || { x0: x, x1: x, z0: z, z1: z };
        r.x0 = Math.min(r.x0, x); r.x1 = Math.max(r.x1, x); r.z0 = Math.min(r.z0, z); r.z1 = Math.max(r.z1, z); legC.set(k, r);
      }
      for (let i = 0; i < P.length; i += 3) {
        const y = P[i + 1], f = 1 + 0.2 * (1 - smooth(0.1, 0.62, y));
        if (f === 1) continue;
        const r = legC.get(legKey(P[i], y)), cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
        P[i] = cx + (P[i] - cx) * f; P[i + 2] = cz + (P[i + 2] - cz) * f;
      }
      // Above the crotch, cut the jeans to her shape: each slice takes the body's width, belly and seat plus a
      // little ease, so they follow the waist-to-hip curve instead of the mesh's straight, boxy cut
      const jeansAt = profile([P], false, 0.76, WAIST_Y + 0.01);
      for (let i = 0; i < P.length; i += 3) {
        const y = P[i + 1], w = smooth(0.8, 0.93, y);
        if (!w) continue;
        const B = bodyAt(y), J = jeansAt(y);
        const tx = (B.hw * 1.035 + 0.008) / J.hw;
        const bc = (B.z0 + B.z1) / 2, bd = (B.z1 - B.z0) / 2 * 1.035 + 0.008, jc = (J.z0 + J.z1) / 2, jd = (J.z1 - J.z0) / 2;
        P[i] *= 1 + (tx - 1) * w;
        P[i + 2] += (bc + (P[i + 2] - jc) * bd / jd - P[i + 2]) * w;
      }
      // Pin each trim onto the reshaped panel: it moves up whole (by as much as the panel moved at the trim's top
      // edge), and keeps its place on the surface, mapped from the panel's old cross-section to its new one
      const panelAfter = profile([P], false, 0.7, WAIST_Y + 0.01);
      for (const c of trims) {
        const pos = c.geometry.attributes.position.array;
        let top = -Infinity;
        for (let i = 1; i < pos.length; i += 3) top = Math.max(top, pos[i]);
        const lift = riseY(top) - top;
        for (let i = 0; i < pos.length; i += 3) {
          const y = pos[i + 1], R = panelBefore(y), F = panelAfter(y + lift);
          const rc = (R.z0 + R.z1) / 2, rd = (R.z1 - R.z0) / 2, fc = (F.z0 + F.z1) / 2, fd = (F.z1 - F.z0) / 2;
          pos[i] *= F.hw / R.hw; pos[i + 1] = y + lift; pos[i + 2] = fc + (pos[i + 2] - rc) * fd / rd;
          pos[i + 2] += Math.sign(pos[i + 2] - fc) * 0.004; // sit just proud of the curved panel, never sunk into it
        }
      }
      for (const c of meshes) parts.push({ geo: c.geometry, base: Float32Array.from(c.geometry.attributes.position.array) });
      jeans = jeansObj; jeans.visible = false; avatar.add(jeans);
      applyHem(); resize();
    });

    return {
      ready, resize,
      bindDrag(el, onFirst) {
        let id = null, lastX = 0, first = true;
        el.addEventListener("pointerdown", (e) => {
          if (e.button !== 0 || id !== null) return;
          id = e.pointerId; el.setPointerCapture(id); dragging = true; angleTo = null; vel = 0; lastX = e.clientX; el.classList.add("is-drag");
          if (first) { first = false; onFirst?.(); }
        });
        el.addEventListener("pointermove", (e) => {
          if (e.pointerId !== id) return;
          const a = (e.clientX - lastX) * 0.012; lastX = e.clientX; vel = a; lastMove = performance.now(); setAngle(angle + a);
        });
        const end = (e) => {
          if (e.pointerId !== id) return;
          id = null; dragging = false; el.classList.remove("is-drag");
          if (reduce() || performance.now() - lastMove > 80) vel = 0;
        };
        el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end); el.addEventListener("lostpointercapture", end);
      },
      rotateBy(a) { vel = 0; angleTo = (angleTo ?? angle) + a; if (reduce()) { setAngle(angleTo); angleTo = null; } },
      turnTo(a) { vel = 0; const t = a + Math.PI * 2 * Math.round((angle - a) / (Math.PI * 2)); if (reduce()) setAngle(t); else angleTo = t; },
      setCam(name, instant) {
        camName = name; const t = target(name);
        if (instant || reduce()) { camera.position.copy(t.p); look.copy(t.l); camera.lookAt(look); camT = 1; dirty = true; return; }
        from.p.copy(camera.position); from.l.copy(look); to.p.copy(t.p); to.l.copy(t.l); camT = 0;
      },
      setAvatar(height, girth) {
        const s = height / 66; camScale = s;
        avatar.scale.set(s * girth, s, s * girth); shadow.scale.set(0.9 * s * girth, 0.5 * s * girth, 1);
        if (camName !== "Full") this.setCam(camName); dirty = true;
      },
      setGarment(on) { if (jeans) jeans.visible = on; body?.traverse((c) => { if (c.isMesh) c.material = on ? dressedMat : skinMat; }); dirty = true; },
      setFit(f, hem) {
        if (jeans) jeans.scale.set(f, 1, f);
        if (hem !== hemY) { hemY = hem; if (parts.length) applyHem(); }
        dirty = true;
      },
      setTint(rgb, underHex) {
        if (!jeansMat) return;
        jeansMat.color.setRGB(...rgb);
        const skin = new THREE.Color(0xe9e5e0).convertSRGBToLinear(), u = new THREE.Color(underHex).convertSRGBToLinear();
        for (const { attr, w } of under) {
          const a = attr.array;
          for (let i = 0; i < w.length; i++) { const t = w[i]; a[i * 3] = skin.r + (u.r - skin.r) * t; a[i * 3 + 1] = skin.g + (u.g - skin.g) * t; a[i * 3 + 2] = skin.b + (u.b - skin.b) * t; }
          attr.needsUpdate = true;
        }
        dirty = true;
      },
      get angle() { return angle; },
      start() { if (!raf && !disposed) { dirty = true; tick(); } },
      stop() { cancelAnimationFrame(raf); raf = 0; },
      dispose() { disposed = true; cancelAnimationFrame(raf); renderer.dispose(); },
    };
  }

  const ICON = {
    bag: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2L5 8Z" stroke="currentColor" stroke-width="1.6"/><path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.6"/></svg>',
    avatar: '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="6.5" r="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M11 12.5h10l-1.4 7.5h-1.4L17.5 29h-3l-.7-9h-1.4L11 12.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 21c0 2.2 5.4 4 12 4s12-1.8 12-4" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2 2.4"/></svg>',
    chev: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" stroke-width="1.6"/></svg>',
    back: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8H3m4-4L3 8l4 4" stroke="currentColor" stroke-width="1.5"/></svg>',
    rotate: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12c0-2.2 3.6-4 8-4s8 1.8 8 4-3.6 4-8 4" stroke="currentColor" stroke-width="1.6"/><path d="m11 13.5 1.5 2.5-2.5 1.5" stroke="currentColor" stroke-width="1.6"/></svg>',
  };

  function gapQuickFit(host) {
    const W = 960, H = 620, CW = 420, CH = 960;
    const stage = h("div", "gq");
    const chips = (list, attr, cls = "gq__c") => list.map((v) => `<button type="button" class="${cls}" data-${attr}="${v}" aria-pressed="false">${v}</button>`).join("");

    stage.innerHTML = `
      <div class="gq__pdp">
        <p class="gq__promo">Free shipping on $50+ for rewards members · Free returns</p>
        <div class="gq__hd">
          <span class="gq__logo">OLD NAVY</span>
          <span class="gq__nav"><span>Women</span><span>Men</span><span>Girls</span><span>Boys</span><span>Toddler</span><span>Baby</span></span>
          <span class="gq__search">Search</span>
          <span class="gq__bag" data-bag-wrap aria-label="Bag, 0 items">${ICON.bag}<b data-bag hidden>0</b></span>
        </div>
        <div class="gq__body">
          <div class="gq__gal">
            <div class="gq__thumbs" role="group" aria-label="Product photos">${PHOTOS.map((p, i) => `<button type="button" class="${i ? "" : "on"}" data-photo="${i}" aria-label="Photo ${i + 1} of ${PHOTOS.length}: ${p.alt}" aria-pressed="${!i}"><img src="/assets/images/gap/pdp-${i + 1}-thumb.webp" alt="" width="56" height="75" loading="lazy" decoding="async"></button>`).join("")}</div>
            <div class="gq__photo"><img src="/assets/images/gap/pdp-1.webp" alt="${PHOTOS[0].alt}" width="800" height="1067" loading="lazy" decoding="async"></div>
          </div>
          <div class="gq__info">
            <p class="gq__crumb">Women / Jeans / Wide-Leg</p>
            <p class="gq__pt">High-Waisted Wow Wide-Leg Jeans</p>
            <p class="gq__rate"><span class="gq__stars" aria-label="Rated 4.7 out of 5"><span>★★★★★</span><span style="width:93.4%">★★★★★</span></span>4.7 <u>(21,319)</u></p>
            <p class="gq__price">$22.19</p>
            <p class="gq__lbl">Color: <b data-pdp-color>Medium Wash</b></p>
            <div class="gq__row" role="group" aria-label="Color">${COLORS.map((c, i) => `<button type="button" class="gq__sw${i ? "" : " on"}" data-pcolor="${i}" style="--sw:${c.hex}" aria-label="${c.id}" aria-pressed="${!i}"></button>`).join("")}</div>
            <div class="gq__ftabs" role="group" aria-label="Fit">${["Regular", "Petite", "Tall", "Plus"].map((f, i) => `<button type="button" data-ftype="${f}" class="${i ? "" : "on"}" aria-pressed="${!i}">${f}</button>`).join("")}</div>
            <p class="gq__lbl">Size: <b data-pdp-size>Select a size</b></p>
            <div class="gq__sgrid" role="group" aria-label="Size">${chips(SIZES, "psize", "gq__sq")}</div>
            <p class="gq__lbl">Length: <b data-pdp-len>Select a length</b></p>
            <div class="gq__lrow" role="group" aria-label="Length">${chips(LENGTHS.map((l) => l.id), "plen", "gq__sq")}</div>
            <button type="button" class="gq__qf" aria-haspopup="dialog">${ICON.avatar}<span><b>QuickFit Finder</b><small data-qf-sub>Not sure of your size? See it on a 3D avatar</small></span>${ICON.chev}</button>
            <button type="button" class="gq__atb">Add to Bag</button>
            <p class="gq__err" role="alert" hidden>Select a size and length to add to bag.</p>
          </div>
        </div>
        <div class="gq__toast" role="status" hidden><img src="/assets/images/gap/pdp-1-thumb.webp" alt=""><div><b>Added to bag</b><span data-toast></span></div></div>
      </div>

      <div class="gq__finder" hidden>
        <div class="gq__app" role="dialog" aria-modal="true" aria-label="QuickFit Finder" data-step="1">
          <p class="gq__ttl">QUICKFIT FINDER</p>
          <button type="button" class="gq__close" aria-label="Close QuickFit Finder">×</button>
          <div class="gq__grid">
            <div class="gq__q">
              <div class="gq__p" data-panel="1">
                <p class="gq__qh">(1 of 3) How tall are you?</p>
                <div class="gq__hrow">
                  <button type="button" class="gq__arw" data-hshift="-3" aria-label="Shorter heights">‹</button>
                  <div class="gq__hwin"><div class="gq__htrack">${HEIGHTS.map((n) => `<button type="button" class="gq__c gq__c--h" data-height="${n}" aria-pressed="false">${ftIn(n)}</button>`).join("")}</div></div>
                  <button type="button" class="gq__arw" data-hshift="3" aria-label="Taller heights">›</button>
                </div>
                <button type="button" class="gq__next" data-goto="2" disabled>Next</button>
              </div>
              <div class="gq__p" data-panel="2" hidden>
                <button type="button" class="gq__back" data-goto="1">${ICON.back}<span data-back-h>Height</span></button>
                <p class="gq__qh">(2 of 3) What size do you usually wear?</p>
                <p class="gq__qs">In jeans, from any brand</p>
                <div class="gq__ugrid">${chips(SIZES, "usual")}</div>
                <button type="button" class="gq__next" data-goto="3" disabled>Next</button>
              </div>
              <div class="gq__p" data-panel="3" hidden>
                <button type="button" class="gq__back" data-goto="2">${ICON.back}<span data-back-s>Size</span></button>
                <p class="gq__qh">(3 of 3) Further customize your avatar (optional)</p>
                <p class="gq__qs" data-meas-for></p>
                <div class="gq__meas">${MEAS.map(([k, label]) => `
                  <div class="gq__m" data-m="${k}"><p><span>${label}:</span> <b data-mv></b></p>
                    <div><button type="button" data-step="-0.5" aria-label="Decrease ${label.toLowerCase()}">−</button><button type="button" data-step="0.5" aria-label="Increase ${label.toLowerCase()}">+</button></div>
                  </div>`).join("")}</div>
                <div class="gq__pair"><button type="button" class="gq__ghost" data-reset>Reset</button><button type="button" class="gq__next" data-goto="4">Done customizing</button></div>
              </div>
            </div>

            <div class="gq__left">
              <button type="button" class="gq__edit" data-goto="3">Edit Body</button>
              <p class="gq__k">Size</p>
              <div class="gq__row" role="group" aria-label="Size" data-rsizes></div>
              <button type="button" class="gq__why" aria-haspopup="dialog">Why this recommendation?</button>
              <p class="gq__k">Length</p>
              <div class="gq__row" role="group" aria-label="Length">${LENGTHS.map((l) => `<button type="button" class="gq__c" data-len="${l.id}" aria-pressed="false">${l.id}</button>`).join("")}</div>
              <p class="gq__k">Color</p>
              <div class="gq__row" role="group" aria-label="Color">${COLORS.map((c, i) => `<button type="button" class="gq__sw${i ? "" : " on"}" data-color="${i}" style="--sw:${c.hex}" aria-label="${c.id}" aria-pressed="${!i}"></button>`).join("")}</div>
              <button type="button" class="gq__add"><span class="a">ADD TO BAG</span><span class="b">✓ ADDED</span></button>
            </div>

            <div class="gq__stage">
              <div class="gq__viewport" tabindex="0" role="img" aria-label="3D avatar. Drag, or use the left and right arrow keys, to turn it.">
                <canvas class="gq__canvas"></canvas>
                <p class="gq__load">Loading avatar…</p>
                <p class="gq__hint" aria-hidden="true">${ICON.rotate}Drag to rotate</p>
              </div>
              <div class="gq__tabs" role="group" aria-label="View">${Object.keys(TABS).map((t, i) => `<button type="button" class="gq__tab${i ? "" : " on"}" data-view="${t}" aria-pressed="${!i}">${t}</button>`).join("")}</div>
            </div>

            <div class="gq__right">
              <p class="gq__k gq__k--top">On your avatar</p>
              <p class="gq__sz" data-sz></p>
              <div class="gq__zones">${Object.keys(FIT).map((z) => `<button type="button" class="gq__z" data-z="${z}" aria-expanded="false"><em>${z}</em><b data-fit></b><i class="gq__i" aria-hidden="true">?</i></button>`).join("")}</div>
              <div class="gq__pop" hidden>
                <button type="button" class="gq__x" data-close-pop aria-label="Close">×</button>
                <p class="gq__ph" data-pop-title></p>
                <p><span class="t">Tight:</span> <span data-d="Tight"></span></p>
                <p><b>Fitted:</b> <span data-d="Fitted"></span></p>
                <p><b>Loose:</b> <span data-d="Loose"></span></p>
              </div>
            </div>
          </div>

          <div class="gq__whyModal" hidden>
            <div class="gq__whyCard" role="dialog" aria-modal="true" aria-label="Why this recommendation?">
              <button type="button" class="gq__x" data-close-why aria-label="Close">×</button>
              <p class="gq__whyT">Why this recommendation?</p>
              <p class="gq__whyLead">It represents how the item was designed to fit based on your inputted measurements. It might not be how you like the item to fit, but you can select different sizes to find your preferred fit.</p>
              <p class="gq__whyCmp" data-why-cmp></p>
              <div data-why-small>
                <p class="gq__whyH">Is this recommendation smaller than you were expecting?</p>
                <ol class="gq__whyList"><li>Double check the body measurements to make sure they represent your dimensions</li><li>You might prefer a tighter fit</li><li>This item might run large</li></ol>
              </div>
              <div data-why-large>
                <p class="gq__whyH">Is this recommendation larger than you were expecting?</p>
                <ol class="gq__whyList"><li>Double check the body measurements to make sure they represent your dimensions</li><li>You might prefer a looser fit</li><li>This item might run small</li></ol>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    host.appendChild(stage);

    const $ = (q) => stage.querySelector(q), $$ = (q) => [...stage.querySelectorAll(q)];
    const press = (sel, match) => $$(sel).forEach((b) => { const on = match(b); b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    const pdp = $(".gq__pdp"), finder = $(".gq__finder"), app = $(".gq__app"), pop = $(".gq__pop"), whyModal = $(".gq__whyModal");
    const vp = $(".gq__viewport"), loadEl = $(".gq__load"), hint = $(".gq__hint");

    // State
    const S = {
      step: 1, height: null, usual: null, body: null, base: null, rec: 5, size: 5, len: 1, color: 0,
      hOffset: 4, openZone: null, done: false,
      pdp: { size: null, len: null, color: 0, bag: 0, photo: 0 },
    };
    let viewer = null, viewerP = null, io = null, lastFocus = null, toastT = 0, addT = 0;

    const stopFit = fitStage(host, stage, W, H, CW, CH, (m) => { stage.dataset.mode = m; layoutHeights(); requestAnimationFrame(() => viewer?.resize()); });

    // ── Product page ──
    const renderPdp = () => {
      const P = S.pdp;
      press("[data-psize]", (b) => b.dataset.psize === P.size);
      press("[data-plen]", (b) => b.dataset.plen === P.len);
      press("[data-pcolor]", (b) => +b.dataset.pcolor === P.color);
      $("[data-pdp-size]").textContent = P.size ?? "Select a size";
      $("[data-pdp-len]").textContent = P.len ? `${P.len} (${LENGTHS.find((l) => l.id === P.len).inseam}″ inseam)` : "Select a length";
      $("[data-pdp-color]").textContent = COLORS[P.color].id;
      const ph = $(".gq__photo img"), photo = PHOTOS[P.photo];
      ph.src = `/assets/images/gap/pdp-${P.photo + 1}.webp`; ph.alt = photo.alt;
      press("[data-photo]", (b) => +b.dataset.photo === P.photo);
      const bag = $("[data-bag]"); bag.textContent = P.bag; bag.hidden = !P.bag;
      $("[data-bag-wrap]").setAttribute("aria-label", `Bag, ${P.bag} item${P.bag === 1 ? "" : "s"}`);
      $("[data-qf-sub]").textContent = S.done ? `Your fit: ${SIZES[S.rec]} ${LENGTHS[recLength(S.body)].id} · see it on your avatar` : "Not sure of your size? See it on a 3D avatar";
      $(".gq__qf").classList.toggle("is-done", S.done);
      if (P.size && P.len) $(".gq__err").hidden = true;
    };
    const toast = (text) => {
      $("[data-toast]").textContent = text;
      const t = $(".gq__toast"); t.hidden = false; requestAnimationFrame(() => t.classList.add("in"));
      clearTimeout(toastT); toastT = setTimeout(() => { t.classList.remove("in"); setTimeout(() => { t.hidden = true; }, 300); }, 3200);
    };
    const addToBag = (size, len, color) => {
      S.pdp.bag += 1; renderPdp();
      toast(`High-Waisted Wow Wide-Leg Jeans · ${size} ${len} · ${COLORS[color].id}`);
    };

    // ── Finder ──
    const derive = () => {
      if (S.height == null || S.usual == null) return;
      const si = SIZES.indexOf(S.usual);
      if (!S.base || S.base.h !== S.height || S.base.si !== si) { S.base = { h: S.height, si, ...baseBody(S.height, si) }; S.body = { ...baseBody(S.height, si) }; }
    };
    const girth = () => Math.min(1.3, Math.max(0.82, ((S.body?.hips ?? 39) / 39 + (S.body?.waist ?? 29.5) / 29.5) / 2));

    const syncAvatar = () => {
      if (!viewer) return;
      viewer.setAvatar(S.height ?? 65, S.body ? girth() : 1);
      viewer.setGarment(S.step === 4);
      if (S.step === 4) {
        const f = zoneFit(S.body, S.size);
        const hem = 0.02 + (S.body.inseam - LENGTHS[S.len].inseam) / S.body.inseam * 0.86;
        // Looser sizes sit a little roomier; a tight size never shrinks the jeans into the body (the label says Tight)
        viewer.setFit(1 + Math.min(3, Math.max(0, f.dW)) * 0.012, Math.min(0.25, Math.max(HEM_Y0, hem)));
        viewer.setTint(COLORS[S.color].rgb, COLORS[S.color].under);
      }
    };

    const renderMeas = () => {
      $("[data-meas-for]").textContent = `Showing measurements for ${ftIn(S.height)} size ${S.usual}`;
      MEAS.forEach(([k]) => {
        const row = $(`[data-m="${k}"]`);
        row.querySelector("[data-mv]").textContent = inch(S.body[k]);
        row.classList.toggle("is-changed", S.body[k] !== S.base[k]);
      });
    };

    const renderResult = () => {
      const lo = Math.max(0, Math.min(S.rec - 1, SIZES.length - 3));
      $("[data-rsizes]").innerHTML = SIZES.slice(lo, lo + 3).map((s, j) => {
        const i = lo + j, rec = i === S.rec, on = i === S.size;
        return `<button type="button" class="gq__c${on ? " on" : ""}${rec ? " is-rec" : ""}" data-size="${i}" aria-pressed="${on}"${rec ? ' aria-describedby="gq-rec"' : ""}>${s}</button>`;
      }).join("") + '<span id="gq-rec" hidden>Recommended</span>';
      press("[data-len]", (b) => b.dataset.len === LENGTHS[S.len].id);
      $$("[data-len]").forEach((b) => b.classList.toggle("is-rec", LENGTHS.findIndex((l) => l.id === b.dataset.len) === recLength(S.body)));
      press("[data-color]", (b) => +b.dataset.color === S.color);
      $("[data-sz]").textContent = `${SIZES[S.size]} ${LENGTHS[S.len].id}`;
      const fit = zoneFit(S.body, S.size);
      $$(".gq__z").forEach((z) => {
        const v = fit[z.dataset.z], b = z.querySelector("[data-fit]");
        b.textContent = v; b.dataset.v = v;
      });
      syncAvatar();
    };

    const setStep = (n) => {
      if (n >= 2 && S.height == null) n = 1;
      if (n >= 3 && S.usual == null) n = 2;
      S.step = n; app.dataset.step = n;
      $$(".gq__p").forEach((p) => { p.hidden = +p.dataset.panel !== n; });
      hidePop(); whyModal.hidden = true;
      if (n >= 3) derive();
      if (n === 2) $("[data-back-h]").textContent = `Height: ${ftIn(S.height)}`;
      if (n === 3) { $("[data-back-s]").textContent = `Size: ${S.usual}`; renderMeas(); }
      if (n === 4) {
        S.rec = recommend(S.body); S.size = S.rec; S.len = recLength(S.body); S.done = true;
        viewer?.turnTo(0); setView("Front", true);
        renderResult();
      } else viewer?.setCam("Full");
      syncAvatar();
      requestAnimationFrame(() => viewer?.resize());
    };

    const layoutHeights = () => {
      // Show a whole number of chips (up to six) in whatever width the panel has
      const win = $(".gq__hwin"), track = $(".gq__htrack"), panel = $('[data-panel="1"]');
      const chip = track.firstElementChild; if (!chip || !panel.clientWidth) return;
      const step = chip.offsetWidth + 6, vis = Math.max(1, Math.min(6, Math.floor((panel.clientWidth - 64 - 4 + 6) / step)));
      win.style.width = `${vis * step - 6 + 4}px`; win.scrollLeft = 0;
      S.hOffset = Math.max(0, Math.min(HEIGHTS.length - vis, S.hOffset));
      track.style.transform = `translateX(${-S.hOffset * step}px)`;
      $$("[data-hshift]").forEach((b) => { b.disabled = +b.dataset.hshift < 0 ? S.hOffset === 0 : S.hOffset >= HEIGHTS.length - vis; });
      $$("[data-height]").forEach((b, i) => { b.tabIndex = i >= S.hOffset && i < S.hOffset + vis ? 0 : -1; });
    };

    let activeView = "Front";
    const setView = (name, instant) => {
      activeView = name; const t = TABS[name];
      viewer?.setCam(t.cam, instant); viewer?.turnTo(t.angle);
      press("[data-view]", (b) => b.dataset.view === name);
    };
    // After a drag, keep the zoom tab lit; light Front or Back only when the avatar faces that way
    const onAngle = (a) => {
      if (S.step !== 4) return;
      const n = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const near = (x) => Math.min(Math.abs(n - x), Math.PI * 2 - Math.abs(n - x)) < 0.2;
      const zoom = TABS[activeView].cam !== "Front";
      press("[data-view]", (b) => zoom ? b.dataset.view === activeView : (b.dataset.view === "Front" && near(0)) || (b.dataset.view === "Back" && near(Math.PI)));
    };

    const showPop = (zone) => {
      S.openZone = zone;
      pop.querySelector("[data-pop-title]").textContent = zone;
      Object.entries(FIT[zone]).forEach(([k, v]) => { pop.querySelector(`[data-d="${k}"]`).textContent = v; });
      pop.dataset.z = zone; pop.hidden = false;
      $$(".gq__z").forEach((z) => { const on = z.dataset.z === zone; z.classList.toggle("on", on); z.setAttribute("aria-expanded", on); });
    };
    function hidePop() {
      S.openZone = null; pop.hidden = true;
      $$(".gq__z").forEach((z) => { z.classList.remove("on"); z.setAttribute("aria-expanded", "false"); });
    }

    const openWhy = () => {
      const usual = SIZES.indexOf(S.usual), d = S.rec - usual, rec = `${SIZES[S.rec]} ${LENGTHS[recLength(S.body)].id}`;
      const why = `We recommend ${rec} from your height (${ftIn(S.height)}), the size you usually wear (${S.usual})${MEAS.some(([k]) => S.body[k] !== S.base[k]) ? " and the measurements you adjusted" : ""}.`;
      $("[data-why-cmp]").textContent = d === 0 ? `${why} It matches the size you usually wear.` : `${why} That is ${Math.abs(d) === 1 ? "one size" : `${Math.abs(d)} sizes`} ${d < 0 ? "smaller" : "larger"} than you usually wear.`;
      const tight = Object.keys(FIT).filter((z) => zoneFit(S.body, S.rec)[z] === "Tight");
      if (tight.length) $("[data-why-cmp]").textContent += ` It is the largest size in this style, and the ${tight.join(" and ").toLowerCase()} may still be tight.`;
      $("[data-why-small]").hidden = d > 0; $("[data-why-large]").hidden = d < 0;
      whyModal.hidden = false; $("[data-close-why]").focus();
    };

    const ensureViewer = () => viewerP || (viewerP = loadThree().then((THREE) => {
      if (!THREE) { loadEl.textContent = "3D unavailable"; return null; }
      viewer = mountViewer($(".gq__canvas"), THREE, onAngle);
      viewer.bindDrag(vp, () => hint.classList.add("is-gone"));
      viewer.ready.then(() => { loadEl.hidden = true; syncAvatar(); if (S.step === 4) renderResult(); viewer.resize(); }, () => { loadEl.textContent = "3D unavailable"; });
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !finder.hidden) { viewer.resize(); viewer.start(); } else viewer.stop(); }, { threshold: 0.1 });
      io.observe(host);
      return viewer;
    }));

    const openFinder = (step) => {
      lastFocus = document.activeElement;
      finder.hidden = false; pdp.inert = true;
      requestAnimationFrame(() => finder.classList.add("in"));
      setStep(step ?? (S.done ? 4 : S.height == null ? 1 : S.usual == null ? 2 : 3));
      layoutHeights();
      ensureViewer().then((v) => { if (!v) return; syncAvatar(); if (S.step === 4) setView(activeView, true); else v.setCam("Full", true); v.resize(); v.start(); });
      requestAnimationFrame(() => (app.querySelector(".gq__p:not([hidden]) button:not([disabled]):not(.gq__back):not(.gq__arw):not([tabindex='-1'])") || $(".gq__close")).focus({ preventScroll: true }));
    };
    const closeFinder = () => {
      finder.classList.remove("in"); finder.hidden = true; pdp.inert = false; viewer?.stop();
      clearTimeout(addT); $(".gq__add").classList.remove("is-added");
      renderPdp();
      (lastFocus && stage.contains(lastFocus) ? lastFocus : $(".gq__qf")).focus({ preventScroll: true });
    };

    stage.addEventListener("click", (e) => {
      const t = e.target, q = (s) => t.closest(s);
      let b;
      // Product page
      if ((b = q("[data-psize]"))) { S.pdp.size = b.dataset.psize; return renderPdp(); }
      if ((b = q("[data-plen]"))) { S.pdp.len = b.dataset.plen; return renderPdp(); }
      if ((b = q("[data-photo]"))) { S.pdp.photo = +b.dataset.photo; return renderPdp(); }
      if ((b = q("[data-pcolor]"))) { S.pdp.color = +b.dataset.pcolor; S.color = S.pdp.color; return renderPdp(); }
      if ((b = q("[data-ftype]"))) return press("[data-ftype]", (x) => x === b);
      if (q(".gq__qf")) return openFinder();
      if (q(".gq__atb")) {
        if (!S.pdp.size || !S.pdp.len) { $(".gq__err").hidden = false; return; }
        return addToBag(S.pdp.size, S.pdp.len, S.pdp.color);
      }
      // Finder chrome
      if (q(".gq__close") || t === finder) return closeFinder();
      if (q("[data-close-why]") || t === whyModal) { whyModal.hidden = true; return $(".gq__why").focus(); }
      if (q("[data-close-pop]")) { const z = S.openZone; hidePop(); return $(`.gq__z[data-z="${z}"]`)?.focus(); }
      if ((b = q("[data-goto]"))) return setStep(+b.dataset.goto);
      // Step 1
      if ((b = q("[data-hshift]"))) { S.hOffset += +b.dataset.hshift; return layoutHeights(); }
      if ((b = q("[data-height]"))) {
        S.height = +b.dataset.height; press("[data-height]", (x) => x === b);
        $('[data-panel="1"] .gq__next').disabled = false; return syncAvatar();
      }
      // Step 2
      if ((b = q("[data-usual]"))) {
        S.usual = b.dataset.usual; press("[data-usual]", (x) => x === b);
        $('[data-panel="2"] .gq__next').disabled = false; derive(); return syncAvatar();
      }
      // Step 3
      if ((b = q("[data-m] [data-step]"))) {
        const k = b.closest("[data-m]").dataset.m, base = S.base[k];
        S.body[k] = Math.min(base + 6, Math.max(base - 6, S.body[k] + +b.dataset.step));
        renderMeas(); return syncAvatar();
      }
      if (q("[data-reset]")) { MEAS.forEach(([k]) => { S.body[k] = S.base[k]; }); renderMeas(); return syncAvatar(); }
      // Result
      if ((b = q("[data-size]"))) { S.size = +b.dataset.size; return renderResult(); }
      if ((b = q("[data-len]"))) { S.len = LENGTHS.findIndex((l) => l.id === b.dataset.len); return renderResult(); }
      if ((b = q("[data-color]"))) { S.color = +b.dataset.color; S.pdp.color = S.color; return renderResult(); }
      if ((b = q("[data-view]"))) return setView(b.dataset.view);
      if ((b = q(".gq__z"))) return S.openZone === b.dataset.z ? hidePop() : showPop(b.dataset.z);
      if (q(".gq__why")) return openWhy();
      if (q(".gq__add")) {
        const btn = $(".gq__add"); if (btn.classList.contains("is-added")) return;
        btn.classList.add("is-added");
        Object.assign(S.pdp, { size: SIZES[S.size], len: LENGTHS[S.len].id, color: S.color });
        addT = setTimeout(() => { closeFinder(); addToBag(S.pdp.size, S.pdp.len, S.pdp.color); }, reduce() ? 300 : 900);
      }
    });

    stage.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !finder.hidden) {
        e.stopPropagation();
        if (!whyModal.hidden) { whyModal.hidden = true; return $(".gq__why").focus(); }
        if (S.openZone) { const z = S.openZone; hidePop(); return $(`.gq__z[data-z="${z}"]`)?.focus(); }
        return closeFinder();
      }
      if (e.target === vp && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault(); hint.classList.add("is-gone");
        viewer?.rotateBy(e.key === "ArrowLeft" ? -Math.PI / 8 : Math.PI / 8);
      }
      // Keep Tab inside the open dialog
      if (e.key === "Tab" && !finder.hidden) {
        const scope = whyModal.hidden ? app : whyModal;
        const f = [...scope.querySelectorAll("button:not([disabled]), [tabindex='0']")].filter((x) => x.offsetParent && x.tabIndex >= 0 && (whyModal.hidden ? !whyModal.contains(x) : true));
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // Load the 3D (~0.8 MB) only on intent: pointing at, focusing or touching QuickFit, or opening it. On a fast
    // connection without Save-Data, also after the demo has been on screen for a moment, so opening is instant.
    const qf = $(".gq__qf"), intent = () => ensureViewer();
    ["pointerenter", "focus", "touchstart"].forEach((t) => qf.addEventListener(t, intent, { once: true, passive: true }));
    const net = navigator.connection, fast = !net || (!net.saveData && !/2g/.test(net.effectiveType || ""));
    let dwell = 0;
    const warm = new IntersectionObserver(([e]) => {
      clearTimeout(dwell);
      if (e.isIntersecting && fast) dwell = setTimeout(() => { warm.disconnect(); ensureViewer(); }, 1500);
    }, { threshold: 0.5 });
    warm.observe(host);
    renderPdp();

    return () => { warm.disconnect(); clearTimeout(dwell); io?.disconnect(); viewer?.dispose(); stopFit(); clearTimeout(toastT); clearTimeout(addT); };
  }

  // ── CotonAI design system, live ──
  // Real components from ~/dev/cotonai/src/design-system running on its real tokens (css/case-studies.css, DS-LIVE block,
  // generated by tools/build-ds-live-css.py). Behaviour follows the components: Button loading, Switch, SegmentedControl,
  // Progress, Skeleton, StatusPill, Menu, Tooltip, Dialog, and the generation lifecycle configure > ready > queued > running > done | cancelled.
  function dsLive(host) {
    if (!document.getElementById("dsx-inter")) {   // the product's own typeface, loaded only when this demo mounts
      const l = document.createElement("link"); l.id = "dsx-inter"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap"; document.head.appendChild(l);
    }
    const SPIN = (c = "") => `<svg class="dsx-spin ${c}" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-opacity=".25" stroke-width="1.6"/><path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
    const ICON = {
      share: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 10V2.5M5.5 5 8 2.5 10.5 5M3.5 8v4.5h9V8"/></svg>`,
      dots: `<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="3.5" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="12.5" cy="8" r="1.2"/></svg>`,
    };
    const root = h("div", "dsx");
    root.innerHTML = `
      <div class="dsx__bar">
        <span class="dsx__title">CotonAI design system, live. Real components on the real tokens.</span>
        <div class="dsx-seg dsx-seg--sm" role="radiogroup" aria-label="Theme mode">
          <button type="button" role="radio" aria-checked="true" data-mode="light">Light</button>
          <button type="button" role="radio" aria-checked="false" data-mode="dark">Dark</button>
        </div>
      </div>
      <div class="dsx__grid">
        <section class="dsx__tile" aria-label="Generation lifecycle">
          <p class="dsx__k"><b>Generation</b><span>Progress · Skeleton · StatusPill</span></p>
          <div class="dsx-gen__meta"><span class="dsx-pill" data-pill></span><span class="dsx__k" style="margin:0">Render · 6 credits</span></div>
          <div class="dsx-gen__stage" data-stage data-phase="ready"><div class="dsx-gen__sk"></div><div class="dsx-gen__img"></div><span class="dsx-gen__txt" data-stage-txt></span></div>
          <div class="dsx-bar" role="progressbar" aria-label="Generation progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i data-fill></i></div>
          <div class="dsx__row"><button type="button" class="dsx-btn dsx-btn--primary" data-gen>Generate</button><button type="button" class="dsx-btn dsx-btn--ghost" data-cancel hidden>Cancel</button></div>
        </section>

        <section class="dsx__tile" aria-label="Controls">
          <p class="dsx__k"><b>Controls</b><span>Button · Switch · SegmentedControl</span></p>
          <div class="dsx__row">
            <button type="button" class="dsx-btn dsx-btn--primary">Generate</button><button type="button" class="dsx-btn dsx-btn--secondary">Credits</button>
            <button type="button" class="dsx-btn dsx-btn--neutral">Share</button><button type="button" class="dsx-btn dsx-btn--solid">Export</button>
            <button type="button" class="dsx-btn dsx-btn--ghost">Maybe later</button><button type="button" class="dsx-btn dsx-btn--danger">Delete</button>
          </div>
          <div class="dsx-sw-row"><span id="dsx-sw1">Snap to guides</span><button type="button" class="dsx-sw" role="switch" aria-checked="true" aria-labelledby="dsx-sw1"><i></i></button></div>
          <div class="dsx-sw-row"><span id="dsx-sw2">Show layer names</span><button type="button" class="dsx-sw" role="switch" aria-checked="false" aria-labelledby="dsx-sw2"><i></i></button></div>
          <div class="dsx-sw-row"><span id="dsx-q">Quality</span>
            <div class="dsx-seg" role="radiogroup" aria-labelledby="dsx-q"><button type="button" role="radio" aria-checked="false">Low</button><button type="button" role="radio" aria-checked="true">Medium</button><button type="button" role="radio" aria-checked="false">High</button></div></div>
        </section>

        <section class="dsx__tile" aria-label="Overlays">
          <p class="dsx__k"><b>Overlays</b><span>Tooltip · Menu · Dialog</span></p>
          <div class="dsx__row">
            <span class="dsx-pop"><button type="button" class="dsx-ib" aria-label="Share">${ICON.share}</button><span class="dsx-tip" role="tooltip">Share<span>⌘S</span></span></span>
            <span class="dsx-pop"><button type="button" class="dsx-ib" aria-label="More actions" aria-haspopup="menu" aria-expanded="false" data-menu-btn>${ICON.dots}</button>
              <div class="dsx-menu" role="menu" data-state="closed" data-menu>
                <button type="button" role="menuitem" class="dsx-row">Rename<kbd>⏎</kbd></button>
                <button type="button" role="menuitem" class="dsx-row">Duplicate<kbd>⌘D</kbd></button>
                <div class="dsx-sep" role="separator"></div>
                <button type="button" role="menuitem" class="dsx-row dsx-row--danger" data-del>Delete board</button>
              </div></span>
            <button type="button" class="dsx-btn dsx-btn--danger" data-del>Delete board</button>
          </div>
          <p class="dsx__k" style="margin-top:auto">Hover the share button for the tooltip. Open the menu, or delete, for the dialog. Esc closes.</p>
          <div class="dsx-scrim" data-state="closed" data-scrim><div class="dsx-dlg" role="dialog" aria-modal="true" aria-labelledby="dsx-dt">
            <h4 id="dsx-dt">Delete this board?</h4><p>The board and its 12 frames are removed for everyone.</p>
            <div class="dsx__row"><button type="button" class="dsx-btn dsx-btn--ghost" data-dlg-close>Cancel</button><button type="button" class="dsx-btn dsx-btn--danger" data-dlg-close>Delete</button></div></div></div>
        </section>

        <section class="dsx__tile" aria-label="Agent states">
          <p class="dsx__k"><b>Agent</b><span>StatusPill · pulse · ping · cursor</span></p>
          <div class="dsx-ag"><span class="dsx-dot" aria-hidden="true"></span><span class="dsx-think">Thinking…</span></div>
          <p class="dsx-stream" aria-live="off"><span data-stream></span><span class="dsx-cur" aria-hidden="true"></span></p>
          <div class="dsx__row">
            <span class="dsx-pill dsx-pill--accent">${SPIN("dsx-spin--sm")}2 running</span>
            <span class="dsx-pill">Queued · 1</span>
            <span class="dsx-pill dsx-pill--warning">Low credits</span>
            <span class="dsx-pill dsx-pill--danger">Out of credits</span>
          </div>
        </section>
      </div>
      <p class="dsx__foot">Tokens: tokens.css. Motion: fast 90ms, base 200ms, theme 240ms. Respects reduced motion.</p>`;
    host.appendChild(root);
    const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
    const timers = new Set(), genT = new Set();   // genT holds only the generation run, so Generate never cancels the agent loop or a button reset
    const later = (fn, ms, set = timers) => { const t = setTimeout(() => { set.delete(t); fn(); }, ms); set.add(t); return t; };

    // Light / Dark: the same semantic names, two modes
    $$("[data-mode]").forEach((b) => b.addEventListener("click", () => {
      root.classList.toggle("is-dark", b.dataset.mode === "dark");
      $$("[data-mode]").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    }));

    // Switches and segmented controls
    $$(".dsx-sw").forEach((s) => s.addEventListener("click", () => s.setAttribute("aria-checked", String(s.getAttribute("aria-checked") !== "true"))));
    $$(".dsx-seg:not([aria-label]) button").forEach((b, _, all) => b.addEventListener("click", () => all.forEach((x) => x.setAttribute("aria-checked", String(x === b)))));
    $$(".dsx-btn:not([data-gen]):not([data-cancel]):not([data-del]):not([data-dlg-close])").forEach((b) => b.addEventListener("click", () => {
      if (b.classList.contains("dsx-btn--primary") && !b.hasAttribute("aria-busy")) {   // Button loading: spinner, aria-busy, clicks blocked
        const html = b.innerHTML; b.setAttribute("aria-busy", "true"); b.disabled = true; b.innerHTML = SPIN() + html;
        later(() => { b.removeAttribute("aria-busy"); b.disabled = false; b.innerHTML = html; }, 1400);
      }
    }));

    // Generation lifecycle
    const pill = $("[data-pill]"), stage = $("[data-stage]"), txt = $("[data-stage-txt]"), fill = $("[data-fill]"), bar = $(".dsx-bar");
    const gen = $("[data-gen]"), cancel = $("[data-cancel]");
    let phase = "ready", pct = 0, iv = 0, queuedAt = 0, ranOnce = false;
    const LABEL = { ready: ["Ready", ""], queued: ["Queued", ""], running: ["Running", "accent"], done: ["Done", ""], cancelled: ["Cancelled", ""] };
    const STAGE = { ready: "Select an image, then generate", queued: "Queued", running: "Generating", done: "Render complete", cancelled: "Cancelled" };
    const render = () => {
      const [t, tone] = LABEL[phase], busy = phase === "queued" || phase === "running";
      pill.className = "dsx-pill" + (tone ? " dsx-pill--" + tone : "");
      pill.innerHTML = (busy ? SPIN("dsx-spin--sm") : "") + t + (phase === "running" ? ` ${Math.round(pct)}%` : "");
      stage.dataset.phase = phase; txt.textContent = STAGE[phase];
      fill.style.transform = `translateX(-${100 - pct}%)`; bar.setAttribute("aria-valuenow", String(Math.round(pct)));
      gen.disabled = busy; if (busy) { gen.setAttribute("aria-busy", "true"); } else gen.removeAttribute("aria-busy");
      gen.innerHTML = (busy ? SPIN() : "") + (phase === "done" || phase === "cancelled" ? "Generate again" : "Generate");
      cancel.hidden = !busy;
    };
    const stop = () => { clearInterval(iv); genT.forEach(clearTimeout); genT.clear(); };
    const start = () => {
      if (phase === "queued" || phase === "running") return;
      stop(); ranOnce = true; pct = 0; phase = "queued"; render();
      later(() => {
        phase = "running"; render();
        iv = setInterval(() => { pct = Math.min(100, pct + 2 + Math.random() * 6); if (pct >= 100) { clearInterval(iv); later(() => { phase = "done"; render(); }, 240, genT); } render(); }, 110);
      }, 700, genT);
    };
    gen.addEventListener("click", start);
    cancel.addEventListener("click", () => { stop(); phase = "cancelled"; pct = 0; render(); });
    render();
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting && !ranOnce) { start(); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(host);

    // Menu, tooltip, dialog
    const menu = $("[data-menu]"), mbtn = $("[data-menu-btn]"), scrim = $("[data-scrim]");
    const setMenu = (open) => { menu.dataset.state = open ? "open" : "closed"; mbtn.setAttribute("aria-expanded", String(open)); };
    const setDlg = (open) => { scrim.dataset.state = open ? "open" : "closed"; if (open) { setMenu(false); later(() => $("[data-dlg-close]").focus({ preventScroll: true }), 160); } };
    mbtn.addEventListener("click", (e) => { e.stopPropagation(); setMenu(menu.dataset.state !== "open"); });
    $$("[data-del]").forEach((b) => b.addEventListener("click", () => setDlg(true)));
    $$("[data-dlg-close]").forEach((b) => b.addEventListener("click", () => setDlg(false)));
    scrim.addEventListener("click", (e) => { if (e.target === scrim) setDlg(false); });
    root.addEventListener("click", (e) => { if (!e.target.closest(".dsx-pop")) setMenu(false); });
    root.addEventListener("keydown", (e) => { if (e.key === "Escape") { setMenu(false); setDlg(false); } });

    // Agent: a streamed answer with the blinking cursor, looping
    const out = $("[data-stream]"), LINE = "Starting with a muted moodboard: three sage greens and one warm sand.";
    let i = 0, dir = 1;
    const type = () => {
      if (reduce()) { out.textContent = LINE; return; }
      i += dir; out.textContent = LINE.slice(0, i);
      if (dir > 0 && i >= LINE.length) { dir = -1; later(type, 2200); return; }
      if (dir < 0 && i <= 0) { dir = 1; later(type, 600); return; }
      later(type, dir > 0 ? 38 : 8);
    };
    out.textContent = ""; later(type, 800);

    return () => { stop(); timers.forEach(clearTimeout); io.disconnect(); };
  }

  // ── Arcade.dev dashboard, live ──
  // The real "Dashboard · Active" screen from the Paper file, exported to assets/arcade-dash/ (dash.html + dash.css, built by
  // tools/build-arcade-dash.py from the Paper markup). Everything is static except the data viz, which is wired here:
  // KPI sparklines, the Tool calls chart (scrub + 1W/1M/3M), Outcomes, Top tools and the When agents run grid.
  const adxCache = {};
  const adxLoad = (name) => adxCache[name] || (adxCache[name] = Promise.all([
    new Promise((res) => {
      let n = 0; const done = () => { if (++n === 2) res(); };
      for (const f of ["base", name]) {
        const id = "adx-css-" + f; if (document.getElementById(id)) { done(); continue; }
        const l = h("link"); l.id = id; l.rel = "stylesheet"; l.href = `/assets/arcade-dash/${f}.css`; l.onload = l.onerror = done; document.head.appendChild(l);
      }
      if (!document.getElementById("adx-fonts")) { const f = h("link"); f.id = "adx-fonts"; f.rel = "stylesheet"; f.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"; document.head.appendChild(f); }
    }),
    fetch(`/assets/arcade-dash/${name}.html`).then((r) => r.text()),
  ]).then((x) => x[1]));

  // Each screen is the Paper frame exported to assets/arcade-dash/<name>.html + .css (tools/arcade-dash/). Static except the data viz, wired in `wire`.
  const adxScreen = (name, wire) => (host) => {
    const root = h("div", "adx"); host.appendChild(root);
    let off = () => {}, dead = false;
    adxLoad(name).then((html) => { if (dead) return; root.innerHTML = `<div class="adx__stage">${html}</div>`; off = adxMount(host, root, wire); });
    return () => { dead = true; off(); };
  };
  const adxMount = (host, root, wire) => {
    const stg = root.firstChild, AW = 1440;
    const fit = () => { const sc = host.clientWidth / AW; stg.style.transform = `scale(${sc})`; root.style.height = stg.offsetHeight * sc + "px"; };
    const ro = new ResizeObserver(fit); ro.observe(host); fit();
    const done = wire ? wire(host, root) : null;
    return () => { ro.disconnect(); done?.(); };
  };
  const arcadeDash = adxScreen("dash", (host, root) => adxWire(host, root));
  const arcadeApprovals = adxScreen("approvals", null);
  const arcadeUsage = adxScreen("usage", (host, root) => adxUsage(host, root));

  function adxWire(host, root) {
    const AW = 1440;
    const $ = (k) => root.querySelector(`[data-w="${k}"]`);
    const fmt = (n) => Math.round(n).toLocaleString("en-US");
    const txt = (el) => el.firstElementChild ? txt(el.firstElementChild) : el;   // innermost text-bearing element

    // ── KPI sparklines: hover a bar (or the line) to read that day ──
    const KV = [
      { vals: [2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4], u: (v) => `${v} agents` },
      { vals: null, u: (v) => `${v}%` },
      { vals: [2, 4, 3, 5, 4, 6, 4, 5, 6, 6, 7, 8], u: (v) => `${v} users` },
      { vals: [10, 9, 9, 8, 8, 6, 7, 5, 5, 4, 4, 3], u: (v) => `${v} failures` },
    ];
    for (let i = 0; i < 4; i++) {
      const tile = $("kpi" + i), svg = $("ks" + i); if (!tile || !svg) continue;
      tile.style.position = "relative";
      const tip = h("span", "adx-ktip"); tile.appendChild(tip);
      const rects = [...svg.querySelectorAll("rect")], line = svg.querySelector("polyline");
      let vals = KV[i].vals, pts = null, dot = null;
      if (line) {
        pts = line.getAttribute("points").trim().split(/\s+/).map((p) => p.split(",").map(Number));
        vals = pts.map((p) => Math.round(91 - ((p[1] - 4) / 13.2) * 6));
        dot = document.createElementNS("http://www.w3.org/2000/svg", "circle"); dot.setAttribute("r", 3.5); dot.setAttribute("fill", "#6F86E0"); dot.setAttribute("stroke", "#262626"); dot.setAttribute("stroke-width", 2); dot.style.opacity = 0; svg.appendChild(dot);
      }
      const n = vals.length, base = rects.map((r) => r.getAttribute("fill"));
      svg.style.cursor = "crosshair"; svg.style.overflow = "visible";
      svg.addEventListener("pointermove", (e) => {
        const r = svg.getBoundingClientRect(), x = Math.min(0.999, Math.max(0, (e.clientX - r.left) / r.width)), j = Math.floor(x * n);
        tip.textContent = `${KV[i].u(vals[j])} · ${n - 1 - j === 0 ? "today" : (n - 1 - j) + "d ago"}`; tip.classList.add("is-on");
        rects.forEach((b, k) => b.setAttribute("fill", k === j ? "#A9B8FF" : base[k]));
        if (dot) { dot.setAttribute("cx", pts[j][0]); dot.setAttribute("cy", pts[j][1]); dot.style.opacity = 1; }
      });
      svg.addEventListener("pointerleave", () => { tip.classList.remove("is-on"); rects.forEach((b, k) => b.setAttribute("fill", base[k])); if (dot) dot.style.opacity = 0; });
    }

    // ── Tool calls per day ──
    const svg = $("chart"), T = svg.querySelectorAll(":scope > text"), poly = svg.querySelector("polygon"), pl = svg.querySelectorAll("polyline");
    const prevL = pl[0], curL = pl[1], cross = svg.querySelector("line:nth-of-type(5)") || [...svg.querySelectorAll("line")].pop(), circ = svg.querySelectorAll("circle")[0], rect = svg.querySelector("rect"), tDate = T[T.length - 2], tVal = T[T.length - 1];
    const X0 = 44, X1 = 716, YB = 184, K = 164 / 750, XL = [...T].slice(4, 9);
    const parse = (el) => el.getAttribute("points").trim().split(/\s+/).map((p) => Math.round((YB - Number(p.split(",")[1])) / K));
    const C30 = parse(curL), P30 = parse(prevL);
    let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const older = (a) => Array.from({ length: 60 }, (_, i) => Math.round(Math.max(140, Math.min(560, a.reduce((x, y) => x + y, 0) / a.length * (0.72 + 0.28 * (i / 60)) + (rnd() - 0.5) * 150))));
    const CUR = older(C30).concat(C30), PRV = older(P30).concat(P30);
    const END = new Date(2026, 10, 12), lab = (back) => new Date(END.getTime() - back * 864e5).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const orig = { poly: poly.getAttribute("points"), cur: curL.getAttribute("points"), prev: prevL.getAttribute("points"), lx1: cross.getAttribute("x1"), cy: circ.getAttribute("cy"), cx: circ.getAttribute("cx"), rx: rect.getAttribute("x"), tx: tDate.getAttribute("x"), d: tDate.textContent, v: tVal.textContent, xl: XL.map((t) => t.textContent) };
    const sum30 = C30.reduce((a, b) => a + b, 0), scale = 12480 / sum30;
    const cTotal = txt($("calls-total")), cDelta = txt($("calls-delta")), legC = $("leg-cur"), legP = $("leg-prev"), outSub = $("out-sub"), outSubOrig = outSub.textContent;
    let range = 30, cs = C30, ps = P30, calls = 12480;
    const px = (i) => X0 + (i / (cs.length - 1)) * (X1 - X0), py = (v) => YB - v * K;
    const line = (a) => a.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
    const showTip = (i) => {
      const x = px(i); cross.setAttribute("x1", x); cross.setAttribute("x2", x); circ.setAttribute("cx", x); circ.setAttribute("cy", py(cs[i]));
      tDate.textContent = lab(cs.length - 1 - i); tVal.textContent = `${fmt(cs[i])} calls · prev ${fmt(ps[i])}`;
      const w = Math.max(146, Math.ceil(tVal.getComputedTextLength?.() || 122) + 24), rx = x - w - 12 < X0 - 6 ? x + 12 : x - w - 12;
      rect.setAttribute("width", w); rect.setAttribute("x", rx); tDate.setAttribute("x", rx + 12); tVal.setAttribute("x", rx + 12);
    };
    const rest = () => { cross.setAttribute("x1", orig.lx1); cross.setAttribute("x2", orig.lx1); circ.setAttribute("cx", orig.cx); circ.setAttribute("cy", orig.cy); rect.setAttribute("x", orig.rx); rect.setAttribute("width", 146); tDate.setAttribute("x", orig.tx); tVal.setAttribute("x", orig.tx); tDate.textContent = orig.d; tVal.textContent = orig.v; };
    const idxAt = (e) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const x = pt.matrixTransform(svg.getScreenCTM().inverse()).x; return Math.max(0, Math.min(cs.length - 1, Math.round(((x - X0) / (X1 - X0)) * (cs.length - 1)))); };
    svg.style.cursor = "crosshair"; svg.style.touchAction = "pan-y";
    svg.addEventListener("pointermove", (e) => showTip(idxAt(e)));
    svg.addEventListener("pointerdown", (e) => showTip(idxAt(e)));
    svg.addEventListener("pointerleave", () => { if (range === 30) rest(); else showTip(cs.length - 1); });

    // 1W / 1M / 3M
    const btn = { 7: $("r7"), 30: $("r30"), 90: $("r90") }, cls = (n) => [btn[n].className, txt(btn[n]).className];
    const SEL = cls(30), UN = cls(7);
    const setRange = (n) => {
      range = n; cs = CUR.slice(-n); ps = PRV.slice(-n);
      for (const k in btn) { const c = +k === n ? SEL : UN; btn[k].className = c[0]; txt(btn[k]).className = c[1]; btn[k].setAttribute("aria-pressed", String(+k === n)); }
      if (n === 30) { poly.setAttribute("points", orig.poly); curL.setAttribute("points", orig.cur); prevL.setAttribute("points", orig.prev); XL.forEach((t, i) => t.textContent = orig.xl[i]); rest(); cTotal.textContent = "12,480"; cDelta.textContent = "+18% vs previous 30 days"; calls = 12480; }
      else {
        curL.setAttribute("points", line(cs)); prevL.setAttribute("points", line(ps)); poly.setAttribute("points", `${line(cs)} ${X1},${YB} ${X0},${YB}`);
        XL.forEach((t, i) => t.textContent = lab(cs.length - 1 - Math.round((i / 4) * (cs.length - 1)))); showTip(cs.length - 1);
        calls = Math.round(cs.reduce((a, b) => a + b, 0) * scale); cTotal.textContent = fmt(calls);
        const d = Math.round((cs.reduce((a, b) => a + b, 0) / ps.reduce((a, b) => a + b, 0) - 1) * 100); cDelta.textContent = `${d >= 0 ? "+" : "−"}${Math.abs(d)}% vs previous ${n === 7 ? "7" : "90"} days`;
      }
      legC.textContent = `Last ${n} days`; legP.textContent = `Previous ${n} days`;
      outSub.textContent = n === 30 ? outSubOrig : `${fmt(calls)} calls, last ${n} days`;
    };
    for (const k in btn) { btn[k].style.cursor = "pointer"; btn[k].setAttribute("role", "button"); btn[k].tabIndex = 0; btn[k].addEventListener("click", () => setRange(+k)); btn[k].addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setRange(+k); } }); }

    // ── Outcomes: hover a segment or its key ──
    const SEG = [["Success", 91], ["Held by policy", 6], ["Failed", 3]], segs = [0, 1, 2].map((i) => $("seg" + i)), keys = [0, 1, 2].map((i) => $("key" + i));
    const dim = (els, on, k) => els.forEach((el, i) => { el.style.transition = "opacity .15s"; el.style.opacity = on && i !== k ? 0.35 : 1; });
    [0, 1, 2].forEach((i) => [segs[i], keys[i]].forEach((el) => {
      el.style.cursor = "default";
      el.addEventListener("pointerenter", () => { dim(segs, true, i); dim(keys, true, i); outSub.textContent = `${SEG[i][0]}: ${fmt((calls * SEG[i][1]) / 100)} calls · ${SEG[i][1]}%`; });
      el.addEventListener("pointerleave", () => { dim(segs, false); dim(keys, false); outSub.textContent = range === 30 ? outSubOrig : `${fmt(calls)} calls, last ${range} days`; });
    }));

    // ── Top tools ──
    const tools = [0, 1, 2, 3, 4].map((i) => $("tool" + i));
    tools.forEach((el, i) => { el.style.transition = "opacity .15s"; el.addEventListener("pointerenter", () => dim(tools, true, i)); el.addEventListener("pointerleave", () => dim(tools, false)); });

    // ── When agents run ──
    const RW = ["Night", "Morning", "Afternoon", "Evening"], DY = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const bk = $("bk"), bt = $("bt"), bd = $("bd"), o = { k: bk.textContent, t: bt.textContent, d: bd.textContent };
    const cells = [], size = (c) => parseFloat(c.firstElementChild.style.width) || c.firstElementChild.getBoundingClientRect().width / (host.clientWidth / AW);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) { const slot = $(`hm${r}-${c}`), dot = slot.firstElementChild; cells.push({ slot, dot, r, c, calls: Math.round(1204 * Math.pow(dot.getBoundingClientRect().width / (host.clientWidth / AW) / 20, 2)) }); }
    cells.forEach((cl) => {
      cl.slot.style.cursor = "default"; cl.dot.style.transition = "transform .12s, box-shadow .12s";
      cl.slot.addEventListener("pointerenter", () => {
        cells.forEach((x) => { x.dot.style.transform = x === cl ? "scale(1.25)" : ""; x.dot.style.boxShadow = x === cl ? "0 0 0 4px #6F86E033" : ""; });
        const best = cl.r === 2 && cl.c === 1;
        bk.textContent = best ? o.k : "Selected"; bt.textContent = `${DY[cl.c]} ${RW[cl.r].toLowerCase()}`;
        bd.textContent = best ? o.d : `${fmt(cl.calls)} calls, ${Math.round((cl.calls / 1204) * 100)}% of the busiest window.`;
      });
      cl.slot.addEventListener("pointerleave", () => { cells.forEach((x) => { x.dot.style.transform = ""; x.dot.style.boxShadow = ""; }); bk.textContent = o.k; bt.textContent = o.t; bd.textContent = o.d; });
    });
    return null;
  }

  // Usage & budget: spend chart scrub + Month/Quarter, share bars, budget bar
  function adxUsage(host, root) {
    const $ = (k) => root.querySelector(`[data-w="${k}"]`), NS = "http://www.w3.org/2000/svg", AW = 1440;
    const el = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
    const money = (v) => "$" + v.toFixed(2), scale = () => host.clientWidth / AW;
    const svg = $("chart"); svg.style.overflow = "visible"; svg.style.cursor = "crosshair"; svg.style.touchAction = "pan-y";
    const [area, lineP] = [...svg.querySelectorAll("path")], dot = svg.querySelector("circle"), pace = svg.querySelectorAll("line")[4];
    const YB = 176, K = 132 / 48.2, W = 700;
    const parse = (d) => d.match(/[ML]\s*[\d.]+\s+[\d.]+/g).map((m) => m.replace(/[ML]\s*/, "").split(/\s+/).map(Number));
    const NOV = parse(lineP.getAttribute("d")).map((p) => (YB - p[1]) / K);
    const orig = { area: area.getAttribute("d"), line: lineP.getAttribute("d"), cx: dot.getAttribute("cx"), cy: dot.getAttribute("cy") };
    const axis = $("axis"), labels = [...axis.children], origLab = labels.map((l) => l.textContent), leg = $("legend");
    // Quarter: three month-to-date curves, each resetting on the 1st (Sep and Oct are full months)
    let sd = 5; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const month = (days, end) => Array.from({ length: days }, (_, i) => { const t = (i + 1) / days; return end * (0.12 + 0.88 * Math.pow(t, 1.12)) + (rnd() - 0.5) * end * 0.04; }).map((v, i, a) => (i === a.length - 1 ? end : v));
    const nov13 = Array.from({ length: 13 }, (_, i) => { const t = i / 12 * 13; const k = Math.min(13, t) / 13 * 13, lo = Math.floor(k), hi = Math.min(13, lo + 1); return NOV[lo] + (NOV[hi] - NOV[lo]) * (k - lo); });
    const QD = [...month(30, 58.4), ...month(31, 66.1), ...nov13];
    const QL = (i) => { const dt = new Date(2026, 8, 1 + i); return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }); };
    let mode = "month", pts = NOV, y = (v) => YB - v * K, label = (i) => { const d = Math.round(1 + (i * 12) / 13); return "Nov " + d; };
    const x = (i) => (i / (pts.length - 1)) * W;
    const draw = () => {
      const d = pts.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
      lineP.setAttribute("d", d); area.setAttribute("d", `${d} L${W} ${YB} L0 ${YB} Z`);
      dot.setAttribute("cx", W); dot.setAttribute("cy", y(pts[pts.length - 1]));
    };
    const cross = el("line", { y1: 8, y2: YB, stroke: "#FFFFFF40", x1: -9, x2: -9 }), hd = el("circle", { r: 5, fill: "#6F86E0", stroke: "#262626", "stroke-width": 2, cx: -9, cy: 0 });
    const tr = el("rect", { y: -26, height: 40, rx: 8, fill: "#303030", width: 150, x: -999 }), t1 = el("text", { "font-family": "Inter", "font-size": 11, fill: "#9B9B9B", y: -9 }), t2 = el("text", { "font-family": "Inter", "font-size": 12, "font-weight": 600, fill: "#F2F2F2", y: 7 });
    [cross, hd, tr, t1, t2].forEach((n) => { n.style.pointerEvents = "none"; n.style.opacity = 0; n.style.transition = "opacity .12s"; svg.appendChild(n); });
    const show = (e) => {
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const px = pt.matrixTransform(svg.getScreenCTM().inverse()).x;
      const i = Math.max(0, Math.min(pts.length - 1, Math.round((px / W) * (pts.length - 1)))), v = pts[i], cx = x(i);
      cross.setAttribute("x1", cx); cross.setAttribute("x2", cx); hd.setAttribute("cx", cx); hd.setAttribute("cy", y(v));
      t1.textContent = label(i); const pv = mode === "month" ? (YB - (150 - (90 * cx) / W)) / K : null;
      t2.textContent = mode === "month" ? `${money(v)} · pace ${money(pv)}` : `${money(v)} spent`;
      const w = Math.max(130, Math.ceil(t2.getComputedTextLength?.() || 110) + 24), rx = cx > W - w - 20 ? cx - w - 12 : cx + 12, ty = Math.max(14, y(v) - 18);
      tr.setAttribute("x", rx); tr.setAttribute("width", w); tr.setAttribute("y", ty - 26); t1.setAttribute("x", rx + 12); t1.setAttribute("y", ty - 9); t2.setAttribute("x", rx + 12); t2.setAttribute("y", ty + 7);
      [cross, hd, tr, t1, t2].forEach((n) => (n.style.opacity = 1));
    };
    svg.addEventListener("pointermove", show); svg.addEventListener("pointerdown", show);
    svg.addEventListener("pointerleave", () => [cross, hd, tr, t1, t2].forEach((n) => (n.style.opacity = 0)));
    // Month / Quarter
    const bm = $("m-month"), bq = $("m-quarter"), inner = (b) => b.firstElementChild;
    const SEL = [bm.className, inner(bm).className], UN = [bq.className, inner(bq).className];
    const setMode = (m) => {
      mode = m;
      [[bm, "month"], [bq, "quarter"]].forEach(([b, k]) => { const c = k === m ? SEL : UN; b.className = c[0]; inner(b).className = c[1]; });
      if (m === "month") { pts = NOV; y = (v) => YB - v * K; label = (i) => "Nov " + Math.round(1 + (i * 12) / 13); pace.style.opacity = 1; labels.forEach((l, i) => (l.textContent = origLab[i])); leg.lastElementChild.style.opacity = 1; }
      else { pts = QD; const k = 150 / 70; y = (v) => YB - v * k; label = QL; pace.style.opacity = 0; leg.lastElementChild.style.opacity = 0; labels.forEach((l, i) => (l.textContent = QL(Math.round((i / 4) * (pts.length - 1))))); }
      draw();
    };
    [bm, bq].forEach((b, i) => { b.style.cursor = "pointer"; b.setAttribute("role", "button"); b.tabIndex = 0; b.addEventListener("click", () => setMode(i ? "quarter" : "month")); b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMode(i ? "quarter" : "month"); } }); });
    // Spend by agent: hover a row to read its share of spend
    const SP = [26.4, 12.1, 6.2, 3.5], TOT = 48.2, rows = [0, 1, 2, 3].map((i) => $("row" + i));
    rows.forEach((r, i) => {
      const track = $("share" + i); track.style.position = "relative";
      const tip = h("span", "adx-ktip"); tip.style.top = "-26px"; tip.style.right = "auto"; tip.style.left = "0"; tip.textContent = `${Math.round((SP[i] / TOT) * 100)}% of spend`; track.appendChild(tip);
      r.style.transition = "opacity .15s"; r.addEventListener("pointerenter", () => { rows.forEach((o, j) => (o.style.opacity = j === i ? 1 : 0.45)); tip.classList.add("is-on"); });
      r.addEventListener("pointerleave", () => { rows.forEach((o) => (o.style.opacity = 1)); tip.classList.remove("is-on"); });
    });
    // Budget bar: hover the bar or the warning marker
    const bar = $("bbar"), btip = h("span", "adx-ktip"); btip.style.top = "-34px"; btip.style.right = "auto"; bar.appendChild(btip);
    bar.style.cursor = "default";
    bar.addEventListener("pointermove", (e) => { const r = bar.getBoundingClientRect(), f = (e.clientX - r.left) / r.width; btip.textContent = Math.abs(f - 0.8) < 0.02 ? "Warning at 80% · $60" : f <= 0.64 ? "Spent $48.20 · 64% of $75" : "Left $26.80"; btip.style.left = Math.max(0, Math.min(f * 100, 80)) + "%"; btip.classList.add("is-on"); });
    bar.addEventListener("pointerleave", () => btip.classList.remove("is-on"));
    return null;
  }

  // ── Arcade feature explorer: an Apple-style pill toggle over live Paper screens ──
  // Screens are the Paper frames as code (assets/arcade-dash/f-*.html, built by tools/arcade-dash/). `set` on the host picks the list.
  const AF_SETS = {
    "first-call": [
      { label: "Role fork", src: "role-fork", w: 2880, h: 1800, alt: "Arcade onboarding: what do you want to do? Build an agent, connect an AI client, or operate Arcade for a team.", cap: "Role fork: build an agent, connect an AI client, or operate Arcade for a team. Each path gets a different first five minutes." },
      { label: "Quickstart", src: "quickstart", w: 2880, h: 2000, alt: "Quickstart: a code snippet and a live listener waiting for the first tool call.", cap: "Quickstart: a key, a snippet and a live listener for the first call, with a manual fallback and a nudge if nothing arrives." },
      { label: "First call detected", src: "first-call", w: 2880, h: 2000, alt: "Quickstart after the first call was received, with next steps: connect a real tool, add to Cursor or Claude, set a first policy.", cap: "First call received: the console confirms it, unlocks Governance, and offers three next steps." },
      { label: "Empty dashboard", src: "dashboard-empty", w: 2880, h: 2000, alt: "An empty dashboard with one call to action: create your first agent flow.", cap: "Empty dashboard: one next step instead of a grid of empty charts." },
    ],
    connect: [
      { label: "Tool catalog", src: "tool-catalog", w: 2880, h: 2000, alt: "Tool catalog: toolkits with filters for all and connected, and categories on the left.", cap: "Tool catalog: browse toolkits, filter to what is connected, and see which ones need authorization." },
      { label: "Playground", src: "playground-auth", w: 2880, h: 2000, alt: "Playground with an inline Authorize GitHub card inside the conversation.", cap: "Playground: authorization happens inline, in the conversation, the first time a tool needs it." },
      { label: "Accounts", src: "accounts", w: 2880, h: 2000, alt: "Authentication: connected accounts with status, and a detail panel with scopes, activity and a re-authorization link.", cap: "Authentication: every connected account with its status and the fix beside it. Tokens are never shown." },
      { label: "Gateway", src: "gateway-builder", w: 2880, h: 2076, alt: "Gateway builder: choose tools, name the gateway and copy a one-click config for the client.", cap: "Gateway builder: choose tools, name it, then copy a one-click config for the client." },
    ],
    debug: [
      { label: "Policy blocked", src: "trace-policy", w: 2880, h: 2728, alt: "A trace where a policy held a Slack call, with a timeline, the rule that fired and actions to edit the rule or allow the channel.", cap: "Policy blocked: the trace shows which rule held the call and offers Edit rule or Allow the channel." },
      { label: "Auth expired", src: "trace-auth", w: 2880, h: 2568, alt: "A trace where a Salesforce authorization expired, with the account to fix and how many other runs it blocks.", cap: "Auth expired: the run stopped at the authorization check, and the page says which account to fix and what else it blocks." },
      { label: "All failure states", src: "trace-states", w: 2880, h: 2172, alt: "Trace failure states: each failure has a name, a cause and one next step.", cap: "Every failure has a name, a cause and one next step." },
    ],
    govern: [
      { label: "Simulator", src: "policy-simulator", w: 2880, h: 2000, alt: "Policies: a rule list on the left, a draft rule in the middle, and a simulator asking whether a call would be allowed.", cap: "Simulator: test a draft against the live rules, then publish." },
      { label: "Rule conflict", src: "policy-conflict", w: 2880, h: 2000, alt: "Policies with a rule conflict: two rules overlap, three ways to resolve it, and publishing is blocked.", cap: "Rule conflict: publishing is blocked until the overlap is resolved, with fixes offered." },
      { label: "Replay results", src: "policy-replay", w: 2880, h: 2000, alt: "Policy replay: what a draft would have changed across the last seven days of calls.", cap: "Replay results: see what the draft would have changed across the last seven days of calls." },
    ],
    agent: [
      { label: "Summoned", src: "agent-summoned", w: 2880, h: 2000, alt: "Arcade Agent summoned as a glow bar over a dimmed page.", cap: "Summoned: a glow bar over the dimmed page. Type or speak." },
      { label: "Docked panel", src: "agent-docked", w: 2880, h: 2728, alt: "The agent docked beside a trace, explaining why a call was blocked and proposing a change.", cap: "Docked panel: it reads the trace, explains the block and proposes a change that waits for approval." },
      { label: "Agent-first home", src: "agent-home", w: 2880, h: 2000, alt: "Agent-first home: a prompt, what needs you, and recent changes tagged Agent, You or API.", cap: "Agent-first home: ask or draft, then what needs you and recent changes tagged Agent, You or API." },
      { label: "Charts", src: "agent-charts", w: 2880, h: 1972, alt: "Agent answers with charts: ask for a number, get one chart that fits the question.", cap: "Answers with charts: ask for a number, get the one chart that fits the question." },
    ],
  };

  function arcadeFeatures(host) {
    const items = AF_SETS[host.dataset.set]; if (!items) return;
    const AW = 1440, root = h("div", "af");
    root.innerHTML = `<div class="af__stage"></div><div class="af__bar"><div class="af__pill" role="radiogroup" aria-label="Choose a screen"><i class="af__thumb" aria-hidden="true"></i></div></div><p class="af__cap" aria-live="polite"></p>`;
    host.appendChild(root);
    const stage = root.querySelector(".af__stage"), pill = root.querySelector(".af__pill"), thumb = root.querySelector(".af__thumb"), cap = root.querySelector(".af__cap");
    // Each screen is the Paper frame as code (assets/arcade-dash/f-<name>.html + .css), laid out at 1440px and scaled to the stage
    const scrs = items.map((it) => { const d = h("div", "af__scr"); d.setAttribute("role", "img"); d.setAttribute("aria-label", it.alt); d.innerHTML = '<div class="adx"></div>'; stage.appendChild(d); it.nat = it.h / 2; return d; });
    const btns = items.map((it, i) => {
      const b = h("button", "af__btn", it.label); b.type = "button"; b.setAttribute("role", "radio"); b.tabIndex = i ? -1 : 0;
      b.addEventListener("click", () => pick(i, true)); pill.appendChild(b); return b;
    });
    let cur = -1, capT = 0;
    const scale = () => stage.clientWidth / AW;
    const lay = (i) => { const adx = scrs[i].firstChild, stg = adx.firstChild; if (!stg) return; const sc = scale(); stg.style.transform = `scale(${sc})`; adx.style.height = items[i].nat * sc + "px"; };
    const load = (i) => {
      const it = items[i]; if (it.state) return; it.state = 1;
      adxLoad("f-" + it.src).then((html) => { scrs[i].firstChild.innerHTML = `<div class="adx__stage">${html}</div>`; it.nat = scrs[i].firstChild.firstChild.offsetHeight; lay(i); if (i === cur) size(); }).catch(() => { it.state = 0; });
    };
    const size = () => { stage.style.height = items[cur].nat * scale() + "px"; };
    const place = () => { const b = btns[cur]; thumb.style.width = b.offsetWidth + "px"; thumb.style.transform = `translateX(${b.offsetLeft}px)`; };
    function pick(i, user) {
      if (i === cur) return; const first = cur < 0; cur = i; load(i);
      scrs.forEach((d, k) => d.classList.toggle("is-on", k === i));
      btns.forEach((b, k) => { b.setAttribute("aria-checked", String(k === i)); b.tabIndex = k === i ? 0 : -1; });
      if (first) root.classList.add("is-still"); size(); place();
      if (first) requestAnimationFrame(() => root.classList.remove("is-still"));
      clearTimeout(capT); cap.classList.add("is-out");
      capT = setTimeout(() => { cap.textContent = items[i].cap; cap.classList.remove("is-out"); }, first ? 0 : 140);
      if (user) btns[i].focus({ preventScroll: true });
    }
    pill.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0; if (!d) return;
      e.preventDefault(); pick((cur + d + items.length) % items.length, true);
    });
    pick(0, false);
    const ro = new ResizeObserver(() => { items.forEach((_, i) => lay(i)); size(); place(); }); ro.observe(root);
    // Load the first screen when the explorer is near the viewport, then the rest when the browser is idle
    const io = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return; io.disconnect(); load(0);
      const rest = () => items.forEach((_, k) => load(k)); if (window.requestIdleCallback) requestIdleCallback(rest, { timeout: 1500 }); else setTimeout(rest, 600);
    }, { rootMargin: "600px 0px" });
    io.observe(host);
    return () => { ro.disconnect(); io.disconnect(); clearTimeout(capT); };
  }

  const DEMOS = { gapQuickFit, dsLive, arcadeDash, arcadeApprovals, arcadeUsage, arcadeFeatures };
  const mount = (el) => {
    if (el.dataset.on) return;
    el.dataset.on = "1";
    const fn = DEMOS[el.dataset.caseDemo];
    if (fn) fn(el);
  };
  const scan = () => document.querySelectorAll("[data-case-demo]").forEach(mount);
  scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
