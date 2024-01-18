// Modified from https://github.com/impersonator-eth/impersonator/blob/c27320c4d9029735c1ff5a03ab659e44e274966f/src/contexts/SafeInjectContext.tsx
// Respect to the original author @impersonator-eth
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { providers, utils } from "ethers";
import { useAppCommunicator } from "../helpers/communicator";
import {
  InterfaceMessageIds,
  InterfaceMessageProps,
  Methods,
  MethodToResponse,
  RequestId,
  RPCPayload,
  SignMessageParams,
  SignTypedMessageParams,
  Transaction,
} from "../types";
import { useEthersProvider } from "@/utils/hooks/ViemAdapter";

export interface TransactionWithId extends Transaction {
  id: number;
}

type SafeInjectContextType = {
  address: string | undefined;
  appUrl: string | undefined;
  //rpcUrl: string | undefined;
  iframeRef: React.RefObject<HTMLIFrameElement> | null;
  latestTransaction: TransactionWithId | undefined;
  setLatestTransaction: React.Dispatch<
    React.SetStateAction<TransactionWithId | undefined>
  >;
  setAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  setAppUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
  //setRpcUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
  sendMessageToIFrame: Function;
};

export const SafeInjectContext = createContext<SafeInjectContextType>({
  address: undefined,
  appUrl: undefined,
  iframeRef: null,
  latestTransaction: undefined,
  setLatestTransaction: () => {},
  setAddress: () => {},
  setAppUrl: () => {},
  sendMessageToIFrame: () => {},
});

export interface FCProps {
  children: React.ReactNode;
  defaultAddress?: string;
}

export const SafeInjectProvider: React.FunctionComponent<FCProps> = ({
  children,
  defaultAddress,
}) => {
  const [address, setAddress] = useState<string | undefined>(defaultAddress);
  const [appUrl, setAppUrl] = useState<string>();
  const ethersProvider = useEthersProvider();
  const _provider =
    ((ethersProvider as providers.FallbackProvider)?.providerConfigs[0]
      ?.provider as providers.JsonRpcProvider) ||
    (ethersProvider as providers.JsonRpcProvider);
  const provider = new providers.StaticJsonRpcProvider(
    _provider.connection.url,
  );
  const [latestTransaction, setLatestTransaction] =
    useState<TransactionWithId>();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const communicator = useAppCommunicator(iframeRef);

  const sendMessageToIFrame = useCallback(
    function <T extends InterfaceMessageIds>(
      message: InterfaceMessageProps<T>,
      requestId?: RequestId,
    ) {
      const requestWithMessage = {
        ...message,
        requestId: requestId || Math.trunc(window.performance.now()),
        version: "0.4.2",
      };

      if (iframeRef) {
        iframeRef.current?.contentWindow?.postMessage(
          requestWithMessage,
          appUrl!,
        );
      }
    },
    [iframeRef, appUrl],
  );

  useEffect(() => {
    if (!provider) return;

    communicator?.on(Methods.getSafeInfo, async () => {
      const ret = {
        safeAddress: address,
        chainId: (await provider.getNetwork()).chainId,
        owners: [],
        threshold: 1,
        isReadOnly: false,
      };
      return ret;
    });

    communicator?.on(Methods.getEnvironmentInfo, async () => ({
      origin: document.location.origin,
    }));

    communicator?.on(Methods.rpcCall, async (msg) => {
      const params = msg.data.params as RPCPayload;

      try {
        const response = (await provider.send(
          params.call,
          params.params,
        )) as MethodToResponse["rpcCall"];
        return response;
      } catch (err) {
        return err;
      }
    });

    communicator?.on(Methods.sendTransactions, (msg) => {
      // @ts-expect-error explore ways to fix this
      const transactions = (msg.data.params.txs as Transaction[]).map(
        ({ to, ...rest }) => ({
          to: utils.getAddress(to), // checksummed
          ...rest,
        }),
      );
      setLatestTransaction({
        id: parseInt(msg.data.id.toString()),
        ...transactions[0],
      });
      // openConfirmationModal(transactions, msg.data.params.params, msg.data.id)
    });

    communicator?.on(Methods.signMessage, async (msg) => {
      const { message } = msg.data.params as SignMessageParams;

      // openSignMessageModal(message, msg.data.id, Methods.signMessage)
    });

    communicator?.on(Methods.signTypedMessage, async (msg) => {
      const { typedData } = msg.data.params as SignTypedMessageParams;

      // openSignMessageModal(typedData, msg.data.id, Methods.signTypedMessage)
    });
  }, [communicator, address, provider]);

  return (
    <SafeInjectContext.Provider
      value={{
        address,
        appUrl,
        iframeRef,
        latestTransaction,
        setLatestTransaction,
        setAddress,
        setAppUrl,
        sendMessageToIFrame,
      }}
    >
      {children}
    </SafeInjectContext.Provider>
  );
};

export const useSafeInject = () => useContext(SafeInjectContext);
