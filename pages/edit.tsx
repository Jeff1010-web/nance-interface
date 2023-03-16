import { useContext, useEffect, useRef, useState } from "react";
import SiteNav from "../components/SiteNav";
import { useForm, FormProvider, useFormContext, Controller, SubmitHandler } from "react-hook-form";
import ResolvedEns from "../components/ResolvedEns";
import ResolvedProject from "../components/ResolvedProject";
import { withDefault, NumberParam, useQueryParams, StringParam } from "next-query-params";
import React from "react";
import { useRouter } from "next/router";
import Notification from "../components/Notification";
import { fetchProposal, useProposalUpload } from "../hooks/NanceHooks";
import { imageUpload } from "../hooks/ImageUpload";
import { Proposal, ProposalUploadRequest } from "../models/NanceTypes";
import { NANCE_API_URL, NANCE_DEFAULT_SPACE } from "../constants/Nance";
import Link from "next/link";

import { useAccount, useSigner } from "wagmi";
import { JsonRpcSigner } from "@ethersproject/providers";
import { signPayload } from "../libs/signer";

import { Editor } from '@tinymce/tinymce-react';

import { markdownToHtml, htmlToMarkdown } from '../libs/markdown.ts';
import { useConnectModal } from "@rainbow-me/rainbowkit";

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
      <div className="m-4 lg:m-6 flex flex-col justify-center">
        <p className="text-center text-xl font-bold text-gray-600">
          {proposalId ? "Edit" : "New"} Proposal
        </p>
        <ResolvedProject version={version} projectId={project} style="text-center" />
        <ProposalMetadataContext.Provider value={{ loadedProposal, version, project }}>
          <Form space={space} />
        </ProposalMetadataContext.Provider>
      </div>
    </>
  )
}

type ProposalFormValues = Omit<ProposalUploadRequest, "type" | "version">

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
    const payload = {
      ...formData.proposal,
      body: await htmlToMarkdown(formData.proposal.body),
      type: "Payout",
      version: String(metadata.version)
    };
    console.debug("📚 Nance.editProposal.onSubmit ->", { formData, payload })

    setSigning(true);

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
                    {...register("proposal.title", { value: metadata.loadedProposal?.title || "" })}
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
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                            'image', 'autosave', 'template'
                          ],
                          toolbar: 'restoredraft undo redo | template blocks | ' +
                            'image bold italic forecolor | bullist numlist outdent indent | ' +
                            'removeformat | help',
                          menubar: false,
                          images_upload_handler: imageUpload,
                          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                          autosave_restore_when_empty: true,
                          template_replace_values: {
                            username: isConnected ? address : "Wallet not connected"
                          },
                          template_cdate_format: '%Y-%m-%d',
                          templates: [
                            { title: 'Proposal template', description: 'Author and date will be replaced automatically', content: TEMPLATE }
                          ]
                        }}
                      />
                    }
                  />
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Metadata</h3>
              <p className="mt-1 text-sm text-gray-500">
                This information will be used by Nance to automate governance.
              </p>
            </div>
            <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
              <PayoutMetadataForm />
            </div>
          </div>
        </div>

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
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
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
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              {signing ? (isMutating ? "Submitting..." : "Signing...") : "Submit"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}

function PayoutMetadataForm() {
  const metadata = useContext(ProposalMetadataContext);
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const [inputEns, setInputEns] = useState<string>("");

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === "proposal.payout.type" && type === "change") {
        if (value.proposal.payout.type == "project") {
          (document.getElementById("payoutAddressInput") as HTMLInputElement).value = "dao.jbx.eth";
          setInputEns("dao.jbx.eth");
        } else {
          (document.getElementById("payoutAddressInput") as HTMLInputElement).value = "";
          setInputEns("");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-1">
        <label htmlFor="proposal.payout.type" className="block text-sm font-medium text-gray-700">
          Receiver Type
        </label>
        <select
          {...register("proposal.payout.type",
            { shouldUnregister: true, value: metadata.loadedProposal?.payout?.project ? "project" : "address" })}
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
            {...register("proposal.payout.count", { valueAsNumber: true, shouldUnregister: true, value: metadata.loadedProposal?.payout?.count || 1 })}
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
            min={0}
            {...register("proposal.payout.amountUSD", { valueAsNumber: true, shouldUnregister: true, value: metadata.loadedProposal?.payout?.amountUSD || 0 })}
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
                {...register("proposal.payout.project", { valueAsNumber: true, shouldUnregister: true, value: metadata.loadedProposal?.payout?.project || 1 })}
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
            id="payoutAddressInput"
            defaultValue={metadata.loadedProposal?.payout?.address || "0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e"}
            onChange={(e) => setInputEns(e.target.value)}
            className="block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="dao.jbx.eth / 0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e"
          />
          <input
            type="text"
            {...register("proposal.payout.address", { shouldUnregister: true })}
            className="hidden w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <ResolvedEns ens={inputEns} hook={(address) => setValue("proposal.payout.address", address)} />
      </div>
    </div>
  )
}

const TEMPLATE = `<h1>Proposal Template</h1><pre><code>Author: {$username}
Date: <span class="cdate">(YYYY-MM-DD)</span>
</code></pre><h2>Synopsis</h2><p><em>State what the proposal does in one sentence.</em></p><p></p><h2>Motivation</h2><p><em>What problem does this solve? Why now?</em></p><p></p><h2>Specification</h2><p><em>How exactly will this be executed? Be specific and leave no ambiguity.</em></p><p></p><h2>Rationale</h2><p><em>Why is this specification appropriate?</em></p><p></p><h2>Risks</h2><p><em>What might go wrong?</em></p><p></p><h2>Timeline</h2><p><em>When exactly should this proposal take effect? When exactly should this proposal end?</em></p>`
