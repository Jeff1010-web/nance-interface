import CONFIG from "@/constants/Config";
import Redis from "ioredis";

export const redis = new Redis({
  host: CONFIG.redis.host,
  port: Number(CONFIG.redis.port),
  password: CONFIG.redis.password,
  tls: { rejectUnauthorized: false },
});
