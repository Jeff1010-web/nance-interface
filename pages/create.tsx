/* eslint-disable react/jsx-no-undef */
import { useContext } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Notification from "@/components/common/Notification";
import { CreateFormValues } from "@/models/NanceTypes";
import { useCreateSpace } from "@/utils/hooks/NanceHooks";
import ProjectForm from "@/components/form/ProjectForm";
import {
  DiscordForm,
  GovernanceCycleForm,
  SnapshotForm,
} from "@/components/CreateSpace";
import { SiteNav } from "@/components/Site";
import DiscordUser from "@/components/CreateSpace/sub/DiscordUser";
import WalletConnectWrapper from "@/components/WalletConnectWrapper/WalletConnectWrapper";
import MultipleStep from "@/components/MultipleStep/MultipleStep";
import DescriptionCardWrapper from "@/components/DescriptionCardWrapper/DescriptionCardWrapper";
import { NetworkContext } from "@/context/NetworkContext";
import RulesForm from "@/components/CreateSpace/RulesForm";
import BackNextButtons from "@/components/CreateSpace/BackNextButtons";
import ReviewSpaceConfig from "@/components/CreateSpace/ReviewSpaceConfig";
import SafeAddressForm from "@/components/form/SafeAddressForm";
import SpaceOwnersForm from "@/components/CreateSpace/SpaceOwnersForm";

export default function CreateSpacePage() {
  return (
    <>
      <SiteNav
        pageTitle="nance control panel"
        withProposalButton={false}
        withWallet
      />
      <div className="m-5 md:m-10 lg:m-20">
        <WalletConnectWrapper
          renderButton={(button: JSX.Element) => (
            <DescriptionCardWrapper
              title="Connect your wallet"
              description="Please connect your wallet to continue, we need to know who you are."
            >
              {button}
            </DescriptionCardWrapper>
          )}
        >
          <Form />
        </WalletConnectWrapper>
      </div>
    </>
  );
}

export const JUICEBOX_PROJECT_FIELD = "config.juicebox.projectId";

function Form() {
  const { data: session, status } = useSession();
  const address = session?.user?.name || "";
  // query and context
  const router = useRouter();
  const dryrun = router.query.dryrun === "true";
  // hooks
  const {
    isMutating,
    error: uploadError,
    trigger,
    data,
    reset,
  } = useCreateSpace(router.isReady);
  // form
  const methods = useForm<CreateFormValues>({ mode: "onChange" });
  const {
    handleSubmit,
    formState: { isValid },
    trigger: triggerFormValidation,
    getValues,
  } = methods;
  const onSubmit: SubmitHandler<CreateFormValues> = async (formData) => {
    console.log(formData);
    const payload = { ...formData, dryrun };
    console.debug("📚 Nance.createSpace.onSubmit ->", { formData, payload });
    return trigger(payload).then((res) => {
      if (dryrun) console.debug("📚 Nance.createSpace.onSubmit -> ", res);
      else router.push(`/s/${formData.config.name}`);
    });
  };

  const network = useContext(NetworkContext);

  return (
    <FormProvider {...methods}>
      <Notification
        title="Success"
        description={dryrun ? JSON.stringify(data) : "Space created!"}
        show={data !== undefined}
        close={() => {
          reset();
        }}
        checked={true}
      />
      {uploadError && (
        <Notification
          title="Error"
          description={"error"}
          show={true}
          close={() => {
            reset();
          }}
          checked={false}
        />
      )}
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <MultipleStep
          steps={[
            {
              name: "Rules",
              contentRender: (back, next) => (
                <DescriptionCardWrapper
                  title="Describe the Space"
                  description="Please choose a name for your space and a prefix for your proposal IDs."
                >
                  <RulesForm />
                  <SpaceOwnersForm />
                  <BackNextButtons back={back} next={next} />
                </DescriptionCardWrapper>
              ),
            },
            {
              name: "Schedule",
              contentRender: (back, next) => (
                <DescriptionCardWrapper
                  title="Configure the Governance Cycle"
                  description={
                    <span>
                      A Governance Cycle is a set amount of time that a DAO has
                      to propose, discuss, vote, and execute proposals.{" "}
                      <a
                        href="https://docs.nance.app/docs/basics/governance-cycle"
                        className="underline"
                      >
                        Learn more.
                      </a>
                    </span>
                  }
                >
                  <GovernanceCycleForm />
                  <BackNextButtons back={back} next={next} />
                </DescriptionCardWrapper>
              ),
            },
            {
              name: "Snapshot",
              contentRender: (back, next) => (
                <DescriptionCardWrapper
                  title="Connect with Snapshot"
                  description="Snapshot is a free, open-source platform for community governance. Nance can connect with your Snapshot space to create proposals, and then users can directly vote here."
                >
                  <SnapshotForm session={session!} />
                  <BackNextButtons back={back} next={next} />
                </DescriptionCardWrapper>
              ),
            },
            {
              name: "Discord",
              contentRender: (back, next) => (
                <DescriptionCardWrapper
                  title="Connect with Discord"
                  description="Nance can connect with your Discord server to send governance messages."
                >
                  <DiscordUser address={address}>
                    <DiscordForm />
                  </DiscordUser>
                  <BackNextButtons back={back} next={next} />
                </DescriptionCardWrapper>
              ),
            },
            {
              name: "Safe",
              contentRender: (back, next) => (
                <DescriptionCardWrapper
                  title="Connect with Safe (Optional)"
                  description="Nance can connect with your Safe to queue transactions after proposals pass."
                >
                  <div className="max-w-md">
                    <SafeAddressForm />
                  </div>
                  <BackNextButtons
                    back={back}
                    next={next}
                    labelAsSkip={
                      !(
                        getValues("config.juicebox.gnosisSafeAddress")?.length >
                        0
                      )
                    }
                  />
                </DescriptionCardWrapper>
              ),
            },
            {
              name: "Juicebox",
              contentRender: (back, next) => (
                <DescriptionCardWrapper
                  title="Connect with Juicebox (Optional)"
                  description="Nance can connect with your Juicebox project to queue reconfigurations after proposals pass."
                >
                  <div className="w-fit">
                    <ProjectForm
                      label="Juicebox project"
                      fieldName={JUICEBOX_PROJECT_FIELD}
                      showType={false}
                      required={false}
                    />
                  </div>
                  <BackNextButtons
                    back={back}
                    next={next}
                    labelAsSkip={
                      getValues("config.juicebox.projectId") === undefined
                    }
                  />
                </DescriptionCardWrapper>
              ),
            },
            {
              name: "Review and Submit",
              contentRender: (back, next, setStep) => (
                <DescriptionCardWrapper
                  title="Review and submit"
                  description="Review your inputs and submit to create your space. You can jump to related fields by clicking that area."
                >
                  <ReviewSpaceConfig setStep={setStep} />

                  <div className="mt-4 flex flex-col space-x-0 space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <button
                      type="submit"
                      disabled={isMutating}
                      className="inline-flex w-fit items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm text-white shadow-sm hover:bg-indigo-500 disabled:bg-gray-400"
                    >
                      {isMutating ? "Creating..." : "Create my space"}
                    </button>
                  </div>

                  <BackNextButtons back={back} next={next} />
                </DescriptionCardWrapper>
              ),
            },
          ]}
          enableDefaultStyle={false}
        />
      </form>
    </FormProvider>
  );
}
