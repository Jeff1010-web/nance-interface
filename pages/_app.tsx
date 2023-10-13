import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { GraphQLClient, ClientContext } from 'graphql-hooks';
import memCache from 'graphql-hooks-memcache';

import {
  getDefaultWallets,
  RainbowKitProvider
} from '@rainbow-me/rainbowkit';
import {
  WagmiConfig, createConfig,
  configureChains,
  useNetwork
} from 'wagmi';
import { mainnet, goerli } from 'wagmi/chains';
import { infuraProvider } from 'wagmi/providers/infura';

import { NextQueryParamProvider } from 'next-query-params';

import { Flowbite } from 'flowbite-react';
import ErrorBoundary from '../components/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';

import { SessionProvider } from 'next-auth/react';
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';
import { NetworkContext } from '../context/NetworkContext';
import { SNAPSHOT_HEADERS, SNAPSHOT_HUB } from '../constants/Snapshot';

const graphqlClient = new GraphQLClient({
  url: `${SNAPSHOT_HUB}/graphql`,
  headers: SNAPSHOT_HEADERS,
  cache: memCache({ size: 200 })
});

// WAGMI and RainbowKit configuration
const { chains, publicClient } = configureChains(
  [mainnet, goerli],
  [
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_KEY || "" }),
  ],
);

const { connectors } = getDefaultWallets({
  appName: "Nance Interface",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

const theme = {
  theme: {
    tooltip: {
      target: '',
      content: 'relative z-20 max-w-[200px] lg:max-w-[300px] 2xl:max-w-[500px] break-words'
    }
  }
};

function MyApp({ Component, pageProps }: any) {
  const { chain } = useNetwork();
  const network = chain?.name === "Goerli" ? "goerli" : "mainnet";

  return (
    <SessionProvider session={pageProps.session}
      // Re-fetch session every 5 minutes
      refetchInterval={5 * 60}
      // Re-fetches session when window is focused
      refetchOnWindowFocus={true}>
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
                  <NetworkContext.Provider value={network}>
                    <Component {...pageProps} />
                  </NetworkContext.Provider>
                </ErrorBoundary>
              </Flowbite>
            </NextQueryParamProvider>
          </ClientContext.Provider>
        </RainbowKitProvider>
      </RainbowKitSiweNextAuthProvider>
    </SessionProvider>
  );
}

function WagmiWrappedApp({ Component, pageProps }: any) {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <MyApp Component={Component} pageProps={pageProps} />
      </WagmiConfig>

      <Analytics />
    </>
  )
}

export default WagmiWrappedApp;
