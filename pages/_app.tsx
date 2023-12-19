import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { GraphQLClient, ClientContext } from "graphql-hooks";
import memCache from "graphql-hooks-memcache";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig, useNetwork } from "wagmi";
import { mainnet } from "wagmi/chains";
import { wagmiConfig, chains } from "../config/wagmi";

import { NextQueryParamProvider } from "next-query-params";

import { Flowbite } from "flowbite-react";
import { ErrorBoundary } from "@/components/Site";
import { Analytics } from "@vercel/analytics/react";

import { SessionProvider } from "next-auth/react";
import { RainbowKitSiweNextAuthProvider } from "@rainbow-me/rainbowkit-siwe-next-auth";
import { NetworkContext } from "../context/NetworkContext";
import { SNAPSHOT_HEADERS, SNAPSHOT_HUB } from "../constants/Snapshot";
import { SWRConfig } from "swr";

const graphqlClient = new GraphQLClient({
  url: `${SNAPSHOT_HUB}/graphql`,
  headers: SNAPSHOT_HEADERS,
  cache: memCache({ size: 200 }),
});

const theme = {
  theme: {
    tooltip: {
      target: "",
      content: "relative z-20 max-w-[200px] lg:max-w-[300px] 2xl:max-w-[500px]",
    },
  },
};

function MyApp({ Component, pageProps }: any) {
  const { chain } = useNetwork();
  const network = chain?.name || mainnet.name;

  return (
    <SessionProvider
      session={pageProps.session}
      // Re-fetch session every 5 minutes
      refetchInterval={5 * 60}
      // Re-fetches session when window is focused
      refetchOnWindowFocus={true}
    >
      <RainbowKitSiweNextAuthProvider>
        <RainbowKitProvider
          chains={chains}
          appInfo={{
            appName: "Nance",
            learnMoreUrl: "https://docs.nance.app",
          }}
        >
          <ClientContext.Provider value={graphqlClient}>
            <NextQueryParamProvider>
              <Flowbite theme={theme}>
                <ErrorBoundary>
                  <NetworkContext.Provider value={network}>
                    <SWRConfig value={{ revalidateOnFocus: false }}>
                      <Component {...pageProps} />
                    </SWRConfig>
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
  );
}

export default WagmiWrappedApp;
