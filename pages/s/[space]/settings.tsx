import { useRouter } from 'next/router';
import { SiteNav } from '@/components/Site';
import { Footer } from '@/components/Site';
import SpaceSettings from '@/components/Space/Settings/SpaceSettings';
import { useSpaceConfig } from '@/utils/hooks/NanceHooks';

export default function Settings() {
  const router = useRouter();
  const { space } = router.query as { space: string };

  const { data } = useSpaceConfig(space);
  const spaceConfig = data?.data;
  return (
    <>
      <SiteNav pageTitle="Space Settings" description="Space Settings" space={space} withProposalButton={false} withWallet />
      { spaceConfig && <SpaceSettings spaceConfig={spaceConfig} /> }
      <Footer />
    </>
  );
}