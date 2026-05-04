export class BadRequestError extends Error {
    constructor(message) {
        super(message);
    }
    ;
}
;
export class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
    }
    ;
}
;
export class ForbiddenError extends Error {
    constructor(message) {
        super(message);
    }
    ;
}
;
export class NotFoundError extends Error {
    constructor(message) {
        super(message);
    }
    ;
}
;
export function ErrorHandler(err, req, resp, next) {
    console.error(err);
    if (err instanceof BadRequestError) {
        resp.status(400).json({ error: `Bad Request` });
    }
    else if (err instanceof UnauthorizedError) {
        resp.status(401).json({ error: `Unauthorized` });
    }
    else if (err instanceof ForbiddenError) {
        resp.status(403).json({ error: `Forbidden` });
    }
    else if (err instanceof NotFoundError) {
        resp.status(404).json({ error: 'Not Found' });
    }
    else {
        resp.status(500).json({ error: 'Something went wrong' });
    }
    ;
}
;
