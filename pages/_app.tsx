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
import { watchAccount } from '@wagmi/core';
import { infuraProvider } from 'wagmi/providers/infura';

import { NextQueryParamProvider } from 'next-query-params';

import { Flowbite } from 'flowbite-react';
import ErrorBoundary from '../components/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';

import { SessionProvider, signOut, useSession } from 'next-auth/react';
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';
import { useEffect } from 'react';
import { NetworkContext } from '../context/NetworkContext';

const graphqlClient = new GraphQLClient({
  url: 'https://hub.snapshot.org/graphql',
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

function AccountWatcher() {
  // check for user wallet switch and logout
  // TODO: refetch proposals on login, but how?
  const { data: session, status } = useSession();

  useEffect(() => {
    const unwatch = watchAccount((account) => {
      if (session?.user && account.address !== session?.user?.name) {
        signOut();
      }
    });
    return () => unwatch();
  });

  return null;
}

function MyApp({ Component, pageProps }: any) {
  const { chain } = useNetwork();
  const network = chain?.name === "goerli" ? "goerli" : "mainnet";
  console.debug("network", network, chain);

  return (
    <SessionProvider refetchInterval={0} session={pageProps.session}>
      <AccountWatcher />
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
