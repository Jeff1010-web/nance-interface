import { ArrowPathIcon } from "@heroicons/react/24/solid";

export default function LoadingArrowSpiner() {
  return (
    <ArrowPathIcon
      className="-ml-0.5 h-5 w-5 animate-spin text-gray-400"
      aria-hidden="true"
    />
  );
}
