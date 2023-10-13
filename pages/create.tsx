/* eslint-disable react/jsx-no-undef */
import Image from "next/image";
import SiteNav from "../components/SiteNav";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import Notification from "../components/Notification";
import { CreateFormValues } from "../models/NanceTypes";
import { useCreateSpace } from "../hooks/NanceHooks";
import { avatarBaseUrl, LOCAL_STORAGE_KEY_DISCORD_STATUS } from "../libs/discordURL";
import { useFetchDiscordUser, useLogoutDiscordUser } from "../hooks/DiscordHooks";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import ProjectForm from "../components/form/ProjectForm";
import SnapshotForm from "../components/form/SnapshotForm";
import DiscordForm from "../components/form/DiscordForm";
import GovernanceCyleForm from "../components/form/GovernanceCycleForm";
import ToggleSwitch from "../components/ToggleSwitch";
import { TextInput } from "../components/form/TextForm";
import GnosisSafeForm from "../components/form/GnosisSafeForm";
import { discordAuthWindow } from '../libs/discord';

export default function CreateSpacePage() {
  const router = useRouter();
  // state
  const [shouldFetchDiscordUser, setShouldFetchDiscordUser] = useState(false);

  // hooks
  const { data: session, status } = useSession();
  const { openConnectModal } = useConnectModal();
  const address = session?.user?.name;
  const { data: discordUser, isLoading: discordLoading } = useFetchDiscordUser({address}, shouldFetchDiscordUser);
  const { trigger: discordLogoutTrigger  } = useLogoutDiscordUser({address: session?.user?.name || ''}, !!discordUser);

  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === LOCAL_STORAGE_KEY_DISCORD_STATUS) {
        if (event.newValue === 'success') setShouldFetchDiscordUser(true);
      }
    }
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <>
      <SiteNav pageTitle='nance control panel' withWallet/>

      <div className="flex justify-center">
        <div className="w-100">
          <h1 className="text-lg text-center font-bold text-gray-900 mt-8 mb-5">Create New Nance Instance</h1>
          {status === "unauthenticated" && (
            <div className="text-center">
              <button type="button" onClick={() => openConnectModal?.()}
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium
              text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
              >
              Connect Wallet
              </button>
            </div>
          )}

          {status === "authenticated" && (
            <>
              { !discordUser?.username && !discordLoading && (
                <div className="flex justify-center">
                  <button
                    className="w-fit inline-flex items-center justify-center rounded-xl border border-transparent bg-purple-800 px-3 py-2 text-md font-bold disabled:text-black text-white shadow-sm hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
                    onClick={ () => {
                      localStorage.removeItem(LOCAL_STORAGE_KEY_DISCORD_STATUS);
                      discordAuthWindow(); 
                    } }
                  >
                    Connect Discord
                  </button>
                </div>
              )}
              <div className="flex justify-center">
                { discordLoading && (
                  <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
                  </div>
                ) }
              </div>
              { !discordLoading && discordUser?.avatar && (
                <>
                  <div className="flex justify-center">
                    <div className="block text-center">
                      <p className="">{`${discordUser?.username}`}</p>
                      <a className="text-xs underline hover:cursor-pointer" onClick={ () => {
                        discordLogoutTrigger();
                        // set local storage to false, then refresh
                        localStorage.removeItem(LOCAL_STORAGE_KEY_DISCORD_STATUS);
                        window.location.assign(window.location.pathname);
                      }
                      }>disconnect</a>
                    </div>
                    <Image className="rounded-full overflow-hidden ml-4" src={`${avatarBaseUrl}/${discordUser?.id}/${discordUser?.avatar}.png`} alt={discordUser?.username || ''} width={50} height={50} />
                  </div>
                </>
              )}
              { discordUser?.username && (
                <Form session={session} />
              )}
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

  // hooks
  const { isMutating, error: uploadError, trigger, data, reset } = useCreateSpace(router.isReady);
  // state
  const [juiceboxProjectDisabled, setJuiceboxProjectDisabled] = useState(false);
  // form
  const methods = useForm<CreateFormValues>({ mode: 'onChange' });
  const { register, handleSubmit, control, formState: { errors, isValid }, watch } = methods;
  const onSubmit: SubmitHandler<CreateFormValues> = async (formData) => {
    console.log(formData);
    const payload = { ...formData };
    console.debug("📚 Nance.createSpace.onSubmit ->", { formData, payload });
    const req = {
      config: formData
    };
    console.debug("📗 Nance.createSpace.submit ->", req);
    return trigger(req).then(() => router.push(`/s/${formData.name}`));
  };

  useEffect(() => {
    // log form values as they change
    console.debug("📗 Nance.createSpace.watch ->", watch());
  });

  return (
    <FormProvider {...methods} >
      <Notification title="Success" description="Created" show={data !== undefined} close={() => {
        reset();
      }} checked={true} />
      {( uploadError) &&
          <Notification title="Error" description={'error'} show={true} close={() => {
            reset();
          }} checked={false} />
      }
      <form className="lg:m-6 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <TextInput label="Nance space name" name="name" register={register} />
        <DiscordForm session={session}/>
        <SnapshotForm session={session} />
        <TextInput label="Proposal ID Prefix" name="propertyKeys.proposalIdPrefix" register={register} maxLength={3} placeHolder="JBP"
          className="w-16" tooltip="Text prepended to proposal ID numbers, usually 3 letters representing your organization"
        />

        <ToggleSwitch enabled={juiceboxProjectDisabled} setEnabled={setJuiceboxProjectDisabled} label="Link to a Juicebox Project?" />
        <div className="mt-2 mb-3"><ProjectForm fieldName="juicebox.projectId" showType={false} disabled={!juiceboxProjectDisabled} /></div>

        <GnosisSafeForm />

        <GovernanceCyleForm />
        {(
          <button
            type="submit"
            disabled={ !isValid || isMutating }
            className="mt-5 ml-300 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm
              hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 w-20"
          >
              Submit
          </button>
        )}
      </form>
    </FormProvider>
  );
}
