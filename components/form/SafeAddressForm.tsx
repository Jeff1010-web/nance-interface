import { useContext } from "react";
import AddressForm from "@/components/form/AddressForm";
import { safeServiceURL, SupportedSafeNetwork } from "@/utils/hooks/Safe/SafeURL";
import { NetworkContext } from "@/context/NetworkContext";
import { isValidSafe } from "@/utils/hooks/Safe/SafeHooks";

export const SAFE_ADDRESS_FIELD = "config.juicebox.gnosisSafeAddress";

export default function SafeAddressForm({
  label = "Safe Address",
  disabled 
}: { 
  label?: string,
  disabled?: boolean 
}) {
  const network = useContext(NetworkContext) as SupportedSafeNetwork;
  return (
    <AddressForm
      label={label}
      fieldName={SAFE_ADDRESS_FIELD}
      showType={false}
      disabled={disabled}
      validate={async (str) => {
        if (!str) return true;
        if (!Object.keys(safeServiceURL).includes(network))
          return "Invalid network";
        const isSafe = await isValidSafe(str, network);
        if (!isSafe) {
          return "Invalid Safe address, check if you are on the correct network";
        }
      }}
      required={false}
    />
  );
}
