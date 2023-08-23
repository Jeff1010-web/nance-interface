import { BigNumber } from "ethers";
import { FundingCycleConfigProps } from "../../components/juicebox/ReconfigurationCompare";
import { useCurrentFundingCycleV3 } from "./CurrentFundingCycle";
import { useDistributionLimit } from "./DistributionLimit";
import { useCurrentSplits } from "./CurrentSplits";
import { JBConstants } from "../../models/JuiceboxTypes";

export function useReconfigurationOfProject(projectId: number) {
  const { value: _fc, loading: fcIsLoading } = useCurrentFundingCycleV3(projectId);
  const [fc, metadata] = _fc || [];
  const { value: _limit, loading: targetIsLoading } = useDistributionLimit(projectId, fc?.configuration);
  const [target, currency] = _limit || [];
  const { value: payoutMods, loading: payoutModsIsLoading } = useCurrentSplits(projectId, fc?.configuration, JBConstants.SplitGroup.ETH, true);
  const { value: ticketMods, loading: ticketModsIsLoading } = useCurrentSplits(projectId, fc?.configuration, JBConstants.SplitGroup.RESERVED_TOKEN, true);

  const zero = BigNumber.from(0);
  const currentConfig: FundingCycleConfigProps = {
    version: 2,
    //@ts-ignore
    fundingCycle: {
      ...fc,
      fee: zero,
      currency: currency?.sub(1) || zero,
      target: target || zero,
      configuration: fc?.configuration || zero
    },
    metadata: metadata!,
    payoutMods: payoutMods || [],
    ticketMods: ticketMods || [],
  };

  return {
    value: currentConfig,
    loading: fcIsLoading || metadata === undefined || targetIsLoading || payoutModsIsLoading || ticketModsIsLoading
  }
} 