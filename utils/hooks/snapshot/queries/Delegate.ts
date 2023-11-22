export const DELEGATES_QUERY = `query delegators($space: String, $address: Bytes) {
  delegations(where: {
    space: $space
    delegate: $address
  }) {
    delegator
  }
}
`;
