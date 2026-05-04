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
}