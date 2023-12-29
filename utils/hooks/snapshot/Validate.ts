import { useEffect, useState } from "react";
import useSnapshotSpaceInfo from "./SpaceInfo";
import { SpaceInfo } from "@/models/SnapshotTypes";

export type VoteValidationResult = Pick<SpaceInfo, "voteValidation"> & {
  isValid: boolean;
};

const emptyVoteValidationResult: VoteValidationResult = {
  isValid: true,
  voteValidation: {
    name: "any",
    params: {},
  },
};

export default function useVoteValidate(
  space: string,
  snapshotBlock: number | "latest",
  address: string | undefined,
) {
  // state
  const [value, setValue] = useState<VoteValidationResult>(
    emptyVoteValidationResult,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(undefined);

  const { data: spaceInfo } = useSnapshotSpaceInfo(space);

  useEffect(() => {
    const validationName = spaceInfo?.voteValidation?.name || "any";
    const validationParams = spaceInfo?.voteValidation?.params || {};
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
      .then((isValid: boolean) =>
        setValue({
          isValid,
          voteValidation: { name: validationName, params: validationParams },
        }),
      )
      .catch((err) => {
        console.warn("🚨 useVote.trigger.error ->", err);
        setError(err);
        setValue(emptyVoteValidationResult);
      })
      .finally(() => setLoading(false));
  }, [space, snapshotBlock, address, spaceInfo]);

  return { value, loading, error };
}
