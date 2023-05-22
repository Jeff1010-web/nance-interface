import { NextApiRequest, NextApiResponse } from 'next'
import { fetchDelegators } from '../../hooks/snapshot/Delegations'
import { AllVotes, fetchAllVotesOfAddress } from '../../hooks/snapshot/Proposals'
import { fetchVotingPower } from '../../hooks/snapshot/VotingPower'
import { fetchCreatedProposals } from '../../hooks/NanceHooks'
import { Proposal } from '../../models/NanceTypes'

export type ProfileResponse = {
  vp: number
  delegators: string[]
  proposals: Pick<Proposal, "title" | "hash" | "proposalId">[],
  votes: AllVotes
}

// FIXME retrieve from API instead of fix values here
const NANCE_MAPPING = {
  "jbdao.eth": "juicebox",
  "gov.thirstythirsty.eth": "thirstythirsty",
  "jigglyjams.eth": "waterbox"
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const voter = req.query.voter as string
  const space = req.query.space as string
  const proposal = req.query.proposal as string
  console.debug('api.profile', { query: req.query })

  const nanceSpace = NANCE_MAPPING[space]

  try {
    const vp = await fetchVotingPower(voter, space, proposal)
    const votes = await fetchAllVotesOfAddress(voter, 1000, space)
    const delegators = await fetchDelegators(voter, space)
    const proposals = await fetchCreatedProposals(nanceSpace, voter)

    const response: ProfileResponse = {
      vp: vp?.vp ?? 0,
      delegators: delegators?.map(o => o.delegator) ?? [],
      proposals: proposals?.data?.map(p => {return { title: p.title, hash: p.hash, proposalId: p.proposalId }}) ?? [],
      votes
    }

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=172800'
    )
    res.status(200).json(response)
  } catch (err) {
    res.status(500).json({ err: JSON.stringify(err) })
  }
}
