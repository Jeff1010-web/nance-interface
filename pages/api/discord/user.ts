import { NextApiRequest, NextApiResponse } from "next";
import { redis } from "../../../libs/redis";

const DISCORD_API = "https://discord.com/api/v10";

const getTokenByAddress = async (address: string) => {
  const redisValue = await redis.get(address);
  if (!redisValue) return null;
  const token = JSON.parse(redisValue!).access_token;
  return token;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address, command } = req.query as Record<string, string>;
  if (!address) return res.status(400).send("Missing address");
  if (!command) return res.status(400).send("Missing command");
  const token = await getTokenByAddress(address);
  if (!token) return res.status(400).send("Missing token");
  const url = `${DISCORD_API}/${command}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const user = await response.json();
  res.status(200).json(user);
}
