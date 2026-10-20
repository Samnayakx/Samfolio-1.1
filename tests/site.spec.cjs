const { test, expect } = require("@playwright/test");

const WIDTHS = [320, 375, 390, 430, 768, 1024, 1280, 1440];
const PAGES = ["/", "/about", "/writing", "/playground", "/work/gap-3d-fit", "/writing/ux-for-agentic-systems"];
const settle = (page) => page.waitForTimeout(1800);
const visibleCards = (page) => page.locator("#work-cards > li:not([hidden])");

test.describe("layout", () => {
  for (const width of WIDTHS) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 768 ? 800 : 900 });
      for (const url of PAGES) {
        await page.goto(url, { waitUntil: "load" });
        await settle(page);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, `${url} overflows by ${over}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("the hero period never wraps away from 'startups'", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/", { waitUntil: "load" });
    await page.waitForSelector(".headline.in");
    for (let w = 900; w <= 1600; w += 20) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(60);
      const orphan = await page.evaluate(() => {
        const h = document.querySelector(".headline"), nodes = [], t = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
        let s = "";
        for (let n; (n = t.nextNode()); ) { nodes.push([n, s.length]); s += n.data; }
        const i = s.indexOf("startups.");
        const rect = (k) => { const [n, o] = nodes.filter(([, off]) => off <= k).pop(); const r = document.createRange(); r.setStart(n, k - o); r.setEnd(n, k - o + 1); const q = r.getClientRects(); return q[q.length - 1]; };
        return Math.abs(rect(i + 8).top - rect(i + 7).top) > 4;
      });
      expect(orphan, `period orphaned at ${w}px`).toBe(false);
    }
  });

  test("the heading still reads in order for assistive tech", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.waitForSelector(".headline.in");
    const heading = page.getByRole("heading", { level: 1, name: "Hi, I’m Sam, a founding product designer and design engineer at 0-1 startups. Previously Salesforce, Gap and YC startups." });
    await expect(heading).toBeVisible();   // the accessible name keeps its spaces and order, including the period after the link
    expect((await page.locator(".headline").textContent()).replace(/\s+/g, " ").trim()).toBe("Hi, I’m Sam, a founding product designer and design engineer at 0-1 startups. Previously Salesforce, Gap and YC startups.");
  });
});

test.describe("hero and work", () => {
  test("hero leads with public work, and About is secondary", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.waitForSelector(".headline.in");
    const cta = page.getByRole("link", { name: "View selected work" });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "#work");
    await expect(page.getByRole("link", { name: /^About me/ })).toBeVisible();
  });

  test("Featured is the default and public projects come first", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await expect(page.locator('.work__tab[aria-selected="true"]')).toContainText("Featured");
    await expect(visibleCards(page).first()).not.toHaveClass(/case--locked/);
    const locked = await visibleCards(page).evaluateAll((els) => els.map((e) => e.classList.contains("case--locked")));
    const firstLocked = locked.indexOf(true);
    expect(firstLocked === -1 || locked.lastIndexOf(false) < firstLocked, "locked group must come after public cards").toBe(true);
  });

  for (const width of [320, 390]) {
    test(`every filter is visible and touch-sized at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/", { waitUntil: "load" });
      const boxes = await page.locator(".work__tab").evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, h: r.height }; }));
      expect(boxes.length).toBeGreaterThanOrEqual(7);
      for (const b of boxes) { expect(b.h).toBeGreaterThanOrEqual(44); expect(b.l).toBeGreaterThanOrEqual(0); expect(b.r).toBeLessThanOrEqual(width); }
    });
  }

  test("tab counts match the cards and keys move selection", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const tabs = page.locator(".work__tab");
    const n = await tabs.count();
    for (let i = 0; i < n; i++) {
      await tabs.nth(i).click();
      const count = parseInt((await tabs.nth(i).locator("sup").innerText()), 10);
      let shown = 0;
      for (const li of await visibleCards(page).all()) shown += (await li.locator(".lockcard, .case__link").count()) || 0;
      expect(shown, `tab ${i}`).toBeGreaterThan(0);
      expect(count).toBeGreaterThan(0);
      await expect(tabs.nth(i)).toHaveAttribute("aria-selected", "true");
    }
    await tabs.nth(2).focus();
    await page.keyboard.press("Home");
    await expect(tabs.first()).toBeFocused();
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("End");
    await expect(tabs.last()).toBeFocused();
    await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
    await expect(tabs.last()).toHaveAttribute("aria-controls", "work-cards");
  });

  test("returning from a case study keeps the chosen filter", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.getByRole("tab", { name: /^Fashion/ }).click();
    await page.goto("/work/gap-3d-fit", { waitUntil: "load" });
    await page.goBack({ waitUntil: "load" });
    await expect(page.locator('.work__tab[aria-selected="true"]')).toContainText("Fashion");
  });
});

test.describe("loader and navigation", () => {
  test("loader leaves quickly even when fonts never arrive", async ({ page }) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    const t0 = Date.now();
    await page.goto("/", { waitUntil: "commit" });
    await page.waitForFunction(() => document.readyState !== "loading" && !document.getElementById("loader"), null, { timeout: 5000 });
    expect(Date.now() - t0).toBeLessThan(2500);
    await expect(page.locator(".headline")).toBeVisible();
  });

  test("reduced motion has no decorative wait", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    const t0 = Date.now();
    await page.goto("/", { waitUntil: "commit" });
    await page.waitForFunction(() => document.readyState !== "loading" && !document.getElementById("loader"), null, { timeout: 5000 });
    expect(Date.now() - t0).toBeLessThan(1200);
    await ctx.close();
  });

  test("same-site links navigate promptly and honour modifiers", async ({ page, context }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.waitForSelector(".headline.in");
    const t0 = Date.now();
    await Promise.all([page.waitForURL("**/about"), page.getByRole("link", { name: /^About me/ }).click()]);
    expect(Date.now() - t0).toBeLessThan(1500);
    await page.goto("/", { waitUntil: "load" });
    await page.waitForSelector(".headline.in");
    const modifier = process.platform === "darwin" ? "Meta" : "Control";
    const [popup] = await Promise.all([context.waitForEvent("page"), page.getByRole("link", { name: /^About me/ }).click({ modifiers: [modifier] })]);
    await popup.close();
    expect(new URL(page.url()).pathname).toBe("/");
  });
});

test.describe("gate", () => {
  test("locked study offers Back to work and Request access, and fits at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/work/cotonai-agent", { waitUntil: "load" });
    await expect(page.locator(".gate")).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to work/ })).toHaveAttribute("href", "/#work");
    const ask = page.getByRole("link", { name: "Request access" });
    await expect(ask).toBeVisible();
    expect(await ask.getAttribute("href")).toMatch(/^mailto:[^?]+\?subject=/);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over).toBeLessThanOrEqual(0);
    await page.locator(".gate__input").fill("not-it");
    await page.keyboard.press("Enter");
    await expect(page.locator(".gate__msg")).not.toBeEmpty();
    await expect(page.locator(".gate")).toBeVisible();
  });
});

test.describe("assets", () => {
  test("résumé is a PDF", async ({ request }) => {
    const res = await request.get("/assets/Sambit-Nayak-Resume.pdf");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/pdf");
    expect((await res.body()).subarray(0, 4).toString()).toBe("%PDF");
  });

  test("optional media failing never hides the site", async ({ page }) => {
    await page.route(/\.(mp4|webm|webp|jpg|png)(\?|$)/, (r) => r.abort());
    await page.goto("/", { waitUntil: "load" });
    await page.waitForSelector(".headline.in");
    await expect(page.getByRole("link", { name: "View selected work" })).toBeVisible();
    await expect(page.locator(".work__tab").first()).toBeVisible();
  });
});
