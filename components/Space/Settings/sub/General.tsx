import SpaceOwnersForm from "@/components/CreateSpace/SpaceOwnersForm";
import { SpaceConfig } from "@nance/nance-sdk";

export default function General({ spaceConfig, edit }: { spaceConfig: SpaceConfig; edit: boolean }) {
  return (
    <div className="flex flex-col">
      <p className="badge text-xs font-bold">NAME</p>
      <p>{spaceConfig.space}</p>
      <p className="mt-4 text-xs font-bold">SPACE OWNERS</p>
      <SpaceOwnersForm edit={edit} />
    </div>
  );
}
