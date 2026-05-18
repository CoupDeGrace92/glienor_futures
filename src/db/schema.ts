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

export const items = pgTable("items", {
    id: integer("id").primaryKey(),
    name: text("name").notNull(),
});

export type NewItems = typeof items.$inferInsert;

export const granularPriceLogs = pgTable("granular_price_logs", {
    uid: uuid("uid").primaryKey().defaultRandom(),
    id: integer("id").notNull().references(() => items.id, {onDelete: "cascade"}),
    lastUpdate: timestamp("last_update").notNull(),
    avgHighPrice: integer("avg_high_price"),
    highPriceVolume: integer("high_price_volume").notNull().default(0),
    avgLowPrice: integer("avg_low_price"),
    lowPriceVolume: integer("low_price_volume").notNull().default(0)
});

export type NewGranularPriceLogs = typeof granularPriceLogs.$inferInsert;

export const priceHist = pgTable("price_history", {
    uid: uuid("uid").primaryKey().defaultRandom(),
    lastUpdate: timestamp("last_update").notNull(),
    id: integer("id").notNull().references(() => items.id, {onDelete: "cascade"}),
    volume: integer("volume").notNull(),
    price: integer("price").notNull(),
});

export type NewPriceHist = typeof priceHist.$inferInsert;

export const meta = pgTable("metadata", {
    version: serial("version").primaryKey(),
    lastLogUpdate: timestamp("last_log_update"),
    lastHistUpdate: timestamp("last_hist_update"),
    lastGranularUpdate: timestamp("last_granular_update"),
    lastSyncStatus: varchar("last_sync_status"),
    lastSyncError: text("last_sync_error").default("none"),
    itemsProcessed: integer("items_processed"),
    lastSyncDuration: integer("last_sync_duration_ms"),
});

export type NewMeta = typeof meta.$inferInsert;