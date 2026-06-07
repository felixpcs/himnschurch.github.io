import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Hymns ────────────────────────────────────────────────────────────────────

export const hymns = mysqlTable("hymns", {
  id: int("id").autoincrement().primaryKey(),
  number: int("number"),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }),
  category: varchar("category", { length: 100 }),
  /** JSON array of slides: { type: 'verse'|'chorus'|'bridge'|'intro', label: string, text: string } */
  slides: json("slides").notNull().$type<HymnSlide[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HymnSlide = {
  type: "verse" | "chorus" | "bridge" | "intro" | "outro";
  label: string;
  text: string;
};

export type Hymn = typeof hymns.$inferSelect;
export type InsertHymn = typeof hymns.$inferInsert;

// ─── Setlists ─────────────────────────────────────────────────────────────────

export const setlists = mysqlTable("setlists", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setlist = typeof setlists.$inferSelect;
export type InsertSetlist = typeof setlists.$inferInsert;

export const setlistItems = mysqlTable("setlist_items", {
  id: int("id").autoincrement().primaryKey(),
  setlistId: int("setlistId").notNull(),
  hymnId: int("hymnId").notNull(),
  position: int("position").notNull().default(0),
});

export type SetlistItem = typeof setlistItems.$inferSelect;
export type InsertSetlistItem = typeof setlistItems.$inferInsert;

// ─── Projection State ─────────────────────────────────────────────────────────

export const projectionState = mysqlTable("projection_state", {
  id: int("id").autoincrement().primaryKey(),
  activeHymnId: int("activeHymnId"),
  currentSlide: int("currentSlide").notNull().default(0),
  blackout: boolean("blackout").notNull().default(false),
  showWelcome: boolean("showWelcome").notNull().default(true),
  welcomeText: text("welcomeText").default("Bienvenidos al culto"),
  theme: mysqlEnum("theme", ["dark", "gradient", "minimal"]).notNull().default("dark"),
  fontSize: mysqlEnum("fontSize", ["sm", "md", "lg", "xl"]).notNull().default("lg"),
  activeSetlistId: int("activeSetlistId"),
  activeSetlistPosition: int("activeSetlistPosition").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectionState = typeof projectionState.$inferSelect;
