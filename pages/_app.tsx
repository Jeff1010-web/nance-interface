import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import { GraphQLClient, ClientContext } from 'graphql-hooks'
import memCache from 'graphql-hooks-memcache'

import {
  getDefaultWallets,
  RainbowKitProvider
} from '@rainbow-me/rainbowkit';
import {
  WagmiConfig, createConfig,
  configureChains, mainnet
} from 'wagmi'
import { infuraProvider } from 'wagmi/providers/infura'

import { NextQueryParamProvider } from 'next-query-params';

import { Flowbite } from 'flowbite-react';
import ErrorBoundary from '../components/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';

import { SessionProvider } from 'next-auth/react';
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';

const graphqlClient = new GraphQLClient({
  url: 'https://hub.snapshot.org/graphql',
  cache: memCache({ size: 200 })
})

// WAGMI and RainbowKit configuration
const { chains, publicClient } = configureChains(
  [mainnet],
  [
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_KEY }),
  ],
)

const { connectors } = getDefaultWallets({
  appName: "Nance Interface",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
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
      <WagmiConfig config={wagmiConfig}>
        <SessionProvider refetchInterval={0} session={pageProps.session}>
          <RainbowKitSiweNextAuthProvider>
            <RainbowKitProvider
              chains={chains}
              appInfo={{
                appName: 'JBDAO',
                learnMoreUrl: 'https://jbdao.org',
              }}>
              <ClientContext.Provider value={graphqlClient}>
                <NextQueryParamProvider>
                  <Flowbite theme={theme}>
                    <ErrorBoundary>
                      <Component {...pageProps} />
                    </ErrorBoundary>
                  </Flowbite>
                </NextQueryParamProvider>
              </ClientContext.Provider>
            </RainbowKitProvider>
          </RainbowKitSiweNextAuthProvider>
        </SessionProvider>
      </WagmiConfig>
      <Analytics />
    </>
  )
}

export default MyApp
