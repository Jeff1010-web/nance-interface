// proposalId is a string with the proposalIdPrefix prepended
// often times we need the number itself to do comparisons

export const getProposalNumber = (proposalId: string) => {
  const proposalIdNumberRe = /\d+/g;
  console.log("proposalud", proposalId);
  const proposalNumber = Number(proposalId.match(proposalIdNumberRe)?.[1]) || 0;
  return proposalNumber;
};
