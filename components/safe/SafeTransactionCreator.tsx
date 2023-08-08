import { useState } from "react";
import { GnosisHandler } from "../../libs/gnosis";
import { useWalletClient } from "wagmi";
import { QueueSafeTransaction, SafeTransactionPartial } from "../../models/SafeTypes";
import { ArrowPathIcon } from "@heroicons/react/24/solid";


export default function SafeTransactionCreator(
  { safeAddress, data, value, defaultNonce }: 
  { safeAddress: string, data: string, value: number, defaultNonce: string }) {
  const [nonce, setNonce] = useState<string>(defaultNonce);
  const [error, setError] = useState<string>();
  const [gnosisLoading, setGnosisLoading] = useState(false);
  const [gnosisResponse, setGnosisResponse] = useState<{ success: boolean, data: any }>();

  const { data: walletClient } = useWalletClient();

  const postTransaction = async () => {
    setGnosisLoading(true);
    const gnosis = new GnosisHandler(safeAddress, 'mainnet');
    const txnPartial: SafeTransactionPartial = { to: safeAddress, value, data, nonce };
    console.debug('txnPartial', txnPartial)
    const { safeTxGas } = await gnosis.getEstimate(txnPartial);
    const { message, transactionHash } = await gnosis.getGnosisMessageToSign(safeTxGas, txnPartial);
    const signature = await walletClient?.signMessage({
      account: (await walletClient.getAddresses())[0],
      message: { raw: message }
    }).then((sig) => {
      return sig.replace(/1b$/, '1f').replace(/1c$/, '20');
    }).catch(() => {
      setGnosisLoading(false);
      setError('signature rejected');
      return 'signature rejected';
    });
    if (signature === 'signature rejected') {
      return; 
    }
    const txn: QueueSafeTransaction = {
      ...txnPartial,
      address: safeAddress,
      safeTxGas,
      transactionHash,
      signature: signature || ""
    };
    const res = await gnosis.queueTransaction(txn);
    setGnosisLoading(false);
    setGnosisResponse(res);
  };

    return (
      <span className="isolate inline-flex rounded-md shadow-sm">
        <button
          type="button"
          disabled={!walletClient || !data}
          onClick={postTransaction}
          className="relative inline-flex items-center gap-x-1.5 rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 disabled:opacity-50"
        >      
          {gnosisLoading && <ArrowPathIcon className="animate-spin -ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />}
          Queue with nonce
        </button>
        <input
          type="number"
          step={1}
          min={0}
          value={nonce}
          onChange={(e) => setNonce(e.target.value)}
          className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 w-20"
        />
      </span>
    )
}