import { classNames } from "../../libs/tailwind";
import { JBSplit } from "../../models/JuiceboxTypes";
import FormattedAddress from "../ethereum/FormattedAddress";
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
        <>
          <FormattedAddress address={mod.allocator} style={mainStyle} />
          <a href="https://info.juicebox.money/dev/learn/glossary/split-allocator/" target="_blank" rel="noreferrer">(Allocator)</a>
          {/* <ResolvedProject version={projectVersion} projectId={mod.projectId.toNumber()} style={subStyle} />
          <FormattedAddress address={mod.beneficiary} style={subStyle} /> */}
        </>
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
        <>
          <FormattedAddress address={mod.beneficiary} style={mainStyle} />
        </>
      )}
    </>
  );
}