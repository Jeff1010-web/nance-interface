function getNanceAPIUrl() {
    // Override the API URL with the environment variable if it exists
    // Create .env.local file in the root directory of the project if you need to override
    if(process.env.NEXT_PUBLIC_NANCE_API_URL) return process.env.NEXT_PUBLIC_NANCE_API_URL;
    return "https://api.nance.app";
}

export const NANCE_API_URL = getNanceAPIUrl();

export enum NANCE_SPACES {
    DEV = "dev",
    JUICEBOX = "juicebox",
}