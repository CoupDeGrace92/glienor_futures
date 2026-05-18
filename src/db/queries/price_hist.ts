import { db } from "../index.js";
import { NewPriceHist, priceHist } from "../schema.js";
import { eq } from "drizzle-orm";

export async function InsertHistData(d: NewPriceHist[]) {
    await db.insert(priceHist).values(d)
};