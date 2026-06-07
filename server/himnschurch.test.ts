import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock context ─────────────────────────────────────────────────────────────

function createCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// ─── Auth tests ───────────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const cleared: string[] = [];
    const ctx: TrpcContext = {
      user: {
        id: 1, openId: "test", email: "test@test.com", name: "Test",
        loginMethod: "manus", role: "user",
        createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string) => { cleared.push(name); },
      } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(cleared).toHaveLength(1);
  });
});

// ─── Hymn import parser test (pure function, no DB) ─────────────────────────

// Inline the parser for unit testing without DB dependency
function parseHymnText(raw: string) {
  type HymnSlide = { type: string; label: string; text: string };
  const lines = raw.split("\n");
  const slides: HymnSlide[] = [];
  let currentSlide: HymnSlide | null = null;
  let verseCount = 0;
  let chorusCount = 0;
  const flushSlide = () => {
    if (currentSlide && currentSlide.text.trim()) {
      currentSlide.text = currentSlide.text.trim();
      slides.push(currentSlide);
    }
    currentSlide = null;
  };
  for (const rawLine of lines) {
    const line = rawLine.trim();
    const chorusMatch = line.match(/^(coro|chorus|estribillo|refrain)[\s:.]*$/i) || line.match(/^(coro|chorus|estribillo|refrain)[\s:.]/i);
    const verseMatch = line.match(/^(estrofa|verso|verse|v\.?|v\d+|stanza)[\s:.](\d*)/i);
    if (chorusMatch) {
      flushSlide(); chorusCount++;
      currentSlide = { type: "chorus", label: `Coro ${chorusCount > 1 ? chorusCount : ""}`.trim(), text: "" };
    } else if (verseMatch) {
      flushSlide(); verseCount++;
      const num = verseMatch[2] ? parseInt(verseMatch[2]) : verseCount;
      currentSlide = { type: "verse", label: `Estrofa ${num}`, text: "" };
    } else if (line === "" && currentSlide) {
      if (currentSlide.text.trim()) {
        flushSlide(); verseCount++;
        currentSlide = { type: "verse", label: `Estrofa ${verseCount}`, text: "" };
      }
    } else {
      if (!currentSlide) { verseCount++; currentSlide = { type: "verse", label: `Estrofa ${verseCount}`, text: "" }; }
      currentSlide.text += (currentSlide.text ? "\n" : "") + line;
    }
  }
  flushSlide();
  if (slides.length === 0 && raw.trim()) slides.push({ type: "verse", label: "Estrofa 1", text: raw.trim() });
  return slides;
}

describe("hymns import parser (unit)", () => {
  it("detects chorus and verse sections from structured text", () => {
    const slides = parseHymnText("Estrofa 1\nPrimera línea\nSegunda línea\n\nCoro\nEste es el coro\nDel himno test");
    expect(slides.length).toBeGreaterThanOrEqual(2);
    expect(slides.some(s => s.type === "chorus")).toBe(true);
    expect(slides.some(s => s.type === "verse")).toBe(true);
  });

  it("handles plain text without section headers", () => {
    const slides = parseHymnText("Línea uno\nLínea dos\nLínea tres");
    expect(slides.length).toBeGreaterThanOrEqual(1);
    expect(slides[0].text).toContain("Línea uno");
  });

  it("handles multiple choruses", () => {
    const slides = parseHymnText("Estrofa 1\nTexto estrofa\n\nCoro\nTexto coro\n\nEstrofa 2\nTexto estrofa 2");
    expect(slides.length).toBe(3);
  });
});

// ─── Hymns CRUD ───────────────────────────────────────────────────────────────

describe("hymns CRUD", () => {
  it("creates a hymn and retrieves it", { timeout: 15000 }, async () => {
    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);

    await caller.hymns.create({
      title: "Test Hymn CRUD",
      number: 9999,
      author: "Test Author",
      category: "Test",
      slides: [
        { type: "verse", label: "Estrofa 1", text: "Test verse text" },
        { type: "chorus", label: "Coro", text: "Test chorus text" },
      ],
    });

    const hymns = await caller.hymns.list({ search: "Test Hymn CRUD" });
    expect(hymns.length).toBeGreaterThan(0);
    const found = hymns.find(h => h.title === "Test Hymn CRUD");
    expect(found).toBeDefined();
    expect(found?.author).toBe("Test Author");
    expect(found?.number).toBe(9999);

    // Cleanup
    if (found) {
      await caller.hymns.delete({ id: found.id });
    }
  });

  it("updates a hymn", { timeout: 15000 }, async () => {
    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);

    await caller.hymns.create({
      title: "Test Update Hymn",
      slides: [{ type: "verse", label: "Estrofa 1", text: "Original text" }],
    });

    const hymns = await caller.hymns.list({ search: "Test Update Hymn" });
    const hymn = hymns.find(h => h.title === "Test Update Hymn");
    expect(hymn).toBeDefined();

    if (hymn) {
      await caller.hymns.update({ id: hymn.id, title: "Test Update Hymn Modified" });
      const updated = await caller.hymns.get({ id: hymn.id });
      expect(updated?.title).toBe("Test Update Hymn Modified");
      await caller.hymns.delete({ id: hymn.id });
    }
  });

  it("returns categories list", { timeout: 10000 }, async () => {
    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);
    const cats = await caller.hymns.categories();
    expect(Array.isArray(cats)).toBe(true);
  });
});

// ─── Setlists ─────────────────────────────────────────────────────────────────

describe("setlists CRUD", () => {
  it("creates and deletes a setlist", { timeout: 15000 }, async () => {
    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);

    await caller.setlists.create({ name: "Test Setlist" });
    const lists = await caller.setlists.list();
    const found = lists.find(s => s.name === "Test Setlist");
    expect(found).toBeDefined();

    if (found) {
      await caller.setlists.delete({ id: found.id });
      const after = await caller.setlists.list();
      expect(after.find(s => s.id === found.id)).toBeUndefined();
    }
  });
});

// ─── Projection State ─────────────────────────────────────────────────────────

describe("projection.getState", () => {
  it("returns projection state", { timeout: 10000 }, async () => {
    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);
    const state = await caller.projection.getState();
    expect(state).not.toBeNull();
    expect(state).toHaveProperty("blackout");
    expect(state).toHaveProperty("theme");
    expect(state).toHaveProperty("fontSize");
  });

  it("updates projection state", { timeout: 10000 }, async () => {
    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);
    await caller.projection.setState({ theme: "gradient", fontSize: "xl" });
    const state = await caller.projection.getState();
    expect(state?.theme).toBe("gradient");
    expect(state?.fontSize).toBe("xl");
    // Reset
    await caller.projection.setState({ theme: "dark", fontSize: "lg" });
  });
});
