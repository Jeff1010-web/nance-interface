import { useState, Fragment, useEffect } from "react"
import useVotingPower from "../hooks/snapshot/VotingPower"
import { Dialog, RadioGroup, Transition } from '@headlessui/react'
import { SnapshotProposal } from "../hooks/snapshot/Proposals"
import { XIcon } from '@heroicons/react/outline'
import { CheckIcon, ExclamationIcon } from '@heroicons/react/solid'
import Notification from "./Notification"
import useVote from "../hooks/snapshot/Vote"
import { useForm } from "react-hook-form"

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact", compactDisplay: "short" });
const formatNumber = (num) => formatter.format(num);

interface VotingProps {
  modalIsOpen: boolean
  closeModal: () => void
  address: string
  spaceId: string
  spaceHideAbstain: boolean
  proposal: SnapshotProposal
  refetch: (option?: any) => void
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const SUPPORTED_VOTING_TYPES = ['single-choice', 'basic', 'weighted']

export default function VotingModal({ modalIsOpen, closeModal, address, spaceId, spaceHideAbstain, proposal, refetch }: VotingProps) {
  // state
  const [choice, setChoice] = useState(undefined);
  const [reason, setReason] = useState('');
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  // external
  const { data: vp, loading: vpLoading } = useVotingPower(address, spaceId, proposal?.id || '');
  const { trigger, value, loading, error, reset } = useVote(spaceId, proposal?.id, proposal?.type, choice, reason);

  // shorthand functions
  const submitVote = () => {
    //setNotificationEnabled(true);
    trigger().then(close).then(refetch);
  }
  const close = () => {
    setNotificationEnabled(false);
    reset();
    closeModal();
  }

  if (proposal === undefined) {
    return <div className="hidden">Proposal not selected</div>
  }

  const hideAbstain = spaceHideAbstain && proposal.type === "basic";
  const totalScore = hideAbstain ?
    proposal.scores_total - (proposal?.scores[2] ?? 0)
    : proposal.scores_total;

  const renderVoteButton = () => {
    let canVote = false;
    let label = "Close";

    if (address == '') {
      label = "Wallet not connected";
    } else if (loading) {
      label = "Loading...";
    } else if (!SUPPORTED_VOTING_TYPES.includes(proposal.type)) {
      label = "Not supported"
    } else if (choice === undefined) {
      label = "You need to select a choice";
    } else if (vp > 0) {
      label = "Submit vote";
      canVote = true;
    } else {
      label = "Close";
    }

    return (
      <button
        type="button"
        disabled={!canVote}
        onClick={canVote ? submitVote : close}
        className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white disabled:bg-gray-400 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500"
      >
        {label}
      </button>
    )
  }

  return (
    <Transition.Root show={modalIsOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" open={modalIsOpen} onClose={close}>
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
                    onClick={close}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  <div className="w-full grid grid-cols-1 gap-y-8 gap-x-6 items-start sm:grid-cols-12 lg:gap-x-8">
                    {value &&
                      <Notification title="Vote result" description="Success!" show={notificationEnabled} close={close} checked={true} autoClose={true} />
                    }
                    {error &&
                      <Notification title="Vote result" description={error.error_description || error.message} show={notificationEnabled} close={() => {
                        setNotificationEnabled(false);
                        reset();
                      }} checked={false} />
                    }
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
                                Scores: {formatNumber(totalScore)}&nbsp;{proposal.quorum > 0 && `(${(totalScore * 100 / proposal.quorum).toFixed()}% of quorum)`}
                              </div>
                              <p className="sr-only">{totalScore} out of {proposal.quorum} quorum</p>
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
                            <p className="ml-2 font-medium text-gray-500">{vpLoading ? "Loading..." : "You have no voting power"}</p>
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
                            {(proposal.type == 'single-choice' || proposal.type == "basic") && (
                              <BasicChoiceSelector value={choice} setValue={setChoice} choices={proposal.choices} />
                            )}
                            {proposal.type == 'weighted' && (
                              <WeightedChoiceSelector value={choice} setValue={setChoice} choices={proposal.choices} />
                            )}
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
                                className="resize-none block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Vote button and error info */}
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

interface SelectorProps {
  value: any
  setValue: (value: any) => void
  choices: string[]
}

function BasicChoiceSelector({ value, setValue, choices }: SelectorProps) {
  return (
    <RadioGroup value={value} onChange={setValue}>
      <RadioGroup.Label className="block text-sm font-medium text-gray-700">
        Options
      </RadioGroup.Label>
      <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {choices.map((choice, index) => (
          <RadioGroup.Option
            as="div"
            key={choice}
            value={index + 1}
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
  )
}

function WeightedChoiceSelector({ value, setValue, choices }: Omit<SelectorProps, 'value'> & { value: { [key: string]: number } }) {
  const { register, getValues, watch } = useForm();

  useEffect(() => {
    // sync form state
    const subscription = watch((_) => {
      const values = getValues();
      const newValue = {};
      // remove empty values
      for (const key in values) {
        const val = values[key]
        if (!isNaN(val) && val > 0) {
          newValue[key] = val;
        }
      }
      setValue(newValue);
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const totalUnits = Object.values(value ?? {}).reduce((a, b) => a + b, 0);

  return (
    <div className="mt-1 grid grid-cols-1 gap-4">
      {choices.map((choice, index) => (
        <div key={choice} className="flex gap-2 rounded-lg border-1 p-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
          <label className="w-3/5">{choice}</label>
          <input className="w-1/5 rounded-lg" type="number" placeholder="0" min={0} step={1} {...register((index + 1).toString(), { shouldUnregister: true, valueAsNumber: true })} />
          <span className="italic w-1/5">
            {(isNaN(getValues((index + 1).toString())) || totalUnits == 0) ?
              "0%" :
              `${Math.round(getValues((index + 1).toString()) / totalUnits * 100)}%`}
          </span>
        </div>
      ))}
    </div>
  )
}
