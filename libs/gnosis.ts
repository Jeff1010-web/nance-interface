import { ethers } from "ethers"
import { SafeTransactionPartial } from "../models/SafeTypes";
import { gnosisSafeInterface } from "./abi/GnosisSafe"

const provider = new ethers.providers.InfuraProvider('mainnet', process.env.NEXT_PUBLIC_INFURA_KEY);

export const safe = (safeAddress: string) =>
  new ethers.Contract(
    safeAddress,
    gnosisSafeInterface.abi,
    provider
);

export const getEstimate = async (txn: SafeTransactionPartial, safeAddress: string) => {
    const env = 'mainnet';
    const baseUrl = `https://safe-transaction-${env}.safe.global/`
    const endpoint = `api/v1/safes/${safeAddress}/multisig-transactions/estimations/`
  
    const body = {
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        to: txn.to,
        value: 0,
        data: txn.data,
        operation: 0 // 0 CALL, 1 DELEGATE_CALL
      }),
      method: "POST"
    }
  
    return (await (fetch(baseUrl + endpoint, body))).json();
  }

export const getGnosisMessageToSign = async (safeGas: number, safeAddress: string, txn: SafeTransactionPartial, nonce: number) => {
    console.debug(txn.to);
    const transactionHash = await safe(safeAddress).getTransactionHash(
        txn.to,                         // to: string
        0,                              // value: BigNumberish
        txn.data,                       // data: BytesLike
        0,                              // operation: BigNumberish, 1 = CALL, 0 = DELEGATE
        safeGas,                        // safeTxGas: BigNumberish
        0,                              // baseGas: BigNumberish
        0,                              // gasPrice: BigNumberish
        ethers.constants.AddressZero,   // gasToken: string
        ethers.constants.AddressZero,   // refundReceiver: string
        nonce                           // _nonce: BigNumberish
    );
    console.debug(transactionHash);
    return {
        message: ethers.utils.arrayify(transactionHash),
        transactionHash
    }
}