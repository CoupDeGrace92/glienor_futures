import { db } from "../index.js";
import { NewRefresh, refresh } from "../schema.js";
import { eq } from "drizzle-orm";

export async function CreateRefresh(token: NewRefresh) {
    const [result] = await db
        .insert(refresh)
        .values(token)
        .returning();
    return result;
};

export async function GetUserFromRefreshToken(token: string) {
    const [result] = await db
        .select()
        .from(refresh)
        .where(eq(refresh.token, token));
    return result;
}