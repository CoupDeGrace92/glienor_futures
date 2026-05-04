import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();
const dbUrl = envOrThrow("DB_URL");
const platform = envOrThrow("PLATFORM");
const jwtSecret = envOrThrow("JWT_SECRET");

const migrationConfig: MigrationConfig={
    migrationsFolder: "./src/db/migrations"
};

type APIConfig = {
    platform: string,
    jwtSecret: string,
};

type DBConfig = {
    url: string,
    migrationConfig: MigrationConfig,
};

type Config = {
    api: APIConfig,
    db: DBConfig,
};

export const config: Config = {
    api: {
        platform: platform,
        jwtSecret: jwtSecret,
    },
    db: {
        url: dbUrl,
        migrationConfig: migrationConfig,
    },
};

function envOrThrow(key: string): string {
    if (typeof process.env[key] !== "string") {
        throw new Error(`Expected env variable not present: ${key}`);
    }
    return process.env[key];
}