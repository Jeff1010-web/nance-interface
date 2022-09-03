import { useState, Fragment } from "react"
import useVotingPower from "../hooks/VotingPower"
import snapshot from '@snapshot-labs/snapshot.js'
import { Dialog, RadioGroup, Transition } from '@headlessui/react'
import { ProposalDataExtended } from "../hooks/ProposalsExtendedOf"
import { XIcon } from '@heroicons/react/outline'
import { CheckIcon, ExclamationIcon } from '@heroicons/react/solid'
import { useSigner } from "wagmi"
import { Wallet } from "@ethersproject/wallet"

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact" , compactDisplay: "short" });
const formatNumber = (num) => formatter.format(num);

const hub = 'https://hub.snapshot.org'; // or https://testnet.snapshot.org for testnet
const client = new snapshot.Client712(hub);


interface VotingProps {
    modalIsOpen: boolean
    closeModal: () => void
    address: string
    spaceId: string
    proposal: ProposalDataExtended
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function VotingModal({modalIsOpen, closeModal, address, spaceId, proposal}: VotingProps) {
  const [selectedOption, setSelectedOption] = useState(1);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(undefined);
  const { data: signer, isError, isLoading } = useSigner();
  const { data: vp } = useVotingPower(address, spaceId, proposal?.id || '');

  // shorthand functions
  const beforeSubmitVote = () => {
    setSubmitting(true);
    setError(undefined);
  }
  const closeModalAndReset = () => {
    setSubmitting(false);
    setError(undefined);
    closeModal();
  }
  const errorWithSubmit = (e) => {
    setSubmitting(false);
    if (modalIsOpen) {
      setError(e);
    }
  }

  const vote = async () => {
    try {
      beforeSubmitVote();
      console.log("reason", reason);
      const receipt = await client.vote(signer as Wallet, address, {
          space: spaceId,
          proposal: proposal.id,
          type: 'single-choice',
          choice: selectedOption,
          reason: reason,
          app: 'juicetool'
      });
      console.info("📗 VotingModal ->", {spaceId, proposal, selectedOption}, receipt);
      closeModalAndReset();
    } catch (e) {
      errorWithSubmit(e);
      console.error("🔴 VotingModal ->", e);
    }
  }

  if(proposal === undefined) {
    return <div className="hidden">Proposal not selected</div>
  }

  const renderVoteButton = () => {
    if(address=='') {
      return (
        <button
          type="button"
          onClick={closeModalAndReset}
          className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500"
        >
          Wallet not connected
        </button>
      )
    }

    if(isLoading) {
      return (
        <button
          type="button"
          onClick={closeModalAndReset}
          className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500"
        >
          Loading wallet
        </button>
      )
    }

    if(isError) {
      return (
        <button
          type="button"
          onClick={closeModalAndReset}
          className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500"
        >
          Can't load the wallet
        </button>
      )
    }

    if(vp>0) {
      return (
        <button
          type="button"
          onClick={vote}
          className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500"
          >
          {submitting ? "Submitting..." : "Submit vote"}
        </button>
      )
    }

    return (
      <button
        type="button"
        onClick={closeModalAndReset}
        className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500"
      >
      Close
      </button>
    )
  }

  return (
    <Transition.Root show={modalIsOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" open={modalIsOpen} onClose={closeModalAndReset}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="hidden fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity md:block" />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-stretch md:items-center justify-center min-h-full text-center md:px-2 lg:px-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
              enterTo="opacity-100 translate-y-0 md:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 md:scale-100"
              leaveTo="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
            >
              <Dialog.Panel className="flex text-base text-left transform transition w-full md:max-w-2xl md:px-4 md:my-8 lg:max-w-4xl">
                <div className="w-full relative flex items-center bg-white px-4 pt-14 pb-8 overflow-hidden shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8">
                  <button
                    type="button"
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 sm:top-8 sm:right-6 md:top-6 md:right-6 lg:top-8 lg:right-8"
                    onClick={closeModalAndReset}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  <div className="w-full grid grid-cols-1 gap-y-8 gap-x-6 items-start sm:grid-cols-12 lg:gap-x-8">
                    {/* <div className="sm:col-span-4 lg:col-span-5">
                      <div className="aspect-w-1 aspect-h-1 rounded-lg bg-gray-100 overflow-hidden">
                        <img src={product.imageSrc} alt={product.imageAlt} className="object-center object-cover" />
                      </div>
                      <p className="absolute top-4 left-4 text-center sm:static sm:mt-6">
                        <a href={product.href} className="font-medium text-indigo-600 hover:text-indigo-500">
                          View full details
                        </a>
                      </p>
                    </div> */}
                    <div className="sm:col-span-12 lg:col-span-12">
                      <h2 className="text-2xl font-bold text-gray-900 sm:pr-12">{proposal.title}</h2>

                      <section aria-labelledby="information-heading" className="mt-4">
                        <h3 id="information-heading" className="sr-only">
                          Proposal information
                        </h3>

                        <div className="flex items-center">
                          <p className="text-lg text-gray-900 sm:text-xl">Votes: {proposal.votes}</p>

                          <div className="ml-4 pl-4 border-l border-gray-300">
                            <h4 className="sr-only">Scores</h4>
                            <div className="flex items-center">
                              <div className="flex items-center">
                                Scores: {formatNumber(proposal.scores_total)}&nbsp;{proposal.quorum>0 && `(${(proposal.scores_total*100/proposal.quorum).toFixed()}% of quorum)`}
                              </div>
                              <p className="sr-only">{proposal.scores_total} out of {proposal.quorum} quorum</p>
                            </div>
                          </div>
                        </div>

                        {vp > 0 ? (
                          <div className="mt-6 flex items-center">
                            <CheckIcon className="flex-shrink-0 w-5 h-5 text-green-500" aria-hidden="true" />
                            <p className="ml-2 font-medium text-gray-500">Your voting power: {formatNumber(vp)}</p>
                          </div>
                        ) : (
                          <div className="mt-6 flex items-center">
                            <ExclamationIcon className="flex-shrink-0 w-5 h-5 text-yellow-500" aria-hidden="true" />
                            <p className="ml-2 font-medium text-gray-500">You have no voting power</p>
                          </div>
                        )}
                      </section>

                      <section aria-labelledby="options-heading" className="mt-6">
                        <h3 id="options-heading" className="sr-only">
                          Voting options
                        </h3>

                        <form>
                          <div className="sm:flex sm:justify-between">
                            {/* Option selector */}
                            <RadioGroup value={selectedOption} onChange={setSelectedOption}>
                              <RadioGroup.Label className="block text-sm font-medium text-gray-700">
                                Options
                              </RadioGroup.Label>
                              <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {proposal.choices.map((choice, index) => (
                                  <RadioGroup.Option
                                    as="div"
                                    key={choice}
                                    value={index+1}
                                    className={({ active }) =>
                                      classNames(
                                        active ? 'ring-2 ring-indigo-500' : '',
                                        'relative block border border-gray-300 rounded-lg p-4 cursor-pointer focus:outline-none'
                                      )
                                    }
                                  >
                                    {({ active, checked }) => (
                                      <>
                                        <RadioGroup.Label as="p" className="text-base font-medium text-gray-900">
                                          {choice}
                                        </RadioGroup.Label>
                                        {/* <RadioGroup.Description as="p" className="mt-1 text-sm text-gray-500">
                                          {size.description}
                                        </RadioGroup.Description> */}
                                        <div
                                          className={classNames(
                                            active ? 'border' : 'border-2',
                                            checked ? 'border-indigo-500' : 'border-transparent',
                                            'absolute -inset-px rounded-lg pointer-events-none'
                                          )}
                                          aria-hidden="true"
                                        />
                                      </>
                                    )}
                                  </RadioGroup.Option>
                                ))}
                              </div>
                            </RadioGroup>
                          </div>
                          <div className="mt-2">
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                              Reason
                            </label>
                            <div className="mt-1">
                              <textarea
                                rows={3}
                                maxLength={140}
                                name="reason"
                                id="reason"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Vote button and error info */}
                          {error && (
                            <div className="mt-6 flex items-center">
                              <ExclamationIcon className="flex-shrink-0 w-5 h-5 text-red-500" aria-hidden="true" />
                              <p className="ml-2 font-medium text-gray-500">{error.error_description || error.message}</p>
                            </div>
                          )}
                          <div className="mt-6">
                            {renderVoteButton()}
                          </div>
                          {/* <div className="mt-6 text-center">
                            <a href="#" className="group inline-flex text-base font-medium">
                              <ShieldCheckIcon
                                className="flex-shrink-0 mr-2 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                              />
                              <span className="text-gray-500 group-hover:text-gray-700">Lifetime Guarantee</span>
                            </a>
                          </div> */}
                        </form>
                      </section>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
