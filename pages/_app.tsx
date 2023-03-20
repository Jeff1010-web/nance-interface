import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';

import { GraphQLClient, ClientContext } from 'graphql-hooks'
import memCache from 'graphql-hooks-memcache'

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  WagmiConfig, createClient,
  configureChains, chain
} from 'wagmi'
import { infuraProvider } from 'wagmi/providers/infura'

import { NextQueryParamProvider } from 'next-query-params';

import { JuiceProvider } from 'juice-hooks'
import { Flowbite } from 'flowbite-react';
import ErrorBoundary from '../components/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';

const graphqlClient = new GraphQLClient({
  url: 'https://hub.snapshot.org/graphql',
  cache: memCache({ size: 200 })
})

// WAGMI and RainbowKit configuration
const { chains, provider } = configureChains(
  [chain.mainnet],
  [
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_KEY }),
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
      target: '',
      content: 'relative z-20 max-w-[200px] lg:max-w-[300px] 2xl:max-w-[500px] break-words'
    }
  }
}

function MyApp({ Component, pageProps }) {
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider
          chains={chains}
          appInfo={{
            appName: 'JBDAO',
            learnMoreUrl: 'https://jbdao.org',
          }}>
          <ClientContext.Provider value={graphqlClient}>
            <NextQueryParamProvider>
              <JuiceProvider provider={wagmiClient.provider}>
                <Flowbite theme={theme}>
                  <ErrorBoundary>
                    <Component {...pageProps} />
                  </ErrorBoundary>
                </Flowbite>
              </JuiceProvider>
            </NextQueryParamProvider>
          </ClientContext.Provider>
        </RainbowKitProvider>
      </WagmiConfig>
      <Analytics />
    </>
  )
}

export default MyApp
