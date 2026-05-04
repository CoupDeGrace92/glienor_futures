import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import { UnauthorizedError } from "./api/errors.js";
export function HashPassword(password) {
    return hash(password);
}
;
export function CheckPassHash(password, hash) {
    return verify(hash, password);
}
;
export function MakeJWT(userID, expiresIn, secret) {
    const pl = {
        iss: "gnome_child",
        sub: userID,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn,
    };
    return jwt.sign(pl, secret);
}
;
export function ValidateJWT(tokenString, secret) {
    let pl;
    try {
        pl = jwt.verify(tokenString, secret);
    }
    catch (err) {
        throw new UnauthorizedError("invalid token");
    }
    ;
    if (typeof pl === "string" || !pl.sub) {
        throw new UnauthorizedError("Incorrect signature for JWT");
    }
    ;
    return pl.sub;
}
;
export function GetAuthToken(req) {
    let authToken = req.get("Authorization");
    if (typeof authToken === "undefined") {
        throw new UnauthorizedError("Missing auth header");
    }
    ;
    const out = authToken.split(" ");
    return out[1];
}
export function MakeRefreshToken() {
    return randomBytes(256).toString("hex");
}
;
