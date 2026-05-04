import { RelationTableAliasProxyHandler } from "drizzle-orm";
import { pgTable, timestamp, varchar, uuid, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("created_at").notNull().defaultNow().$onUpdate(() => new Date()),
    username: text().unique().notNull(),
    email: varchar("email", {length: 256}).unique().notNull(),
    password: text().notNull().default("NOSET")
});

export type NewUser = typeof users.$inferInsert;