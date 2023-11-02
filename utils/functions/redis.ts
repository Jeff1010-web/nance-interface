import Redis from "ioredis";

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT!),
  password: process.env.REDIS_PASSWORD!,
  tls: { rejectUnauthorized: false }
});
