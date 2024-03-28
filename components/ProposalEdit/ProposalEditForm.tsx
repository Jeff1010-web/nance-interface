/* eslint-disable max-lines */
"use client";
import {
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useContext, useState, useEffect, useRef } from "react";
import {
  useForm,
  SubmitHandler,
  FormProvider,
  Controller,
} from "react-hook-form";
import { useProposalUpload } from "@/utils/hooks/NanceHooks";
import { CustomTransaction, ProposalUploadRequest } from "@/models/NanceTypes";
import MiddleStepModal from "../modal/MiddleStepModal";
import Actions from "./Actions";
import { driverSteps } from "./GuideSteps";
import useLocalStorage from "@/utils/hooks/LocalStorage";
import { formatDistance, fromUnixTime, getUnixTime } from "date-fns";
import { Editor } from "@toast-ui/react-editor";
import { getMarkdown, setMarkdown } from "@/components/Markdown/utils";
import { ProposalMetadataContext } from "./context/ProposalMetadataContext";
import { ProposalStatus, TEMPLATE } from "@/constants/Nance";
import { ProposalSubmitButton } from "./ProposalSubmitButton";
import DiscordUser from "../CreateSpace/sub/DiscordUser";
import { classNames } from "@/utils/functions/tailwind";
import { SpaceContext } from "@/context/SpaceContext";
import { useAccount } from "wagmi";
import { accessCheckWithGuild } from "@/utils/hooks/GuildxyzHooks";

const ResultModal = dynamic(() => import("../modal/ResultModal"), {
  ssr: false,
});
const MarkdownEditor = dynamic(
  () => import("@/components/Markdown/MarkdownEditor"),
  { ssr: false },
);
const UIGuide = dynamic(() => import("@/components/common/UIGuide"), {
  ssr: false,
});

type ProposalFormValues = Omit<ProposalUploadRequest, "signature">;

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
  const editorRef = useRef<Editor>(null);
  const spaceInfo = useContext(SpaceContext);
  const guildxyz = spaceInfo?.guildxyz;

  // state
  const [formErrors, setFormErrors] = useState<string>("");
  const [selected, setSelected] = useState(ProposalStatus[0]);
  const [submitWillFailReason, setSubmitWillFailReason] = useState<string>("");
  const [formDataPayload, setFormDataPayload] = useState<ProposalFormValues>();
  const [authorDiscordId, setAuthorDiscordId] = useState<string | null>();
  const [submitted, setSubmitted] = useState(false);

  // hooks
  const { address } = useAccount();
  const [proposalCache, setProposalCache] = useLocalStorage<ProposalCache>(
    "ProposalCache",
    CACHE_VERSION,
    { version: CACHE_VERSION, title: "", body: "", timestamp: 0 },
  );
  const [cacheModalIsOpen, setCacheModalIsOpen] = useState(
    !!(proposalCache.title || proposalCache.body),
  );
  const {
    isMutating,
    error: uploadError,
    trigger,
    data,
    reset,
  } = useProposalUpload(
    space,
    (!metadata.fork && metadata.loadedProposal?.hash) || undefined,
    router.isReady,
  );

  const { data: session, status } = useSession();
  const { openConnectModal } = useConnectModal();

  const isNew = metadata.fork || metadata.loadedProposal === null;

  // form
  const methods = useForm<ProposalFormValues>();
  const {
    register,
    handleSubmit,
    control,
    formState,
    getValues,
    setValue,
  } = methods;

  const onSubmit: SubmitHandler<ProposalFormValues> = async (formData) => {
    // check if actions all passed simulation
    const _allSimulated =
      getValues("proposal.actions").filter(
        (a) =>
          a.type === "Custom Transaction" &&
          (a.payload as CustomTransaction).tenderlyStatus !== "true",
      ).length === 0;
    const simulationFailedInfo = _allSimulated
      ? ""
      : "You have some transactions may failed based on simulations.\n";

    // check if user has satisfied the requirements of potential guildxyz gate
    const { hasPassGuildxyzCheck, guildxyzInfo } = await accessCheckWithGuild(
      guildxyz?.id,
      address,
      guildxyz?.roles || [],
    );

    if (
      _allSimulated &&
      (selected.value !== "Discussion" || hasPassGuildxyzCheck)
    ) {
      return await processAndUploadProposal(formData);
    } else {
      setFormDataPayload(formData);
      setSubmitWillFailReason(simulationFailedInfo + guildxyzInfo);
    }
  };
  const processAndUploadProposal: SubmitHandler<ProposalFormValues> = async (
    formData,
  ) => {
    let hash;
    if (!metadata.fork && metadata?.loadedProposal) {
      hash = metadata.loadedProposal.hash;
    }

    const payload = {
      ...formData.proposal,
      authorDiscordId: authorDiscordId,
      status:
        metadata.loadedProposal?.status === "Temperature Check" && !isNew
          ? "Temperature Check"
          : selected.value,
      body: formData.proposal.body,
      hash,
    };
    console.debug("📚 Nance.editProposal.onSubmit ->", { formData, payload });

    const req: ProposalUploadRequest = {
      proposal: payload as any,
    };
    console.debug("📗 Nance.editProposal.submit ->", req);
    trigger(req)
      .then(async (res) => {
        setSubmitted(true);
        // clear local cache
        setProposalCache({
          version: CACHE_VERSION,
          title: "",
          body: "",
          timestamp: 0,
        });
        console.debug("📗 Nance.editProposal.onSignSuccess ->", res);
        if (res?.data && res.data.hash) {
          router.push(`/s/${space}/${res.data.hash}`);
        }
      })
      .catch((err) => {
        console.warn("📗 Nance.editProposal.onSignError ->", err);
      });
  };

  // shortcut
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
      setFormErrors("in actions " + arr.join(", "));
    } else {
      setFormErrors("");
    }
  }, [formState.errors]);

  return (
    <FormProvider {...methods}>
      {error && (
        <ResultModal
          title="Error"
          description={error.error_description || error.message || error}
          buttonText="Close"
          onClick={reset}
          isSuccessful={false}
          shouldOpen={true}
          close={reset}
        />
      )}

      <ResultModal
        title="You have saved proposal content, do you wish to restore it?"
        description={`Saved ${formatDistance(
          fromUnixTime(proposalCache.timestamp),
          new Date(),
          { addSuffix: true },
        )}. Title: ${proposalCache.title}, Content: ${proposalCache.body.slice(
          0,
          140,
        )}...`}
        buttonText="Restore"
        onClick={() => {
          setValue("proposal.title", proposalCache.title);
          setMarkdown(editorRef, proposalCache.body);
          setCacheModalIsOpen(false);
        }}
        cancelButtonText="Delete"
        close={() => {
          setProposalCache({
            version: CACHE_VERSION,
            title: "",
            body: "",
            timestamp: 0,
          });
          setCacheModalIsOpen(false);
        }}
        shouldOpen={cacheModalIsOpen}
      />

      <UIGuide name="EditPage" steps={driverSteps} />
      <MiddleStepModal
        open={submitWillFailReason.length > 0}
        setOpen={(v) => {
          if (!v) {
            setSubmitWillFailReason("");
          }
        }}
        title="Submit will fail, please check the following:"
        description={submitWillFailReason}
        onContinue={() => processAndUploadProposal(formDataPayload!)}
      />
      <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Actions
          loadedActions={
            (metadata.fork ? metadata.loadedProposal?.actions?.map(({ uuid, ...rest }) => rest)
              : metadata.loadedProposal?.actions) || []
          }
        />

        <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div>
            <div>
              <div className=" gap-6">
                <div id="proposal-title">
                  <input
                    type="text"
                    {...register("proposal.title", {
                      value: metadata.loadedProposal?.title || "Proposal Title",
                      onChange: (e) => {
                        if (!cacheModalIsOpen) {
                          setProposalCache({
                            version: CACHE_VERSION,
                            title: e.target.value,
                            body: getMarkdown(editorRef) || "",
                            timestamp: getUnixTime(new Date()),
                          });
                        }
                      },
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 text-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="mt-4" id="proposal-body">
                  <Controller
                    name="proposal.body"
                    control={control}
                    defaultValue={metadata.loadedProposal?.body || TEMPLATE}
                    render={({ field: { onChange } }) => (
                      <MarkdownEditor
                        parentRef={editorRef}
                        onEditorChange={(value) => {
                          if (!cacheModalIsOpen) {
                            setProposalCache({
                              version: CACHE_VERSION,
                              title: getValues("proposal.title"),
                              body: value || "",
                              timestamp: getUnixTime(new Date()),
                            });
                          }
                          onChange(value);
                        }}
                        initialValue={metadata.loadedProposal?.body || TEMPLATE}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            <CheckCircleIcon className="mr-1 inline h-5 w-5" />
            Drag and drop markdown file or image to attach content (images are
            pinned to IPFS)
          </p>
        </div>

        {formErrors.length > 0 && (
          <p className="mt-1 text-red-500">Form errors: {formErrors}</p>
        )}

        <div className="flex justify-end" id="submit-button-div">
          {status === "unauthenticated" && (
            <button
              type="button"
              onClick={() => openConnectModal?.()}
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              Connect Wallet
            </button>
          )}

          {status !== "unauthenticated" && (
            <div
              className={classNames(
                "flex w-full",
                isNew ? "justify-between" : "justify-end",
              )}
            >
              {isNew ? (
                <div className="ml-6 items-center">
                  <DiscordUser
                    address={session?.user?.name || ""}
                    setDiscordId={setAuthorDiscordId}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    <InformationCircleIcon className="mr-1 inline h-5 w-5" />
                    Optional: receive notification of proposal status changes
                  </p>
                </div>
              ) : (
                <></>
              )}
              <ProposalSubmitButton
                formErrors={formErrors}
                status={status}
                isMutating={formState.isSubmitting || isMutating || submitted}
                selected={selected}
                setSelected={setSelected}
              />
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
