import { GovernanceCycleForm } from "@/components/CreateSpace";
import { SpaceConfig } from "@/models/NanceTypes";

export default function Schedule({
  spaceConfig,
  edit,
}: {
  spaceConfig: SpaceConfig;
  edit?: boolean;
}) {
  return <GovernanceCycleForm disabled={!edit} />;
}
