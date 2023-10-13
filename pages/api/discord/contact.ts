import { NextApiRequest, NextApiResponse } from "next";

const WEBHOOK = process.env.DISCORD_CONTACT_WEBHOOK || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  if (method === 'POST') {
    const response = await fetch(WEBHOOK, {
      method,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    res.status(200).json({ message: 'Message sent.' });
  } else {
    res.status(400).json({ error: 'Bad request.' });
  }
}
