import { SplitDiffEntry, keyOfSplit } from "../../libs/juicebox";
import { classNames } from "../../libs/tailwind";
import { JBSplit } from "../../models/JuiceboxTypes";
import FormattedAddress from "../ethereum/FormattedAddress";
import { Status, SectionTableData } from "../form/DiffTableWithSection";
import ResolvedProject from "./ResolvedProject";

export default function JBSplitEntry({ mod, projectVersion = 3 }: { mod: JBSplit, projectVersion?: number }) {
  let splitMode = "address";
  if (mod.allocator !== "0x0000000000000000000000000000000000000000") splitMode = "allocator";
  else if (mod.projectId.toNumber() !== 0) splitMode = "project";

  const mainStyle = "text-sm";
  const subStyle = "text-xs text-gray-500";

  return (
    <>
      {splitMode === "allocator" && (
        <div className="inline-block mx-1">
          <FormattedAddress address={mod.allocator} style={mainStyle} />
          <a href="https://info.juicebox.money/dev/learn/glossary/split-allocator/" target="_blank" rel="noreferrer">(Allocator)</a>
          {/* <ResolvedProject version={projectVersion} projectId={mod.projectId.toNumber()} style={subStyle} />
          <FormattedAddress address={mod.beneficiary} style={subStyle} /> */}
        </div>
      )}

      {splitMode === "project" && (
        <div className="inline-block mx-1">
          <div className="flex flex-col">
            <ResolvedProject version={projectVersion} projectId={mod.projectId.toNumber()} style={mainStyle} />
            <div>
              <span className={classNames(
                subStyle,
                "ml-1"
              )}>Token: </span>
              <FormattedAddress address={mod.beneficiary} style={subStyle} />
            </div>
          </div>
        </div>
      )}

      {/* Address mode */}
      {splitMode === "address" && (
        <div className="inline-block mx-1">
          <FormattedAddress address={mod.beneficiary} style={mainStyle} />
        </div>
      )}
    </>
  );
}

export function diff2TableEntry(index: number, status: Status, tableData: SectionTableData[]) {
  return (v: SplitDiffEntry) => {
    tableData[index].entries.push({
      id: keyOfSplit(v.split),
      proposal: v.proposalId,
      oldVal: v.oldVal,
      newVal: v.newVal,
      valueToBeSorted: parseFloat(v.oldVal.split("%")[0]) || 0,
      status,
      title: (<JBSplitEntry mod={v.split} projectVersion={3} />)
    });
  };
}