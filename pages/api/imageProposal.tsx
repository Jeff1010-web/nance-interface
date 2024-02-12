/* eslint-disable react/no-unknown-property */
import { getParagraphOfMarkdown } from "@/utils/functions/markdown";
import { getProposal } from "@/utils/functions/nance";
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};
 
export default async function handler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get("proposalId");
    const space = searchParams.get("space") || "juicebox";
    const chunk = Number(searchParams.get("chunk"));
    if (!proposalId) return new Response("No proposal id provided", { status: 400 });
    const proposal = await getProposal(space, proposalId);
    const title = proposal.title;

    const paragraph = getParagraphOfMarkdown(proposal.body || "", chunk || 0);
    return new ImageResponse(
      (
        <div tw="flex flex-col w-full h-full items-center justify-center bg-gray-700 text-white">
          <h1 tw="text-2xl pl-5 pr-5 underline">{title}</h1>
          <div tw="flex pl-7 pr-7 text-center">
            <p tw="text-2xl">{paragraph}</p>
          </div>
          <div tw="flex absolute bottom-0 left-0 p-5 bg-gray-900 text-white rounded-3xl">
            <p tw="text-xl">Powered by Nance</p>
          </div>
        </div>
      ),
      {
        width: 600,
        height: 600,
      },
    );

  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}