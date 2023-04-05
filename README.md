## Nance Interface

### Build

```
yarn install && yarn build && yarn export
```

### Environment Variable

You should set these env variables accordingly for the app to work.

* `NEXT_PUBLIC_NANCE_API_URL` API url of [Nance](https://nance.app/).
* `NEXT_PUBLIC_INFURA_KEY` API key of [Infura](https://www.infura.io/)
* `NEXT_PUBLIC_SUBGRAPH_ID` Subgraph Deployment ID of [Juicebox](https://thegraph.com/explorer/subgraphs/FVmuv3TndQDNd2BWARV8Y27yuKKukryKXPzvAS5E7htC?view=Overview&chain=mainnet)
* `NEXT_PUBLIC_SNAPSHOT_SUBGRAPH_ID` Subgraph Deployment ID of [Snapshot](https://thegraph.com/hosted-service/subgraph/snapshot-labs/snapshot)
* `NEXT_PUBLIC_TINY_KEY` API Key of [TinyMCE, WYSIWYG Editor](https://www.tiny.cloud/)
* `NEXT_PUBLIC_OVERRIDE_SPACE` By default, the space is `juicebox`, you can use this to override.
* `NEXT_PUBLIC_INFURA_IPFS_ID` Infura IPFS PROJECT ID, used by proposal editor to upload attached images on IPFS
* `NEXT_PUBLIC_INFURA_IPFS_SECRET` Infura IPFS API Key Secret, used by proposal editor to upload attached images on IPFS.

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
