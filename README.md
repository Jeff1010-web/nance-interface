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

#### Nance Auto API

Some tasks need to run at specific times, this is done by querying [Nance-auto](https://github.com/nance-eth/nance-ts/blob/main/src/api/auto.ts). We need a shared secret, `NANCE_AUTO_KEY`, to verify requests.

#### Ethereum

We need [Infura](https://www.infura.io/) RPC to interact with Ethereum. Please specify `NEXT_PUBLIC_INFURA_KEY`.

#### Juicebox Subgraph

To get infomation of Juicebox projects, we need to specify the [subgraph url of Juicebox](https://docs.juicebox.money/dev/frontend/subgraph/): `JUICEBOX_SUBGRAPH_KEY`.

#### Snapshot Subgraph

To find delegations, we need to specify the subgraph url of [Snapshot](https://thegraph.com/hosted-service/subgraph/snapshot-labs/snapshot): `NEXT_PUBLIC_SNAPSHOT_SUBGRAPH_ID`

#### NextAuth SIWE

To support session, you need to implement backend for NextAuth and set two env variables: [`NEXTAUTH_DOMAINS`](https://next-auth.js.org/configuration/options#nextauth_url) (a comma separated list of approved domains, no https://) and [`NEXTAUTH_SECRET`](https://next-auth.js.org/configuration/options#nextauth_secret)

#### Etherscan API

`NEXT_PUBLIC_ETHERSCAN_KEY` Etherscan API Key, used to retrieve contract ABI when adding custom transaction action to proposal.

#### WalletConnect V2 ProjectId

`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

#### Tenderly Simulation

`TENDERLY_ACCESS_KEY`, this will be used to run simulation.

#### Discord

We use the Discord API to fetch a user's guilds (serves) and guild channels when creating a Nance space. To do this you need to gather the following from the Discord Developer Portal:
* `NEXT_PUBLIC_DISCORD_CLIENT_ID`
* `NEXT_PUBLIC_DISCORD_REDIRECT_URI_BASE` (need to add this in your Discord Developer Portal as well)
* `DISCORD_CLIENT_SECRET`
* `DISCORD_NANCE_BOT_KEY`

We use a Discord webhook to alert us when someone fills out a contact form. To do this you need to set:
* ``DISCORD_CONTACT_WEBHOOK``

#### Redis

We use a hosted Redis instance on [Upstash](https://upstash.com) to store a user's Discord session and link it to their wallet. To do this you need to set:
* `REDIS_HOST`
* `REDIS_PORT`
* `REDIS_PASSWORD`

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
