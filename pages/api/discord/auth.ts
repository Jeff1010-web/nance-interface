// https://discordjs.guide/oauth2/#a-quick-example
// https://github.com/discordjs/guide/blob/main/code-samples/oauth/simple-oauth-webserver/index.js
import { redis } from "../../../libs/redis";
import { decode } from "next-auth/jwt";
import { DISCORD_OAUTH_URL, discordRedirectBaseUrl, discordScope, DISCORD_CLIENT_ID } from "../../../libs/discordURL";

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
  const { code, from } = req.query;
  params.code = code;
  params.redirect_uri = `${discordRedirectBaseUrl}?from=${from}`;
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
      const discordUser = await response.json();
      const session = await decode({
        token: req.cookies["__Secure-next-auth.session-token"] ?? req.cookies["next-auth.session-token"],
        secret: process.env.NEXTAUTH_SECRET!,
      });
      const key = session?.sub ?? req.cookies["next-auth.session-token"] ?? req.cookies["__Secure-next-auth.session-token"];
      await redis.set(key, JSON.stringify(discordUser));
    } catch (error) {
      console.error('Discord authentication error:', error);
      res.status(500).send('Internal Server Error');
    }
    res.redirect(`/${from}`);
    res.end();
  } catch (error: any) {
    console.error('Discord authentication error:', error);
    res.status(500).send('Internal Server Error');
  }
}