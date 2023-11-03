import { getUnixTime } from "date-fns";
import { BigNumber, utils } from "ethers";
import {
  JBConstants,
  JBFundAccessConstraints,
  JBGroupedSplits,
  V2FundingCycleMetadata,
  V2V3FundingCycleData,
} from "../../models/JuiceboxTypes";
import JBControllerV3 from "@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBController3_1.json";
import { FundingCycleConfigProps } from "./fundingCycle";

export default function parseSafeJuiceboxTx(
  rawData: string,
  submissionDate: string,
  fallbackFee: BigNumber,
  fallbackConfiguration: BigNumber,
): FundingCycleConfigProps | undefined {
  const iface = new utils.Interface(JBControllerV3.abi);
  const raw = rawData;

  try {
    const ret = iface.parseTransaction({ data: raw, value: 0 });
    const {
      _data,
      _metadata,
      _groupedSplits,
      _fundAccessConstraints,
    }: {
      _data: V2V3FundingCycleData;
      _metadata: V2FundingCycleMetadata;
      _groupedSplits: JBGroupedSplits[];
      _fundAccessConstraints: JBFundAccessConstraints[];
    } = ret.args as any;
    const fac = _fundAccessConstraints[0];
    const txDate =
      getUnixTime(new Date(submissionDate)) || getUnixTime(new Date());
    const newConfig: FundingCycleConfigProps = {
      version: 3,
      fundingCycle: {
        ..._data,
        fee: fallbackFee,
        configuration: txDate ? BigNumber.from(txDate) : fallbackConfiguration,
        currency: fac?.distributionLimitCurrency.sub(1) || BigNumber.from(0),
        target: fac?.distributionLimit || BigNumber.from(0),
      },
      metadata: _metadata,
      payoutMods:
        _groupedSplits.find(
          (s) => s.group.toNumber() == JBConstants.SplitGroup.ETH,
        )?.splits ?? [],
      ticketMods:
        _groupedSplits.find(
          (s) => s.group.toNumber() == JBConstants.SplitGroup.RESERVED_TOKEN,
        )?.splits ?? [],
    };
    return newConfig;
  } catch (e) {
    console.debug("parseSafeJuiceboxTx.error", e);
  }
}
