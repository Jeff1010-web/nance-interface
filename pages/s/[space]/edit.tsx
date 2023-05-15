import { useContext, useState, Fragment, useEffect } from "react";
import SiteNav from "../../../components/SiteNav";
import { useForm, FormProvider, useFormContext, Controller, SubmitHandler, useFieldArray } from "react-hook-form";
import { useQueryParams, StringParam } from "next-query-params";
import React from "react";
import { useRouter } from "next/router";
import Notification from "../../../components/Notification";
import GenericButton from "../../../components/GenericButton";
import { fetchProposal, useProposalUpload } from "../../../hooks/NanceHooks";
import { imageUpload } from "../../../hooks/ImageUpload";
import { fileDrop } from "../../../hooks/FileDrop";
import { Proposal, ProposalUploadRequest, Action, JBSplitNanceStruct } from "../../../models/NanceTypes";
import { NANCE_DEFAULT_JUICEBOX_PROJECT, NANCE_DEFAULT_SPACE } from "../../../constants/Nance";
import Link from "next/link";

import { useSigner } from "wagmi";
import { JsonRpcSigner } from "@ethersproject/providers";
import { signPayload } from "../../../libs/signer";

import { Editor } from '@tinymce/tinymce-react';

import { markdownToHtml, htmlToMarkdown } from '../../../libs/markdown';
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { CurrencyDollarIcon, LightningBoltIcon, PlusIcon, SwitchVerticalIcon, UserGroupIcon, XIcon } from "@heroicons/react/solid";
import { Combobox, Dialog, Disclosure, Transition } from '@headlessui/react';
import { ErrorMessage } from "@hookform/error-message";
import FunctionSelector from "../../../components/FunctionSelector";
import { FunctionFragment } from "ethers/lib/utils";
import { CONTRACT_MAP, ZERO_ADDRESS } from "../../../constants/Contract";
import { useCurrentFundingCycleV2 } from "../../../hooks/juicebox/CurrentFundingCycle";
import { useCurrentSplits } from "../../../hooks/juicebox/CurrentSplits";
import { JBConstants } from "../../../models/JuiceboxTypes";
import { CheckCircleIcon, TrashIcon } from "@heroicons/react/outline";
import AddressForm from "../../../components/form/AddressForm";
import NumberForm from "../../../components/form/NumberForm";
import BooleanForm from "../../../components/form/BooleanForm";
import StringForm from "../../../components/form/StringForm";
import SelectForm from "../../../components/form/SelectForm";
import ProjectForm from "../../../components/form/ProjectForm";
import JBSplitEntry from "../../../components/juicebox/JBSplitEntry";
import Footer from "../../../components/Footer";

const ProposalMetadataContext = React.createContext({
  loadedProposal: null as Proposal | null
});

export async function getServerSideProps(context) {
  // check proposal parameter type
  console.debug(context.query);
  const proposalParam: string = context.query.proposalId;
  const spaceParam: string = context.params.space;
  let proposalResponse = null;
  if (proposalParam) {
    proposalResponse = await fetchProposal(spaceParam, proposalParam);
    if (proposalResponse?.data) {
      proposalResponse.data.body = await markdownToHtml(proposalResponse.data.body)
    }
  }

  // Pass data to the page via props
  return { props: { space: spaceParam, loadedProposal: proposalResponse?.data || null } }
}

export default function NanceEditProposal({ space, loadedProposal }: { space: string, loadedProposal: Proposal }) {
  const router = useRouter();

  const [query, setQuery] = useQueryParams({
    proposalId: StringParam
  });
  const { proposalId } = query;

  if (!router.isReady) {
    return <p className="mt-2 text-xs text-gray-500 text-center">loading...</p>
  }

  return (
    <>
      <SiteNav
        pageTitle="Edit Proposal"
        description="Create or edit proposal on Nance."
        space={space}
        withWallet />
        
      <div className="m-4 lg:m-6 flex justify-center items-center">
        <div className="max-w-7xl w-full">
          <p className="text-2xl font-bold">
            {proposalId ? "Edit" : "New"} Proposal
          </p>

          <ProposalMetadataContext.Provider value={{ loadedProposal }}>
            <Form space={space} />
          </ProposalMetadataContext.Provider>
        </div>
      </div>

      <Footer />
    </>
  )
}

type ProposalFormValues = Omit<ProposalUploadRequest, "signature">

function Form({ space }: { space: string }) {
  // query and context
  const router = useRouter();
  const metadata = useContext(ProposalMetadataContext);

  // state
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState(undefined);
  const [formErrors, setFormErrors] = useState<string>("");

  // hooks
  const { isMutating, error: uploadError, trigger, data, reset } = useProposalUpload(space, metadata.loadedProposal?.hash, router.isReady);
  const { data: signer, isError, isLoading } = useSigner()
  const jrpcSigner = signer as JsonRpcSigner;
  const { openConnectModal } = useConnectModal();

  const isNew = metadata.loadedProposal === null;

  // form
  const methods = useForm<ProposalFormValues>();
  const { register, handleSubmit, control, formState } = methods;
  const onSubmit: SubmitHandler<ProposalFormValues> = async (formData) => {
    const { hash } = metadata?.loadedProposal ?? {};
    const payload = {
      ...formData.proposal,
      body: await htmlToMarkdown(formData.proposal.body),
      hash
    };
    console.debug("📚 Nance.editProposal.onSubmit ->", { formData, payload })

    setSigning(true);

    signPayload(
      jrpcSigner, space,
      isNew ? "upload" : "edit",
      payload
    ).then((signature) => {

      setSigning(false);
      // send to API endpoint
      reset();
      const req: ProposalUploadRequest = {
        signature,
        proposal: payload
      }
      console.debug("📗 Nance.editProposal.submit ->", req);
      return trigger(req);
    })
      .then(res => router.push(space === NANCE_DEFAULT_SPACE ? `/p/${res.data.hash}` : `/s/${space}/${res.data.hash}`))
      .catch((err) => {
        setSigning(false);
        setSignError(err);
        console.warn("📗 Nance.editProposal.onSignError ->", err);
      });
  }

  // shortcut
  const isSubmitting = signing || isMutating;
  const error = signError || uploadError;
  const resetSignAndUpload = () => {
    setSignError(undefined);
    reset();
  }

  useEffect(() => {
    if(formState.errors && Object.keys(formState.errors).length > 0) {
      const actionErrors = formState.errors.proposal?.actions || [];
      const arr = [];
      actionErrors.forEach((e, i) => {
        if (e) {
          arr.push(i);
        }
      })
      setFormErrors("in actions " + arr.join(', '))
    } else {
      setFormErrors("")
    }
  }, [formState])

  return (
    <FormProvider {...methods} >
      <Notification title="Success" description={`${isNew ? "Created" : "Updated"} proposal ${data?.data.hash}`} show={data !== undefined} close={resetSignAndUpload} checked={true} />
      {(signError || uploadError) &&
        <Notification title="Error" description={error.error_description || error.message || error} show={true} close={resetSignAndUpload} checked={false} />
      }
      <form className="space-y-6 mt-6" onSubmit={handleSubmit(onSubmit)}>
        <Actions loadedActions={metadata.loadedProposal?.actions || []} />

        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
          <div>
            <div className="mt-5 md:mt-0">
              <div className=" gap-6">
                <div className="">
                  <input
                    type="text"
                    {...register("proposal.title", { value: metadata.loadedProposal?.title || "Proposal Title" })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xl"
                  />
                </div>
              </div>

              <div>
                <div className="mt-4">
                  <Controller
                    name="proposal.body"
                    control={control}
                    render={({ field: { onChange, onBlur, value, ref } }) =>
                      <Editor
                        apiKey={process.env.NEXT_PUBLIC_TINY_KEY || 'no-api-key'}
                        onInit={(evt, editor) => console.log(editor.getBody())}
                        initialValue={metadata.loadedProposal?.body || TEMPLATE}
                        value={value}
                        onEditorChange={(newValue, editor) => onChange(newValue)}
                        init={{
                          height: 500,
                          plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'preview',
                            'anchor', 'searchreplace', 'code', 'fullscreen',
                            'insertdatetime', 'table', 'code', 'help', 'wordcount',
                            'image', 'autosave', 'template'
                          ],
                          toolbar: 'restoredraft undo redo | template blocks | ' +
                            'image link table | bold italic forecolor | bullist numlist outdent indent | ' +
                            'preview removeformat | help',
                          menubar: false,
                          block_unsupported_drop: false,
                          images_upload_handler: imageUpload,
                          init_instance_callback: fileDrop,
                          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                          autosave_restore_when_empty: true,
                          templates: [
                            { title: 'Proposal template', description: 'Default for most proposal', content: TEMPLATE }
                          ],
                          relative_urls: false,
                          browser_spellcheck: true,
                        }}
                      />
                    }
                  />
                </div>

              </div>
            </div>
          </div>

          <p className="text-gray-500 text-sm mt-1">
            <CheckCircleIcon className="h-5 w-5 inline mr-1" />
            Drag and drop markdown file or image to attach content
          </p>
        </div>

        {formErrors.length > 0 && (
          <p className="text-red-500 mt-1">
            Form errors: {formErrors}
          </p>
        )}

        <div className="flex justify-end">
          <Link href={space === NANCE_DEFAULT_SPACE ? `/` : `/s/${space}`}>
            <a
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </a>
          </Link>

          {!jrpcSigner && (
            <button onClick={() => openConnectModal()}
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              Connect Wallet
            </button>
          )}

          {jrpcSigner && (
            <button
              type="submit"
              disabled={
                isSubmitting || formErrors.length > 0
                //|| (!isNew && hasVoting)
              }
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              {signing ? 
                (isMutating ? "Submitting..." : "Signing...") : 
                (formErrors.length > 0 ? "Error in form" : "Submit")}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}

function Actions({ loadedActions }: { loadedActions: Action[] }) {
  const [open, setOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<ActionItem>()

  const { register } = useFormContext();
  const { fields, append, remove, replace } = useFieldArray<{
    actions: Action[];
    [key: string]: any;
  }>({ name: "proposal.actions" });

  const newAction = (a: ActionItem) => {
    setOpen(false)
    append({ type: a.name, payload: {} })
  }

  const genFieldName = (index: number) => {
    return (field: string) => `proposal.actions.${index}.payload.${field}` as const
  }

  useEffect(() => {
    // load actions
    if (fields.length === 0) {
      replace(loadedActions)
    }
  }, [replace])

  return (
    <div>
      <div className="bg-white p-8 shadow rounded-lg flex flex-col items-center justify-center">
        <GenericButton onClick={() => setOpen(true)} className="px-3 py-3">
          <PlusIcon className="w-5 h-5" />
          <p className="ml-1 font-semibold text-xl">Add an action</p>
        </GenericButton>
        <p className="text-gray-500 text-sm mt-1">
          <CheckCircleIcon className="h-5 w-5 inline mr-1" />
          Specify on-chain actions you want to execute with current proposal
        </p>
      </div>
      
      {fields.map((field: any, index) => {
        if (field.type === "Payout") {
          return (
            <div key={field.id} className="mt-4 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-xl">Payout</h3>
                <XIcon className="w-5 h-5 cursor-pointer" onClick={() => remove(index)} />
              </div>
              <input
                type="text"
                {...register(`proposal.actions.${index}.type`, { shouldUnregister: true, value: field.type })}
                className="hidden"
              />
              <PayoutActionForm genFieldName={genFieldName(index)} />
            </div>
          )
        } else if (field.type === "Transfer") {
          return (
            <div key={field.id} className="mt-4 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-xl">Transfer</h3>
                <XIcon className="w-5 h-5 cursor-pointer" onClick={() => remove(index)} />
              </div>
              <input
                type="text"
                {...register(`proposal.actions.${index}.type`, { shouldUnregister: true, value: field.type })}
                className="hidden"
              />
              <TransferActionForm genFieldName={genFieldName(index)} />
            </div>
          )
        } else if (field.type === "Reserve") {
          return (
            <div key={field.id} className="mt-4 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-xl">Reserve</h3>
                <XIcon className="w-5 h-5 cursor-pointer" onClick={() => remove(index)} />
              </div>
              <input
                type="text"
                {...register(`proposal.actions.${index}.type`, { shouldUnregister: true, value: field.type })}
                className="hidden"
              />
              <ReserveActionForm genFieldName={genFieldName(index)} />
            </div>
          )
        } else if (field.type === "Custom Transaction") {
          return (
            <div key={field.id} className="mt-4 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-xl">Custom Transaction</h3>
                <XIcon className="w-5 h-5 cursor-pointer" onClick={() => remove(index)} />
              </div>
              <input
                type="text"
                {...register(`proposal.actions.${index}.type`, { shouldUnregister: true, value: field.type })}
                className="hidden"
              />
              <CustomTransactionActionForm genFieldName={genFieldName(index)} />
            </div>
          )
        } else {
          return (
            <div key={field.id} className="mt-4 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-xl">{field.type}</h3>
                <XIcon className="w-5 h-5 cursor-pointer" onClick={() => remove(index)} />
              </div>
            </div>
          )
        }
      })}

      <ActionPalettes open={open} setOpen={setOpen} selectedAction={selectedAction} setSelectedAction={newAction} />
    </div>
  )
}

interface ActionItem {
  id: number;
  name: string;
  description: string;
  url: string;
  color: string;
  icon: any
}

const items: ActionItem[] = [
  {
    id: 1,
    name: 'Payout',
    description: 'Apply payouts from Juicebox treasury.',
    url: '#',
    color: 'bg-blue-500',
    icon: CurrencyDollarIcon,
  },
  {
    id: 2,
    name: 'Reserve',
    description: 'Apply to be added in reserved token list.',
    url: '#',
    color: 'bg-blue-500',
    icon: UserGroupIcon,
  },
  {
    id: 3,
    name: 'Transfer',
    description: 'Transfer tokens from Safe.',
    url: '#',
    color: 'bg-blue-500',
    icon: SwitchVerticalIcon,
  },
  {
    id: 4,
    name: 'Custom Transaction',
    description: 'Execute custom transaction with Safe.',
    url: '#',
    color: 'bg-blue-500',
    icon: LightningBoltIcon,
  },
  // More items...
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function ActionPalettes({ open, setOpen, selectedAction, setSelectedAction }) {

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              <Combobox value={selectedAction} onChange={setSelectedAction}>
                <Combobox.Options static className="max-h-96 scroll-py-3 overflow-y-auto p-3">
                  {items.map((item) => (
                    <Combobox.Option
                      key={item.id}
                      value={item}
                      className={({ active }) =>
                        classNames('flex cursor-default select-none rounded-xl p-3', active && 'bg-gray-100')
                      }
                    >
                      {({ active }) => (
                        <>
                          <div
                            className={classNames(
                              'flex h-10 w-10 flex-none items-center justify-center rounded-lg',
                              item.color
                            )}
                          >
                            <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                          </div>
                          <div className="ml-4 flex-auto">
                            <p
                              className={classNames(
                                'text-sm font-medium',
                                active ? 'text-gray-900' : 'text-gray-700'
                              )}
                            >
                              {item.name}
                            </p>
                            <p className={classNames('text-sm', active ? 'text-gray-700' : 'text-gray-500')}>
                              {item.description}
                            </p>
                          </div>
                        </>
                      )}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

function PayoutActionForm({ genFieldName }:
  { genFieldName: (field: string) => any }) {
    const { watch, getValues } = useFormContext();

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-1">
        <SelectForm label="Receiver Type" fieldName={genFieldName("type")} options={[
          { displayValue: "Address", value: "address" },
          { displayValue: "Project", value: "project" },
        ]} defaultValue={getValues(genFieldName("project")) > 0 ? "project" : "address"} />
      </div>
      <div className="col-span-4 sm:col-span-1">
        <NumberForm label="Duration(Cycles)" fieldName={genFieldName("count")} decimal={1} />
      </div>
      <div className="col-span-4 sm:col-span-2">
        <NumberForm label="Amount" fieldName={genFieldName("amountUSD")} fieldType="$" />
      </div>

      {
        watch(genFieldName("type")) === "project" && (
          <div className="col-span-4 sm:col-span-2">
            <ProjectForm label="Project Receiver" fieldName={genFieldName("project")} />
          </div>
        )
      }
      <div className="col-span-4 sm:col-span-2">
        <AddressForm label={watch(genFieldName("type")) === "project" ? "Token Beneficiary" : "Receiver Address"} fieldName={genFieldName("address")} />
      </div>
    </div>
  )
}

function TransferActionForm({ genFieldName }:
  { genFieldName: (field: string) => any }) {

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-2">
        <AddressForm label="Receiver" fieldName={genFieldName("to")} />
      </div>

      <div className="col-span-4 sm:col-span-1">
        <NumberForm label="Amount" fieldName={genFieldName("amount")} />
      </div>

      <div className="col-span-4 sm:col-span-1">
        <SelectForm label="Token" fieldName={genFieldName("contract")} options={[
          { displayValue: "ETH", value: CONTRACT_MAP.ETH },
          { displayValue: "USDC", value: CONTRACT_MAP.USDC },
          { displayValue: "JBX", value: CONTRACT_MAP.JBX },
        ]} defaultValue={CONTRACT_MAP.ETH} />
      </div>
    </div>
  )
}

function ReserveActionForm({ genFieldName }:
  { genFieldName: (field: string) => any }) {

  const { watch, formState: { errors } } = useFormContext();
  const { fields, append, remove, prepend } = useFieldArray<{
    splits: JBSplitNanceStruct[];
    [key: string]: any;
  }>({ name: genFieldName("splits") });
  
  const { value: _fc, loading: fcIsLoading } = useCurrentFundingCycleV2({ projectId: NANCE_DEFAULT_JUICEBOX_PROJECT, isV3: true });
  const [fc, metadata] = _fc || [];
  const { value: ticketMods, loading: ticketModsIsLoading } = useCurrentSplits(NANCE_DEFAULT_JUICEBOX_PROJECT, fc?.configuration, JBConstants.SplitGroup.RESERVED_TOKEN, true);
  // TODO: reserve rate, percent / total_percentage JBConstants

  useEffect(() => {
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
        allocator: ticket.allocator
      }
      append(split)
    })
  }, [ticketMods])

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

      {fields?.map((field: JBSplitNanceStruct & { id: string }, index) => (
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
  )
}

function CustomTransactionActionForm({ genFieldName }:
  { genFieldName: (field: string) => any }) {

  const { watch, control, formState: { errors } } = useFormContext();
  const [functionFragment, setFunctionFragment] = useState<FunctionFragment>();

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-2">
        <AddressForm label="Contract" fieldName={genFieldName("contract")} />
      </div>

      <div className="col-span-4 sm:col-span-1">
        <NumberForm label="ETH Value" fieldName={genFieldName("value")} />
      </div>

      {
        watch(genFieldName("contract"))?.length === 42 && (
          <div className="col-span-4 sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Function
            </label>
            <Controller
              name={genFieldName("functionName")}
              control={control}
              rules={{
                required: "Can't be empty"
              }}
              render={({ field: { onChange, onBlur, value, ref } }) =>
                <FunctionSelector address={watch(genFieldName("contract"))} val={value} setVal={onChange} setFunctionFragment={setFunctionFragment} inputStyle="h-10" />
              }
            />
            <ErrorMessage
              errors={errors}
              name={genFieldName("functionName")}
              render={({ message }) => <p className="text-red-500 mt-1">{message}</p>}
            />
          </div>
        )
      }

      {
        functionFragment?.inputs?.map((param, index) => (
          <div key={param.name} className="col-span-4 sm:col-span-1">
            {param.type === "address" && (
              <AddressForm label={`Param: ${param.name}`} fieldName={genFieldName(`args.${param.name}`)} />
            )}

            {param.type.includes("int") && (
              <NumberForm label={`Param: ${param.name}`} fieldName={genFieldName(`args.${param.name}`)} fieldType={param.type} />
            )}

            {param.type === "bool" && (
              <BooleanForm label={`Param: ${param.name}`} fieldName={genFieldName(`args.${param.name}`)} />
            )}

            {param.type !== "address" && !param.type.includes("int") && param.type !== "bool" && (
              <StringForm label={`Param: ${param.name}`} fieldName={genFieldName(`args.${param.name}`)} fieldType={param.type} />
            )}
          </div>
        ))
      }

    </div >
  )
}

const TEMPLATE = `<h2>Synopsis</h2><p><em>State what the proposal does in one sentence.</em></p><p></p><h2>Motivation</h2><p><em>What problem does this solve? Why now?</em></p><p></p><h2>Specification</h2><p><em>How exactly will this be executed? Be specific and leave no ambiguity.</em></p><p></p><h2>Rationale</h2><p><em>Why is this specification appropriate?</em></p><p></p><h2>Risks</h2><p><em>What might go wrong?</em></p><p></p><h2>Timeline</h2><p><em>When exactly should this proposal take effect? When exactly should this proposal end?</em></p>`
