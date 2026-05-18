import { db } from "../index.js";
import { NewMeta, meta } from "../schema.js"

export async function GetLastUpdateTimestamp() {
    const [result] = await db 
        .select({timestamp: meta.lastLogUpdate})
        .from(meta);
    return result;
};

export async function GetGranularUpdate() {
    const [result] = await db
        .select({timestamp: meta.lastHistUpdate})
        .from(meta);
    return result;
};

export async function GetHistoricUpdate() {
    const [result] = await db
        .select({timestamp: meta.lastGranularUpdate})
        .from(meta);
    return result;
};