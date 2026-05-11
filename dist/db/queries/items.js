import { db } from "../index.js";
import { items } from "../schema.js";
import { eq, sql } from "drizzle-orm";
export async function getIDFromName(name) {
    const [result] = await db
        .select({ id: items.id })
        .from(items)
        .where(eq(items.name, name));
    return result?.id;
}
export async function BootstrapItemName(i) {
    await db.insert(items).values(i).onConflictDoUpdate({
        target: items.id,
        set: { name: sql `excluded.name` }
    });
}
