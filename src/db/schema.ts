import { pgTable, timestamp, varchar, uuid, text, boolean, integer, serial } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("created_at").notNull().defaultNow().$onUpdate(() => new Date()),
    username: text().unique().notNull(),
    email: varchar("email", {length: 256}).unique(),
    password: text().notNull().default("NOSET")
});

export type NewUser = typeof users.$inferInsert;

export const refresh = pgTable("refresh", {
    token: text("token").primaryKey(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    username: text("username").notNull().references(() => users.username, {onDelete: "cascade"}),
    expiresAt: timestamp("expires_at").notNull(),
    revoked: boolean("revoked").notNull().default(false)
});

export type NewRefresh = typeof refresh.$inferInsert;

export const dailyPriceLogs = pgTable("daily_price_logs", {
    uid: uuid("uid").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    lastUpdate: timestamp("last_update").notNull(),
    id: integer("id").notNull(),
    volume: integer("volume").notNull(),
});

export type NewDailyPriceLogs = typeof dailyPriceLogs.$inferInsert;

export const priceHist = pgTable("price_history", {
    uid: uuid("uid").primaryKey().defaultRandom(),
    name: text("name").notNull().references(() => users.username),
    lastUpdate: timestamp("last_update").notNull(),
    id: integer("id").notNull(),
    volume: integer("volume").notNull(),
});

export type NewPriceHist = typeof priceHist.$inferInsert;

export const meta = pgTable("metadata", {
    version: serial("version").primaryKey(),
    lastLogUpdate: timestamp("last_log_update"),
    lastHistUpdate: timestamp("last_hist_update"),
    lastSyncStatus: varchar("last_sync_status"),
    lastSyncError: text("last_sync_error"),
    itemsProcessed: integer("items_processed"),
    lastSyncDuration: integer("last_sync_duration_ms"),
});

export type NewMeta = typeof meta.$inferInsert;