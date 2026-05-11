import express, { application } from "express";
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
    ResetUsers,
    GetPassHash,
    UpdateUser,
} from "./db/queries/users.js"

import {
    CreateRefresh,
    GetUserFromRefreshToken,
} from "./db/queries/refresh.js"

import { 
    HashPassword, 
    CheckPassHash, 
    MakeJWT,
    MakeRefreshToken,
    GetAuthToken,
    ValidateJWT,
} from "./auth.js";
import { db } from "./db/index.js";
import { ResetDailyDB } from "./db/queries/daily_price_logs.js";


const app = express();
const PORT = 8080;

app.use(middlewareLogesponse);
app.use(express.json());

app.get("/api/health", HandlerReadiness);
app.post("/admin/users/reset", HandlerResetUsers);
app.post("/admin/daily_logs/reset", HandlerResetDaily);
app.post("/api/users", HandlerCreateUser);
app.post("/api/login", HandlerLogin);
app.post("api/refresh", HandlerRefresh);
app.put("/api/users", HandlerUpdateUser);



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

async function HandlerResetUsers(req: Request, resp: Response) {
    resp.set("Content-Type", "text/plain; charset=utf8");
    if (config.api.platform !== "dev") {
        throw new ForbiddenError("Reset forbidden");
    };
    await ResetUsers();
    resp.status(200).send(`User DB reset`);
}

async function HandlerCreateUser(req: Request, resp: Response) {
    resp.set("Content-Type", "application/json");

    type Parameters = {
        email?: string,
        password: string,
        username: string
    }
    const params: Parameters = req.body;
    if (!params.password) {
        throw new BadRequestError("Need username, password");
    };
    const hash = await HashPassword(params.password);

    const user = await CreateUser({username: params.username, email: params.email, password: hash});
    resp.status(201).send(user)
};

async function HandlerLogin(req: Request, resp: Response) {
    resp.set("Content-Type", "application/json");

    type Parameters = {
        username: string,
        password: string,
        expiresInSeconds?: number,
    }

    const params: Parameters = req.body;
    const dbHash = await GetPassHash(params.username);
    if (!CheckPassHash(params.password, dbHash)) {
        throw new UnauthorizedError("Incorrect Password");
    };
    if (!params.expiresInSeconds) {
        params.expiresInSeconds = 3600;
    }
    const jwt = MakeJWT(params.username, params.expiresInSeconds, config.api.jwtSecret);

    type RespParameters = {
        jwt: string,
        refresh: string,
        jwtExpiresIn: number,
        refreshExpiresAt: Date,
    };

    const refresh = MakeRefreshToken()
    
    const ref = await CreateRefresh({
        username: params.username,
        token: refresh,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    });

    const response: RespParameters = {
        jwt: jwt,
        refresh: refresh,
        jwtExpiresIn: params.expiresInSeconds,
        refreshExpiresAt: ref.expiresAt,
    };

    resp.status(200).send(response);
};

async function HandlerResetDaily(req: Request, resp: Response) {
    resp.set("Content-Type", "text/plain; charset=utf-8");
    if (config.api.platform !== "dev") {
        throw new ForbiddenError("Can not perform reset action");
    }
    await ResetDailyDB;
    resp.status(200).send("Daily db reset")
}

async function HandlerRefresh(req: Request, resp: Response) {
    resp.set("Content-Type", "application/json");
    const refToken = GetAuthToken(req);
    const refTokenObj = await GetUserFromRefreshToken(refToken)
    if (!refTokenObj || refTokenObj.revoked || refTokenObj.expiresAt <= new Date()) {
        return resp.status(401).send();
    };
    const jwt = MakeJWT(refTokenObj.username, 3600, config.api.jwtSecret);
    resp.status(200).send({token: jwt});
};

async function HandlerUpdateUser(req: Request, resp: Response) {
    resp.set("Content-Type", "application/json");

    type Parameters = {
        email: string,
        password: string
    };

    const params: Parameters = req.body;

    const token = GetAuthToken(req);
    const username = await ValidateJWT(token, config.api.jwtSecret);
    const pHash = await HashPassword(params.password);
    const user = await UpdateUser(params.email, pHash, username);
    resp.status(200).send(user);
};

//MIDDLEWARE
function middlewareLogesponse(req: Request, resp: Response, next: NextFunction) {
    resp.on("finish", () => {
        if (resp.statusCode !== 200) {
            console.log(`[NON-OK] ${req.method} ${req.path} - Status: ${resp.statusCode}`);
        };
    });
    next();
};