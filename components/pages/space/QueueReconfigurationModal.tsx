import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { BigNumber, utils } from 'ethers';
import { Reserve } from '../../../models/NanceTypes';
import { useCurrentPayouts, useProposalsInfinite } from '../../../hooks/NanceHooks';
import DiffTableWithSection, { } from '../../form/DiffTableWithSection';
import { calcDiffTableData, mergePayouts, compareReserves, splitStruct2JBSplit, encodedReconfigureFundingCyclesOf } from '../../../libs/juicebox';
import useControllerOfProject from '../../../hooks/juicebox/ControllerOfProject';
import useTerminalOfProject from '../../../hooks/juicebox/TerminalOfProject';
import useProjectInfo from '../../../hooks/juicebox/ProjectInfo';
import { useReconfigurationOfProject } from '../../../hooks/juicebox/ReconfigurationOfProject';
import parseSafeJuiceboxTx from '../../../libs/SafeJuiceboxParser';
import TransactionCreator from '../../ethereum/TransactionCreator';
import { useRouter } from 'next/router';
import { BooleanParam, NumberParam, StringParam, useQueryParams, withDefault } from 'next-query-params';

export default function QueueReconfigurationModal({ open, setOpen, juiceboxProjectId, space, currentCycle }: {
  open: boolean, setOpen: (o: boolean) => void,
  juiceboxProjectId: number,
  space: string,
  currentCycle: number | undefined
}) {
  const cancelButtonRef = useRef(null);
  const router = useRouter();
  const [query, setQuery] = useQueryParams({
    keyword: StringParam,
    limit: withDefault(NumberParam, 5),
    cycle: StringParam,
    sortBy: withDefault(StringParam, ''),
    sortDesc: withDefault(BooleanParam, true)
  });
  const { cycle, keyword, limit } = query;

  // Get configuration of current fundingCycle
  const projectId = juiceboxProjectId;
  const { data: projectInfo, loading: infoIsLoading } = useProjectInfo(3, projectId);
  const owner = projectInfo?.owner ? utils.getAddress(projectInfo.owner) : "";
  const { value: controller, version } = useControllerOfProject(projectId);
  const { value: terminal } = useTerminalOfProject(projectId);
  const { value: currentConfig, loading: configIsLoading } = useReconfigurationOfProject(projectId);

  // Get registered payouts
  const previousCycle = currentCycle ? (currentCycle - 1).toString() : undefined;
  const { data: nancePayouts, isLoading: nancePayoutsLoading } = useCurrentPayouts(space, previousCycle);

  const { data: proposalDataArray, isLoading: proposalsLoading } = useProposalsInfinite({ space, cycle, keyword, limit }, router.isReady);

  // Gather all payout and reserve actions in current fundingCycle
  const actionWithPIDArray = proposalDataArray?.map(r => r.data?.proposals).flat()
    // only gather approved actions
    ?.filter(p => p.actions.length > 0 && (p.status === "Voting" || p.status === "Approved"))
    .flatMap(p => {
      return p.actions?.map(action => {
        return {
          pid: p.proposalId || 0,
          action
        };
      });
    });

  // Splits with changes
  const payoutsDiff = mergePayouts(currentConfig, currentCycle, currentConfig.payoutMods || [], nancePayouts?.data || [], actionWithPIDArray?.filter((v) => v.action.type === "Payout") || []);
  const actionReserve = actionWithPIDArray?.find(v => v.action.type === "Reserve");
  const reservesDiff = compareReserves(currentConfig.ticketMods ?? [], (actionReserve?.action.payload as Reserve)?.splits.map(splitStruct => splitStruct2JBSplit(splitStruct)) || (currentConfig.ticketMods ?? []), actionReserve?.pid ?? 0);

  const loading = infoIsLoading || configIsLoading || nancePayoutsLoading || proposalsLoading;

  // Construct reconfiguration function data
  const encodeReconfiguration = !loading ? encodedReconfigureFundingCyclesOf(currentConfig, payoutsDiff, reservesDiff, projectId, controller, terminal?.address) || "" : "";

  const tableData = calcDiffTableData(currentConfig,
    parseSafeJuiceboxTx(encodeReconfiguration, "", currentConfig.fundingCycle.fee, BigNumber.from(Math.floor(Date.now() / 1000))),
    payoutsDiff, reservesDiff);

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Queue Juicebox Cycle
                    </Dialog.Title>

                    <DiffTableWithSection space={space} tableData={tableData} loading={loading} />
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <div className="sm:ml-3 sm:w-auto">
                    <TransactionCreator address={owner} transactions={[{
                      to: controller?.address || "",
                      value: "0",
                      data: encodeReconfiguration
                    }]} />
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
