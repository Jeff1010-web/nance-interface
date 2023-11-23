import { useEffect, useState } from "react";
import { SnapshotProposal } from "@/models/SnapshotTypes";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { classNames } from "@/utils/functions/tailwind";
import VotingModal from "./VotingModal";

export default function NewVoteButton({
  snapshotProposal,
  snapshotSpace,
  refetch,
  isSmall = false,
}: {
  snapshotProposal: SnapshotProposal | undefined;
  snapshotSpace: string;
  refetch: (option?: any) => void;
  isSmall?: boolean;
}) {
  // state
  const [modalIsOpen, setModalIsOpen] = useState(false);
  // external hook
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  let buttonLabel = "Vote";
  if (snapshotProposal === undefined) {
    buttonLabel = "Loading";
  }
  if (snapshotProposal?.state !== "active") {
    buttonLabel = "Voting Closed";
  } else if (isConnected) {
    buttonLabel = "Vote";
  } else {
    buttonLabel = "Connect Wallet";
  }

  return (
    <div className={isSmall ? "" : "my-4"}>
      <button
        id="vote"
        className={classNames(
          "inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-black disabled:opacity-50",
          isSmall ? "" : "px-4",
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (isConnected) {
            setModalIsOpen(true);
          } else {
            openConnectModal?.();
          }
        }}
        disabled={snapshotProposal?.state !== "active"}
      >
        <span>{buttonLabel}</span>
      </button>

      {snapshotProposal?.choices && modalIsOpen && (
        <VotingModal
          modalIsOpen={modalIsOpen}
          closeModal={() => setModalIsOpen(false)}
          address={address}
          spaceId={snapshotSpace}
          proposal={snapshotProposal}
          spaceHideAbstain={true}
          refetch={refetch}
        />
      )}
    </div>
  );
}
