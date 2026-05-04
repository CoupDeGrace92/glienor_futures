import {hash, verify} from "argon2";
import jwt from "jsonwebtoken";
import type {JwtPayload} from "jsonwebtoken";
import {Request} from "express";
import {randomBytes} from "node:crypto";
import {UnauthorizedError} from "./api/errors.js"
import { date } from "drizzle-orm/mysql-core";

export function HashPassword(password: string): Promise<string> {
    return hash(password);
};

export function CheckPassHash(password: string, hash: string): Promise<boolean> {
    return verify(hash, password);
};

export function MakeJWT(userID: string, expiresIn: number, secret: string): string {
    type payload = Pick<JwtPayload, "iss"|"sub"|"iat"|"exp">;
    const pl: payload = {
        iss: "gnome_child",
        sub: userID,
        iat: Math.floor(Date.now()/1000),
        exp: Math.floor(Date.now()/1000) + expiresIn,
    };
    return jwt.sign(pl, secret);
};

export function ValidateJWT(tokenString: string, secret: string): string {
    let pl;
    try {
        pl = jwt.verify(tokenString, secret);
    } catch(err) {
        throw new UnauthorizedError("invalid token");
    };
    if (typeof pl === "string" || !pl.sub) {
        throw new UnauthorizedError("Incorrect signature for JWT");
    };

    return pl.sub;
};

export function GetAuthToken(req: Request): string {
    let authToken = req.get("Authorization");
    if (typeof authToken === "undefined") {
        throw new UnauthorizedError("Missing auth header");
    };
    const out = authToken.split(" ");
    return out[1];
}

export function MakeRefreshToken(): string {
    return randomBytes(256).toString("hex");
};