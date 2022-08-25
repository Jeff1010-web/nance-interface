import { useContext, useState, Fragment } from "react"
import useVotingPower from "../hooks/VotingPower"
import { Web3Context } from "../pages/snapshot/[space]"
import snapshot from '@snapshot-labs/snapshot.js'
import { Dialog, RadioGroup, Transition } from '@headlessui/react'
import { ProposalDataExtended } from "../hooks/ProposalsExtendedOf"
import { ShieldCheckIcon, XIcon } from '@heroicons/react/outline'
import { CheckIcon, QuestionMarkCircleIcon, StarIcon } from '@heroicons/react/solid'

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
    shouldOpen?: boolean
}

const product = {
  name: 'Everyday Ruck Snack',
  price: '$220',
  rating: 3.9,
  href: '#',
  imageSrc: 'https://tailwindui.com/img/ecommerce-images/product-quick-preview-03-detail.jpg',
  imageAlt: 'Interior of light green canvas bag with padded laptop sleeve and internal organization pouch.',
  sizes: [
    { name: '18L', description: 'Perfect for a reasonable amount of snacks.' },
    { name: '20L', description: 'Enough room for a serious amount of snacks.' },
  ],
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function VotingModal({modalIsOpen, closeModal, address, spaceId, proposal}: VotingProps) {
  const [selectedOption, setSelectedOption] = useState(1);
  const web3 = useContext(Web3Context);
  const { data: vp, loading } = useVotingPower(address, spaceId, proposal.id);

  const vote = async () => {
    try {
        const receipt = await client.vote(web3, address, {
            space: spaceId,
            proposal: proposal.id,
            type: 'single-choice',
            choice: selectedOption,
            app: 'juicetool'
        });
        console.info("📗 VotingModal ->", {spaceId, proposal, selectedOption}, receipt);
        closeModal();
    } catch (e) {
        console.error("🔴 VotingModal ->", e);
    }
}

  return (
    <Transition.Root show={modalIsOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
                    onClick={closeModal}
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

                        <div className="mt-6 flex items-center">
                          <CheckIcon className="flex-shrink-0 w-5 h-5 text-green-500" aria-hidden="true" />
                          <p className="ml-2 font-medium text-gray-500">Your voting power: {formatNumber(vp)}</p>
                        </div>
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
                          {/* <div className="mt-4 flex">
                            <a href="#" className="group flex text-sm text-gray-500 hover:text-gray-700">
                              <span>What size should I buy?</span>
                              <QuestionMarkCircleIcon
                                className="flex-shrink-0 ml-2 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                              />
                            </a>
                          </div> */}
                          <div className="mt-6">
                            <button
                              type="button"
                              onClick={vote}
                              className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500"
                            >
                              Submit vote
                            </button>
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
