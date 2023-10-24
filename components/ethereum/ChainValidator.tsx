import { useContext, useState } from "react";
import { useSwitchNetwork } from "wagmi";
import { mainnet, goerli } from "wagmi/chains";
import { NetworkContext } from "../../context/NetworkContext";
import ResultModal from "../modal/ResultModal";

export function ChainValidator({ supportedNetwork }: { supportedNetwork: string }) {
  const _network = useContext(NetworkContext);
  const network = _network.toLowerCase();
  const [open, setOpen] = useState(network !== supportedNetwork);
  const { switchNetwork } = useSwitchNetwork();

  const supportedChainId = supportedNetwork === "mainnet" ? mainnet.id : goerli.id;
  const description = `The transactor of this space was deployed on ${supportedNetwork}, please switch network if you need to queue transactions. ${switchNetwork ? "" : "You can switch network in your wallet."}`;

  return (
    <ResultModal
      shouldOpen={open}
      isSuccessful={false} title="Wrong Network" description={description}
      buttonText="Switch network" onClick={() => {
        switchNetwork?.(supportedChainId);
        setOpen(false);
      }}
      cancelButtonText="Ignore" close={() => setOpen(false)} />
  )
}
