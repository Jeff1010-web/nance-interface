import CONFIG from "@/constants/Config";
import { NextApiRequest, NextApiResponse } from "next";
import { goerli } from "wagmi/chains";

const KEY = CONFIG.juicebox.subgraphKey;
const MAINNET_SUBGRAPH_API_URL = `https://subgraph.satsuma-prod.com/${KEY}/juicebox/mainnet/api`;
const GOERLI_SUBGRAPH_API_URL = `https://subgraph.satsuma-prod.com/${KEY}/juicebox/goerli/api`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { method, body, query } = req;
    const network = query.network as string;
    const subgraphUrl =
      network === goerli.name
        ? GOERLI_SUBGRAPH_API_URL
        : MAINNET_SUBGRAPH_API_URL;

    // Forward the request to the destination URL
    console.debug("Forwarding request to", subgraphUrl, method, body);
    const response = await fetch(subgraphUrl, {
      method,
      body,
    });

    if (response.status === 200) {
      const responseData = await response.json();
      res.status(200).json(responseData);
    } else {
      res.status(response.status).json({ error: response.statusText });
    }
  } catch (error) {
    // Handle any errors that occur during the forwarding process
    console.error("Error forwarding request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
