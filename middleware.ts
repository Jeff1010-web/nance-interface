import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { fetchProposal } from './hooks/NanceHooks';
import { NANCE_DEFAULT_SPACE } from './constants/Nance';

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const space: string = NANCE_DEFAULT_SPACE;

    if (pathname.startsWith('/p')) {
        // get last part of pathname, example: /p/abc => abc
        const proposalParam: string = pathname.split('/').pop() || '';

        if(proposalParam.startsWith('0x') || proposalParam.length == 32) {
            // it's proposal hash of snapshot or nance, if we can find a proposal number, redirect to that url
            const proposalResponse = await fetchProposal(space, proposalParam);
            const proposal = proposalResponse.data;
            if(proposal && proposal.proposalId) {
                return NextResponse.redirect(new URL(`/p/${proposal.proposalId}`, req.url))
            } else {
                return NextResponse.rewrite(new URL(`/s/${space}/${proposalParam}`, req.url))
            }
        } else {
            return NextResponse.rewrite(new URL(`/s/${space}/${proposalParam}`, req.url))
        }
    } else if (pathname.startsWith('/edit')) {
        return NextResponse.rewrite(new URL(`/s/${space}/edit${req.nextUrl.search}`, req.url))
    }
}

export const config = {
    matcher: ['/p/:path', '/edit'],
}