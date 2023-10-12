// fetch user auth token from Discord API, set the user auth token in redis

// https://discordjs.guide/oauth2/#a-quick-example
// https://github.com/discordjs/guide/blob/main/code-samples/oauth/simple-oauth-webserver/index.js
import { redis } from "../../../libs/redis";
import { decode } from "next-auth/jwt";
import { DISCORD_OAUTH_URL, discordRedirectBaseUrl, discordScope, DISCORD_CLIENT_ID, DISCORD_PROXY_USER_URL, DISCORD_PROXY_AUTH_SUCCESS_URL } from "../../../libs/discordURL";
import { DiscordUserAuthResponse } from '../../../models/DiscordTypes';

const params = {
  client_id: DISCORD_CLIENT_ID as string,
  client_secret: process.env.DISCORD_CLIENT_SECRET!,
  grant_type: 'authorization_code',
  code: '',
  redirect_uri: '',
  scope: discordScope,
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.redirect("/create");
  const { code } = req.query;
  params.code = code;
  params.redirect_uri = `${discordRedirectBaseUrl}`;
  const body = new URLSearchParams(params);
  try {
    const response = await fetch(DISCORD_OAUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    try {
      const discordUser = await response.json() as DiscordUserAuthResponse;
      const session = await decode({
        token: req.cookies["__Secure-next-auth.session-token"] ?? req.cookies["next-auth.session-token"],
        secret: process.env.NEXTAUTH_SECRET!,
      });
      const key = session?.sub;
      if (!key) return res.status(401).send('Unauthorized');
      // const encryptedDiscordUser = await redis.get(key);
      // TODO implement refresh token, set expiry to discordUser.expires_in for now
      await redis.set(key, JSON.stringify(discordUser), 'EX', discordUser.expires_in);
      res.redirect(`${DISCORD_PROXY_AUTH_SUCCESS_URL}?status=success`);
    } catch (error) {
      console.error('Discord authentication error:', error);
    }
  } catch (error: any) {
    console.error('Discord authentication error:', error);
  }
}
