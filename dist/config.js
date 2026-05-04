process.loadEnvFile();
const dbUrl = envOrThrow("DB_URL");
const platform = envOrThrow("PLATFORM");
const jwtSecret = envOrThrow("JWT_SECRET");
const migrationConfig = {
    migrationsFolder: "./src/db/migrations"
};
export const config = {
    api: {
        platform: platform,
        jwtSecret: jwtSecret,
    },
    db: {
        url: dbUrl,
        migrationConfig: migrationConfig,
    },
};
function envOrThrow(key) {
    if (typeof process.env[key] !== "string") {
        throw new Error(`Expected env variable not present: ${key}`);
    }
    return process.env[key];
}
