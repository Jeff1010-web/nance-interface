import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useCurrentFundingCycleV2 } from '../../hooks/juicebox/CurrentFundingCycle';
import useTerminalFee from '../../hooks/juicebox/TerminalFee';
import { useDistributionLimit } from '../../hooks/juicebox/DistributionLimit';
import { useCurrentSplits } from '../../hooks/juicebox/CurrentSplits';
import { JBConstants, JBSplit } from '../../models/JuiceboxTypes';
import { FundingCycleConfigProps, SplitEntry, formatCurrency, formattedSplit, keyOfSplit } from '../juicebox/ReconfigurationCompare';
import FormattedAddress from '../FormattedAddress';
import { BigNumber } from 'ethers';
import { ProposalsPacket } from '../../models/NanceTypes';

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

// TODOs:
// ✅ get current funding cycle configuration
// * gather all payout and reserve actions in current cycle
// * find out those entries got updated by actions
// * table layout
// * two-step modal
// * gather transfer and customTransaction actions
// * submit txns to safe
// * support tenderly simulation
// * peak queued reconfiguration in safe
export default function QueueExecutionModal({ open, setOpen, juiceboxProjectId, proposals }: {
    open: boolean, setOpen: (o: boolean) => void,
    juiceboxProjectId: number,
    proposals: ProposalsPacket | undefined
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
  const actionMap = proposals?.proposals?.map(p => {
    return {
        pid: p.proposalId,
        actions: p.actions
    }
  })

  const loading = fcIsLoading || feeIsLoading || targetIsLoading || payoutModsIsLoading || ticketModsIsLoading;
  if (!loading) {
    console.debug("QueueExecutionModal.currentConfig", currentConfig, actionMap);
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
