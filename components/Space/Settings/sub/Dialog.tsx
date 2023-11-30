import { SpaceConfig } from "@/models/NanceTypes";
import { useSession } from "next-auth/react";
import ConnectWalletButton from "@/components/common/ConnectWalletButton";
import DiscordUser from "@/components/CreateSpace/sub/DiscordUser";
import { DiscordForm } from "@/components/CreateSpace";
import { FormProvider, useForm } from "react-hook-form";

export default function Dialog({ spaceConfig }: { spaceConfig: SpaceConfig }) {
  const { data: session } = useSession();
  // FIXME: to load discordConfig into DiscordForm with useForm(defaultValues)
  const methods = useForm({
    defaultValues: {
      config: spaceConfig.config,
    },
  });

  return (
    <div className="flex flex-col">
      {session ? (
        <>
          <DiscordUser address={session.user?.name || ""} />
          <FormProvider {...methods}>
            <DiscordForm />
          </FormProvider>
        </>
      ) : (
        <div className="flex flex-col">
          <ConnectWalletButton />
        </div>
      )}
    </div>
  );
}
