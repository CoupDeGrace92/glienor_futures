import express from "express";
import { Request, Response, NextFunction } from "express";
import { config } from "./config.js"
import {
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ErrorHandler
} from "./api/errors.js"

import {
    CreateUser,
    ResetUsers
} from "./db/queries/users.js"
import { ExpoSQLitePreparedQuery } from "drizzle-orm/expo-sqlite";

const app = express();
const PORT = 8080;

app.use(express.json());

app.get("/api/health", HandlerReadiness);
app.post("/admin/reset", HandlerReset);

app.use(ErrorHandler);

const server = app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

//Collision check:
server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use.  Is another server running?`);
        process.exit(1);
    } else {
        console.error("Server error:", err);
        process.exit(1);
    };
});

//Handlers
function HandlerReadiness(req: Request, resp: Response) {
    resp.set("Content-Type", "text/plain; charset=utf8");
    resp.send("OK")
}

async function HandlerReset(req: Request, resp: Response) {
    resp.set("Content-Type", "text/plain; charset=utf8");
    if (config.api.platform !== "dev") {
        throw new ForbiddenError("Reset forbidden");
    };
    await ResetUsers();
    resp.send(`User DB reset`);
}

//MIDDLEWARE
function middlewareLogesponse(req: Request, resp: Response, next: NextFunction) {
    resp.on("finish", () => {
        if (resp.statusCode !== 200) {
            console.log(`[NON-OK] ${req.method} ${req.path} - Status: ${resp.statusCode}`);
        }
    });
};