import { Listbox, Transition } from "@headlessui/react";
import { CheckCircleIcon, ArrowPathIcon, ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Editor } from "@tinymce/tinymce-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useState, useEffect, Fragment } from "react";
import { useForm, SubmitHandler, FormProvider, Controller } from "react-hook-form";
import { fileDrop } from "../../../hooks/FileDrop";
import { imageUpload } from "../../../hooks/ImageUpload";
import { useProposalUpload } from "../../../hooks/NanceHooks";
import { htmlToMarkdown } from "../../../libs/markdown";
import { classNames } from "../../../libs/tailwind";
import { CustomTransaction, ProposalUploadRequest } from "../../../models/NanceTypes";
import { ProposalMetadataContext } from "../../../pages/s/[space]/edit";
import MiddleStepModal from "../../modal/MiddleStepModal";
import ResultModal from "../../modal/ResultModal";
import Actions from "./Actions";
import { DriveStep } from "driver.js";
import UIGuide from "../../modal/UIGuide";
import useLocalStorage from "../../../hooks/LocalStorage";
import { formatDistance, fromUnixTime, getUnixTime } from "date-fns";
import { revalidatePath } from 'next/cache';

type ProposalFormValues = Omit<ProposalUploadRequest, "signature">

const ProposalStatus = [
  { title: "Publish", description: "Publish your proposal and let people join the discussion.", value: "Discussion", display: "Publish" },
  { title: "Draft", description: "Save your proposal as draft, you can publish it later.", value: "Draft", display: "Save as Draft" },
  { title: "Private Draft", description: "Save your proposal as private, you can publish it later for discussion.", value: "Private", display: "Save as Private" },
];

const TEMPLATE = `<h2>Synopsis</h2><p><em>State what the proposal does in one sentence.</em></p><p></p><h2>Motivation</h2><p><em>What problem does this solve? Why now?</em></p><p></p><h2>Specification</h2><p><em>How exactly will this be executed? Be specific and leave no ambiguity.</em></p><p></p><h2>Rationale</h2><p><em>Why is this specification appropriate?</em></p><p></p><h2>Risks</h2><p><em>What might go wrong?</em></p><p></p><h2>Timeline</h2><p><em>When exactly should this proposal take effect? When exactly should this proposal end?</em></p>`;

const driverSteps: DriveStep[] = [
  {
    element: "#add-action-button",
    popover: {
      title: "Add an action",
      description: "Specify this proposal's onchain actions.",
      side: "bottom", align: 'start'
    },
  },
  {
    element: "#proposal-title",
    popover: {
      title: "Input proposal title",
      description: "Keep it short and simple.",
      side: "bottom", align: 'start'
    },
  },
  {
    element: "#proposal-body",
    popover: {
      title: "Input proposal body",
      description: "You can write more details here. You can also drag and drop markdown file or image to attach content (images are pinned to IPFS).",
      side: "bottom", align: 'start'
    },
  },
  {
    element: "#submit-button-div",
    popover: {
      title: "Submit the proposal",
      description: "After you connected wallet, you can either submit the proposal or save it as private draft.",
      side: "top", align: 'start'
    },
  },
];

interface ProposalCache {
  version: number;
  timestamp: number;
  title: string;
  body: string;
}

const CACHE_VERSION = 1;

export default function ProposalEditForm({ space }: { space: string }) {
  // query and context
  const router = useRouter();
  const metadata = useContext(ProposalMetadataContext);

  // state
  const [formErrors, setFormErrors] = useState<string>("");
  const [selected, setSelected] = useState(ProposalStatus[0]);
  const [txnsMayFail, setTxnsMayFail] = useState(false);
  const [formDataPayload, setFormDataPayload] = useState<ProposalFormValues>();

  // hooks
  const [proposalCache, setProposalCache] = useLocalStorage<ProposalCache>("ProposalCache", CACHE_VERSION, { version: CACHE_VERSION, title: "", body: "", timestamp: 0 });
  const [cacheModalIsOpen, setCacheModalIsOpen] = useState(!!(proposalCache.title || proposalCache.body));
  const { isMutating, error: uploadError, trigger, data, reset } = useProposalUpload(space, !metadata.fork && metadata.loadedProposal?.hash || undefined, router.isReady);

  const { data: session, status } = useSession();
  const { openConnectModal } = useConnectModal();

  const isNew = metadata.fork || metadata.loadedProposal === null;

  // form
  const methods = useForm<ProposalFormValues>();
  const { register, handleSubmit, control, formState, getValues, setValue } = methods;
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
      status: (metadata.loadedProposal?.status === 'Temperature Check' && !isNew) ? 'Temperature Check' : selected.value,
      body: await htmlToMarkdown(formData.proposal.body ?? ""),
      hash
    };
    console.debug("📚 Nance.editProposal.onSubmit ->", { formData, payload });

    const req: ProposalUploadRequest = {
      proposal: payload as any
    };
    console.debug("📗 Nance.editProposal.submit ->", req);
    trigger(req).then((res) => {
      revalidatePath('/s/[space]/[proposal]');
      console.debug("📗 Nance.editProposal.onSignSuccess ->", res);
    }).catch((err) => {
      console.warn("📗 Nance.editProposal.onSignError ->", err);
    });
  };

  // shortcut
  const isSubmitting = isMutating;
  const error = uploadError;

  useEffect(() => {
    if (formState.errors && Object.keys(formState.errors).length > 0) {
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

  function getButtonLabel(selected: { title: string, description: string, value: string, display: string }) {
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

      {!error && <ResultModal title="Success" description={`Proposal "${getValues("proposal.title")}" ${isNew ? "created" : "updated"} by ${session?.user?.name || "unknown"}`} buttonText="Go to proposal page" onClick={() => router.push(`/s/${space}/${data?.data.hash}`)} isSuccessful={true} shouldOpen={data !== undefined} close={reset} />}
      {error && <ResultModal title="Error" description={error.error_description || error.message || error} buttonText="Close" onClick={reset} isSuccessful={false} shouldOpen={true} close={reset} />}

      <ResultModal
        title="You have saved proposal content, do you wish to restore it?"
        description={`Saved ${formatDistance(fromUnixTime(proposalCache.timestamp), new Date(), { addSuffix: true })}. Title: ${proposalCache.title}, Content: ${proposalCache.body.slice(0, 140)}...`}
        buttonText="Restore" onClick={() => {
          setValue("proposal.title", proposalCache.title);
          setValue("proposal.body", proposalCache.body);
          setCacheModalIsOpen(false);
        }}
        cancelButtonText="Delete" close={() => {
          setProposalCache({ version: CACHE_VERSION, title: "", body: "", timestamp: 0 });
          setCacheModalIsOpen(false);
        }}
        shouldOpen={cacheModalIsOpen} />

      <UIGuide name="EditPage" steps={driverSteps} />
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
                <div id="proposal-title">
                  <input
                    type="text"
                    {...register("proposal.title", {
                      value: metadata.loadedProposal?.title || "Proposal Title",
                      onChange: (e) => {
                        if (!cacheModalIsOpen) {
                          setProposalCache({ version: CACHE_VERSION, title: e.target.value, body: getValues("proposal.body") || "", timestamp: getUnixTime(new Date()) });
                        }
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xl"
                  />
                </div>
              </div>

              <div>
                <div className="mt-4" id="proposal-body">
                  <Controller
                    name="proposal.body"
                    control={control}
                    render={({ field: { onChange, onBlur, value, ref } }) =>
                      <Editor
                        apiKey={process.env.NEXT_PUBLIC_TINY_KEY || 'no-api-key'}
                        onInit={(evt, editor) => editor.setContent(metadata.loadedProposal?.body || TEMPLATE)}
                        initialValue={metadata.loadedProposal?.body || TEMPLATE}
                        value={value}
                        onEditorChange={(newValue, editor) => {
                          if (!cacheModalIsOpen) {
                            setProposalCache({ version: CACHE_VERSION, title: getValues("proposal.title") || "", body: newValue, timestamp: getUnixTime(new Date()) });
                          }
                          onChange(newValue);
                        }}
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

        <div className="flex justify-end" id="submit-button-div">
          <Link href={`/s/${space}`} legacyBehavior>
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
