import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useCurrentFundingCycleV2 } from '../../hooks/juicebox/CurrentFundingCycle';
import useTerminalFee from '../../hooks/juicebox/TerminalFee';
import { useDistributionLimit } from '../../hooks/juicebox/DistributionLimit';
import { useCurrentSplits } from '../../hooks/juicebox/CurrentSplits';
import { JBConstants, JBSplit } from '../../models/JuiceboxTypes';
import { FundingCycleConfigProps, SplitEntry, calculateSplitAmount, formatCurrency, formattedSplit, keyOfNancePayout2Split, keyOfPayout2Split, keyOfSplit } from '../juicebox/ReconfigurationCompare';
import FormattedAddress from '../FormattedAddress';
import { BigNumber, utils } from 'ethers';
import { Action, Payout, ProposalsPacket, SQLPayout } from '../../models/NanceTypes';
import { useCurrentPayouts } from '../../hooks/NanceHooks';
import { ZERO_ADDRESS } from '../../constants/Contract';

const configFormatter: {
    name: string;
    getFunc: (fc: FundingCycleConfigProps) => any;
  }[] = [
    { name: 'Reserve rate', getFunc: (fc) => fc.metadata.reservedRate.toNumber() / JBConstants.TotalPercent.ReservedRate[fc.version - 1] * 100 + "%" },
    { name: 'Rdemption rate', getFunc: (fc) => fc.metadata.redemptionRate.toNumber() / JBConstants.TotalPercent.RedemptionRate[fc.version - 1] * 100 + "%" },
    { name: 'Discount rate', getFunc: (fc) => fc.fundingCycle.discountRate.toNumber() / JBConstants.TotalPercent.DiscountRate[fc.version - 1] * 100 + "%" },
    { name: 'Payments', getFunc: (fc) => fc.metadata.pausePay ? "Disabled" : "Enabled" },
    { name: 'Token minting', getFunc: (fc) => fc.metadata.allowMinting ? "Enabled" : "Disabled" },
    { name: 'Terminal migration', getFunc: (fc) => fc.metadata.allowTerminalMigration ? "Enabled" : "Disabled" },
    { name: 'Controller migration', getFunc: (fc) => fc.metadata.allowControllerMigration ? "Enabled" : "Disabled" },
    { name: 'Reconfiguration strategy', getFunc: (fc) => <FormattedAddress key={fc.fundingCycle.ballot} address={fc.fundingCycle.ballot} /> },
    //{name: 'Reconfiguration strategy', getFunc: (fc) => fc.fundingCycle.ballot},
  ];

interface JuiceboxReconfigurationStruct {
    overall: {
        distributionLimit: number,
        discountRate: number,
        redemptionRate: number,
        reserveRate: number,
        reconfigurationStrategy: string,
        pausePay: boolean,
        allowMinting: boolean,
        allowTerminalMigration: boolean,
        allowControllerMigration: boolean
    },
    payouts: JBSplit[],
    reserves: JBSplit[]
}

interface SplitDiffEntry {
  split: JBSplit;
  oldVal: string;
  newVal: string;
  proposalId: number;
  amountUSD: number;
}

interface SplitDiff {
  expire: {
    [key: string]: SplitDiffEntry
  },
  new: {
    [key: string]: SplitDiffEntry
  },
  change: {
    [key: string]: SplitDiffEntry
  },
  keep: {
    [key: string]: SplitDiffEntry
  }
}

const BIG_ZERO = BigNumber.from(0);
function payoutsDiffOf(config: FundingCycleConfigProps, currentCycle: number | undefined, onchainPayouts: JBSplit[], registeredPayouts: SQLPayout[], actionPayouts: {pid: number, action: Action}[]) {
  const diff: SplitDiff = {
    expire: {},
    new: {},
    change: {},
    keep: {}
  }

  // Maps
  const registeredPayoutMap = new Map<string, SQLPayout>();
  const actionPayoutMap = new Map<string, {pid: number, action: Action}>();
  registeredPayouts.forEach(payout => registeredPayoutMap.set(keyOfNancePayout2Split(payout), payout));
  actionPayouts.forEach(action => actionPayoutMap.set(keyOfPayout2Split((action.action.payload as Payout)), action));

  // Calculate diff
  //  abc.eth 20% => 100u
  //  1. expired: numberOfPayouts == (currentCycle - governanceCycleStart + 1)
  //  2. added: split not existed before
  //  3. changed: payouts amount changed
  onchainPayouts.forEach(split => {
    const key = keyOfSplit(split);
    const registeredPayout = registeredPayoutMap.get(key);
    const actionPayout = actionPayoutMap.get(key);
    //console.debug("payoutsDiffOf.start.iterate", key, split, registeredPayout, actionPayout);

    if (actionPayout) {
      // Amount change or refresh
      diff.change[key] = {
        split,
        proposalId: actionPayout.pid,
        oldVal: formattedSplit(
            split.percent || BigNumber.from(0),
            config.fundingCycle.currency,
            config.fundingCycle.target,
            config.fundingCycle.fee,
            config.version
        ) || "",
        newVal: "",
        amountUSD: (actionPayout.action.payload as Payout).amountUSD
      }
    } else if (registeredPayout) {
      // Will it expire?
      const willExpire = currentCycle && registeredPayout.numberOfPayouts < (currentCycle - registeredPayout.governanceCycleStart + 1)
      if (willExpire) {
        diff.expire[key] = {
          split,
          proposalId: registeredPayout.proposalId || 0,
          oldVal: formattedSplit(
            split.percent || BIG_ZERO,
            config.fundingCycle.currency,
            config.fundingCycle.target,
            config.fundingCycle.fee,
            config.version
          ) || "",
          newVal: "",
          amountUSD: calculateSplitAmount(split.percent, config.fundingCycle.target)
        }
      } else {
        // keep it
        diff.keep[key] = {
          split,
          proposalId: registeredPayout.proposalId || 0,
          oldVal: formattedSplit(
            split.percent || BIG_ZERO,
            config.fundingCycle.currency,
            config.fundingCycle.target,
            config.fundingCycle.fee,
            config.version
          ) || "",
          newVal: "",
          amountUSD: calculateSplitAmount(split.percent, config.fundingCycle.target)
        }
      }
    } else {
      // keep it
      diff.keep[key] = {
        split,
        proposalId: 0,
        oldVal: formattedSplit(
          split.percent || BIG_ZERO,
          config.fundingCycle.currency,
          config.fundingCycle.target,
          config.fundingCycle.fee,
          config.version
        ) || "",
        newVal: "",
        amountUSD: calculateSplitAmount(split.percent, config.fundingCycle.target)
      }
    }

    // Remove map entry so it won't get calculated twice later
    actionPayoutMap.delete(key);
  })

  actionPayoutMap.forEach((action, key) => {
    // New entry
    const payout = action.action.payload as Payout;
    const split: JBSplit = {
      preferClaimed: false,
      preferAddToBalance: false,
      percent: BIG_ZERO,
      lockedUntil: BIG_ZERO,
      beneficiary: payout.address,
      projectId: BigNumber.from(payout.project || 0),
      allocator: ZERO_ADDRESS
    }
    diff.new[key] = {
      split,
      proposalId: action.pid,
      oldVal: "",
      newVal: formattedSplit(
        split.percent || BIG_ZERO,
        config.fundingCycle.currency,
        config.fundingCycle.target,
        config.fundingCycle.fee,
        config.version
      ) || "",
      amountUSD: payout.amountUSD
    }
  })

  // Calculate new distributionLimit and percentages for all payouts if there are changes.
  // FIXME here we assume all project will use USD-based payout, otherwise we need to handle currency
  const isInfiniteLimit = config.fundingCycle.target.gte(JBConstants.UintMax);
  const oldLimit = parseInt(utils.formatEther(config.fundingCycle.target ?? 0));
  let newLimit = oldLimit;
  Object.entries(diff.new).forEach((v) => newLimit += v[1].amountUSD)
  Object.entries(diff.expire).forEach((v) => newLimit -= v[1].amountUSD)
  Object.entries(diff.change).forEach((v) => {
    newLimit -= calculateSplitAmount(v[1].split.percent, config.fundingCycle.target);
    newLimit += v[1].amountUSD;
  })

  // Attention: remining funds should be allocated to project owner

  console.debug("payoutsDiffOf.middle", { diff, isInfiniteLimit, oldLimit, newLimit });
}

export default function QueueExecutionModal({ open, setOpen, juiceboxProjectId, proposals, space, currentCycle }: {
    open: boolean, setOpen: (o: boolean) => void,
    juiceboxProjectId: number,
    proposals: ProposalsPacket | undefined,
    space: string,
    currentCycle: number | undefined
}) {
  const cancelButtonRef = useRef(null);

  // Get configuration of current fundingCycle
  const isV3 = true;
  const projectId = juiceboxProjectId;
  const { value: _fc, loading: fcIsLoading } = useCurrentFundingCycleV2({ projectId, isV3 });
  const [fc, metadata] = _fc || [];
  const { value: fee, loading: feeIsLoading } = useTerminalFee({ version: "3" });
  const { value: _limit, loading: targetIsLoading } = useDistributionLimit(projectId, fc?.configuration, isV3);
  const [target, currency] = _limit || [];
  const { value: payoutMods, loading: payoutModsIsLoading } = useCurrentSplits(projectId, fc?.configuration, JBConstants.SplitGroup.ETH, isV3);
  const { value: ticketMods, loading: ticketModsIsLoading } = useCurrentSplits(projectId, fc?.configuration, JBConstants.SplitGroup.RESERVED_TOKEN, isV3);
  // Get current registered payouts
  const { data: nancePayouts, isLoading: nancePayoutsLoading } = useCurrentPayouts(space);

  // Prepare fundingCycle data
  const zero = BigNumber.from(0);
  const currentConfig: FundingCycleConfigProps = {
    version: 2,
    //@ts-ignore
    fundingCycle: {
      ...fc,
      fee: fee || zero,
      currency: currency?.sub(1) || zero,
      target: target || zero,
      configuration: fc?.configuration || zero
    },
    metadata: metadata!,
    payoutMods: payoutMods || [],
    ticketMods: ticketMods || [],
  };

  // Gather all payout and reserve actions in current fundingCycle
  const actionWithPIDArray = proposals?.proposals?.filter(p => p.actions.length > 0).flatMap(p => {
    return p.actions?.map(action => {
      return {
        pid: p.proposalId || 0,
        action
      }
    })
  })

  // Splits with changes
  payoutsDiffOf(currentConfig, currentCycle, payoutMods || [], nancePayouts?.data || [], actionWithPIDArray?.filter((v) => v.action.type === "Payout") || []);

  const loading = fcIsLoading || feeIsLoading || targetIsLoading || payoutModsIsLoading || ticketModsIsLoading || nancePayoutsLoading;
  if (!loading) {
    console.debug("QueueExecutionModal.currentConfig", currentConfig, actionWithPIDArray);
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Queue Juicebox Cycle
                    </Dialog.Title>
                    <div className="mt-2 ml-2 space-y-2">
                        <p className="rounded-sm bg-gray-300 p-2">Overall</p>
                        <p>
                            <span className="mr-2">
                                Distribution Limit
                            </span>

                            <span>
                                {formatCurrency(currentConfig.fundingCycle.currency, currentConfig.fundingCycle.target)}
                            </span>
                        </p>

                        {/* {!loading && configFormatter.map((config) => (
                            <p key={config.name}>
                                <span className="mr-2">
                                    {config.name}
                                </span>

                                <span>
                                    {config.getFunc(currentConfig)}
                                </span>
                            </p>
                        ))}
                        {loading && (
                            <div className="animate-pulse w-full h-5">
                            </div>
                        )} */}
                        
                        <p className="rounded-sm bg-gray-300 p-2">Distribution</p>
                        {!loading && payoutMods?.map((mod) => (
                            <p key={keyOfSplit(mod)}>
                                <span className="mr-2">
                                    <SplitEntry mod={mod} projectVersion={3} />
                                </span>

                                <span>
                                    {formattedSplit(
                                        mod?.percent || BigNumber.from(0),
                                        currentConfig.fundingCycle.currency,
                                        currentConfig.fundingCycle.target,
                                        currentConfig.fundingCycle.fee,
                                        currentConfig.version
                                    )}
                                </span>
                            </p>
                        ))}

                        <p className="rounded-sm bg-gray-300 p-2">Reserve Tokens</p>
                        {!loading && ticketMods?.map((mod) => (
                            <p key={keyOfSplit(mod)}>
                                <span className="mr-2">
                                    <SplitEntry mod={mod} projectVersion={3} />
                                </span>

                                <span>
                                    {`${(mod.percent.toNumber() / 10000000 ?? 0 / JBConstants.TotalPercent.Splits[2] * 100).toFixed(2)}%`}
                                </span>
                            </p>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={() => setOpen(false)}
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
