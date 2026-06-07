import { eq, like, or, asc, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, hymns, InsertHymn, setlists, InsertSetlist, setlistItems, projectionState } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Hymns ────────────────────────────────────────────────────────────────────

export async function getHymns(search?: string, category?: string) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(hymns).$dynamic();
  if (search) {
    query = query.where(or(
      like(hymns.title, `%${search}%`),
      like(hymns.author, `%${search}%`)
    ));
  }
  if (category) {
    query = query.where(eq(hymns.category, category));
  }
  return query.orderBy(asc(hymns.number), asc(hymns.title));
}

export async function getHymnById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(hymns).where(eq(hymns.id, id)).limit(1);
  return result[0];
}

export async function createHymn(data: InsertHymn) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(hymns).values(data);
  return result;
}

export async function updateHymn(id: number, data: Partial<InsertHymn>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(hymns).set(data).where(eq(hymns.id, id));
}

export async function deleteHymn(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(hymns).where(eq(hymns.id, id));
}

export async function getHymnCategories() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.selectDistinct({ category: hymns.category }).from(hymns).orderBy(asc(hymns.category));
  return result.map(r => r.category).filter(Boolean) as string[];
}

// ─── Setlists ─────────────────────────────────────────────────────────────────

export async function getSetlists() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(setlists).orderBy(desc(setlists.updatedAt));
}

export async function getSetlistById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(setlists).where(eq(setlists.id, id)).limit(1);
  return result[0];
}

export async function createSetlist(data: InsertSetlist) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(setlists).values(data);
}

export async function updateSetlist(id: number, data: Partial<InsertSetlist>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(setlists).set(data).where(eq(setlists.id, id));
}

export async function deleteSetlist(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(setlistItems).where(eq(setlistItems.setlistId, id));
  await db.delete(setlists).where(eq(setlists.id, id));
}

export async function getSetlistItems(setlistId: number) {
  const db = await getDb();
  if (!db) return [];
  const items = await db
    .select({
      id: setlistItems.id,
      setlistId: setlistItems.setlistId,
      hymnId: setlistItems.hymnId,
      position: setlistItems.position,
      hymnTitle: hymns.title,
      hymnNumber: hymns.number,
      hymnAuthor: hymns.author,
      hymnCategory: hymns.category,
      hymnSlides: hymns.slides,
    })
    .from(setlistItems)
    .innerJoin(hymns, eq(setlistItems.hymnId, hymns.id))
    .where(eq(setlistItems.setlistId, setlistId))
    .orderBy(asc(setlistItems.position));
  return items;
}

export async function addHymnToSetlist(setlistId: number, hymnId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db.select().from(setlistItems).where(eq(setlistItems.setlistId, setlistId)).orderBy(desc(setlistItems.position)).limit(1);
  const nextPos = existing.length > 0 ? (existing[0].position + 1) : 0;
  await db.insert(setlistItems).values({ setlistId, hymnId, position: nextPos });
}

export async function removeHymnFromSetlist(itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(setlistItems).where(eq(setlistItems.id, itemId));
}

export async function reorderSetlistItem(itemId: number, newPosition: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(setlistItems).set({ position: newPosition }).where(eq(setlistItems.id, itemId));
}

// ─── Projection State ─────────────────────────────────────────────────────────

export async function getProjectionState() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(projectionState).where(eq(projectionState.id, 1)).limit(1);
  return result[0] ?? null;
}

export async function updateProjectionState(data: Partial<typeof projectionState.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(projectionState).set(data).where(eq(projectionState.id, 1));
}
