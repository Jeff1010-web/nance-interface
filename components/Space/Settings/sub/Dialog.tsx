import { SpaceConfig } from '@/models/NanceTypes';
import DiscordSelector from '@/components/CreateSpace/sub/DiscordSelector';
import { useSession } from 'next-auth/react';
import ConnectWalletButton from '@/components/common/ConnectWalletButton';
import DiscordUser from '@/components/CreateSpace/sub/DiscordUser';

export default function Dialog({ spaceConfig }: { spaceConfig: SpaceConfig }) {
  const { data: session } = useSession();
  
  return (
    <div className="flex flex-col">
      { session ?
        <>
          <DiscordUser address={session.user?.name || ""} />
          <DiscordSelector session={session} val={spaceConfig.config.discord} setVal={()=>{}} discordConfig={spaceConfig.config.discord} />
        </>
        :
        <div className="flex flex-col">
          <ConnectWalletButton />
        </div>
      }
    </div>
  );
}
