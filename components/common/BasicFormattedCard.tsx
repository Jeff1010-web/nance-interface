import Image from "next/image";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { PropsWithChildren } from "react";

interface BasicFormattedCardProps {
  /**
   * The image source for the card.
   */
  imgSrc: string;
  /**
   * The image alt text for the card.
   */
  imgAlt: string;
  /**
   * The action to perform when the card is clicked.
   */
  action?: () => void;
}

/**
 * A basic formatted card with an image, title, and action.
 * @param imgSrc The image source for the card.
 * @param imgAlt The image alt text for the card.
 * @param action The action to perform when the card is clicked.
 * @param children The children of the card, will render as title, can use to support multiple lines.
 */
export default function BasicFormattedCard({
  imgSrc,
  imgAlt,
  action,
  children,
}: PropsWithChildren<BasicFormattedCardProps>) {
  return (
    <div className="mt-4 w-fit rounded-md border border-gray-300 bg-white p-2">
      <div className="flex items-center">
        <Image
          src={imgSrc}
          alt={imgAlt}
          className="ml-1 h-10 w-10 flex-shrink-0 rounded-full"
          width={100}
          height={100}
        />
        <span className="ml-3 block w-32 truncate">{children}</span>
        {action && (
          <XCircleIcon
            onClick={action}
            className="ml-3 h-5 w-5 cursor-pointer text-gray-400"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
