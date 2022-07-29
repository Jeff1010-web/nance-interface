import '../styles/globals.css'
import { GraphQLClient, ClientContext } from 'graphql-hooks'
import {
  WagmiConfig, createClient,
  configureChains, chain
} from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'

const { provider, webSocketProvider } = configureChains(
  [chain.mainnet, chain.polygon],
  [publicProvider()],
)

const wagmiClient = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
})

const graphqlClient = new GraphQLClient({
  url: 'https://hub.snapshot.org/graphql'
})

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <ClientContext.Provider value={graphqlClient}>
        <Component {...pageProps} />
      </ClientContext.Provider>
    </WagmiConfig>
  )
}

export default MyApp
