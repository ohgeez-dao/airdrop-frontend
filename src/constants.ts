import dotenv from "dotenv";
dotenv.config();

export const DISCORD_AUTH_URL =
    process.env.NODE_ENV == "development"
        ? "https://discord.com/api/oauth2/authorize?client_id=903931715511283722&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fsharkpunks&response_type=code&scope=identify"
        : "https://discord.com/api/oauth2/authorize?client_id=903931715511283722&redirect_uri=https%3A%2F%2Fairdrops.levxdao.org%2Fsharkpunks&response_type=code&scope=identify";
export const DISCORD_REDIRECT_URL =
    process.env.NODE_ENV == "development"
        ? "http://localhost:3000/sharkpunks"
        : "https://airdrops.levxdao.org/sharkpunks";
