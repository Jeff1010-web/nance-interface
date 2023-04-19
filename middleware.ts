import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { fetchProposal } from './hooks/NanceHooks';
import { NANCE_DEFAULT_SPACE } from './constants/Nance';

export async function middleware(req: NextRequest) {
    const { pathname, searchParams } = req.nextUrl;
    // get last part of pathname, example: /p/abc => abc
    const proposalParam: string = pathname.split('/').pop() || '';
    const spaceParam: string = searchParams.get("overrideSpace") || NANCE_DEFAULT_SPACE;

    if(proposalParam.startsWith('0x') || proposalParam.length == 32) {
        // it's proposal hash of snapshot or nance, if we can find a proposal number, redirect to that url
        const proposalResponse = await fetchProposal(spaceParam, proposalParam);
        const proposal = proposalResponse.data;
        if(proposal && proposal.proposalId) {
            return NextResponse.redirect(new URL(`/p/${proposal.proposalId}`, req.url))
        }
    }
}

export const config = {
    matcher: '/p/:path',
}