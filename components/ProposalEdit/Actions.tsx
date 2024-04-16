import { SquaresPlusIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { utils } from "ethers";
import { useState, useContext, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import useProjectInfo from "@/utils/hooks/juicebox/ProjectInfo";
import { Action } from "@nance/nance-sdk";
import ActionPalettes, { ActionItem } from "./ActionPalettes";
import CustomTransactionActionForm from "./CustomTransactionActionForm";
import PayoutActionForm from "./PayoutActionForm";
import ReserveActionForm from "./ReserveActionForm";
import TransferActionForm from "./TransferActionForm";
import { ProposalMetadataContext } from "./context/ProposalMetadataContext";
import { SafeInjectProvider } from "../SafeInjectIframeCard/context/SafeInjectedContext";
import { SpaceContext } from "@/context/SpaceContext";
import { NetworkContext } from "@/context/NetworkContext";
import { useSwitchNetwork } from "wagmi";
import { getChainByNetworkName } from "config/custom-chains";
import { getChainIdFromName } from "../SafeInjectIframeCard/helpers/utils";

export default function Actions({
  loadedActions,
}: {
  loadedActions: Action[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionItem>();

  const { register, watch } = useFormContext();
  const { fields, append, remove, replace } = useFieldArray<{
    actions: Action[];
    [key: string]: any;
  }>({ name: "proposal.actions" });

  const { space } = useContext(ProposalMetadataContext);
  const spaceInfo = useContext(SpaceContext);
  let network = useContext(NetworkContext).toLowerCase();
  if (network === "ethereum") network = "mainnet";
  const spaceChainName = spaceInfo?.transactorAddress?.network;
  const { switchNetwork } = useSwitchNetwork();
  const projectOwner = spaceInfo?.transactorAddress?.address
    ? utils.getAddress(spaceInfo?.transactorAddress?.address)
    : "";

  const newAction = (a: ActionItem) => {
    setOpen(false);
    append({ type: a.name, payload: {} });
  };

  const genFieldName = (index: number) => {
    return (field: string) =>
      `proposal.actions.${index}.payload.${field}` as const;
  };

  useEffect(() => {
    // load actions
    if (fields.length === 0) {
      replace(loadedActions);
    }
  }, [replace]);

  return (
    <div>
      {fields.map((field: any, index) => {
        if (field.type === "Payout") {
          return (
            <div
              key={field.id}
              className="mt-4 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6"
            >
              <div className="mb-2 flex justify-between">
                <h3 className="text-xl font-semibold">Payout</h3>
                <XMarkIcon
                  className="h-5 w-5 cursor-pointer"
                  onClick={() => remove(index)}
                />
              </div>
              <input
                type="text"
                {...register(`proposal.actions.${index}.type`, {
                  shouldUnregister: true,
                  value: field.type,
                })}
                className="hidden"
              />
              <PayoutActionForm
                genFieldName={genFieldName(index)}
                projectOwner={projectOwner}
              />
            </div>
          );
        } else if (field.type === "Transfer") {
          return (
            <div
              key={field.id}
              className="mt-4 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6"
            >
              <div className="mb-2 flex justify-between">
                <h3 className="text-xl font-semibold">Transfer</h3>
                <XMarkIcon
                  className="h-5 w-5 cursor-pointer"
                  onClick={() => remove(index)}
                />
              </div>
              <input
                type="text"
                {...register(`proposal.actions.${index}.type`, {
                  shouldUnregister: true,
                  value: field.type,
                })}
                className="hidden"
              />
              {spaceChainName !== network ? (
                <div className="flex flex-col items-start">
                  <p>{`Must be on ${spaceChainName} to propose a Transfer`}</p>
                  <button
                    type="button"
                    disabled={!switchNetwork}
                    onClick={() => {
                      switchNetwork?.(
                        getChainByNetworkName(spaceChainName)?.id,
                      );
                    }}
                    className="relative inline-flex items-center gap-x-1.5 rounded-md bg-red-500 px-3 py-3 text-sm font-semibold text-white hover:bg-red-400 focus:z-10 disabled:opacity-50"
                  >
                    {switchNetwork ? "Switch network" : `Not on ${network}`}
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    {...register(`proposal.actions.${index}.payload.chainId`, {
                      shouldUnregister: true,
                      value: getChainByNetworkName(spaceChainName)?.id,
                    })}
                    className="hidden"
                  />
                  <TransferActionForm
                    genFieldName={genFieldName(index)}
                    address={spaceInfo?.transactorAddress?.address || ""}
                  />
                </>
              )}
            </div>
          );
        } else if (field.type === "Reserve") {
          return (
            <div
              key={field.id}
              className="mt-4 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6"
            >
              <div className="mb-2 flex justify-between">
                <h3 className="text-xl font-semibold">Reserve</h3>
                <XMarkIcon
                  className="h-5 w-5 cursor-pointer"
                  onClick={() => remove(index)}
                />
              </div>
              <input
                type="text"
                {...register(`proposal.actions.${index}.type`, {
                  shouldUnregister: true,
                  value: field.type,
                })}
                className="hidden"
              />
              <ReserveActionForm genFieldName={genFieldName(index)} />
            </div>
          );
        } else if (field.type === "Custom Transaction") {
          return (
            <div
              key={field.id}
              className="mt-4 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6"
            >
              <div className="mb-2 flex justify-between">
                <h3 className="text-xl font-semibold">Custom Transaction</h3>
                <XMarkIcon
                  className="h-5 w-5 cursor-pointer"
                  onClick={() => remove(index)}
                />
              </div>
              <p className="text-xs text-gray-500">
                You can input transaction data manually or get them from
                interacting with embed dApp below.
              </p>
              <input
                type="text"
                {...register(`proposal.actions.${index}.type`, {
                  shouldUnregister: true,
                  value: field.type,
                })}
                className="hidden"
              />
              <SafeInjectProvider
                defaultAddress={projectOwner}
                chainId={getChainIdFromName(spaceChainName)}
              >
                <CustomTransactionActionForm
                  genFieldName={genFieldName(index)}
                  projectOwner={projectOwner}
                />
              </SafeInjectProvider>
            </div>
          );
        } else {
          return (
            <div
              key={field.id}
              className="mt-4 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6"
            >
              <div className="mb-2 flex justify-between">
                <h3 className="text-xl font-semibold">{field.type}</h3>
                <XMarkIcon
                  className="h-5 w-5 cursor-pointer"
                  onClick={() => remove(index)}
                />
              </div>
            </div>
          );
        }
      })}

      <div
        id="add-action-button"
        className="mt-4 flex flex-col items-center justify-center rounded-lg bg-white p-8 shadow hover:cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8">
          <SquaresPlusIcon className="h-14 w-14 text-gray-400" />
          <p className="text-l mt-2 font-medium">Add an action</p>
          <p className="mt-6 text-sm text-gray-500">
            {/* <InformationCircleIcon className="h-5 w-5 inline mr-1 mb-0.5" /> */}
            Specify this proposal{"'"}s onchain actions
          </p>
        </div>
      </div>

      <ActionPalettes
        open={open}
        setOpen={setOpen}
        selectedAction={selectedAction}
        setSelectedAction={newAction}
        space={space}
      />
    </div>
  );
}
