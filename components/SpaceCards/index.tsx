import { useAllSpaceInfo } from "@/utils/hooks/NanceHooks";
import SpaceCards from "./SpaceCards";

export default function AllSpace() {
  const { data, error, isLoading } = useAllSpaceInfo();

  return (
    <SpaceCards spaceInfos={data?.data} error={error} isLoading={isLoading} />
  );
}
