// proposalId is a string with the proposalIdPrefix prepended
// often times we need the number itself to do comparisons

export const getProposalNumber = (proposalId: string) => {
  const proposalIdNumberRe = /\d+/g;
  const proposalNumber = Number(proposalId.match(proposalIdNumberRe)?.[0]) || 0;
  return proposalNumber;
};
