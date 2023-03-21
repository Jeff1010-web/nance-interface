import { NextApiRequest, NextApiResponse } from 'next'
import { fetchDelegators } from '../../hooks/snapshot/Delegations'
import { fetchAllVotesOfAddress } from '../../hooks/snapshot/Proposals'
import { fetchVotingPower } from '../../hooks/snapshot/VotingPower'

export interface ProfileResponse {
  vp: number
  votes: number
  delegators: string[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const voter = req.query.voter as string
  const space = req.query.space as string
  const proposal = req.query.proposal as string
  console.debug('api.profile', { query: req.query })

  try {
    const vp = await fetchVotingPower(voter, space, proposal)
    const votes = await fetchAllVotesOfAddress(voter, 1000, space)
    const delegators = await fetchDelegators(voter, space)

    const response: ProfileResponse = {
      vp: vp?.vp ?? 0,
      votes: votes?.length ?? 0,
      delegators: delegators?.map(o => o.delegator) ?? []
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
