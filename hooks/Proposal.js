import { useQuery } from 'graphql-hooks'
import { format } from 'date-fns';

const PROPOSALS_QUERY = `
query {
  proposals (
    first: 1000
    where: {
      space: "jbdao.eth"
    }
  ) {
    id
    start
    state
    title
    choices
    votes
    scores_total
  }
}
`

const VOTES_QUERY = `
query {
  votes (
    first: 100000
    where: {
      space: "jbdao.eth"
    }
  ) {
    vp
    proposal {
      id
    }
    choice
  }
}
`

// Proposal:
// 1. Group proposals by funding cycle
// 2. Calculate approve rate
function groupProposalsByDate(proposals) {
  return proposals?.reduce((acc, proposal) => {
    const date = new Date(proposal.start * 1000);
    date.setSeconds(0);
    date.setMinutes(0);
    date.setHours(0);
    const start = date.getTime() / 1000;
    if (!acc[start]) {
      acc[start] = [];
    }

    acc[start].push(proposal);
    return acc;
  }, {});
};

export function useProposalGroups() {
  const { loading, error, data: proposalData } = useQuery(PROPOSALS_QUERY);

  return { data: groupProposalsByDate(proposalData?.proposals), loading };
}

export function useProposalsExtended() {
  // Load all proposals
  const {
    loading: proposalLoading,
    error: proposalError,
    data: proposalData
  } = useQuery(PROPOSALS_QUERY);

  // Load all votes
  const {
    loading: voteLoading,
    error: voteError,
    data: voteData
  } = useQuery(VOTES_QUERY);

  const loading = proposalLoading || voteLoading;
  // { [proposalId]: { [choice]: score } }
  const votes = voteData?.votes.reduce((acc, vote) => {
    if(!acc[vote.proposal.id]) {
      acc[vote.proposal.id] = [0,0,0]
    }

    // 1-index, 1 means affirmative
    acc[vote.proposal.id][vote.choice-1] += vote.vp;
    return acc
  }, {});

  const proposalExtended = proposalData?.proposals.map((proposal) => {
    if(votes === undefined || votes[proposal.id] === undefined) {
      return { ...proposal }
    }

    return {
      voteByChoice: votes[proposal.id],
      approved: isApproved(
        proposal.start,
        votes[proposal.id][0] / (
          // For Against Abstain, Abstain didn't count
          votes[proposal.id][0] + votes[proposal.id][1]
        ),
        votes[proposal.id][0],
        proposal.votes
      ),
      ...proposal
    }
  });
  console.log(proposalExtended);

  return { data: proposalExtended, loading };
}

export function useApprovalGroups() {
  const { loading, data } = useProposalsExtended();

  if (loading) {
    return { loading, data };
  }

  const groups = data?.reduce((acc, proposal) => {
    const date = new Date(proposal.start * 1000);
    date.setSeconds(0);
    date.setMinutes(0);
    date.setHours(0);
    const start = date.getTime() / 1000;
    if (!acc[start]) {
      acc[start] = {
        total: 0,
        approved: 0
      };
    }

    acc[start]['total'] += 1;
    if (proposal.approved) {
      console.log('Approved');
      acc[start]['approved'] +=1
    }
    return acc;
  }, {});
  console.log(groups);

  if (!groups) {
    return { loading, data };
  }
  // [{'time': .., 'approvedRate': ..}]
  const chartData = Object.keys(groups).map((time) => {
    return {
      'key': format(new Date(time * 1000), 'LLL, yy'),
      'approval_rate': 100.0 * groups[time].approved / groups[time].total,
      'total_proposals': groups[time].total
    }
  })
  console.log(chartData);

  return { data: chartData, loading };
}

// Base: >50% approval rate
// Amendment 1: >= 66% approval rate from >=8 votes (Dec 1, 2021, 12:59 PM)
// Amendment 2: >= 66% approval rate from >=15 votes (Dec 26, 2021, 06:00 AM
// Amendment 5: >= 66% approval rate from >=80M affirmative scores (Jun 25, 2022, 8:00 AM)
function isApproved(time, approvalRate, approvalScores, votes) {
  if(time > 1656115200) {
    // Amendment 5
    return approvalRate>=0.66 && approvalScores>=80_000_000;
  } else if (time > 1640469600) {
    // Amendment 2
    return approvalRate>=0.66 && votes>=15;
  } else if (time > 1638334740) {
    // Amendment 1
    return approvalRate>=0.66 && votes>=8;
  } else {
    return approvalRate>0.5;
  }
}
