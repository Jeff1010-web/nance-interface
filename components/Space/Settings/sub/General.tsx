import FormattedAddress from '@/components/AddressCard/FormattedAddress';
import { SpaceConfig } from '@/models/NanceTypes';

export default function General({ spaceConfig }: { spaceConfig: SpaceConfig }) {
  return (
    <div className="flex flex-col overflow-hidden">
      <p className="font-bold text-xs badge">NAME</p>
      <p>{spaceConfig.space}</p>
      <p className="mt-4 font-bold text-xs">SPACE OWNERS</p>
      {spaceConfig.spaceOwners.map((owner) => (
        <FormattedAddress key={owner} address={owner} />
      ))}
    </div>
  );
}
