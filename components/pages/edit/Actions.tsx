import { SquaresPlusIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { utils } from "ethers";
import { useState, useContext, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useSpaceInfo } from "../../../hooks/NanceHooks";
import useProjectInfo from "../../../hooks/juicebox/ProjectInfo";
import { Action } from "../../../models/NanceTypes";
import { ProposalMetadataContext } from "../../../pages/s/[space]/edit";
import ActionPalettes, { ActionItem } from "./ActionPalettes";
import CustomTransactionActionForm from "./CustomTransactionActionForm";
import PayoutActionForm from "./PayoutActionForm";
import ReserveActionForm from "./ReserveActionForm";
import TransferActionForm from "./TransferActionForm";

export default function Actions({ loadedActions }: { loadedActions: Action[] }) {
  const [open, setOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionItem>();

  const { register, getValues } = useFormContext();
  const { fields, append, remove, replace } = useFieldArray<{
    actions: Action[];
    [key: string]: any;
  }>({ name: "proposal.actions" });

  const {space} = useContext(ProposalMetadataContext);
  const { data: spaceInfo } = useSpaceInfo({space});
  const projectId = spaceInfo?.data?.juiceboxProjectId;
  const { data: projectInfo, loading: infoIsLoading } = useProjectInfo(3, parseInt(projectId ?? ""));
  const projectOwner = projectInfo?.owner ? utils.getAddress(projectInfo.owner) : "";

  const newAction = (a: ActionItem) => {
    setOpen(false);
    append({ type: a.name, payload: {} });
  };

  const genFieldName = (index: number) => {
    return (field: string) => `proposal.actions.${index}.payload.${field}` as const;
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
            <div key={field.id} className="mt-4 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-xl">Payout</h3>
                <XMarkIcon className="w-5 h-5 cursor-pointer" onClick={() => remove(index)} />
              </div>
              <input
                type="text"
                {...register(`proposal.actions.${index}.type`, { shouldUnregister: true, value: field.type })}
                className="hidden"
              />
              <PayoutActionForm genFieldName={genFieldName(index)} />
            </div>
          );
        } else if (field.type === "Transfer") {
          return (
            <div key={field.id} className="mt-4 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-xl">Transfer</h3>
                <XMarkIcon className="w-5 h-5 cursor-pointer" onClick={() => remove(index)} />
              </div>
              <input
                type="text"
                {...register(`proposal.actions.${index}.type`, { shouldUnregister: true, value: field.type })}
                className="hidden"
              />
              <TransferActionForm genFieldName={genFieldName(index)} />
            </div>
          );
        } else if (field.type === "Reserve") {
          return (
            <div key={field.id} className="mt-4 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-xl">Reserve</h3>
                <XMarkIcon className="w-5 h-5 cursor-pointer" onClick={() => remove(index)} />
              </div>
              <input
                type="text"
                {...register(`proposal.actions.${index}.type`, { shouldUnregister: true, value: field.type })}
                className="hidden"
              />
              <ReserveActionForm genFieldName={genFieldName(index)} />
            </div>
          );
        } else if (field.type === "Custom Transaction") {
          return (
            <div key={field.id} className="mt-4 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-xl">Custom Transaction</h3>
                <XMarkIcon className="w-5 h-5 cursor-pointer" onClick={() => remove(index)} />
              </div>
              <input
                type="text"
                {...register(`proposal.actions.${index}.type`, { shouldUnregister: true, value: field.type })}
                className="hidden"
              />
              <CustomTransactionActionForm genFieldName={genFieldName(index)} projectOwner={projectOwner} />
            </div>
          );
        } else {
          return (
            <div key={field.id} className="mt-4 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-xl">{field.type}</h3>
                <XMarkIcon className="w-5 h-5 cursor-pointer" onClick={() => remove(index)} />
              </div>
            </div>
          );
        }
      })}

      <div className="bg-white p-8 mt-4 shadow rounded-lg flex flex-col items-center justify-center hover:cursor-pointer"
        onClick={() => setOpen(true)}>
        <div className="w-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8">
          <SquaresPlusIcon className="w-14 h-14 text-gray-400" />
          <p className="mt-2 font-medium text-l">Add an action</p>
          <p className="text-gray-500 text-sm mt-6">
            {/* <InformationCircleIcon className="h-5 w-5 inline mr-1 mb-0.5" /> */}
            Specify this proposal{"'"}s onchain actions
          </p>
        </div>
      </div>

      <ActionPalettes open={open} setOpen={setOpen} selectedAction={selectedAction} setSelectedAction={newAction} />
    </div>
  );
}