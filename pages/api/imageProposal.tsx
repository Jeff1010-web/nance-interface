/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unknown-property */
import { numToPrettyString } from "@/utils/functions/NumberFormatter";
import { getParagraphOfMarkdown } from "@/utils/functions/markdown";
import { getProposal } from "@/utils/functions/nance";
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};
 
export default async function handler(request: NextRequest) {
  try {
    const boldFont = await fetch(
      new URL('/public/fonts/IBMPlexMono-Bold.ttf', import.meta.url),
    ).then((res) => res.arrayBuffer());
    const regularFont = await fetch(
      new URL('/public/fonts/IBMPlexMono-Regular.ttf', import.meta.url),
    ).then((res) => res.arrayBuffer());

    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get("proposalId");
    const space = searchParams.get("space") || "juicebox";
    const chunk = Number(searchParams.get("chunk"));
    if (!proposalId) return new Response("No proposal id provided", { status: 400 });
    const proposal = await getProposal(space, proposalId);
    const title = proposal.title;
    const spaceH1 = "NANCE";
    const totalScore = proposal.voteResults?.scores.reduce((a, b) => a + b, 0);
    const paragraph = getParagraphOfMarkdown(proposal.body || "", chunk || 0);
    return new ImageResponse(
      (
        <div tw="flex flex-col w-full h-full bg-gray-700 text-white">
          {/* Top Section */}
          <div tw="flex flex-col items-start pl-8 pt-4 bg-white text-black">
            <div tw="flex flex-row">
              <img
                tw="mt-2 h-16 w-16 rounded-md"
                src={`https://nance.app/_next/image?url=https%3A%2F%2Fcdn.stamp.fyi%2Fspace%2F${spaceH1}%3Fs%3D160&w=64&q=75`}
                alt={`${spaceH1} Logo`}
                height={64}
                width={64}
              />
              <h1 tw="ml-4 text-2xl font-bold">{spaceH1}</h1>
            </div>
            <h2 tw="text-3xl pb-2 mr-4 font-bold">{title}</h2>
          </div>

          {/* Bottom Section */}
          <div tw="flex flex-col text-left mt-4 ml-12">
            {chunk ? <h2 tw="mr-5">{paragraph}</h2> :
              <div tw="flex flex-col">
                <h2>TOTAL VOTES = {proposal.voteResults?.votes.toLocaleString()}</h2>
                {proposal.voteResults?.scores.slice(0, 3).map((score, i) => (
                  <span tw="flex flex-row text-2xl" key={i}>
                    {proposal.voteResults?.choices[i]} - {numToPrettyString(score)}
                    {totalScore && ` (${((score / totalScore) * 100).toFixed(2)}%)`}
                  </span>
                ))}
              </div>
            }
          </div>
        </div>
      ),
      {
        width: 600,
        height: 600,
        fonts: [
          {
            name: "Mono",
            data: boldFont,
            style: "normal",
            weight: 700,
          },
          {
            name: "Mono",
            data: regularFont,
            style: "normal",
            weight: 400,
          },
        ],
      },
    );

  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}