import { useRouter } from 'next/router';
import { SiteNav } from '@/components/Site';
import { Footer } from '@/components/Site';
import SpaceSettings from '@/components/Space/Settings/SpaceSettings';
import { useSpaceConfig, useSpaceInfo } from '@/utils/hooks/NanceHooks';

export default function Settings() {
  const router = useRouter();
  const { space } = router.query as { space: string };

  const { data: spaceInfoReq } = useSpaceInfo({ space });
  const { data: spaceConfigReq } = useSpaceConfig(space);

  const spaceInfo = spaceInfoReq?.data;
  const spaceConfig = spaceConfigReq?.data;

  return (
    <>
      <SiteNav pageTitle="Space Settings" description="Space Settings" space={space} withProposalButton={false} withWallet />
      { spaceConfig && spaceInfo &&
        <SpaceSettings spaceInfo={spaceInfo} spaceConfig={spaceConfig} />
      }
      <Footer />
    </>
  );
}