import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function TooltipInfo({ content }: { content: string }) {
  return (
    <div className="tooltip" data-tip={content}>
      <InformationCircleIcon className="h-4 w-4 text-gray-400" />
    </div>
  );
}
