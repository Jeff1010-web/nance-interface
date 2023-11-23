import { classNames } from "@/utils/functions/tailwind";

/**
 * Simple badge label for proposal status
 */
export default function ProposalBadgeLabel({ status }: { status: string }) {
  return (
    <span
      className={classNames(
        "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
        `bg-${statusToColor[status]}-100`,
        `text-${statusToColor[status]}-800`,
        "sm:px-2",
      )}
    >
      {status === "Temperature Check" ? "Temp-check" : status}
    </span>
  );
}

const statusToColor: Record<string, string> = {
  Archived: "gray",
  Discussion: "gray",
  Draft: "gray",
  Revoked: "gray",
  Approved: "green",
  Cancelled: "red",
  Private: "red",
  "Temperature Check": "purple",
  Voting: "yellow",
};
