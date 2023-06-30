## Nance Interface

### Build

```
yarn install && yarn build && yarn export
```

### Environment Variable

You should set these env variables accordingly for the app to work.

```bash
cp exmaple.env .env.local
vim .env.local
```

#### Nance API

Specify url of [Nance](https://nance.app/) backend as `NEXT_PUBLIC_NANCE_API_URL`, and your space id as `NEXT_PUBLIC_OVERRIDE_SPACE`.

#### Ethereum

We need [Infura](https://www.infura.io/) RPC to interact with Ethereum. Please specify `NEXT_PUBLIC_INFURA_KEY`.

#### Juicebox Subgraph

To get infomation of Juicebox projects, we need to specify the subgraph url of Juicebox: `NEXT_PUBLIC_SUBGRAPH_ID`

#### Snapshot Subgraph

To find delegations, we need to specify the subgraph url of [Snapshot](https://thegraph.com/hosted-service/subgraph/snapshot-labs/snapshot): `NEXT_PUBLIC_SNAPSHOT_SUBGRAPH_ID`

#### NextAuth SIWE

To support session, you need to implement backend for NextAuth and set two env variables: [`NEXTAUTH_URL`](https://next-auth.js.org/configuration/options#nextauth_url) and [`NEXTAUTH_SECRET`](https://next-auth.js.org/configuration/options#nextauth_secret)

#### RichText Editor

We use [TinyMCE](https://www.tiny.cloud/) editor for editing RichText and Infura IPFS Gateway for uploading images.
Env: 
* `NEXT_PUBLIC_TINY_KEY`
* `NEXT_PUBLIC_INFURA_IPFS_ID` & `NEXT_PUBLIC_INFURA_IPFS_SECRET`

#### Etherscan API

`NEXT_PUBLIC_ETHERSCAN_KEY` Etherscan API Key, used to retrieve contract ABI when adding custom transaction action to proposal.

### Framework & Library

* [react](https://github.com/facebook/react)
* [next.js](https://github.com/vercel/next.js)
* [recharts, render charts](https://github.com/recharts/recharts)
* [graphql-hooks, query with graphql](https://github.com/nearform/graphql-hooks)
* [wagmi & ethers, interact with chains](https://github.com/tmm/wagmi)
* [react-vertical-timeline](https://github.com/stephane-monnot/react-vertical-timeline)
* [react-markdown](https://github.com/remarkjs/react-markdown)
* [tailwindcss, a utility-first CSS framework](https://tailwindcss.com/)
* [tailwindui](https://tailwindui.com/)
* [snapshot.js](https://github.com/snapshot-labs/snapshot.js)
* [flowbite, components on top of Tailwind CSS](https://github.com/themesberg/flowbite-react)
* [react-hook-form](https://github.com/react-hook-form/react-hook-form)
