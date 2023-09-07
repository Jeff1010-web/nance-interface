import snapshot from '@snapshot-labs/snapshot.js';
import { Signer, Wallet } from 'ethers';
import { useCallback, useState } from 'react';
import { useAccount } from "wagmi";
import { useEthersSigner } from '../ViemAdapter';
import useSnapshotSpaceSettings from './SpaceSettings';
import { NANCE_PUBLIC_ADDRESS } from '../../constants/Nance';

const hub = 'https://hub.snapshot.org';
const client = new snapshot.Client712(hub);

function clearNull(input: any) {
  let output = {} as Record<string, any>;
  Object.keys(input as Record<string, string>).forEach(key => {
    if (input[key]) output[key] = input[key];
    // clear out empty sub-objects that are NOT arrays
    if (input[key] && typeof input[key] === 'object' && !Array.isArray(input[key])) output[key] = clearNull(input[key]);
  });
  return output;
}

export default function useSetSpace(
  space: string,
){
  // state
  const [value, setValue] = useState<unknown>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(undefined);
  // external state
  const signer = useEthersSigner();
  const { address } = useAccount();

  const { data: currentSettings, loading: settingsLoading } = useSnapshotSpaceSettings(space);

  const trigger = useCallback(async () => {
    try {
      if (!currentSettings) {
        setError("No settings found for this space");
        return;
      }
      const settings = clearNull(currentSettings);
      console.log("🚀 settings", settings);
      // only add nance if it's not already there or else snapshot throws an error
      if (!settings.members.includes(NANCE_PUBLIC_ADDRESS)) {
        settings.members.push(NANCE_PUBLIC_ADDRESS);
      }
      setError(undefined);
      setLoading(true);
      const receipt = await client.space(
                signer as Signer as Wallet, 
                address as string, 
                {space, settings: JSON.stringify(settings)}
      );
      setValue(receipt);
    } catch(err: any) {
      console.warn("🚨 SetSpace.trigger.error ->", err);
      setError(err);
      setValue(undefined);
    } finally {
      setLoading(false);
    }
        
  }, [signer, address, space, currentSettings]);

  const reset = () => {
    setValue(undefined);
    setError(undefined);
    setLoading(false);
  };
  return { trigger, value, loading, error, reset };
}