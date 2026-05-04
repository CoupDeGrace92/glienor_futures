import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { eq } from "drizzle-orm";

export async function CreateUser(user: NewUser) {
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning({
            id: users.id, 
            username: users.username, 
            createdAt: users.createdAt, 
            updatedAt: users.updatedAt});
    return result;
};

export async function ResetUsers() {
    await db.delete(users);
};

export async function GetPassHash(username: string) {
    const [result] = await db 
        .select({password: users.password})
        .from(users) 
        .where(eq(users.username, username))
    return result?.password;
};

export async function UpdateUser(email: string, pHash: string, username: string) {
    const [result] = await db
        .update(users)
        .set({email, password: pHash})
        .where(eq(users.username, username))
        .returning({
            id: users.id, 
            username: users.username, 
            createdAt: users.createdAt, 
            updatedAt: users.updatedAt});
    return result;
}