import { ethers, Contract } from "ethers";
import {
  SafeTransactionPartial,
  QueueSafeTransaction,
} from "../../models/SafeTypes";
import { gnosisSafeInterface } from "./abi/GnosisSafe";
import CONFIG from "@/constants/Config";

export function getSafeTxUrl(address: string, hash: string) {
  return `https://app.safe.global/transactions/tx?safe=eth:${address}&id=multisig_${address}_${hash}`;
}

export class GnosisHandler {
  provider;
  baseUrl: string;
  safe: Contract;

  constructor(
    protected safeAddress: string,
    protected network = "mainnet",
  ) {
    this.provider = new ethers.providers.InfuraProvider(
      network,
      CONFIG.infura.key,
    );
    this.safe = new ethers.Contract(
      this.safeAddress,
      gnosisSafeInterface.abi,
      this.provider,
    );
    this.baseUrl = `https://safe-transaction-${this.network}.safe.global/`;
  }

  getNextNonce = async () => {
    const res = await fetch(this.baseUrl + `api/v1/safes/${this.safeAddress}`);
    const json = await res.json();
    return (Number(json.nonce) + 1).toString();
  };

  getEstimate = async (txn: SafeTransactionPartial) => {
    const endpoint = `api/v1/safes/${this.safeAddress}/multisig-transactions/estimations/`;

    const data = {
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        to: txn.to,
        value: txn.value,
        data: txn.data,
        operation: 0, // 0 CALL, 1 DELEGATE_CALL
      }),
      method: "POST",
    };
    const res = await fetch(this.baseUrl + endpoint, data);
    if (res.status === 400) throw new Error("Data not valid");
    else if (res.status === 404) throw new Error("Safe not found");
    else if (res.status === 422) throw new Error("Transaction not valid");

    const estimateResponse: {
      safeTxGas: string;
    } = await res.json();

    return estimateResponse;
  };

  getGnosisMessageToSign = async (
    safeGas: string,
    txn: SafeTransactionPartial,
  ) => {
    const transactionHash = await this.safe.getTransactionHash(
      txn.to, // to: string
      txn.value, // value: BigNumberish
      txn.data, // data: BytesLike
      0, // operation: BigNumberish, 0 = CALL, 1 = DELEGATE
      safeGas, // safeTxGas: BigNumberish
      0, // baseGas: BigNumberish
      0, // gasPrice: BigNumberish
      ethers.constants.AddressZero, // gasToken: string
      ethers.constants.AddressZero, // refundReceiver: string
      txn.nonce, // _nonce: BigNumberish
    );
    return {
      message: ethers.utils.arrayify(transactionHash),
      transactionHash,
    };
  };

  queueTransaction = async (txn: QueueSafeTransaction) => {
    const data = {
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        to: txn.to,
        value: txn.value,
        data: txn.data,
        operation: 0,
        safeTxGas: txn.safeTxGas,
        baseGas: 0,
        gasPrice: 0,
        gasToken: null,
        refundReceiver: null,
        nonce: txn.nonce,
        contractTransactionHash: txn.transactionHash,
        sender: txn.address,
        signature: txn.signature,
        origin: "JBDAO",
      }),
      method: "POST",
    };
    const res = await fetch(
      this.baseUrl + `api/v1/safes/${this.safeAddress}/multisig-transactions/`,
      data,
    );

    if (res.status === 400) throw new Error("Data not valid");
    else if (res.status === 201)
      return { success: true, data: "Created or signature updated" };

    const json = await res.json();
    throw new Error(json.nonFieldErrors[0]);
  };
}
