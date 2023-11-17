import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  CustomTransaction,
  Transfer,
  extractFunctionName,
} from "@/models/NanceTypes";
import { getContractLabel } from "@/constants/Contract";
import { Interface, parseUnits } from "ethers/lib/utils";
import {
  BooleanParam,
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from "next-query-params";
import { useProposalsInfinite } from "@/utils/hooks/NanceHooks";
import { useRouter } from "next/router";
import OrderCheckboxTable, {
  TransactionEntry,
} from "../form/OrderCheckboxTable";
import TransferActionLabel from "../ActionLabel/TransferActionLabel";
import CustomTransactionActionLabel from "../ActionLabel/CustomTransactionActionLabel";
import TransactionCreator from "./TransactionCreator";
import { SUPPORTED_NFTS } from '@/constants/Nance';
import { useFetchSafeCollectibles } from '@/utils/hooks/SafeHooks';

export default function QueueTransactionsModal({
  open,
  setOpen,
  transactorAddress,
  space,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  transactorAddress?: string;
  space: string;
}) {
  const cancelButtonRef = useRef(null);
  const router = useRouter();
  const [query, setQuery] = useQueryParams({
    keyword: StringParam,
    limit: withDefault(NumberParam, 5),
    cycle: StringParam,
    sortBy: withDefault(StringParam, ""),
    sortDesc: withDefault(BooleanParam, true),
  });
  const { cycle, keyword, limit } = query;

  const { data: proposalDataArray, isLoading: proposalsLoading } =
    useProposalsInfinite({ space, cycle, keyword, limit }, router.isReady);

  const { data: safeCollectibles} = useFetchSafeCollectibles(transactorAddress as string);

  // Gather all actions in current fundingCycle
  const actionWithPIDArray = proposalDataArray
    ?.map((r) => r.data?.proposals)
    .flat()
    // only gather approved actions
    ?.filter(
      (p) =>
        p.actions.length > 0 &&
        (p.status === "Voting" || p.status === "Approved"),
    )
    .flatMap((p) => {
      return p.actions?.map((action) => {
        return {
          pid: p.proposalId || 0,
          action,
        };
      });
    });
  const transferActions = actionWithPIDArray?.filter(
    (v) => v.action.type === "Transfer" && !SUPPORTED_NFTS.includes((v.action.payload as Transfer).contract),
  );
  const nftTransferActions = actionWithPIDArray?.filter(
    (v) => v.action.type === "Transfer" && SUPPORTED_NFTS.includes((v.action.payload as Transfer).contract)
  );
  const customTransactionActions = actionWithPIDArray?.filter(
    (v) => v.action.type === "Custom Transaction",
  );

  // Turn them into entries with constructed transaction data
  const erc20 = new Interface([
    "function transfer(address to, uint256 amount) external returns (bool)",
  ]);
  const transferEntries: TransactionEntry[] =
    transferActions?.map((v) => {
      const transfer = v.action.payload as Transfer;
      return {
        title: <TransferActionLabel transfer={transfer} />,
        proposal: v.pid.toString(),
        transactionData: {
          to: transfer.contract,
          value:
            getContractLabel(transfer.contract) === "ETH"
              ? transfer.amount
              : "0",
          data:
            getContractLabel(transfer.contract) === "ETH"
              ? "0x"
              : erc20.encodeFunctionData("transfer", [
                transfer.to,
                parseUnits(transfer.amount, transfer.decimals),
              ]),
        },
      };
    }) || [];

  if (nftTransferActions) {
    const tokenIds = safeCollectibles?.results.map((nft: any) => {
      return nft.id;
    });
    console.log("tokenIds", tokenIds);
    const erc721 = new Interface([
      "function safeTransferFrom(address from, address to, uint256 tokenId) external",
    ]);
    nftTransferActions?.forEach((v, index) => {
      const transfer = v.action.payload as Transfer;
      if (tokenIds) {
        transferEntries.push({
          title: (
            <div className="line-clamp-5">
              {getContractLabel(transfer.contract)}
              &nbsp;to
              <span className="ml-1">
                {transfer.to}
              </span>
            </div>
          ),
          proposal: v.pid.toString(),
          transactionData: {
            to: transfer.contract,
            value: "0",
            data: erc721.encodeFunctionData("safeTransferFrom", [
              transactorAddress,
              transfer.to,
              tokenIds[index],
            ]),
          },
        });
      }
    });
  }

  const customTransactionEntries: TransactionEntry[] =
    customTransactionActions?.map((v) => {
      const customTransaction = v.action.payload as CustomTransaction;
      const contractInterface = new Interface([customTransaction.functionName]);
      return {
        title: (
          <CustomTransactionActionLabel
            customTransaction={customTransaction}
            space={space}
            uuid={v.action.uuid}
          />
        ),
        proposal: v.pid.toString(),
        transactionData: {
          to: customTransaction.contract,
          value: customTransaction.value,
          data: contractInterface.encodeFunctionData(
            extractFunctionName(customTransaction.functionName),
            customTransaction.args,
          ),
        },
      };
    }) || [];
  const entries = transferEntries.concat(customTransactionEntries);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
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
              <Dialog.Panel className="relative transform overflow-auto rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900"
                    >
                      Queue Transactions
                    </Dialog.Title>

                    <OrderCheckboxTable address={transactorAddress || ""} entries={entries} />
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <div className="sm:ml-3 sm:w-auto">
                    <TransactionCreator
                      address={transactorAddress || ""}
                      transactions={entries.map((e) => e.transactionData)}
                    />
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
