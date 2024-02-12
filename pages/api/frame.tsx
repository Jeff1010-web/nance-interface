/* eslint-disable react/no-unknown-property */
import { FrameSignaturePacket } from "@/models/FarcasterTypes";
import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};
 
export default async function handler(request: NextRequest) {
  try {
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const domain = request.headers.get("host") || "http://localhost:3001";
    const origin = `${protocol}://${domain}`;

    const body = await request.json() as FrameSignaturePacket;
    const { buttonIndex } = body.untrustedData;
    
    if (!buttonIndex) return new Response("No button index provided", { status: 400 });

    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get("proposalId");
    const space = searchParams.get("space") || "juicebox";
    const chunk = Number(searchParams.get("chunk")) + 1;
    
    if (!proposalId || !space) return new Response("No proposal id or space provided", { status: 400 });
    const frameMetadata = `
    <html lang="en">
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:button:1" content="read on Nance" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content=${origin}/s/${space}/${proposalId} />
        <meta property="fc:frame:button:2" content="say more" />
        <meta property="fc:frame:image" content=${origin}/api/imageProposal?space=${space}&proposalId=${proposalId}&chunk=${chunk} />
        <meta property="fc:frame:image:aspect_ratio" content="1:1" />
        <meta property="fc:frame:post_url" content=${origin}/api/frame?space=${space}&proposalId=${proposalId}&chunk=${chunk} />
      </head>
      </html>
    `;
    return new Response(frameMetadata, {
      headers: { "Content-Type": "text/html" },
      status: 200,
    });

  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}