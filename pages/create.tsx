/* eslint-disable react/jsx-no-undef */
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Notification from "@/components/common/Notification";
import { CreateFormValues } from "@/models/NanceTypes";
import { useCreateSpace } from "@/utils/hooks/NanceHooks";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import ProjectForm from "@/components/form/ProjectForm";
import ToggleSwitch from "@/components/common/ToggleSwitch";

import {
  DiscordForm,
  GnosisSafeForm,
  GovernanceCycleForm,
  SnapshotForm,
  TextForm,
} from "@/components/CreateSpace";
import { SiteNav } from "@/components/Site";
import ConnectWalletButton from '@/components/common/ConnectWalletButton';
import DiscordUser from '@/components/CreateSpace/sub/DiscordUser';

export default function CreateSpacePage() {
  // hooks
  const { data: session, status } = useSession();
  const address = session?.user?.name || "";

  return (
    <>
      <SiteNav pageTitle="nance control panel" withProposalButton={false} withWallet />

      <div className="flex justify-center">
        <div className="w-100">
          <h1 className="mb-5 mt-8 text-center text-lg font-bold text-gray-900">
            Create New Nance Instance
          </h1>
          {status === "unauthenticated" && (
            <div className="text-center">
              <ConnectWalletButton />
            </div>
          )}

          {status === "authenticated" && (
            <>
              <DiscordUser address={address} />
              <Form session={session} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Form({ session }: { session: Session }) {
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
  // state
  const [juiceboxProjectDisabled, setJuiceboxProjectDisabled] = useState(false);
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

  useEffect(() => {
    console.debug("📝 Nance.create ->", watch());
  });

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
      <form className="flex flex-col lg:m-6" onSubmit={handleSubmit(onSubmit)}>
        <TextForm
          label="Nance space name"
          name="config.name"
          register={register}
        />
        <DiscordForm session={session} />
        <SnapshotForm session={session} />
        <TextForm
          label="Proposal ID Prefix"
          name="config.proposalIdPrefix"
          register={register}
          maxLength={3}
          placeHolder="JBP"
          className="w-16"
          tooltip="Text prepended to proposal ID numbers, usually 3 letters representing your organization"
        />

        <ToggleSwitch
          enabled={juiceboxProjectDisabled}
          setEnabled={setJuiceboxProjectDisabled}
          label="Link to a Juicebox Project?"
        />
        <div className="mb-3 mt-2">
          <ProjectForm
            fieldName="config.juicebox.projectId"
            showType={false}
            disabled={!juiceboxProjectDisabled}
          />
        </div>

        <GnosisSafeForm />

        <GovernanceCycleForm />
        {
          <button
            type="submit"
            disabled={!isValid || isMutating}
            className="ml-300 mt-5 inline-flex w-20 justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white
              shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            Submit
          </button>
        }
      </form>
    </FormProvider>
  );
}
