import { NextApiRequest, NextApiResponse } from "next";
import { getCsrfToken, getSession } from "next-auth/react";
import { redis } from "@/utils/functions/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const csrf = await getCsrfToken({ req });
  const session = await getSession({ req });
  if (!csrf || !session) return res.status(401).send('Unauthorized no csrf or session');
  const address = session?.user?.name || "";
  await redis.set(csrf, address, "EX", 30);
  res.status(200).json({ csrf, address: session?.user?.name });
}
