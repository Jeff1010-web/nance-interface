import { NextApiRequest, NextApiResponse } from "next";

const API = 'https://nance-ts-production-2d49.up.railway.app';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const status = await fetch(`${API}/auto/events`, {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${process.env.NANCE_AUTO_KEY}`,
    }}).then((response) => {
    return (response.status);
  });
  return res.status(status).json({ success: true });
}