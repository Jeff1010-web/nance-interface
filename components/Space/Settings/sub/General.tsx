import FormattedAddress from "@/components/AddressCard/FormattedAddress";
import { SpaceConfig } from "@/models/NanceTypes";

export default function General({ spaceConfig }: { spaceConfig: SpaceConfig }) {
  return (
    <div className="flex flex-col overflow-hidden">
      <p className="badge text-xs font-bold">NAME</p>
      <p>{spaceConfig.space}</p>
      <p className="mt-4 text-xs font-bold">SPACE OWNERS</p>
      {spaceConfig.spaceOwners.map((owner) => (
        <FormattedAddress key={owner} address={owner} />
      ))}
    </div>
  );
}
