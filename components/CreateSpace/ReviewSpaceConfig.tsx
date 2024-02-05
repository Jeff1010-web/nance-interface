import { useFormContext } from "react-hook-form";
import RulesForm from "./RulesForm";
import GovernanceCalendarMiniWrapped from "./sub/GovernanceCalendarMiniWrapped";
import BasicFormattedCard from "../common/BasicFormattedCard";
import useSnapshotSpaceInfo from "@/utils/hooks/snapshot/SpaceInfo";
import { ConfigSnapshotSpaceField } from "./SnapshotForm";
import { JUICEBOX_PROJECT_FIELD } from "pages/create";
import useJBMSearch from "@/utils/hooks/juicebox/ProjectSmartSearch";
import { useContext, useEffect } from "react";
import { JBDAO_LOGO, cidFromUrl, ipfsUrlOf } from "@/constants/Juicebox";
import DiscordForm from "./DiscordForm";
import DiscordUser from "./sub/DiscordUser";
import { useSession } from "next-auth/react";
import { NetworkContext } from "@/context/NetworkContext";
import SafeAddressForm from "../form/SafeAddressForm";
import { ConfigGuildxyzGuildField } from "./GuildxyzForm";
import { useGuild } from "@/utils/hooks/GuildxyzHooks";
import { ConfigGuildxyzRolesField } from "./sub/GuildxyzConfigForm";

const LABEL_STYLE = "text-sm font-medium text-gray-700";

export default function ReviewSpaceConfig({
  setStep,
}: {
  setStep: (step: number) => void;
}) {
  const {
    watch,
    getValues,
    formState: { errors },
  } = useFormContext();

  const spaceId = watch(ConfigSnapshotSpaceField);
  const projectId = watch(JUICEBOX_PROJECT_FIELD);
  const guildId = watch(ConfigGuildxyzGuildField);
  const guildRoles = watch(ConfigGuildxyzRolesField);

  const { data: snapshotSpaceInfo } = useSnapshotSpaceInfo(spaceId);
  const { data: guildInfo } = useGuild(guildId, guildId !== undefined);
  const { projects, setQueryParams } = useJBMSearch({
    pv: "2",
    projectId: projectId,
  });
  const network = useContext(NetworkContext);
  const { data: session } = useSession();

  const address = session?.user?.name || "";
  const selectedProject = projects?.[0];

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === JUICEBOX_PROJECT_FIELD) {
        setQueryParams({
          pv: "2",
          projectId: getValues(JUICEBOX_PROJECT_FIELD),
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <div className="space-y-2">
      <div className="hover:cursor-pointer" onClick={() => setStep(0)}>
        <RulesForm disabled />
      </div>

      <div className="hover:cursor-pointer" onClick={() => setStep(1)}>
        <label className={LABEL_STYLE}>Governance calendar</label>
        <GovernanceCalendarMiniWrapped disabled />
      </div>

      <div className="hover:cursor-pointer" onClick={() => setStep(2)}>
        <label className={LABEL_STYLE}>Snapshot space</label>
        {snapshotSpaceInfo && (
          <BasicFormattedCard
            imgSrc={`https://cdn.stamp.fyi/space/${spaceId}?s=160}`}
            imgAlt={snapshotSpaceInfo?.name || ""}
          >
            {snapshotSpaceInfo?.name}
          </BasicFormattedCard>
        )}
        {!snapshotSpaceInfo && (
          <p className="text-red-500">{"Can't be empty"}</p>
        )}
      </div>

      <div className="hover:cursor-pointer" onClick={() => setStep(3)}>
        <label className={LABEL_STYLE}>Guildxyz config</label>
        {guildInfo && (
          <div>
            <BasicFormattedCard
              imgSrc={guildInfo.imageUrl}
              imgAlt={guildInfo.name || ""}
            >
              {guildInfo?.name}
            </BasicFormattedCard>
            <p>Roles: {guildRoles.join(", ")}</p>
          </div>
        )}
        {!guildInfo && <p className="text-red-500">{"Can't be empty"}</p>}
      </div>

      <div className="hover:cursor-pointer" onClick={() => setStep(4)}>
        <label className={LABEL_STYLE}>Discord config</label>
        <DiscordUser address={address} disabled>
          <DiscordForm disabled />
        </DiscordUser>
      </div>

      <div className="max-w-md hover:cursor-pointer" onClick={() => setStep(5)}>
        <SafeAddressForm disabled label="Safe address (Optional)" />
      </div>

      <div className="hover:cursor-pointer" onClick={() => setStep(6)}>
        <label className={LABEL_STYLE}>Juicebox project (Optional)</label>
        {selectedProject && (
          <BasicFormattedCard
            imgSrc={
              selectedProject.logo_uri
                ? ipfsUrlOf(cidFromUrl(selectedProject.logo_uri))
                : JBDAO_LOGO
            }
            imgAlt={selectedProject.name || ""}
          >
            <span className="ml-3 block truncate">{selectedProject.name}</span>
          </BasicFormattedCard>
        )}
        {!selectedProject && <p className="text-gray-400">No input</p>}
      </div>
    </div>
  );
}
