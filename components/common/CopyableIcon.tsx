import { classNames } from "@/utils/functions/tailwind";
import { ClipboardDocumentIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "flowbite-react";
import { PropsWithChildren, useState } from "react";

interface CopyableIconProps {
  /**
   * The text to copy to the clipboard.
   */
  text: string;

  /**
   * Hide the icon.
   */
  hide?: boolean;
}

/**
 * A tooltip that shows a copy icon next to the text. When the icon is clicked, the text is copied to the clipboard.
 * @param text The text to copy to the clipboard.
 */
export default function CopyableIcon({
  text,
  hide = true,
}: PropsWithChildren<CopyableIconProps>) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  };

  return (
    <Tooltip
      content={copied ? "Copied!" : "Copy to clipboard"}
      placement="top"
    >
      <ClipboardDocumentIcon
        className={classNames("ml-2 h-4 w-4 hover:text-blue-600 cursor-pointer", hide ? "hidden" : "")}
        onClick={handleCopy}
      />
    </Tooltip>
  );
}
