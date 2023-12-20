import { useCallback, useEffect, useState } from "react";
import SafeApiKit from "@safe-global/api-kit";
import { useEthersSigner } from "@/utils/hooks/ViemAdapter";
import { ethers } from "ethers";
import { EthersAdapter } from "@safe-global/protocol-kit";
import { useSafeNetworkAPI } from "@/utils/hooks/Safe/SafeURL";

export function useSafeAPIKit() {
  const [value, setValue] = useState<SafeApiKit>();
  const signer = useEthersSigner();
  const txServiceUrl = useSafeNetworkAPI();

  useEffect(() => {
    if (!signer) {
      return;
    }
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: signer!,
    });
    const safeApiKit = new SafeApiKit({
      txServiceUrl,
      ethAdapter,
    });
    setValue(safeApiKit);
  }, [signer]);

  return { value, loading: !value };
}