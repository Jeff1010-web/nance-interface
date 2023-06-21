import { useEffect, useState } from "react";
import { SnapshotProposal } from "../hooks/snapshot/Proposals";
import VotingModal from "./VotingModal";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { classNames } from "../libs/tailwind";


export default function NewVoteButton(
    { proposal, refetch, isSmall = false }: 
    { proposal: SnapshotProposal, refetch: (option?: any) => void, isSmall?: boolean}) {
    // state
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [buttonLabel, setButtonLabel] = useState('Vote');
    // external hook
    const { address, isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();
  
    useEffect(() => {
      if (proposal?.state !== 'active') {
        setButtonLabel('Voting Closed');
      } else if (isConnected) {
        setButtonLabel('Vote');
      } else {
        setButtonLabel('Connect Wallet');
      }
    }, [isConnected, proposal]);
  
    return (
      <div className={isSmall ? "" : "my-4"}>
        <button id="vote" className={classNames(
            "inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 py-2 text-sm font-medium disabled:text-black text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 w-full",
            isSmall ? "" : "px-4"
        )}
          onClick={() => {
            if (isConnected) {
              setModalIsOpen(true);
            } else {
              openConnectModal();
            }
          }}
          disabled={proposal?.state !== 'active'}>
  
          <span>
            {buttonLabel}
          </span>
        </button>
  
        {proposal?.choices && (
          <VotingModal modalIsOpen={modalIsOpen} closeModal={() => setModalIsOpen(false)} address={address} spaceId='jbdao.eth' proposal={proposal} spaceHideAbstain={true} refetch={refetch} />
        )}
      </div>
    )
  }