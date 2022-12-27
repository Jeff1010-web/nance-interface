import { getUnixTime } from "date-fns";
import { BigNumber, utils } from "ethers";
import { FundingCycleArgs, FundingCycleConfigProps, MetadataArgs } from "../components/juicebox/ReconfigurationCompare";
import { V1FundingCycleMetadata, PayoutModV1, TicketModV1, payoutMod2Split, ticketMod2Split, JBConstants, JBFundAccessConstraints, JBGroupedSplits, V2FundingCycleMetadata, V2V3FundingCycleData } from "../models/JuiceboxTypes";
import { TerminalV1Contract } from "./contractsV1";
import JBControllerV2 from '@jbx-protocol/contracts-v2/deployments/mainnet/JBController.json';
import JBETHPaymentTerminal from '@jbx-protocol/contracts-v2/deployments/mainnet/JBETHPaymentTerminal.json';
import { SafeMultisigTransaction } from "../models/SafeTypes";
import JBControllerV3 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBController.json';
import JBETHPaymentTerminalV3 from '@jbx-protocol/juice-contracts-v3/deployments/mainnet/JBETHPaymentTerminal.json';

function v1metadata2args(m: V1FundingCycleMetadata): MetadataArgs {
    if (!m) return undefined;
    return {
      redemptionRate: BigNumber.from(m.bondingCurveRate),
      reservedRate: BigNumber.from(m.reservedRate),
      pausePay: m.payIsPaused,
      allowMinting: m.ticketPrintingIsAllowed,
      allowTerminalMigration: false,
      allowControllerMigration: false
    }
}

export function getVersionOfTx(tx: SafeMultisigTransaction, fallbackVersion: number): number {
    const to = tx?.to;
    if (to === JBControllerV3.address) return 3;
    else if (to === JBControllerV2.address) return 2;
    else if (to === TerminalV1Contract.addressOrName) return 1;
    else return fallbackVersion;
}

export default function parseSafeJuiceboxTx(
    version: number,
    rawData: string, 
    submissionDate: string, 
    fallbackFee: BigNumber, 
    fallbackConfiguration: BigNumber
): FundingCycleConfigProps {

    if(version === 1) {
        const iface = new utils.Interface(TerminalV1Contract.contractInterface);
        const raw = rawData;
        try {
        const ret = iface.parseTransaction({data: raw, value: 0});
        const {
            _projectId,
            _properties,
            _metadata,
            _payoutMods,
            _ticketMods
        }: {
            _projectId: BigNumber,
            _properties: Omit<FundingCycleArgs, "fee" | "configuration">,
            _metadata: V1FundingCycleMetadata,
            _payoutMods: PayoutModV1[],
            _ticketMods: TicketModV1[],
        } = ret.args as any;
        const txDate = getUnixTime(new Date(submissionDate)) || getUnixTime(new Date());
        const newConfig: FundingCycleConfigProps = {
            version: 1,
            fundingCycle: {
            ..._properties, 
            fee: fallbackFee, 
            configuration: txDate ? BigNumber.from(txDate) : fallbackConfiguration
            },
            metadata: v1metadata2args(_metadata),
            payoutMods: _payoutMods.map(payoutMod2Split),
            ticketMods: _ticketMods.map(ticketMod2Split)
        };
        return newConfig;
        } catch (e) {
        console.debug('TerminalV1.interface.parse >', e);
        }
    } else if (version === 2) {

        const iface = new utils.Interface(JBControllerV2.abi);
        const raw = rawData;
        try {
            const ret = iface.parseTransaction({data: raw, value: 0});
            const {
                _data,
                _metadata,
                _groupedSplits,
                _fundAccessConstraints
            }: {
                _data: V2V3FundingCycleData,
                _metadata: V2FundingCycleMetadata,
                _groupedSplits: JBGroupedSplits[],
                _fundAccessConstraints: JBFundAccessConstraints[]
            } = ret.args as any;
            const fac = _fundAccessConstraints.find(c => c.terminal == JBETHPaymentTerminal.address);
            const txDate = getUnixTime(new Date(submissionDate)) || getUnixTime(new Date());
            const newConfig: FundingCycleConfigProps = {
                version: 2,
                fundingCycle: {
                ..._data, 
                fee: fallbackFee,
                configuration: txDate ? BigNumber.from(txDate) : fallbackConfiguration,
                currency: fac?.distributionLimitCurrency.sub(1),
                target: fac?.distributionLimit
                },
                metadata: _metadata,
                payoutMods: _groupedSplits.find(s => s.group.toNumber() == JBConstants.SplitGroup.ETH)?.splits,
                ticketMods: _groupedSplits.find(s => s.group.toNumber() == JBConstants.SplitGroup.RESERVED_TOKEN)?.splits
            };
            return newConfig;
        } catch (e) {
            console.debug('JBETHPaymentTerminal.interface.parse >', e);
        }
    } else if (version === 3) {

        const iface = new utils.Interface(JBControllerV3.abi);
        const raw = rawData;
        try {
            const ret = iface.parseTransaction({data: raw, value: 0});
            const {
                _data,
                _metadata,
                _groupedSplits,
                _fundAccessConstraints
            }: {
                _data: V2V3FundingCycleData,
                _metadata: V2FundingCycleMetadata,
                _groupedSplits: JBGroupedSplits[],
                _fundAccessConstraints: JBFundAccessConstraints[]
            } = ret.args as any;
            const fac = _fundAccessConstraints.find(c => c.terminal == JBETHPaymentTerminalV3.address);
            const txDate = getUnixTime(new Date(submissionDate)) || getUnixTime(new Date());
            const newConfig: FundingCycleConfigProps = {
                version: 3,
                fundingCycle: {
                ..._data, 
                fee: fallbackFee,
                configuration: txDate ? BigNumber.from(txDate) : fallbackConfiguration,
                currency: fac?.distributionLimitCurrency.sub(1),
                target: fac?.distributionLimit
                },
                metadata: _metadata,
                payoutMods: _groupedSplits.find(s => s.group.toNumber() == JBConstants.SplitGroup.ETH)?.splits,
                ticketMods: _groupedSplits.find(s => s.group.toNumber() == JBConstants.SplitGroup.RESERVED_TOKEN)?.splits
            };
            return newConfig;
        } catch (e) {
            console.debug('JBETHPaymentTerminalV3.interface.parse >', e);
        }
    }
}