import { useContext, useState } from "react";
import SiteNav from "../../../components/SiteNav";
import { useForm, FormProvider, useFormContext, Controller, SubmitHandler } from "react-hook-form";
import ResolvedEns from "../../../components/ResolvedEns";
import ResolvedProject from "../../../components/ResolvedProject";
import { useQueryParam, withDefault, createEnumParam, NumberParam } from "next-query-params";
import React from "react";
import { useRouter } from "next/router";
import Notification from "../../../components/Notification";
import { getUploadUrl, useProposalUpload } from "../../../hooks/NanceHooks";
import { ProposalUploadRequest } from "../../../models/NanceTypes";
import { NANCE_API_URL } from "../../../constants/Nance";
import Link from "next/link";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import useLocalStorage from "../../../hooks/LocalStorage";
import { format } from "date-fns";
import { useAccount, useSigner, useSignTypedData } from "wagmi";
import { DOMAIN, TYPES } from "../../../constants/Signature";
import { Signer } from "ethers";
import { JsonRpcSigner } from "@ethersproject/providers";
import { keccak256, solidityKeccak256, verifyTypedData } from "ethers/lib/utils";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

type ProposalType = "Payout" | "ReservedToken" | "ParameterUpdate" | "ProcessUpdate" | "CustomTransaction";
const ProposalTypes = ["Payout", "ReservedToken", "ParameterUpdate", "ProcessUpdate", "CustomTransaction"];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const ProposalMetadataContext = React.createContext({
  proposalType: "Payout",
  setProposalType: undefined,
  version: 2,
  project: 1
});

export default function NanceNewProposal() {
  console.info(`using nance API: ${NANCE_API_URL}`);
  const router = useRouter();
  const [proposalType, setProposalType] = useQueryParam<ProposalType>('type', withDefault(createEnumParam(["Payout", "ReservedToken", "ParameterUpdate", "ProcessUpdate", "CustomTransaction"]), 'Payout'));
  const [version, setVersion] = useQueryParam('version', withDefault(NumberParam, 2));
  const [project, setProject] = useQueryParam('project', withDefault(NumberParam, 1));

  if(!router.isReady) {
    return <p className="mt-2 text-xs text-gray-500 text-center">loading...</p>
  }

  return (
    <>
      <SiteNav pageTitle="New Proposal on Nance" description="Create new proposal on Nance." image="/images/opengraph/nance_current_demo.png" />
      <div className="m-4 lg:m-6 flex flex-col justify-center">
        <p className="text-center text-xl font-bold text-gray-600">
          New Proposal
        </p>
        <ResolvedProject version={version} projectId={project} style="text-center" />
        <ProposalMetadataContext.Provider value={{proposalType, setProposalType, version, project}}>
          {/* <ProposalTypeTabs /> */}
          <Form />
        </ProposalMetadataContext.Provider>
      </div>
    </>
  )
}

function ProposalTypeTabs() {
  const metadata = useContext(ProposalMetadataContext);
  const current = metadata.proposalType;

  return (
    <div className="my-6">
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          defaultValue={ProposalTypes[0]}
          onChange={(e) => metadata.setProposalType(e.target.value)}
        >
          {ProposalTypes.map((tab) => (
            <option key={tab}>{tab}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <nav className="isolate flex divide-x divide-gray-200 rounded-lg shadow" aria-label="Tabs">
          {ProposalTypes.map((tab, _) => (
            <a
              className={classNames(
                tab == current ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700',
                'first:rounded-l-lg last:rounded-r-lg group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10'
              )}
              aria-current={tab == current ? 'page' : undefined}
              onClick={() => metadata.setProposalType(tab)}
              key={tab}
            >
              <span>{tab}</span>
              <span
                aria-hidden="true"
                className={classNames(
                  tab == current ? 'bg-indigo-500' : 'bg-transparent',
                  'absolute inset-x-0 bottom-0 h-0.5'
                )}
              />
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}

interface ProposalCache {
  body: string;
  timestamp: number;
}

type ProposalFormValues = Omit<ProposalUploadRequest, "type" | "version">

function Form() {
  // query and context
  const router = useRouter();
  const { space } = router.query;
  const metadata = useContext(ProposalMetadataContext);

  // state
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState(undefined);

  // hooks
  const [cachedProposal, setCachedProposal] = useLocalStorage<ProposalCache>("cachedProposal", undefined);
  const { isMutating, error: uploadError, trigger, data, reset } = useProposalUpload(space as string, router.isReady);
  const { address, isConnecting, isDisconnected } = useAccount()
  const { data: signer, isError, isLoading } = useSigner()
  const jrpcSigner = signer as JsonRpcSigner;

  // form
  const methods = useForm<ProposalFormValues>();
  const { register, handleSubmit, control, setValue, getValues, formState: { errors } } = methods;
  const onSubmit: SubmitHandler<ProposalFormValues> = (formData) => {
    console.debug("📗 Nance.newProposal.onSubmit ->", {formData, metadata});

    const payload = {
      ...formData.proposal,
      type: metadata.proposalType as ProposalType,
      version: String(metadata.version)
    };
    const typedValue = {
      path: getUploadUrl(space as string),
      wallet: address,
      timestamp: Math.floor(Date.now() / 1000),
      payload: solidityKeccak256(["string"], [JSON.stringify(payload)])
    };

    setSigning(true);
    // request the signature from user
    jrpcSigner._signTypedData(
      DOMAIN,
      TYPES,
      typedValue
    ).then((signature) => {

      setSigning(false);
      // send to API endpoint
      reset();
      const req: ProposalUploadRequest = {
        signature: {
          address: address,
          timestamp: Math.floor(Date.now() / 1000),
          signature
        },
        proposal: {
          ...formData.proposal,
          type: metadata.proposalType as ProposalType,
          version: String(metadata.version)
        }
      }
      console.debug("📗 Nance.newProposal.verifySignature", {address: verifyTypedData(DOMAIN, TYPES, typedValue, signature), valid: verifyTypedData(DOMAIN, TYPES, typedValue, signature) == address});
      console.debug("📗 Nance.newProposal.upload ->", req);
      trigger(req);
    }).catch((err) => {
      setSigning(false);
      setSignError(err);
      console.warn("📗 Nance.newProposal.onSignError ->", err);
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
      <Notification title="Success" description={`Created proposal ${data?.data.hash}`} show={data !== undefined} close={resetSignAndUpload} checked={true} />
      {(signError || uploadError) && 
        <Notification title="Error" description={error.error_description || error.message || error} show={true} close={resetSignAndUpload} checked={false} />
      }
      <form className="space-y-6 mt-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Metadata</h3>
              <p className="mt-1 text-sm text-gray-500">
                This information will be used by Nance to automate governance.
              </p>
            </div>
            <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
              {metadata.proposalType === 'Payout' && <PayoutMetadataForm />}
              {metadata.proposalType === 'ReservedToken' && <ReservedTokenMetadataForm />}
              {metadata.proposalType === 'ParameterUpdate' && <ParameterUpdateForm />}
            </div>
          </div>
        </div>

        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Proposal</h3>
              <p className="mt-1 text-sm text-gray-500">Detailed content of your proposal.</p>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    {...register("proposal.title", { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="about" className="mt-6 block text-sm font-medium text-gray-700">
                  Body
                </label>
                
                <div className="mt-1">
                  <Controller
                    name="proposal.body"
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { onChange, onBlur, value, ref } }) => 
                      <MDEditor ref={ref} onBlur={onBlur}
                        value={value} onChange={(val) => {
                          onChange(val);
                          setCachedProposal({
                            body: val,
                            timestamp: Date.now()
                          });
                        }}
                        height={600} />}
                    defaultValue={cachedProposal?.body || PORPOSAL_TEMPLATE}
                  />
                </div>

                {cachedProposal && (
                  <div className="mt-1 flex">
                    <p className="text-gray-500">Last saved on {format(cachedProposal.timestamp, 'LLL d, yy HH:mm')}</p>
                    <button type="button" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100 ml-2 mb-1"
                    onClick={() => {
                      setCachedProposal(undefined)
                      setValue("proposal.body", PORPOSAL_TEMPLATE)
                    }}>
                      Reset to template
                    </button>
                </div>
                )}
                {/* <p className="mt-2 text-sm text-gray-500">Brief description for your profile. URLs are hyperlinked.</p> */}
              </div>
            </div>
          </div>
        </div>

        {/* <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Notifications</h3>
              <p className="mt-1 text-sm text-gray-500">Decide which communications you&lsquo;d like to receive and how.</p>
            </div>
            <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
              <fieldset>
                <legend className="sr-only">By Email</legend>
                <div className="text-base font-medium text-gray-900" aria-hidden="true">
                  By Discord
                </div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        {...register("notification.expiry")}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notification.expiry" className="font-medium text-gray-700">
                        Expiry
                      </label>
                      <p className="text-gray-500">Get notified when your proposal expires.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        {...register("notification.execution")}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notification.execution" className="font-medium text-gray-700">
                        Execution
                      </label>
                      <p className="text-gray-500">Get notified when your proposal gets executed.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        {...register("notification.progress")}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notification.progress" className="font-medium text-gray-700">
                        Progress
                      </label>
                      <p className="text-gray-500">Get notified when your proposal moves to new stage (temperature check & snapshot voting).</p>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </div> */}

        <div className="flex justify-end">
          <Link href={`/nance/${space as string}`}>
            <a
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </a>
          </Link>
          <button
            type="submit"
            disabled={!jrpcSigner || isSubmitting}
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {isSubmitting ? "Submitting" : "Submit"}
          </button>
        </div>
      </form>
    </FormProvider>
  )
}

function ParameterUpdateForm() {
  const { register } = useFormContext();
  const fields = {
    "parameter.discount": "Discount Rate",
    "parameter.reserved": "Reserved Rate",
    "parameter.redemption": "Redemption Rate",
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-2">
        <label htmlFor="parameter.duration" className="block text-sm font-medium text-gray-700">
          Duration
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="number"
            placeholder="7"
            {...register("parameter.duration", { required: true, valueAsNumber: true, shouldUnregister: true })}
            className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          <span className="inline-flex items-center rounded-r-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
            days
          </span>
        </div>
      </div>

      {Object.entries(fields).map(values => (
        <div key={values[0]} className="col-span-4 sm:col-span-2">
          <label htmlFor={values[0]} className="block text-sm font-medium text-gray-700">
            {values[1]}
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="number"
              min={0.01}
              max={100}
              step={0.01}
              placeholder="50"
              {...register(values[0], { required: true, valueAsNumber: true, shouldUnregister: true })}
              className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
              %
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ReservedTokenMetadataForm() {
  const metadata = useContext(ProposalMetadataContext);
  const { register, setValue } = useFormContext();
  const [inputEns, setInputEns] = useState<string>('')

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-2">
        <label htmlFor="receiver-value" className="block text-sm font-medium text-gray-700">
          Receiver Address
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            onChange={(e) => {
              setValue("proposal.reserve.address", e.target.value);
              setInputEns(e.target.value);
            }}
            className="block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="jbdao.eth / 0x0000000000000000000000000000000000000000"
          />
          <input
            type="text"
            {...register("proposal.reserve.address", { required: true, shouldUnregister: true })}
            className="hidden w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <ResolvedEns ens={inputEns} hook={(address) => setValue("proposal.reserve.address", address)} />
      </div>

      <div className="col-span-4 sm:col-span-2">
        <label htmlFor="proposal.reserve.percentage" className="block text-sm font-medium text-gray-700">
          Percentage
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="number"
            min={0.01}
            max={100}
            step={0.01}
            {...register("proposal.reserve.percentage", { required: true, valueAsNumber: true, shouldUnregister: true })}
            className="block w-full flex-1 rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="50"
          />
          <span className="inline-flex items-center rounded-none rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
            %
          </span>
        </div>
      </div>
    </div>
  )
}

function PayoutMetadataForm() {
  const metadata = useContext(ProposalMetadataContext);
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const [inputEns, setInputEns] = useState<string>('')

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-1">
        <label htmlFor="proposal.payout.type" className="block text-sm font-medium text-gray-700">
          Receiver Type
        </label>
        <select
          {...register("proposal.payout.type", { shouldUnregister: true })}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          <option value="address">Address</option>
          <option value="project">Project</option>
        </select>
      </div>
      <div className="col-span-4 sm:col-span-1">
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
          Duration(Cycles)
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="number"
            step={1}
            min={1}
            {...register("proposal.payout.count", { required: true, valueAsNumber: true, shouldUnregister: true })}
            className="block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="1"
          />
        </div>
      </div>
      <div className="col-span-4 sm:col-span-2">
        <label htmlFor="proposal.payout.amountUSD" className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
            $
          </span>
          <input
            type="number"
            step={1}
            min={1}
            {...register("proposal.payout.amountUSD", { required: true, valueAsNumber: true, shouldUnregister: true })}
            className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="1500"
          />
        </div>
      </div>

      {
        watch("proposal.payout.type") === "project" && (
          <div className="col-span-4 sm:col-span-2">
            <label htmlFor="proposal.payout.project" className="block text-sm font-medium text-gray-700">
              Project Receiver
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                {...register("proposal.payout.project", { required: true, valueAsNumber: true, shouldUnregister: true })}
                className="block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="1"
              />
            </div>
            <ResolvedProject version={metadata.version} projectId={watch("proposal.payout.project")} />
          </div>
        )
      }
      <div className="col-span-4 sm:col-span-2">
        <label htmlFor="payout.address" className="block text-sm font-medium text-gray-700">
          {watch("proposal.payout.type") === "project" ? "Token Beneficiary" : "Receiver Address"}
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            onChange={(e) => {
              setValue("proposal.payout.address", e.target.value);
              setInputEns(e.target.value);
            }}
            className="block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="jbdao.eth / 0x0000000000000000000000000000000000000000"
          />
          <input
            type="text"
            {...register("proposal.payout.address", { required: true, shouldUnregister: true })}
            className="hidden w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <ResolvedEns ens={inputEns} hook={(address) => setValue("proposal.payout.address", address)} />
      </div>
    </div>
  )
}

const PORPOSAL_TEMPLATE = `Status: Draft

\`\`\`
Author:
Date: (YYYY-MM-DD)
\`\`\`

## Synopsis

*State what the proposal does in one sentence.*

## Motivation

*What problem does this solve? Why now?* 

## Specification

*How exactly will this be executed? Be specific and leave no ambiguity.* 

## Rationale

*Why is this specification appropriate?*

## Risks

*What might go wrong?*

## Timeline

*When exactly should this proposal take effect? When exactly should this proposal end?*`