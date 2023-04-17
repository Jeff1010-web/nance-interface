import { useContext, useState, Fragment } from "react";
import SiteNav from "../components/SiteNav";
import { useForm, FormProvider, useFormContext, Controller, SubmitHandler, useFieldArray } from "react-hook-form";
import { withDefault, NumberParam, useQueryParams, StringParam } from "next-query-params";
import React from "react";
import { useRouter } from "next/router";
import Notification from "../components/Notification";
import GenericButton from "../components/GenericButton";
import { fetchProposal, useProposalUpload } from "../hooks/NanceHooks";
import { imageUpload } from "../hooks/ImageUpload";
import { Proposal, ProposalUploadRequest, Action, Payout, Transfer, CustomTransaction } from "../models/NanceTypes";
import { NANCE_DEFAULT_SPACE } from "../constants/Nance";
import Link from "next/link";

import { useAccount, useSigner } from "wagmi";
import { JsonRpcSigner } from "@ethersproject/providers";
import { signPayload } from "../libs/signer";

import { Editor } from '@tinymce/tinymce-react';

import { markdownToHtml, htmlToMarkdown } from '../libs/markdown';
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { CurrencyDollarIcon, LightningBoltIcon, PlusIcon, SwitchVerticalIcon, UserGroupIcon, XIcon } from "@heroicons/react/solid";
import { Combobox, Dialog, Transition } from '@headlessui/react'
import ENSAddressInput from "../components/ENSAddressInput";
import { ErrorMessage } from "@hookform/error-message";
import ProjectSearch from "../components/juicebox/ProjectSearch";
import FunctionSelector from "../components/FunctionSelector";
import { FunctionFragment } from "ethers/lib/utils";

const ProposalMetadataContext = React.createContext({
  loadedProposal: null as Proposal | null,
  version: 2,
  project: 1
});

export async function getServerSideProps(context) {
  // check proposal parameter type
  console.debug(context.query);
  const proposalParam: string = context.query.proposalId;
  const spaceParam: string = context.query.overrideSpace || 'juicebox';
  let proposalResponse = null;
  if (proposalParam) {
    proposalResponse = await fetchProposal(spaceParam, proposalParam);
    if (proposalResponse?.data) {
      proposalResponse.data.body = await markdownToHtml(proposalResponse.data.body)
    }
  }

  // Pass data to the page via props
  return { props: { loadedProposal: proposalResponse?.data || null } }
}

export default function NanceEditProposal({ loadedProposal }: { loadedProposal: Proposal }) {
  const router = useRouter();

  const [query, setQuery] = useQueryParams({
    proposalId: StringParam,
    version: withDefault(NumberParam, 2),
    project: withDefault(NumberParam, 1),
    overrideSpace: StringParam
  });
  const { proposalId, version, project, overrideSpace } = query;
  let space = NANCE_DEFAULT_SPACE;
  if (overrideSpace) {
    space = overrideSpace;
  }

  if (!router.isReady) {
    return <p className="mt-2 text-xs text-gray-500 text-center">loading...</p>
  }

  return (
    <>
      <SiteNav
        pageTitle="Edit Proposal"
        description="Create or edit proposal on Nance."
        withWallet />
      <div className="m-4 lg:m-6 flex flex-col">
        <p className="text-2xl font-bold">
          {proposalId ? "Edit" : "New"} Proposal
        </p>
        <ProposalMetadataContext.Provider value={{ loadedProposal, version, project }}>
          <Form space={space} />
        </ProposalMetadataContext.Provider>
      </div>
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

  // hooks
  const { isMutating, error: uploadError, trigger, data, reset } = useProposalUpload(space as string, metadata.loadedProposal?.hash, router.isReady);
  const { data: signer, isError, isLoading } = useSigner()
  const jrpcSigner = signer as JsonRpcSigner;
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const isNew = metadata.loadedProposal === null;
  const hasVoting = metadata.loadedProposal?.voteURL?.length > 0;

  // form
  const methods = useForm<ProposalFormValues>();
  const { register, handleSubmit, control, formState: { errors } } = methods;
  const onSubmit: SubmitHandler<ProposalFormValues> = async (formData) => {
    const { body, title, hash } = metadata?.loadedProposal ?? {}; // send back all values except ones in form
    const payload = {
      ...formData.proposal,
      body: await htmlToMarkdown(formData.proposal.body),
      hash
    };
    console.debug("📚 Nance.editProposal.onSubmit ->", { formData, payload })

    setSigning(true);

    // TODO combo box for project search
    signPayload(
      jrpcSigner, space as string,
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
      .then(res => router.push(`/p/${res.data.hash}${space !== NANCE_DEFAULT_SPACE ? `?overrideSpace=${space}` : ''}`))
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

  return (
    <FormProvider {...methods} >
      <Notification title="Success" description={`${isNew ? "Created" : "Updated"} proposal ${data?.data.hash}`} show={data !== undefined} close={resetSignAndUpload} checked={true} />
      {(signError || uploadError) &&
        <Notification title="Error" description={error.error_description || error.message || error} show={true} close={resetSignAndUpload} checked={false} />
      }
      <form className="space-y-6 mt-6" onSubmit={handleSubmit(onSubmit)}>

        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
          <div>
            <div className="mt-5 md:mt-0">
              <div className=" gap-6">
                <div className="">
                  <input
                    type="text"
                    {...register("proposal.title", { value: metadata.loadedProposal?.title || "Title" })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                          images_upload_handler: imageUpload,
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
        </div>

        <Actions />

        <div className="flex justify-end">
          <Link href={`/${space !== NANCE_DEFAULT_SPACE ? `?overrideSpace=${space}` : ''}`}>
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
                isSubmitting
                //|| (!isNew && hasVoting)
              }
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              {signing ? (isMutating ? "Submitting..." : "Signing...") : "Submit"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}

function Actions() {
  const [open, setOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<ActionItem>()

  const { register } = useFormContext();
  const { fields, append, remove } = useFieldArray<{
    actions: Action[];
    [key: string]: any;
  }>({ name: "actions" });

  const newAction = (a: ActionItem) => {
    setOpen(false)
    append({ type: a.name, payload: {} })
  }

  const genFieldName = (index: number) => {
    return (field: string) => `proposal.actions.${index}.payload.${field}` as const
  }

  return (
    <div>
      <p className="text-2xl font-bold">Proposed Actions</p>

      <GenericButton onClick={() => setOpen(true)} className="mt-6">
        <PlusIcon className="w-5 h-5" />
        <p className="ml-1">Add an action</p>
      </GenericButton>

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
  // {
  //   id: 2,
  //   name: 'Reserve',
  //   description: 'Apply to be added in reserved token list.',
  //   url: '#',
  //   color: 'bg-blue-500',
  //   icon: UserGroupIcon,
  // },
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

function PayoutActionForm({ genFieldName, loadedPayout = undefined }:
  { genFieldName: (field: string) => any, loadedPayout?: Payout }) {
  const { register, watch, control, formState: { errors } } = useFormContext();

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-1">
        <label className="block text-sm font-medium text-gray-700">
          Receiver Type
        </label>
        <select
          {...register(genFieldName("type"),
            { shouldUnregister: true, value: loadedPayout?.project ? "project" : "address" })}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          <option value="address">Address</option>
          <option value="project">Project</option>
        </select>
      </div>
      <div className="col-span-4 sm:col-span-1">
        <label className="block text-sm font-medium text-gray-700">
          Duration(Cycles)
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="number"
            step={1}
            min={1}
            {...register(genFieldName("count"), { valueAsNumber: true, shouldUnregister: true, value: loadedPayout?.count || 1 })}
            className="block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="1"
          />
        </div>
      </div>
      <div className="col-span-4 sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
            $
          </span>
          <input
            type="number"
            step={1}
            min={0}
            {...register(genFieldName("amountUSD"), { valueAsNumber: true, shouldUnregister: true, value: loadedPayout?.amountUSD || 0 })}
            className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="1500"
          />
        </div>
      </div>

      {
        watch(genFieldName("type")) === "project" && (
          <div className="col-span-4 sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Project Receiver
            </label>
            <Controller
              name={genFieldName("project")}
              control={control}
              rules={{
                required: "Can't be empty",
                validate: {
                  positive: (v) => parseInt(v) > 0 || "Not a positive number"
                }
              }}
              render={({ field: { onChange, onBlur, value, ref } }) =>
                <ProjectSearch val={value} setVal={onChange} />
              }
            />
            <ErrorMessage
              errors={errors}
              name={genFieldName("project")}
              render={({ message }) => <p className="text-red-500 mt-1">{message}</p>}
            />
          </div>
        )
      }
      <div className="col-span-4 sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          {watch(genFieldName("type")) === "project" ? "Token Beneficiary" : "Receiver Address"}
        </label>
        <Controller
          name={genFieldName("address")}
          control={control}
          rules={{
            required: "Can't be empty",
            pattern: { value: /^0x[a-fA-F0-9]{40}$/, message: "Not a valid address" }
          }}
          render={({ field: { onChange, onBlur, value, ref } }) =>
            <ENSAddressInput val={value} setVal={onChange} />
          }
        />
        <ErrorMessage
          errors={errors}
          name={genFieldName("address")}
          render={({ message }) => <p className="text-red-500 mt-1">{message}</p>}
        />
      </div>
    </div>
  )
}

function TransferActionForm({ genFieldName, loadedTransfer = undefined }:
  { genFieldName: (field: string) => any, loadedTransfer?: Transfer }) {
  const { register, control, setValue, getValues, formState: { errors } } = useFormContext();

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Receiver
        </label>
        <Controller
          name={genFieldName("to")}
          control={control}
          rules={{
            required: "Can't be empty",
            pattern: { value: /^0x[a-fA-F0-9]{40}$/, message: "Not a valid address" }
          }}
          render={({ field: { onChange, onBlur, value, ref } }) =>
            <ENSAddressInput val={value} setVal={onChange} />
          }
        />
        <ErrorMessage
          errors={errors}
          name={genFieldName("address")}
          render={({ message }) => <p className="text-red-500 mt-1">{message}</p>}
        />
      </div>

      <div className="col-span-4 sm:col-span-1">
        <label className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            step={1}
            min={0}
            {...register(genFieldName("amount"), { shouldUnregister: true, required: "Can't be empty" })}
            className="block h-10 w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <GenericButton
            onClick={() => setValue(genFieldName("amount"), getValues<string>(genFieldName("amount"))
              .concat("000000000000000000"))}
            className="inline-flex items-center rounded-none rounded-r-md border border-l-0 border-gray-300 m-0">
            18
          </GenericButton>
        </div>
      </div>

      <div className="col-span-4 sm:col-span-1">
        <label className="block text-sm font-medium text-gray-700">
          Token
        </label>
        <select
          {...register(genFieldName("contract"),
            { shouldUnregister: true, value: loadedTransfer?.contract || "0x0000000000000000000000000000000000000000" })}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          <option value="0x0000000000000000000000000000000000000000">ETH</option>
          <option value="0x4554CC10898f92D45378b98D6D6c2dD54c687Fb2">JBX</option>
          <option value="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48">USDC</option>
        </select>
      </div>
    </div>
  )
}

function CustomTransactionActionForm({ genFieldName, loadedCustomTransaction = undefined }:
  { genFieldName: (field: string) => any, loadedCustomTransaction?: CustomTransaction }) {

  const { register, watch, control, setValue, getValues, formState: { errors } } = useFormContext();
  const [functionFragment, setFunctionFragment] = useState<FunctionFragment>();

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contract
        </label>
        <Controller
          name={genFieldName("contract")}
          control={control}
          rules={{
            required: "Can't be empty",
            pattern: { value: /^0x[a-fA-F0-9]{40}$/, message: "Not a valid address" }
          }}
          render={({ field: { onChange, onBlur, value, ref } }) =>
            <ENSAddressInput val={value} setVal={onChange} inputStyle="h-10" />
          }
          defaultValue={loadedCustomTransaction?.contract || ""}
        />
        <ErrorMessage
          errors={errors}
          name={genFieldName("contract")}
          render={({ message }) => <p className="text-red-500 mt-1">{message}</p>}
        />
      </div>

      <div className="col-span-4 sm:col-span-1">
        <label className="block text-sm font-medium text-gray-700">
          ETH Value
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            step={1}
            min={0}
            {...register(genFieldName("value"), { shouldUnregister: true, required: "Can't be empty" })}
            className="block h-10 w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <GenericButton
            onClick={() => setValue(genFieldName("value"), getValues<string>(genFieldName("value"))
              .concat("000000000000000000"))}
            className="inline-flex items-center rounded-none rounded-r-md border border-l-0 border-gray-300 m-0">
            18
          </GenericButton>
        </div>
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
              defaultValue={loadedCustomTransaction?.functionName || ""}
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
            <label className="block text-sm font-medium text-gray-700">
              Param: {param.name}
            </label>

            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                {param.type}
              </span>

              {param.type === "address" && (
                <>
                  <Controller
                    name={genFieldName(`args.${param.name}`)}
                    control={control}
                    rules={{
                      required: "Can't be empty",
                      pattern: { value: /^0x[a-fA-F0-9]{40}$/, message: "Not a valid address" }
                    }}
                    render={({ field: { onChange, onBlur, value, ref } }) =>
                      <ENSAddressInput val={value} setVal={onChange} inputStyle="rounded-none h-10 rounded-r-md" />
                    }
                    defaultValue={loadedCustomTransaction?.contract || ""}
                  />
                </>
              )}

              {param.type === "uint256" && (
                <>
                  <input
                    type="text"
                    step={1}
                    min={0}
                    {...register(genFieldName(`args.${param.name}`), { shouldUnregister: true, required: "Can't be empty" })}
                    className="block h-10 w-full flex-1 rounded-none border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <GenericButton
                    onClick={() => setValue(genFieldName(`args.${param.name}`), getValues<string>(genFieldName(`args.${param.name}`))
                      .concat("000000000000000000"))}
                    className="inline-flex items-center rounded-none rounded-r-md border border-l-0 border-gray-300 m-0">
                    18
                  </GenericButton>
                </>
              )}

              {param.type === "bool" && (
                <>
                  <input
                    type="checkbox"
                    {...register(genFieldName(`args.${param.name}`), { shouldUnregister: true })}
                    className="block h-10 w-10 flex-1 rounded-none rounded-r-md border-gray-300"
                  />
                </>
              )}

              {param.type !== "address" && param.type !== "uint256" && param.type !== "bool" && (
                <input
                  type="text"
                  step={1}
                  min={0}
                  {...register(genFieldName(`args.${param.name}`), { shouldUnregister: true })}
                  className="block h-10 w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              )}

            </div>

            <ErrorMessage
              errors={errors}
              name={genFieldName(`args.${param.name}`)}
              render={({ message }) => <p className="text-red-500 mt-1">{message}</p>}
            />
          </div>
        ))
      }

    </div >
  )
}

const TEMPLATE = `<h2>Synopsis</h2><p><em>State what the proposal does in one sentence.</em></p><p></p><h2>Motivation</h2><p><em>What problem does this solve? Why now?</em></p><p></p><h2>Specification</h2><p><em>How exactly will this be executed? Be specific and leave no ambiguity.</em></p><p></p><h2>Rationale</h2><p><em>Why is this specification appropriate?</em></p><p></p><h2>Risks</h2><p><em>What might go wrong?</em></p><p></p><h2>Timeline</h2><p><em>When exactly should this proposal take effect? When exactly should this proposal end?</em></p>`
