import { db } from "../index.js";
import { dailyPriceLogs } from "../schema.js";
/*
export const dailyPriceLogs = pgTable("daily_price_logs", {
    uid: uuid("uid").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    lastUpdate: timestamp("last_update").notNull(),
    id: integer("id").notNull(),
    volume: integer("volume").notNull(),
});
*/
export async function InsertDailyData(d) {
    await db.insert(dailyPriceLogs).values(d);
}
;
