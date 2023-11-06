import { SplitDiffEntry, keyOfSplit } from "@/utils/functions/juicebox";
import { classNames } from "@/utils/functions/tailwind";
import { JBSplit } from "@/models/JuiceboxTypes";
import { Status, SectionTableData } from "../form/DiffTableWithSection";
import FormattedAddress from "../AddressCard/FormattedAddress";
import ProjectHandleLink from "../ProjectLink";

export default function JBSplitEntry({
  mod,
  projectVersion = 3,
}: {
  mod: JBSplit;
  projectVersion?: number;
}) {
  let splitMode = "address";
  if (mod.allocator !== "0x0000000000000000000000000000000000000000")
    splitMode = "allocator";
  else if (mod.projectId.toNumber() !== 0) splitMode = "project";

  const mainStyle = "text-sm";
  const subStyle = "text-xs text-gray-500";

  return (
    <>
      {splitMode === "allocator" && (
        <div className="mx-1 inline-block">
          <FormattedAddress address={mod.allocator} style={mainStyle} />
          <a
            href="https://info.juicebox.money/dev/learn/glossary/split-allocator/"
            target="_blank"
            rel="noreferrer"
          >
            (Allocator)
          </a>
        </div>
      )}

      {splitMode === "project" && (
        <div className="mx-1 inline-block">
          <div className="flex flex-col">
            <ProjectHandleLink
              projectId={mod.projectId.toNumber()}
              style={mainStyle}
            />
            <div>
              <span className={classNames(subStyle, "ml-1")}>Token: </span>
              <FormattedAddress address={mod.beneficiary} style={subStyle} />
            </div>
          </div>
        </div>
      )}

      {/* Address mode */}
      {splitMode === "address" && (
        <div className="mx-1 inline-block">
          <FormattedAddress address={mod.beneficiary} style={mainStyle} />
        </div>
      )}
    </>
  );
}

export function diff2TableEntry(
  index: number,
  status: Status,
  tableData: SectionTableData[]
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
