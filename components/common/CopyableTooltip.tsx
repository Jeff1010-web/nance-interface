import { Tooltip } from "flowbite-react";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { PropsWithChildren, useState } from "react";

interface CopyableTooltipProps {
  /**
   * The text to copy to the clipboard.
   */
  text: string;
}

/**
 * A tooltip that shows a copy icon next to the text. When the icon is clicked, the text is copied to the clipboard.
 * @param text The text to copy to the clipboard.
 */
export default function CopyableTooltip({
  children,
  text,
}: PropsWithChildren<CopyableTooltipProps>) {
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
      content={
        <div className="flex overflow-x-auto">
          {text}
          <Tooltip
            content={copied ? "Copied!" : "Copy to clipboard"}
            placement="top"
          >
            <ClipboardDocumentIcon
              className="ml-2 h-5 w-5"
              onClick={handleCopy}
            />
          </Tooltip>
        </div>
      }
      placement="top"
    >
      {children}
    </Tooltip>
  );
}
