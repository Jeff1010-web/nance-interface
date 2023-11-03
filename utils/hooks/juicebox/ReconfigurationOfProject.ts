import { BigNumber } from "ethers";
import { useCurrentFundingCycle } from "./CurrentFundingCycle";
import { useDistributionLimit } from "./DistributionLimit";
import { useCurrentSplits } from "./CurrentSplits";
import { JBConstants } from "../../../models/JuiceboxTypes";
import { FundingCycleConfigProps } from "@/utils/functions/fundingCycle";

export function useReconfigurationOfProject(projectId: number) {
  const { value: _fc, loading: fcIsLoading } =
    useCurrentFundingCycle(projectId);
  const [fc, metadata] = _fc || [];
  const { value: _limit, loading: targetIsLoading } = useDistributionLimit(
    projectId,
    fc?.configuration,
  );
  const [target, currency] = _limit || [];
  const { value: payoutMods, loading: payoutModsIsLoading } = useCurrentSplits(
    projectId,
    fc?.configuration,
    JBConstants.SplitGroup.ETH,
  );
  const { value: ticketMods, loading: ticketModsIsLoading } = useCurrentSplits(
    projectId,
    fc?.configuration,
    JBConstants.SplitGroup.RESERVED_TOKEN,
  );

  const zero = BigNumber.from(0);
  const currentConfig: FundingCycleConfigProps = {
    version: 2,
    //@ts-ignore
    fundingCycle: {
      ...fc,
      fee: zero,
      currency: currency?.sub(1) || zero,
      target: target || zero,
      configuration: fc?.configuration || zero,
    },
    metadata: metadata,
    payoutMods: payoutMods || [],
    ticketMods: ticketMods || [],
  };

  return {
    value: currentConfig,
    loading:
      fcIsLoading ||
      metadata === undefined ||
      targetIsLoading ||
      payoutModsIsLoading ||
      ticketModsIsLoading,
  };
}
