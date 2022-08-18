import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';

import { GraphQLClient, ClientContext } from 'graphql-hooks'

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  WagmiConfig, createClient,
  configureChains, chain
} from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'

const graphqlClient = new GraphQLClient({
  url: 'https://hub.snapshot.org/graphql'
})

// WAGMI and RainbowKit configuration
const { chains, provider } = configureChains(
  [chain.mainnet],
  [publicProvider()],
)

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <ClientContext.Provider value={graphqlClient}>
          <Component {...pageProps} />
        </ClientContext.Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default MyApp
