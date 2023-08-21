import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useCurrentFundingCycleV3 } from '../../../hooks/juicebox/CurrentFundingCycle';
import { useDistributionLimit } from '../../../hooks/juicebox/DistributionLimit';
import { useCurrentSplits } from '../../../hooks/juicebox/CurrentSplits';
import { CURRENCY_USD, ETH_TOKEN_ADDRESS, JBConstants, JBFundingCycleData } from '../../../models/JuiceboxTypes';
import { FundingCycleConfigProps, diff2TableEntry, formatCurrency } from '../../juicebox/ReconfigurationCompare';
import { BigNumber, utils } from 'ethers';
import { ProposalsPacket, Reserve } from '../../../models/NanceTypes';
import { useCurrentPayouts } from '../../../hooks/NanceHooks';
import TableWithSection, { SectionTableData } from '../../form/TableWithSection';
import SafeTransactionCreator from '../../safe/SafeTransactionCreator';
import { payoutsDiffOf, reservesDiffOf } from '../../../libs/juicebox';
import useControllerOfProject from '../../../hooks/juicebox/ControllerOfProject';
import { ZERO_ADDRESS } from '../../../constants/Contract';
import useTerminalOfProject from '../../../hooks/juicebox/TerminalOfProject';
import useProjectInfo from '../../../hooks/juicebox/ProjectInfo';

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
  const { data: projectInfo, loading: infoIsLoading } = useProjectInfo(3, projectId);
  const owner = projectInfo?.owner ? utils.getAddress(projectInfo.owner) : "";
  const { value: controller, version } = useControllerOfProject(projectId);
  const { value: terminal } = useTerminalOfProject(projectId);
  const { value: _fc, loading: fcIsLoading } = useCurrentFundingCycleV3(projectId);
  const [fc, metadata] = _fc || [];
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
      fee: zero,
      currency: currency?.sub(1) || zero,
      target: target || zero,
      configuration: fc?.configuration || zero
    },
    metadata: metadata!,
    payoutMods: payoutMods || [],
    ticketMods: ticketMods || [],
  };

  // Gather all payout and reserve actions in current fundingCycle
  const actionWithPIDArray = proposals?.proposals
    // only gather approved actions
    ?.filter(p => p.actions.length > 0 && (p.status === "Voting" || p.status === "Approved"))
    .flatMap(p => {
      return p.actions?.map(action => {
        return {
          pid: p.proposalId || 0,
          action
        }
      })
  });

  // Splits with changes
  const payoutsDiff = payoutsDiffOf(currentConfig, currentCycle, payoutMods || [], nancePayouts?.data || [], actionWithPIDArray?.filter((v) => v.action.type === "Payout") || []);
  const actionReserve = actionWithPIDArray?.find(v => v.action.type === "Reserve");
  const reservesDiff = reservesDiffOf(ticketMods ?? [], (actionReserve?.action.payload as Reserve), actionReserve?.pid ?? 0)

  // Table data
  const tableData: SectionTableData[] = [
    {
      section: "Overall",
      entries: [
        {
          id: "distributionLimit",
          title: "Distribution Limit",
          proposal: 0,
          oldVal: formatCurrency(currentConfig.fundingCycle.currency, currentConfig.fundingCycle.target),
          newVal: formatCurrency(currentConfig.fundingCycle.currency, payoutsDiff.newTotal),
          status: payoutsDiff.newTotal.eq(currentConfig.fundingCycle.target) ? "Keep" : "Edit",
          valueToBeSorted: 0
        }
      ]
    },
    {
      section: "Distribution",
      entries: []
    },
    {
      section: "Reserve Token",
      entries: []
    }
  ];
  
  // Payout Diff
  Object.values(payoutsDiff.new).forEach(diff2TableEntry(1, "Add", tableData));
  Object.values(payoutsDiff.change).forEach(diff2TableEntry(1, "Edit", tableData));
  Object.values(payoutsDiff.expire).forEach(diff2TableEntry(1, "Remove", tableData));
  Object.values(payoutsDiff.keep).forEach(diff2TableEntry(1, "Keep", tableData));
  tableData[1].entries.sort((a, b) => b.valueToBeSorted - a.valueToBeSorted);
  // Reserve Diff
  Object.values(reservesDiff.new).forEach(diff2TableEntry(2, "Add", tableData));
  Object.values(reservesDiff.change).forEach(diff2TableEntry(2, "Edit", tableData));
  Object.values(reservesDiff.expire).forEach(diff2TableEntry(2, "Remove", tableData));
  Object.values(reservesDiff.keep).forEach(diff2TableEntry(2, "Keep", tableData));
  tableData[2].entries.sort((a, b) => b.valueToBeSorted - a.valueToBeSorted);

  const loading = fcIsLoading || metadata === undefined || targetIsLoading || payoutModsIsLoading || ticketModsIsLoading || nancePayoutsLoading;

  // Construct reconfiguration function data
  const BIG_ZERO = BigNumber.from(0);
  const jbFundingCycleData: JBFundingCycleData = {
    duration: fc?.duration || BIG_ZERO,
    weight: fc?.weight || BIG_ZERO,
    discountRate: fc?.discountRate || BIG_ZERO,
    ballot: fc?.ballot || ZERO_ADDRESS
  }
  const reconfigurationRawData = [
    BigNumber.from(projectId),                       // _projectId
    jbFundingCycleData,                              // _data
    metadata,                                        // _metadata
    BigNumber.from(Math.floor(Date.now() / 1000)),   // _mustStartAtOrAfter
    [                                                // _groupedSplits
      {
        group: JBConstants.SplitGroup.ETH,
        // gather JBSplit of payoutsDiff.new .change .keep
        splits: Object.values(payoutsDiff.new).concat(Object.values(payoutsDiff.change)).concat(Object.values(payoutsDiff.keep)).map(v => v.split)
      },
      {
        group: JBConstants.SplitGroup.RESERVED_TOKEN,
        // gather JBSplit of reservesDiff.new .change .keep
        splits: Object.values(reservesDiff.new).concat(Object.values(reservesDiff.change)).concat(Object.values(reservesDiff.keep)).map(v => v.split)
      }
    ],
    [{                                                // _fundAccessConstraints
      terminal: terminal.address,
      token: ETH_TOKEN_ADDRESS,
      distributionLimit: payoutsDiff.newTotal,
      distributionLimitCurrency: CURRENCY_USD,
      overflowAllowance: BIG_ZERO,
      overflowAllowanceCurrency: BIG_ZERO
    }],
    "Queued from Nance.QueueExecutionFlow"           // _memo
  ];
  const encodeReconfiguration = !loading ? controller?.interface?.encodeFunctionData("reconfigureFundingCyclesOf", reconfigurationRawData) || "" : "";

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
                    
                    <TableWithSection space={space} tableData={tableData} />
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  {/* <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={() => setOpen(false)}
                  >
                    Next
                  </button> */}
                  <div className="sm:ml-3 sm:w-auto">
                    <SafeTransactionCreator safeAddress={owner} toContract={controller?.address || ""} data={encodeReconfiguration} value={0} defaultNonce="0" />
                  </div>

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
