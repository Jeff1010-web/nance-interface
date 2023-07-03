import { NextApiRequest, NextApiResponse } from "next";
import { NANCE_API_URL } from "../../../constants/Nance";
import { getToken } from "next-auth/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Extract the request method, URL, and body from the incoming request
    const { method, body } = req;
    const destinationUrl = NANCE_API_URL + "/"; // Replace with the base destination URL

    // Extract the dynamic route path from the request
    let { path } = req.query;
    if (!path) {
      path = "";
    }
    if (!Array.isArray(path)) {
      path = [path];
    }
    const destinationPath = path.join('/');

    // extract params
    const params = new URLSearchParams(req.query as any)
    params.delete("path");

    // Attach the JWT token to the request headers
    const token = await getToken({ req, raw: true }); // Fixme this should be empty if wallet was disconnected
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };

    // Forward the request to the destination URL
    const url = `${destinationUrl}${destinationPath}?${params}`;
    console.debug("/api/nance forwarding", url, method, headers, body);
    const response = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' && method !== 'HEAD' ? JSON.stringify(body) : undefined,
    });

    // Parse the response data as JSON
    const responseData = await response.json();

    // Return the response from the destination URL
    res.status(response.status).json(responseData);
  } catch (error) {
    // Handle any errors that occur during the forwarding process
    console.error('Error forwarding request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};