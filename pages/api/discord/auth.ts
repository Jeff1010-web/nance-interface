// fetch user auth token from Discord API, set the user auth token in redis

// https://discordjs.guide/oauth2/#a-quick-example
// https://github.com/discordjs/guide/blob/main/code-samples/oauth/simple-oauth-webserver/index.js
import { redis } from "@/utils/functions/redis";
import { encode } from "next-auth/jwt";
import { discordRedirectBaseUrl, discordScope, DISCORD_CLIENT_ID, DISCORD_PROXY_AUTH_SUCCESS_URL } from "@/utils/functions/discordURL";
import { DISCORD_OAUTH_URL } from "@/constants/Discord";
import { DiscordUserAuthResponse } from '@/models/DiscordTypes';

const params = {
  client_id: DISCORD_CLIENT_ID as string,
  client_secret: process.env.DISCORD_CLIENT_SECRET!,
  grant_type: 'authorization_code',
  code: '',
  state: '',
  redirect_uri: '',
  scope: discordScope,
};

export default async function handler(req: any, res: any) {
  const { code, state } = req.query;
  params.code = code;
  params.state = state;
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
      const addressFromCsrf = await redis.get(state);
      if (!addressFromCsrf) return res.status(401).send('Unauthorized');
      // TODO implement refresh token, set expiry to discordUser.expires_in for now and ditch the refresh token
      const encryptDiscordUserAuthResponse = await encode({
        token: { ...discordUser, refresh_token: undefined },
        secret: process.env.NEXTAUTH_SECRET!,
      });
      await redis.set(addressFromCsrf, encryptDiscordUserAuthResponse, "EX", discordUser.expires_in);
      res.redirect(`${DISCORD_PROXY_AUTH_SUCCESS_URL}?status=success`);
    } catch (error) {
      console.error('Discord authentication error:', error);
    }
  } catch (error: any) {
    console.error('Discord authentication error:', error);
  }
}
