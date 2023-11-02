import { Disclosure } from "@headlessui/react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useContext, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { ZERO_ADDRESS } from "../../../constants/Contract";
import { useSpaceInfo } from "../../../utils/hooks/NanceHooks";
import { useCurrentFundingCycle } from "../../../utils/hooks/juicebox/CurrentFundingCycle";
import { useCurrentSplits } from "../../../utils/hooks/juicebox/CurrentSplits";
import { JBConstants } from "../../../models/JuiceboxTypes";
import { JBSplitNanceStruct } from "../../../models/NanceTypes";
import GenericButton from "../../GenericButton";
import AddressForm from "../../form/AddressForm";
import BooleanForm from "../../form/BooleanForm";
import NumberForm from "../../form/NumberForm";
import ProjectForm from "../../form/ProjectForm";
import JBSplitEntry from "../../juicebox/JBSplitEntryDetailed";
import { ProposalMetadataContext } from "../../../pages/s/[space]/edit";

export default function ReserveActionForm({ genFieldName }:
  { genFieldName: (field: string) => any }) {

  const { space } = useContext(ProposalMetadataContext);

  const { watch, formState: { errors } } = useFormContext();
  const { fields, append, remove, prepend } = useFieldArray<{
    splits: JBSplitNanceStruct[];
    [key: string]: any;
  }>({ name: genFieldName("splits") });

  const { data: spaceInfo } = useSpaceInfo({ space });
  const projectId = spaceInfo?.data?.juiceboxProjectId;
  const { value: _fc, loading: fcIsLoading } = useCurrentFundingCycle(projectId);
  const [fc, metadata] = _fc || [];
  const { value: ticketMods, loading: ticketModsIsLoading } = useCurrentSplits(projectId, fc?.configuration, JBConstants.SplitGroup.RESERVED_TOKEN);
  // TODO: reserve rate, percent / total_percentage JBConstants

  useEffect(() => {
    if (fields.length === 0) { // if no splits in proposal (not editing) then load from JB project
      const arr = ticketMods ? [...ticketMods] : [];
      arr.sort((a, b) => b.percent.sub(a.percent).toNumber());
      arr.forEach(ticket => {
        const split: JBSplitNanceStruct = {
          preferClaimed: ticket.preferClaimed,
          preferAddToBalance: ticket.preferAddToBalance,
          percent: ticket.percent.toNumber(),
          projectId: ticket.projectId.toNumber(),
          beneficiary: ticket.beneficiary,
          lockedUntil: ticket.lockedUntil.toNumber(),
          allocator: ticket.allocator || ""
        };
        append(split);
      });
    }
  }, [ticketMods, append, fields]);

  return (
    <div className="flex flex-col gap-6">
      <GenericButton onClick={() => prepend({
        preferClaimed: false,
        preferAddToBalance: false,
        percent: 0,
        projectId: 0,
        beneficiary: ZERO_ADDRESS,
        lockedUntil: 0,
        allocator: ZERO_ADDRESS
      })} className="mt-6">
        <PlusIcon className="w-5 h-5" />
        <p className="ml-1">Add a receipient</p>
      </GenericButton>

      {ticketModsIsLoading && (
        <>
          <div className="w-full h-12 animate-pulse bg-blue-100 rounded-md shadow-sm p-4"></div>
          <div className="w-full h-12 animate-pulse bg-blue-100 rounded-md shadow-sm p-4"></div>
          <div className="w-full h-12 animate-pulse bg-blue-100 rounded-md shadow-sm p-4"></div>
        </>
      )}

      {(fields as any)?.map((field: JBSplitNanceStruct & { id: string }, index: number) => (
        <Disclosure key={field.id} as="div" className="rounded-md bg-blue-100 shadow-sm p-4" defaultOpen={field.beneficiary === ZERO_ADDRESS}>
          <Disclosure.Button as="div" className="flex space-x-6">
            <span>No.{index}</span>
            <JBSplitEntry beneficiary={watch(genFieldName(`splits.${index}.beneficiary`)) || field.beneficiary} projectId={watch(genFieldName(`splits.${index}.projectId`)) || field.projectId.toString()} allocator={watch(genFieldName(`splits.${index}.allocator`)) || field.allocator} percent={watch(genFieldName(`splits.${index}.percent`)) || field.percent.toString()} preferAddToBalance={watch(genFieldName(`splits.${index}.preferAddToBalance`)) || field.preferAddToBalance} preferClaimed={watch(genFieldName(`splits.${index}.preferClaimed`)) || field.preferClaimed} />
            <TrashIcon className="w-5 h-5 cursor-pointer" onClick={() => remove(index)} />
          </Disclosure.Button>
          <Disclosure.Panel as="div" className="grid grid-cols-4 gap-6 mt-2" unmount={false}>
            <div className="col-span-4 sm:col-span-3">
              <AddressForm label="Beneficiary" fieldName={genFieldName(`splits.${index}.beneficiary`)} defaultValue={field.beneficiary} />
            </div>
            <div className="col-span-4 sm:col-span-1">
              <NumberForm label="Percent" fieldName={genFieldName(`splits.${index}.percent`)} fieldType="per billion" decimal={9} defaultValue={field.percent} />
            </div>

            <div className="col-span-4 sm:col-span-2">
              <ProjectForm label="Project ID" fieldName={genFieldName(`splits.${index}.projectId`)} defaultValue={field.projectId} />
            </div>
            <div className="col-span-4 sm:col-span-2">
              <AddressForm label="Allocator" fieldName={genFieldName(`splits.${index}.allocator`)} defaultValue={field.allocator} />
            </div>

            <div className="col-span-4 sm:col-span-2">
              {/* todo date timestamp param */}
              <NumberForm label="lockedUntil" fieldName={genFieldName(`splits.${index}.lockedUntil`)} fieldType="timestamp" defaultValue={field.lockedUntil} />
            </div>
            <div className="col-span-4 sm:col-span-1">
              <BooleanForm label="preferClaimed" fieldName={genFieldName(`splits.${index}.preferClaimed`)} checked={field.preferClaimed} />
            </div>
            <div className="col-span-4 sm:col-span-1">
              <BooleanForm label="preferAddToBalance" fieldName={genFieldName(`splits.${index}.preferAddToBalance`)} checked={field.preferAddToBalance} />
            </div>
          </Disclosure.Panel>
        </Disclosure>
      ))}
    </div>
  );
}
