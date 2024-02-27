import { classNames } from "@/utils/functions/tailwind";
import {
  StringParam,
  useQueryParams
} from "next-query-params";

export default function TransactionCycleNavigator() {

  return (
    <div className="flex flex-row ml-2">
      <p className="text-sm font-semibold italic text-gray-900">Change Cycle</p>
      <CycleNavButton dir="prev" />
      <CycleNavButton dir="next" />
    </div>
  );
}

const CycleNavButton = ({ dir }: {dir: string}) => {
  const [query, setQuery] = useQueryParams({
    cycle: StringParam,
  });

  const handleCycleChange = (dir: string) => {
    const currentCycle = parseInt(query.cycle || "0");
    const newCycle = currentCycle + (dir === "prev" ? -1 : 1);
    if (newCycle >= 0) {
      setQuery({ cycle: newCycle.toString() }, "replace");
    }
  };

  return (
    <p
      className={
        classNames("ml-2 text-sm",
          query.cycle === "0" && dir === "prev"
            ? "text-gray-400"
            : "text-blue-500 underline hover:cursor-pointer"
        )
      }
      onClick={() => handleCycleChange(dir)}
    >
      {dir}
    </p>
  );
};