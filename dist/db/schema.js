import { pgTable, timestamp, varchar, uuid, text, boolean } from "drizzle-orm/pg-core";
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("created_at").notNull().defaultNow().$onUpdate(() => new Date()),
    username: text().unique().notNull(),
    email: varchar("email", { length: 256 }).unique(),
    password: text().notNull().default("NOSET")
});
export const refresh = pgTable("refresh", {
    token: text("token").primaryKey(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    username: text("username").notNull().references(() => users.username, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    revoked: boolean("revoked").notNull().default(false)
});
