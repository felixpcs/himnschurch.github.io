import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getHymns, getHymnById, createHymn, updateHymn, deleteHymn, getHymnCategories,
  getSetlists, getSetlistById, createSetlist, updateSetlist, deleteSetlist,
  getSetlistItems, addHymnToSetlist, removeHymnFromSetlist, reorderSetlistItem,
  getProjectionState, updateProjectionState,
} from "./db";
import type { HymnSlide } from "../drizzle/schema";

// ─── Slide type ───────────────────────────────────────────────────────────────

const slideSchema = z.object({
  type: z.enum(["verse", "chorus", "bridge", "intro", "outro"]),
  label: z.string(),
  text: z.string(),
});

// ─── Hymn import parser ───────────────────────────────────────────────────────

function parseHymnText(raw: string): HymnSlide[] {
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

    // Detect section headers
    const chorusMatch = line.match(/^(coro|chorus|estribillo|refrain)[\s:.]*/i);
    const verseMatch = line.match(/^(estrofa|verso|verse|v\.?|v\d+|stanza)[\s:.]*(\d*)/i);
    const bridgeMatch = line.match(/^(puente|bridge|pre-coro|pre-chorus)[\s:.]*/i);
    const introMatch = line.match(/^(intro|introducción|introduction)[\s:.]*/i);
    const outroMatch = line.match(/^(outro|final|coda)[\s:.]*/i);

    if (chorusMatch) {
      flushSlide();
      chorusCount++;
      currentSlide = { type: "chorus", label: `Coro ${chorusCount > 1 ? chorusCount : ""}`.trim(), text: "" };
    } else if (verseMatch) {
      flushSlide();
      verseCount++;
      const num = verseMatch[2] ? parseInt(verseMatch[2]) : verseCount;
      currentSlide = { type: "verse", label: `Estrofa ${num}`, text: "" };
    } else if (bridgeMatch) {
      flushSlide();
      currentSlide = { type: "bridge", label: "Puente", text: "" };
    } else if (introMatch) {
      flushSlide();
      currentSlide = { type: "intro", label: "Intro", text: "" };
    } else if (outroMatch) {
      flushSlide();
      currentSlide = { type: "outro", label: "Final", text: "" };
    } else if (line === "" && currentSlide) {
      // blank line may separate slides in simple format
      if (currentSlide.text.trim()) {
        flushSlide();
        // continue with next verse auto-detected
        verseCount++;
        currentSlide = { type: "verse", label: `Estrofa ${verseCount}`, text: "" };
      }
    } else {
      if (!currentSlide) {
        verseCount++;
        currentSlide = { type: "verse", label: `Estrofa ${verseCount}`, text: "" };
      }
      currentSlide.text += (currentSlide.text ? "\n" : "") + line;
    }
  }
  flushSlide();

  // If nothing was parsed, put everything as a single slide
  if (slides.length === 0 && raw.trim()) {
    slides.push({ type: "verse", label: "Estrofa 1", text: raw.trim() });
  }

  return slides;
}

// ─── Routers ──────────────────────────────────────────────────────────────────

const hymnsRouter = router({
  list: publicProcedure
    .input(z.object({ search: z.string().optional(), category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return getHymns(input?.search, input?.category);
    }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getHymnById(input.id);
    }),

  categories: publicProcedure.query(async () => {
    return getHymnCategories();
  }),

  create: publicProcedure
    .input(z.object({
      number: z.number().optional(),
      title: z.string().min(1),
      author: z.string().optional(),
      category: z.string().optional(),
      slides: z.array(slideSchema),
    }))
    .mutation(async ({ input }) => {
      await createHymn({
        number: input.number,
        title: input.title,
        author: input.author,
        category: input.category,
        slides: input.slides,
      });
      return { success: true };
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      number: z.number().optional(),
      title: z.string().min(1).optional(),
      author: z.string().optional(),
      category: z.string().optional(),
      slides: z.array(slideSchema).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateHymn(id, data);
      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteHymn(input.id);
      return { success: true };
    }),

  import: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      number: z.number().optional(),
      author: z.string().optional(),
      category: z.string().optional(),
      rawText: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const slides = parseHymnText(input.rawText);
      await createHymn({
        title: input.title,
        number: input.number,
        author: input.author,
        category: input.category,
        slides,
      });
      return { success: true, slidesDetected: slides.length };
    }),
});

const setlistsRouter = router({
  list: publicProcedure.query(async () => getSetlists()),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const sl = await getSetlistById(input.id);
      if (!sl) return null;
      const items = await getSetlistItems(input.id);
      return { ...sl, items };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      await createSetlist({ name: input.name });
      return { success: true };
    }),

  update: publicProcedure
    .input(z.object({ id: z.number(), name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      await updateSetlist(input.id, { name: input.name });
      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteSetlist(input.id);
      return { success: true };
    }),

  addHymn: publicProcedure
    .input(z.object({ setlistId: z.number(), hymnId: z.number() }))
    .mutation(async ({ input }) => {
      await addHymnToSetlist(input.setlistId, input.hymnId);
      return { success: true };
    }),

  removeHymn: publicProcedure
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ input }) => {
      await removeHymnFromSetlist(input.itemId);
      return { success: true };
    }),

  reorder: publicProcedure
    .input(z.object({ itemId: z.number(), newPosition: z.number() }))
    .mutation(async ({ input }) => {
      await reorderSetlistItem(input.itemId, input.newPosition);
      return { success: true };
    }),
});

const projectionRouter = router({
  getState: publicProcedure.query(async () => {
    return getProjectionState();
  }),

  setState: publicProcedure
    .input(z.object({
      activeHymnId: z.number().nullable().optional(),
      currentSlide: z.number().optional(),
      blackout: z.boolean().optional(),
      showWelcome: z.boolean().optional(),
      welcomeText: z.string().optional(),
      theme: z.enum(["dark", "gradient", "minimal"]).optional(),
      fontSize: z.enum(["sm", "md", "lg", "xl"]).optional(),
      activeSetlistId: z.number().nullable().optional(),
      activeSetlistPosition: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      await updateProjectionState(input);
      return { success: true };
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  hymns: hymnsRouter,
  setlists: setlistsRouter,
  projection: projectionRouter,
});

export type AppRouter = typeof appRouter;
