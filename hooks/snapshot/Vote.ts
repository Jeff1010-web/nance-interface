import snapshot from '@snapshot-labs/snapshot.js'
import { ProposalType } from '@snapshot-labs/snapshot.js/dist/sign/types';
import { Wallet } from 'ethers';
import { useCallback, useState } from 'react';
import { useAccount, useSigner } from "wagmi"

const hub = 'https://hub.snapshot.org'; // or https://testnet.snapshot.org for testnet
const client = new snapshot.Client712(hub);

export default function useVote(
    space: string, 
    proposal: string, 
    type: string, 
    choice: string | number | number[] | {
        [key: string]: number;
    }, 
    reason: string = ""
){
    // state
    const [value, setValue] = useState<unknown>()
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState(undefined);
    // external state
    const { data: signer } = useSigner();
    const { address, isConnected } = useAccount();

    const trigger = useCallback(async () => {
        try {
            setError(undefined);
            setLoading(true);
            const receipt = await client.vote(
                signer as Wallet, 
                address, 
                {
                    space,
                    proposal,
                    type: type as ProposalType,
                    choice: choice as number | number[] | string,
                    reason,
                    app: 'juicetool'
                }
            );
            setValue(receipt);
        } catch(err) {
            console.warn("🚨 useVote.trigger.error ->", err);
            setError(err);
            setValue(undefined);
        } finally {
            setLoading(false);
        }
        
    }, [signer, space, proposal, type, choice, reason, address]);

    const reset = () => {
        setValue(undefined);
        setError(undefined);
        setLoading(false);
    }
    
    return { trigger, value, loading, error, reset };
}