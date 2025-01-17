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
import { useContext, useState, useEffect } from "react";
import {
  useForm,
  SubmitHandler,
  FormProvider,
  Controller,
} from "react-hook-form";
import { useProposalUpload } from "@/utils/hooks/NanceHooks";
import {
  CustomTransaction,
  ProposalStatus as ProposalStatusType,
  ProposalUploadRequest,
  actionsToYaml,
  // ===== SIGNATURE BASED AUTHENTICATION =====
  // formatSnapshotProposalMessage,
  // domain,
  // SnapshotTypes,
  // ==========================================
  getActionsFromBody,
  trimActionsFromBody
} from "@nance/nance-sdk";
import MiddleStepModal from "../modal/MiddleStepModal";
import Actions from "./Actions";
import { driverSteps } from "./GuideSteps";
import useLocalStorage from "@/utils/hooks/LocalStorage";
import { formatDistance, fromUnixTime, getUnixTime } from "date-fns";
import { ProposalMetadataContext } from "./context/ProposalMetadataContext";
import { NANCE_DEFAULT_IPFS_GATEWAY, ProposalStatus, TEMPLATE } from "@/constants/Nance";
import { ProposalSubmitButton } from "./ProposalSubmitButton";
import DiscordUser from "../CreateSpace/sub/DiscordUser";
import { classNames } from "@/utils/functions/tailwind";
import { SpaceContext } from "@/context/SpaceContext";
import { useAccount, useSignTypedData } from "wagmi";
import { accessCheckWithGuild } from "@/utils/hooks/GuildxyzHooks";
import "@nance/nance-editor/lib/css/editor.css";
import "@nance/nance-editor/lib/css/dark.css";
import { GetMarkdown, SetMarkdown } from "@nance/nance-editor";

// Have to use dynamic import to avoid SSR issues (maybe theres a better way??)
let getMarkdown: GetMarkdown;
let setMarkdown: SetMarkdown;

const NanceEditor = dynamic(
  async () => {
    getMarkdown = (await import("@nance/nance-editor")).getMarkdown;
    setMarkdown = (await import("@nance/nance-editor")).setMarkdown;
    return import("@nance/nance-editor").then(mod => mod.NanceEditor);
  }, {
    ssr: false,
  });

const fileUploadIPFS = {
  gateway: NANCE_DEFAULT_IPFS_GATEWAY,
  auth: `Basic ${Buffer.from(
    `${process.env.NEXT_PUBLIC_INFURA_IPFS_ID}:${process.env.NEXT_PUBLIC_INFURA_IPFS_SECRET}`,
  ).toString("base64")}`
};

const ResultModal = dynamic(() => import("../modal/ResultModal"), {
  ssr: false,
});

const UIGuide = dynamic(() => import("@/components/common/UIGuide"), {
  ssr: false,
});

type ProposalFormValues = Omit<ProposalUploadRequest, "signature">;

type ICustomTransaction = CustomTransaction & { tenderlyStatus: string };

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
  const spaceInfo = useContext(SpaceContext);
  const guildxyz = spaceInfo?.guildxyz;

  // state
  const [formErrors, setFormErrors] = useState<string>("");
  const [selected, setSelected] = useState(ProposalStatus[0]);
  const [submitWillFailReason, setSubmitWillFailReason] = useState<string>("");
  const [formDataPayload, setFormDataPayload] = useState<ProposalFormValues>();
  const [authorDiscordId, setAuthorDiscordId] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  // hooks
  const { address } = useAccount();
  // const { signTypedDataAsync } = useSignTypedData(); // ===== SIGNATURE BASED AUTHENTICATION =====
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
    (!metadata.fork && metadata.loadedProposal?.uuid) || undefined,
    router.isReady,
  );

  const { data: session, status } = useSession();
  const { openConnectModal } = useConnectModal();

  const isNew = metadata.fork || metadata.loadedProposal === undefined;

  // form
  const methods = useForm<ProposalFormValues>({mode: "onBlur"});
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
      getValues("proposal.actions")?.filter(
        (a) =>
          a.type === "Custom Transaction" &&
          (a.payload as ICustomTransaction).tenderlyStatus !== "true",
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
    let uuid;
    if (!metadata.fork && metadata?.loadedProposal) {
      uuid = metadata.loadedProposal.uuid;
    }

    const body = `${formData.proposal.body}\n\n${actionsToYaml(formData.proposal.actions)}`;
    const proposal = {
      ...formData.proposal,
      body,
      authorDiscordId,
      status:
        metadata.loadedProposal?.status === "Temperature Check" && !isNew
          ? "Temperature Check"
          : selected.value as ProposalStatusType,
    };

    if (!address || !spaceInfo?.snapshotSpace) return;
    // ===== SIGNATURE BASED AUTHENTICATION =====
    // const message = formatSnapshotProposalMessage(address, proposal, spaceInfo.snapshotSpace, new Date(), new Date());
    // signTypedDataAsync({
    //   types: SnapshotTypes.proposalTypes,
    //   primaryType: "Proposal",
    //   domain,
    //   message: message as SnapshotTypes.Proposal as any,
    // }).then(async (signature) => {
    // ==========================================

    const req: ProposalUploadRequest = {
      proposal,
      // ===== SIGNATURE BASED AUTHENTICATION =====
      // signature,
      // address,
      // ==========================================
    };
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
        if (res?.data && res.data.uuid) {
          router.push(`/s/${space}/${res.data.uuid}`);
        }
      })
      .catch((err) => {
        console.warn("📗 Nance.editProposal.onSignError ->", err);
      });
    // }); // ===== SIGNATURE BASED AUTHENTICATION =====
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
          setMarkdown(proposalCache.body);
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
              : getActionsFromBody(metadata?.loadedProposal?.body || "")) || []
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
                      onChange: async (e) => {
                        if (!cacheModalIsOpen) {
                          setProposalCache({
                            version: CACHE_VERSION,
                            title: e.target.value,
                            body: getMarkdown() || "",
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
                    defaultValue={trimActionsFromBody(metadata.loadedProposal?.body) || TEMPLATE}
                    render={({ field: { onChange } }) => (
                      <NanceEditor
                        initialValue={trimActionsFromBody(metadata.loadedProposal?.body) || TEMPLATE}
                        onEditorChange={(value) => {
                          if (!cacheModalIsOpen) {
                            setProposalCache({
                              version: CACHE_VERSION,
                              title: getValues("proposal.title"),
                              body: value,
                              timestamp: getUnixTime(new Date()),
                            });
                          }
                          onChange(value);
                        }}
                        fileUploadIPFS={fileUploadIPFS}
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
