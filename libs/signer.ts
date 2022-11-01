import { JsonRpcSigner } from "@ethersproject/providers";
import { solidityKeccak256, verifyTypedData } from "ethers/lib/utils";
import { DOMAIN, TYPES } from "../constants/Signature";
import { getPath } from "../hooks/NanceHooks";
import { Signature } from "../models/NanceTypes";

export async function signPayload(signer: JsonRpcSigner, space: string, command: string, payload: any): Promise<Signature> {
  const timestamp = Math.floor(Date.now() / 1000);
  const path = getPath(space, command);
  const typedValue = {
    path,
    timestamp,
    payload: solidityKeccak256(["string"], [JSON.stringify(payload)])
  };
  const address = await signer.getAddress();
  return signer._signTypedData(DOMAIN, TYPES, typedValue).then(async (signature) => {
    const valid = verifyTypedData(DOMAIN, TYPES, typedValue, signature) === address;
    console.debug("📗 Nance.newProposal.verifySignature", { 
      address: verifyTypedData(DOMAIN, TYPES, typedValue, signature),
      valid,
      typedValue,
      payload
    });
    return {
      address,
      signature,
      timestamp
    }
  });
}