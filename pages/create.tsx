/* eslint-disable react/jsx-no-undef */
import { useContext } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Notification from "@/components/common/Notification";
import { CreateFormValues } from "@/models/NanceTypes";
import { useCreateSpace } from "@/utils/hooks/NanceHooks";
import ProjectForm from "@/components/form/ProjectForm";
import AddressForm from "@/components/form/AddressForm";

import {
  DiscordForm,
  GovernanceCycleForm,
  SnapshotForm,
  TextForm,
} from "@/components/CreateSpace";
import { SiteNav } from "@/components/Site";
import DiscordUser from "@/components/CreateSpace/sub/DiscordUser";
import WalletConnectWrapper from "@/components/WalletConnectWrapper/WalletConnectWrapper";
import MultipleStep from "@/components/MultipleStep/MultipleStep";
import { isValidSafe } from "@/utils/hooks/SafeHooks";
import DescriptionCardWrapper from "@/components/DescriptionCardWrapper/DescriptionCardWrapper";
import { NetworkContext } from "@/context/NetworkContext";
import { safeServiceURL, SupportedSafeNetwork } from "@/constants/SafeGlobal";

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
    register,
    handleSubmit,
    formState: { isValid },
    watch,
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
                  <TextForm
                    label="Nance space name"
                    name="config.name"
                    register={register}
                  />
                  <TextForm
                    label="Proposal ID Prefix"
                    name="config.proposalIdPrefix"
                    register={register}
                    maxLength={3}
                    placeHolder="JBP"
                    className="w-16"
                    tooltip="Text prepended to proposal ID numbers, usually 3 letters representing your organization"
                  />
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
                  title="Connect with Safe"
                  description="Nance can connect with your Safe to queue transactions after proposals pass."
                >
                  <AddressForm
                    label="Safe address"
                    fieldName="config.juicebox.gnosisSafeAddress"
                    showType={false}
                    validate={async (e) => {
                      if (!Object.keys(safeServiceURL).includes(network as SupportedSafeNetwork)) return "Invalid network";
                      const isSafe = await isValidSafe(e, network as SupportedSafeNetwork);
                      if (!isSafe) {
                        return "Invalid Safe address";
                      }
                    }}
                  />
                  <BackNextButtons back={back} next={next} />
                </DescriptionCardWrapper>
              ),
            },
            {
              name: "Juicebox",
              contentRender: (back, next) => (
                <DescriptionCardWrapper
                  title="Connect with Juicebox"
                  description="Nance can connect with your Juicebox project to queue reconfigurations after proposals pass."
                >
                  <ProjectForm
                    label="Juicebox projectId"
                    fieldName="config.juicebox.projectId"
                    showType={false}
                  />
                  <BackNextButtons back={back} next={next} />
                </DescriptionCardWrapper>
              ),
            },
            {
              name: "Review and Submit",
              contentRender: (back, next) => (
                <div>
                  <p>You may review all inputs here...</p>
                  <pre>{JSON.stringify(watch(), null, 2)}</pre>
                  <button
                    type="submit"
                    disabled={!isValid || isMutating}
                    className="ml-300 mt-5 inline-flex w-20 justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white
                    shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
                  >
                    Submit
                  </button>
                  <BackNextButtons back={back} next={next} />
                </div>
              ),
            },
          ]}
          enableDefaultStyle={false}
        />
      </form>
    </FormProvider>
  );
}

const BackNextButtons = ({ back, next }: { back?: () => void, next?: () => void}) => (
  <div className="flex justify-end space-x-6 mt-4">
    {back && <button
      className="inline-flex w-fit items-center justify-center rounded-md border border-transparent bg-gray-400 px-4 py-2 text-sm text-white shadow-sm hover:bg-gray-500"
      onClick={back}>Back</button>}
    {next && <button
      className="inline-flex w-fit items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm text-white shadow-sm hover:bg-indigo-500"
      onClick={next}>Next</button>}
  </div>
);
