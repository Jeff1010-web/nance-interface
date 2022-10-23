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
import { infuraProvider } from 'wagmi/providers/infura';

import {NextQueryParamProvider} from 'next-query-params';

import {JuiceProvider} from 'juice-hooks'
import { Flowbite } from 'flowbite-react';

const graphqlClient = new GraphQLClient({
  url: 'https://hub.snapshot.org/graphql'
})

// WAGMI and RainbowKit configuration
const { chains, provider } = configureChains(
  [chain.mainnet],
  [
    infuraProvider({ infuraId: process.env.NEXT_PUBLIC_INFURA_KEY}),
    publicProvider()
  ],
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

const theme = {
  theme: {
    tooltip: {
      target: ''
    }
  }
}

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        appInfo={{
          appName: 'JuiceTool',
          learnMoreUrl: 'https://juicetool.xyz',
        }}>
        <ClientContext.Provider value={graphqlClient}>
          <NextQueryParamProvider>
            <JuiceProvider provider={wagmiClient.provider}>
              <Flowbite theme={theme}>
                <Component {...pageProps} />
              </Flowbite>
            </JuiceProvider>
          </NextQueryParamProvider>
        </ClientContext.Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default MyApp
