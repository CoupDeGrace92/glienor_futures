import { db } from "../index.js";
import { NewDailyPriceLogs, dailyPriceLogs } from "../schema.js";
import { eq } from "drizzle-orm";

/*
export const dailyPriceLogs = pgTable("daily_price_logs", {
    uid: uuid("uid").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    lastUpdate: timestamp("last_update").notNull(),
    id: integer("id").notNull(),
    volume: integer("volume").notNull(),
});
*/

export async function InsertDailyData(d: NewDailyPriceLogs[]) {
    await db.insert(dailyPriceLogs).values(d)
};