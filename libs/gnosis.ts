import { ethers, Contract} from "ethers"
import { SafeTransactionPartial, QueueSafeTransaction } from "../models/SafeTypes";
import { gnosisSafeInterface } from "./abi/GnosisSafe"

export class GnosisHandler {
    provider;
    safe: Contract;

    constructor(
        protected safeAddress: string,
        protected network = 'mainnet'
    ) {
        this.provider = new ethers.providers.InfuraProvider(network, process.env.NEXT_PUBLIC_INFURA_KEY);
        this.safe = new ethers.Contract(
            this.safeAddress,
            gnosisSafeInterface.abi,
            this.provider
        );
    }

    getEstimate = async (txn: SafeTransactionPartial) => {
        const baseUrl = `https://safe-transaction-${this.network}.safe.global/`
        const endpoint = `api/v1/safes/${this.safeAddress}/multisig-transactions/estimations/`
  
        const data = {
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
            to: txn.to,
            value: 0,
            data: txn.data,
            operation: 0 // 0 CALL, 1 DELEGATE_CALL
            }),
            method: "POST"
        }
        return fetch(baseUrl + endpoint, data).then((res) => {
            return res.json()
        }).catch((e) => console.error(e));
    }

    getGnosisMessageToSign = async (safeGas: number, txn: SafeTransactionPartial) => {
        const transactionHash = await this.safe.getTransactionHash(
            txn.to,                         // to: string
            0,                              // value: BigNumberish
            txn.data,                       // data: BytesLike
            0,                              // operation: BigNumberish, 0 = CALL, 1 = DELEGATE
            safeGas,                        // safeTxGas: BigNumberish
            0,                              // baseGas: BigNumberish
            0,                              // gasPrice: BigNumberish
            ethers.constants.AddressZero,   // gasToken: string
            ethers.constants.AddressZero,   // refundReceiver: string
            txn.nonce                       // _nonce: BigNumberish
        );
        return {
            message: ethers.utils.arrayify(transactionHash),
            transactionHash
        }
    }

    queueTransaction = async (txn: QueueSafeTransaction) => {
        const data = {
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                to: txn.to,
                value: 0,
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
                origin: "Juicetool"
            }),
        method: "POST"
        }
        const baseUrl = `https://safe-transaction-${this.network}.safe.global/`
        const res = await fetch(baseUrl + `api/v1/safes/${this.safeAddress}/multisig-transactions/`, data)
        if (res.status === 201) return { success: true, data: '' }
        const json = await res.json();
        return { success: false, data: json.nonFieldErrors[0] }
    }
}

