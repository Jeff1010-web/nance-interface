import { useEffect, useState } from "react";
import { SpaceInfo } from "@/models/SnapshotTypes";
import { strategySymbolsOf } from "@/utils/functions/snapshotUtil";

export type VoteValidationResult = Pick<SpaceInfo, "voteValidation"> & {
  isValid: boolean;
  invalidMessage: string;
};

const emptyVoteValidationResult: VoteValidationResult = {
  isValid: true,
  invalidMessage: "",
  voteValidation: {
    name: "any",
    params: {},
  },
};

export default function useVoteValidate(
  space: string,
  snapshotBlock: number | "latest",
  address: string | undefined,
  spaceInfo: SpaceInfo | undefined,
) {
  // state
  const [value, setValue] = useState<VoteValidationResult>(
    emptyVoteValidationResult,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(undefined);

  useEffect(() => {
    const validationName = spaceInfo?.voteValidation?.name || "any";
    const validationParams = spaceInfo?.voteValidation?.params || {};
    const symbol = strategySymbolsOf(
      spaceInfo?.voteValidation?.params.strategies,
    );
    const networkId = spaceInfo?.network || "1";
    const options = {};

    if (!address) {
      setError("No address provided");
      setValue(emptyVoteValidationResult);
      setLoading(false);
      return;
    } else if (validationName === "any") {
      setValue({
        isValid: true,
        invalidMessage: "",
        voteValidation: { name: validationName, params: validationParams },
      });
      setLoading(false);
      setError(undefined);
      return;
    }

    setError(undefined);
    setLoading(true);

    console.debug(
      "🔥 useVote.trigger ->",
      spaceInfo?.voteValidation,
      validationName,
      validationParams,
    );

    import("@snapshot-labs/snapshot.js")
      .then((snapshot) => {
        return snapshot.default.utils.validate(
          validationName,
          address,
          space,
          networkId,
          snapshotBlock,
          validationParams,
          options,
        );
      })
      .then((isValid: boolean) => {
        setValue({
          isValid,
          invalidMessage:
            validationName === "basic"
              ? `You need at least ${spaceInfo?.voteValidation.params.minScore} ${symbol} to vote`
              : "",
          voteValidation: { name: validationName, params: validationParams },
        });
      })
      .catch((err) => {
        console.warn("🚨 useVote.trigger.error ->", err);
        setError(err);
        setValue(emptyVoteValidationResult);
      })
      .finally(() => setLoading(false));
  }, [space, snapshotBlock, address, spaceInfo]);

  return { value, loading, error };
}
