import Contact from "./Contact";
import FeatureSection from "./FeatureSection";
import HeroSection from "./HeroSection";
import StatsSection from "./StatsSection";
import Testimonials from "./Testimonials";

import { useAllSpaceInfo } from "@/utils/hooks/NanceHooks";
const DEFAULT_TOP4SPACES = [
  {
    id: "juicebox",
    name: "juicebox",
    snapshotSpace: "jbdao.eth"
  },
  {
    id: "moondao",
    name: "moondao",
    snapshotSpace: "tomoondao.eth"
  },
  {
    id: "thirstythirsty",
    name: "thirstythirsty",
    snapshotSpace: "gov.thirstythirsty.eth"
  },
  {
    id: "daosquare",
    name: "DAOSquare",
    snapshotSpace: "community.daosquare.eth"
  },
];

export interface SimpleSpaceEntry {
  id: string;
  name: string;
  snapshotSpace: string;
}

export default function Landing() {
  const { data } = useAllSpaceInfo();
  const top4Spaces: SimpleSpaceEntry[] = data?.data
  // filter test spaces
    ?.filter((s) => !["gnance", "waterbox", "nance"].includes(s.name))
  // sort by proposal count
    .sort((a, b) => b.nextProposalId - a.nextProposalId)
  // top 4
    .slice(0, 4)
    .map((s) => {
      return {
        id: s.name,
        name: s.displayName,
        snapshotSpace: s.snapshotSpace
      };
    }) || DEFAULT_TOP4SPACES;
  return (
    <>
      <HeroSection top4Spaces={top4Spaces} />
      <StatsSection data={data?.data}/>
      <FeatureSection />
      <Testimonials />
      <Contact />
    </>
  );
}
