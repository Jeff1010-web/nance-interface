import { SplitDiffEntry, keyOfSplit } from "@/utils/functions/juicebox";
import { classNames } from "@/utils/functions/tailwind";
import { JBSplit } from "@/models/JuiceboxTypes";
import { Status, SectionTableData } from "../form/DiffTableWithSection";
import FormattedAddress from "../AddressCard/FormattedAddress";
import ProjectLink from "../ProjectLink";
import { shortenAddress } from "@/utils/functions/address";

export default function JBSplitEntry({
  mod,
  projectVersion = 3,
}: {
  mod: JBSplit;
  projectVersion?: number;
}) {
  const { allocator, projectId, beneficiary } = mod;

  let splitMode = "address";
  if (allocator !== "0x0000000000000000000000000000000000000000") {
    splitMode = "allocator";
  } else if (projectId.toNumber() !== 0) {
    splitMode = "project";
  }

  const mainStyle = "text-sm";

  if (splitMode === "project") {
    return (
      <div className="mx-1 inline-block">
        <ProjectLink
          projectId={projectId.toNumber()}
          style={mainStyle}
          subText={`token: ${shortenAddress(beneficiary)}`}
          minified
        />
      </div>
    );
  }

  if (splitMode === "allocator") {
    return (
      <div className="mx-1 inline-block">
        <FormattedAddress
          address={allocator}
          style={mainStyle}
          subText="allocator contract"
          minified
        />
      </div>
    );
  }

  return (
    <div className="mx-1 inline-block">
      <FormattedAddress address={beneficiary} style={mainStyle} minified />
    </div>
  );
}

export function diff2TableEntry(
  index: number,
  status: Status,
  tableData: SectionTableData[],
) {
  return (v: SplitDiffEntry) => {
    tableData[index].entries.push({
      id: keyOfSplit(v.split),
      proposal: v.proposalId,
      oldVal: v.oldVal,
      newVal: v.newVal,
      valueToBeSorted: parseFloat(v.oldVal.split("%")[0]) || 0,
      status,
      title: <JBSplitEntry mod={v.split} projectVersion={3} />,
    });
  };
}
