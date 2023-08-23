import { NextApiRequest, NextApiResponse } from "next";

const KEY = process.env.JUICEBOX_SUBGRAPH_KEY;
const SUBGRAPH_API_URL = `https://subgraph.satsuma-prod.com/${KEY}/juicebox/mainnet/api`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method, body } = req;

    // Forward the request to the destination URL
    console.debug("/api/juicebox forwarding", method, body);
    const response = await fetch(SUBGRAPH_API_URL, {
      method,
      body
    });
    
    if (response.status === 200) {
      const responseData = await response.json();
      res.status(200).json(responseData);
    } else {
      res.status(response.status).json({ error: response.statusText })
    }    
  } catch (error) {
    // Handle any errors that occur during the forwarding process
    console.error('Error forwarding request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};