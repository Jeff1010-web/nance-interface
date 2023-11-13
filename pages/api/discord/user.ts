// use the user auth token that was previously fetched from Discord API and stored in redis

import { NextApiRequest, NextApiResponse } from "next";
import { decode } from "next-auth/jwt";
import { redis } from "../../../utils/functions/redis";
import { DiscordUserAuthResponse } from "../../../models/DiscordTypes";
import CONFIG from "@/constants/Config";

const DISCORD_API = "https://discord.com/api/v10";

const getTokenByAddress = async (address: string) => {
  const encryptedDiscordTokenUserStore = await redis.get(address);
  if (!encryptedDiscordTokenUserStore) return null;
  const discordTokenUserStore = (await decode({
    token: encryptedDiscordTokenUserStore,
    secret: CONFIG.nextAuth.secret,
  })) as unknown as DiscordUserAuthResponse;
  return discordTokenUserStore.access_token ?? null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { address, command } = req.query as Record<string, string>;
    if (!address) return res.status(400).send("Missing address");
    if (!command) return res.status(400).send("Missing command");

    // fetch address from session, confirm its same as what was sent in request
    const session = await decode({
      token:
        req.cookies["__Secure-next-auth.session-token"] ??
        req.cookies["next-auth.session-token"],
      secret: CONFIG.nextAuth.secret,
    });
    const key = session?.sub;
    if (!key || key === null || key !== address)
      return res.status(401).send("Unauthorized, address not found");
    const token = await getTokenByAddress(key);
    if (!token) return res.status(401).send("Unauthorized, token not found");
    const url = `${DISCORD_API}/${command}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const user = await response.json();
    res.status(200).json(user);
  } catch (error: any) {
    console.error("Discord authentication error:", error);
    res.status(500).send(error);
  }
}
