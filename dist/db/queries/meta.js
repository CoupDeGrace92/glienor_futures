import { db } from "../index.js";
import { meta } from "../schema.js";
export async function GetLastUpdateTimestamp() {
    const [result] = await db
        .select({ timestamp: meta.lastLogUpdate })
        .from(meta);
    return result;
}
;
