import FormattedAddress from "@/components/AddressCard/FormattedAddress";
import { SpaceConfig } from "@/models/NanceTypes";
import { getChainByNetworkName } from "config/custom-chains";
import Image from "next/image";
import SafeAddressForm from "@/components/form/SafeAddressForm";
import { SupportedSafeNetwork } from "@/utils/hooks/Safe/SafeURL";

export default function Execution({ spaceConfig, edit }: { spaceConfig: SpaceConfig; edit?: boolean }) {
  const findNetwork = getChainByNetworkName(spaceConfig.config.juicebox.network);
  const networkName = findNetwork.name as SupportedSafeNetwork;
  const networkIcon = findNetwork.iconUrl;
  return (
    <div className="flex flex-col">
      <p className="badge text-xs font-bold">NETWORK</p>
      <div className="ml-4 mt-1 flex flex-row items-center space-x-2">
        <Image
          src={networkIcon as string}
          alt=""
          className="h-8 w-8 flex-shrink-0 rounded-full"
          width={50}
          height={50}
        />
        <p className="font-semibold">{networkName}</p>
      </div>
      <p className="mt-4 badge text-xs font-bold">SAFE ADDRESS</p>
      { edit ? (
        <div className="max-w-md">
          <SafeAddressForm label={""} networkName={networkName} />
        </div>
      ) : (
        <FormattedAddress address={spaceConfig.config.juicebox.gnosisSafeAddress} network={spaceConfig.config.juicebox.network} />
      )}
    </div>
  );
}
