import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  try {
    await res.revalidate(`/${path}`);
    return res.json({ revalidated: true });
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).send('Error revalidating');
  }
}