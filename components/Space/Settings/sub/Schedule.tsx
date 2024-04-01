import { GovernanceCycleForm } from "@/components/CreateSpace";
import { SpaceConfig } from "@nance/nance-sdk";

export default function Schedule({
  spaceConfig,
  edit,
}: {
  spaceConfig: SpaceConfig;
  edit?: boolean;
}) {
  return <GovernanceCycleForm disabled={!edit} />;
}
