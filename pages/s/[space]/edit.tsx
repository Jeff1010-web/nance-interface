import { useContext, useState, Fragment, useEffect } from "react";
import SiteNav from "../../../components/SiteNav";
import { useForm, FormProvider, useFormContext, Controller, SubmitHandler, useFieldArray } from "react-hook-form";
import { useQueryParams, StringParam } from "next-query-params";
import React from "react";
import { useRouter } from "next/router";
import Notification from "../../../components/Notification";
import GenericButton from "../../../components/GenericButton";
import { useProposalUpload, useSpaceInfo } from "../../../hooks/NanceHooks";
import { imageUpload } from "../../../hooks/ImageUpload";
import { fileDrop } from "../../../hooks/FileDrop";
import { Proposal, ProposalUploadRequest, Action, JBSplitNanceStruct, CustomTransaction } from "../../../models/NanceTypes";
import { NANCE_API_URL, NANCE_DEFAULT_SPACE } from "../../../constants/Nance";
import Link from "next/link";

import { Editor } from '@tinymce/tinymce-react';

import { markdownToHtml, htmlToMarkdown } from '../../../libs/markdown';
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { CheckIcon, ChevronDownIcon, CurrencyDollarIcon, BoltIcon, PlusIcon, ArrowsUpDownIcon, UserGroupIcon, XMarkIcon, XCircleIcon, ArrowPathIcon, CursorArrowRaysIcon } from "@heroicons/react/24/solid";
import { Combobox, Dialog, Disclosure, Listbox, Transition } from '@headlessui/react';
import { ErrorMessage } from "@hookform/error-message";
import FunctionSelector from "../../../components/FunctionSelector";
import { FormatTypes, FunctionFragment } from "ethers/lib/utils";
import { CONTRACT_MAP, ZERO_ADDRESS } from "../../../constants/Contract";
import { useCurrentFundingCycleV2 } from "../../../hooks/juicebox/CurrentFundingCycle";
import { useCurrentSplits } from "../../../hooks/juicebox/CurrentSplits";
import { JBConstants } from "../../../models/JuiceboxTypes";
import { CheckCircleIcon, TrashIcon, SquaresPlusIcon } from "@heroicons/react/24/outline";
import AddressForm from "../../../components/form/AddressForm";
import NumberForm from "../../../components/form/NumberForm";
import BooleanForm from "../../../components/form/BooleanForm";
import StringForm from "../../../components/form/StringForm";
import SelectForm from "../../../components/form/SelectForm";
import ProjectForm from "../../../components/form/ProjectForm";
import JBSplitEntry from "../../../components/juicebox/JBSplitEntry";
import Footer from "../../../components/Footer";
import { getToken } from "next-auth/jwt";
import { useSession } from "next-auth/react";
import { classNames } from "../../../libs/tailwind";
import { encodeTransactionInput, useTendelySimulate } from "../../../hooks/TenderlyHooks";
import { utils } from "ethers";
import useProjectInfo from "../../../hooks/juicebox/ProjectInfo";
import MiddleStepModal from "../../../components/MiddleStepModal";
import { Tooltip } from "flowbite-react";

const ProposalMetadataContext = React.createContext({
  loadedProposal: null as Proposal | null,
  fork: false as boolean,
  space: '' as string
});

export async function getServerSideProps({ req, query, params}: any) {
  // check proposal parameter type
  const proposalParam: string = query.proposalId;
  const spaceParam: string = params.space;
  const forkParam: string = query.fork;

  // Attach the JWT token to the request headers
  const token = await getToken({ req, raw: true });
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  let proposalResponse = null;
  if (proposalParam) {
    proposalResponse = await fetch(`${NANCE_API_URL}/${spaceParam}/proposal/${proposalParam}`, {headers}).then(res => res.json());
    if (proposalResponse?.data) {
      proposalResponse.data.body = await markdownToHtml(proposalResponse.data.body);
    }
  }

  // Pass data to the page via props
  return { props: { space: spaceParam, loadedProposal: proposalResponse?.data || null, fork: forkParam === "true" } };
}

export default function NanceEditProposal({ space, loadedProposal, fork }: { space: string, loadedProposal: Proposal, fork: boolean }) {
  const router = useRouter();

  const [query, setQuery] = useQueryParams({
    proposalId: StringParam
  });
  const { proposalId } = query;

  if (!router.isReady) {
    return <p className="mt-2 text-xs text-gray-500 text-center">loading...</p>;
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
            {(proposalId && !fork) ? "Edit" : "New"} Proposal for <a href={`/s/${space}`}>{space}</a>
          </p>

          <ProposalMetadataContext.Provider value={{ loadedProposal, fork, space }}>
            <Form space={space} />
          </ProposalMetadataContext.Provider>
        </div>
      </div>

      <Footer />
    </>
  );
}

type ProposalFormValues = Omit<ProposalUploadRequest, "signature">

const ProposalStatus = [
  {title: "Publish", description: "Publish your proposal and let people join the discussion.", value: "Discussion", display: "Publish"},
  {title: "Draft", description: "Save your proposal as draft, you can publish it later.", value: "Draft", display: "Save as Draft"},
  {title: "Private Draft", description: "Save your proposal as private, you can publish it later for discussion.", value: "Private", display: "Save as Private"},
];

function Form({ space }: { space: string }) {
  // query and context
  const router = useRouter();
  const metadata = useContext(ProposalMetadataContext);

  // state
  const [formErrors, setFormErrors] = useState<string>("");
  const [selected, setSelected] = useState(ProposalStatus[0]);
  const [txnsMayFail, setTxnsMayFail] = useState(false);
  const [formDataPayload, setFormDataPayload] = useState<ProposalFormValues>();

  // hooks
  const { isMutating, error: uploadError, trigger, data, reset } = useProposalUpload(space, !metadata.fork && metadata.loadedProposal?.hash || undefined, router.isReady);
  
  const { data: session, status } = useSession();
  const { openConnectModal } = useConnectModal();

  const isNew = metadata.fork || metadata.loadedProposal === null;

  // form
  const methods = useForm<ProposalFormValues>();
  const { register, handleSubmit, control, formState, getValues } = methods;
  const onSubmit: SubmitHandler<ProposalFormValues> = async (formData) => {
    const _allSimulated = getValues("proposal.actions")
      .filter((a) => a.type === "Custom Transaction" && (a.payload as CustomTransaction).tenderlyStatus !== "true")
      .length === 0;
    console.debug("check simulations", _allSimulated, getValues("proposal.actions"));
    setTxnsMayFail(!_allSimulated);

    if (_allSimulated) {
      return await processAndUploadProposal(formData);
    } else {
      setFormDataPayload(formData);
    }
  };
  const processAndUploadProposal: SubmitHandler<ProposalFormValues> = async (formData) => {
    let hash;
    if (!metadata.fork && metadata?.loadedProposal) {
      hash = metadata.loadedProposal.hash;
    }

    const payload = {
      ...formData.proposal,
      status: (metadata.loadedProposal?.status === 'Temperature Check') ? 'Temperature Check' : selected.value,
      body: await htmlToMarkdown(formData.proposal.body ?? ""),
      hash
    };
    console.debug("📚 Nance.editProposal.onSubmit ->", { formData, payload });

    const req: ProposalUploadRequest = {
      proposal: payload as any
    };
    console.debug("📗 Nance.editProposal.submit ->", req);
    trigger(req)
      .then(res => router.push(space === NANCE_DEFAULT_SPACE ? `/p/${res?.data.hash}` : `/s/${space}/${res?.data.hash}`))
      .catch((err) => {
        console.warn("📗 Nance.editProposal.onSignError ->", err);
      });
  };

  // shortcut
  const isSubmitting = isMutating;
  const error = uploadError;

  useEffect(() => {
    if(formState.errors && Object.keys(formState.errors).length > 0) {
      const actionErrors = formState.errors.proposal?.actions || [];
      const arr: any = [];
      actionErrors.forEach?.((e, i) => {
        if (e) {
          arr.push(i);
        }
      });
      setFormErrors("in actions " + arr.join(', '));
    } else {
      setFormErrors("");
    }
  }, [formState]);

  function getButtonLabel(selected: {title: string, description: string, value: string, display: string}) {
    //{status === "loading" ? 
    //(isMutating ? "Submitting..." : "Connecting...") : 
    //(formErrors.length > 0 ? "Error in form" : selected.display)}

    if (formErrors.length > 0) {
      return "Error in form";
    } else if (status === "loading") {
      return "Connecting...";
    } else if (isMutating) {
      return "Submitting...";
    } else {
      return selected.display;
    }
  }

  return (
    <FormProvider {...methods} >
      <Notification title="Success" description={`${isNew ? "Created" : "Updated"} proposal ${data?.data?.hash}`} show={data !== undefined} close={reset} checked={true} />
      {error &&
        <Notification title="Error" description={error.error_description || error.message || error} show={true} close={reset} checked={false} />
      }
      <MiddleStepModal open={txnsMayFail} setOpen={setTxnsMayFail} 
        title="SimulationCheck" description="You have some transactions may failed based on simulations, do you wish to continue?" 
        payload={formDataPayload}
        onContinue={(f) => processAndUploadProposal(f)} />
      <form className="space-y-6 mt-6" onSubmit={handleSubmit(onSubmit)}>
        <Actions loadedActions={((metadata.fork) ? metadata.loadedProposal?.actions?.map(({ uuid, ...rest }) => rest) : metadata.loadedProposal?.actions) || []} />

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
                        onInit={(evt, editor) => editor.setContent(metadata.loadedProposal?.body || TEMPLATE)}
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
            Drag and drop markdown file or image to attach content (images are pinned to IPFS)
          </p>

        </div>

        {formErrors.length > 0 && (
          <p className="text-red-500 mt-1">
            Form errors: {formErrors}
          </p>
        )}

        <div className="flex justify-end">
          <Link href={space === NANCE_DEFAULT_SPACE ? `/` : `/s/${space}`} legacyBehavior>
            <a
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </a>
          </Link>

          {status === "unauthenticated" && (
            <button type="button" onClick={() => openConnectModal?.()}
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              Connect Wallet
            </button>
          )}

          {status !== "unauthenticated" && (
            <Listbox value={selected} onChange={setSelected} as="div">
              {({ open }) => (
                <>
                  <Listbox.Label className="sr-only">Change published status</Listbox.Label>
                  <div className="relative">
                    <div className="inline-flex divide-x divide-blue-700 rounded-md shadow-sm">
                      <button
                        type="submit"
                        disabled={
                          isSubmitting || formErrors.length > 0
                          //|| (!isNew && hasVoting)
                        }
                        className="ml-3 inline-flex justify-center rounded-none rounded-l-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
                      >
                        {(status === "loading" || isMutating) && <ArrowPathIcon className="animate-spin mr-1 h-5 w-5 text-white" aria-hidden="true" />}
                        {getButtonLabel(selected)}
                      </button>
                      <Listbox.Button className="inline-flex items-center rounded-l-none rounded-r-md bg-blue-600 p-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-50">
                        <span className="sr-only">Change proposal status</span>
                        <ChevronDownIcon className="h-5 w-5 text-white" aria-hidden="true" />
                      </Listbox.Button>
                    </div>

                    <Transition
                      show={open}
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute right-0 z-10 mt-2 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {ProposalStatus.map((option) => (
                          <Listbox.Option
                            key={option.title}
                            className={({ active }) =>
                              classNames(
                                active ? 'bg-blue-600 text-white' : 'text-gray-900',
                                'cursor-default select-none p-4 text-sm'
                              )
                            }
                            value={option}
                          >
                            {({ selected, active }) => (
                              <div className="flex flex-col">
                                <div className="flex justify-between">
                                  <p className={selected ? 'font-semibold' : 'font-normal'}>{option.title}</p>
                                  {selected ? (
                                    <span className={active ? 'text-white' : 'text-blue-600'}>
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  ) : null}
                                </div>
                                <p className={classNames(active ? 'text-blue-200' : 'text-gray-500', 'mt-2')}>
                                  {option.description}
                                </p>
                              </div>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </>
              )}
            </Listbox>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

function Actions({ loadedActions }: { loadedActions: Action[] }) {
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
    icon: ArrowsUpDownIcon,
  },
  {
    id: 4,
    name: 'Custom Transaction',
    description: 'Execute custom transaction with Safe.',
    url: '#',
    color: 'bg-blue-500',
    icon: BoltIcon,
  },
  // More items...
];

function ActionPalettes({ open, setOpen, selectedAction, setSelectedAction }: any) {

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
  );
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
  );
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
  );
}

function ReserveActionForm({ genFieldName }:
  { genFieldName: (field: string) => any }) {

  const {space} = useContext(ProposalMetadataContext);

  const { watch, formState: { errors } } = useFormContext();
  const { fields, append, remove, prepend } = useFieldArray<{
    splits: JBSplitNanceStruct[];
    [key: string]: any;
  }>({ name: genFieldName("splits") });
  
  const { data: spaceInfo } = useSpaceInfo({space});
  const projectId = spaceInfo?.data?.juiceboxProjectId;
  const { value: _fc, loading: fcIsLoading } = useCurrentFundingCycleV2({ projectId, isV3: true });
  const [fc, metadata] = _fc || [];
  const { value: ticketMods, loading: ticketModsIsLoading } = useCurrentSplits(projectId, fc?.configuration, JBConstants.SplitGroup.RESERVED_TOKEN, true);
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

function CustomTransactionActionForm({ genFieldName, projectOwner }:
  { genFieldName: (field: string) => any, projectOwner: string | undefined }) {

  const [functionFragment, setFunctionFragment] = useState<FunctionFragment>();
  const [shouldSimulate, setShouldSimulate] = useState<boolean>();

  const { watch, control, formState: { errors }, getValues, getFieldState, formState: { isDirty }, setValue } = useFormContext();
  const { replace } = useFieldArray<{
    args: any[];
    [key: string]: any;
  }>({ name: genFieldName("args") });

  const args = functionFragment?.inputs?.map((param, index) => getValues(genFieldName(`args.${index}`)));
  const input = encodeTransactionInput(functionFragment?.format(FormatTypes.minimal) || "", args || []);
  const simulateArgs = {
    from: projectOwner || "",
    to: getValues(genFieldName("contract")) as string,
    value: parseInt(getValues(genFieldName("value"))),
    input
  };
  const { data, isLoading, error } = useTendelySimulate(simulateArgs, !!projectOwner && !!input && shouldSimulate);

  console.log("CustomTransactionActionForm.tenderly", 
    {
      args: simulateArgs, 
      formValues: getValues(),
      data: data
    });
  
  useEffect(() => {
    // clear args of last selected function
    if(functionFragment?.inputs && replace) {
      console.debug(functionFragment);
      replace(functionFragment.inputs.map(p => ""));
    }
  }, [functionFragment, replace]);

  useEffect(() => {
    // if the function input changed, we need to re-run simulation
    setShouldSimulate(false);
  }, [getFieldState(genFieldName("args")).isDirty, getValues(genFieldName("functionName"))]);

  useEffect(() => {
    // set simulationId which will be uploaded within action
    const simulationId = data?.simulation?.id;
    if (simulationId) {
      setValue(genFieldName("tenderlyId"), simulationId);
    }
  }, [data]);

  useEffect(() => {
    // save simulation status so we can check when user submit proposals
    const simulationStatus = data?.simulation?.status;
    if (shouldSimulate) {
      setValue(genFieldName("tenderlyStatus"), simulationStatus ? "true" : "false");
    } else {
      setValue(genFieldName("tenderlyStatus"), "false");
    }
  }, [data, shouldSimulate]);

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="isolate inline-flex rounded-md col-span-4">
        <button
          type="button"
          className={classNames(
            "relative inline-flex items-center gap-x-1.5 rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300",
            shouldSimulate ? "" : "hover:bg-gray-50 focus:z-10"
          )}
          onClick={() => {
            if (shouldSimulate) {
              setShouldSimulate(false);
            }
            setShouldSimulate(true);
          }}
        >
          Simulate
        </button>
        <div
          className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300"
        >
          {shouldSimulate ? 
            (isLoading ? 
              <ArrowPathIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" /> : 
              (data?.simulation?.status ? 
                <CheckCircleIcon className="-ml-0.5 h-5 w-5 text-green-400" aria-hidden="true" /> : 
                <Tooltip content={`Error: ${error ? error.message : (data?.simulation?.error_message || "Not enough args")}`}>
                  <XCircleIcon className="-ml-0.5 h-5 w-5 text-red-400" aria-hidden="true" />
                </Tooltip>
              ) 
            )
            : <CursorArrowRaysIcon className="-ml-0.5 h-5 w-5 text-blue-400" aria-hidden="true" />}
        </div>
      </div>

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
                <FunctionSelector address={watch(genFieldName("contract"))} val={value} setVal={onChange} setFunctionFragment={(f) => setFunctionFragment(f)} inputStyle="h-10" />
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
          <div key={index} className="col-span-4 sm:col-span-1">
            {param.type === "address" && (
              <AddressForm label={`Param: ${param.name || '_'}`} fieldName={genFieldName(`args.${index}`)} />
            )}

            {param.type.includes("int") && (
              <NumberForm label={`Param: ${param.name || '_'}`} fieldName={genFieldName(`args.${index}`)} fieldType={param.type} />
            )}

            {param.type === "bool" && (
              <BooleanForm label={`Param: ${param.name || '_'}`} fieldName={genFieldName(`args.${index}`)} />
            )}

            {param.type !== "address" && !param.type.includes("int") && param.type !== "bool" && (
              <StringForm label={`Param: ${param.name || '_'}`} fieldName={genFieldName(`args.${index}`)} fieldType={param.type} />
            )}
          </div>
        ))
      }

    </div >
  );
}

const TEMPLATE = `<h2>Synopsis</h2><p><em>State what the proposal does in one sentence.</em></p><p></p><h2>Motivation</h2><p><em>What problem does this solve? Why now?</em></p><p></p><h2>Specification</h2><p><em>How exactly will this be executed? Be specific and leave no ambiguity.</em></p><p></p><h2>Rationale</h2><p><em>Why is this specification appropriate?</em></p><p></p><h2>Risks</h2><p><em>What might go wrong?</em></p><p></p><h2>Timeline</h2><p><em>When exactly should this proposal take effect? When exactly should this proposal end?</em></p>`;
