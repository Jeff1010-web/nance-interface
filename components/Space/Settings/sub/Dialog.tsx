import { SpaceConfig } from '@/models/NanceTypes';
import DiscordSelector from '@/components/CreateSpace/sub/DiscordSelector';
import { useSession } from 'next-auth/react';

export default function Dialog({ spaceConfig }: { spaceConfig: SpaceConfig }) {
  const { data: session } = useSession();
  
  return (
    <div className="flex flex-col">
      { session && (
        <DiscordSelector session={session} val={spaceConfig.config.discord} setVal={()=>{}} discordConfig={spaceConfig.config.discord} />
      )}
    </div>
  );
}
