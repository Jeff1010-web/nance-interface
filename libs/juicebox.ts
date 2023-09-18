/* eslint-disable max-lines */
import { BigNumber, BigNumberish, Contract, utils } from "ethers";
import { FundingCycleConfigProps, formattedSplit, calculateSplitAmount, splitAmount2Percent, isEqualPayoutSplit } from "../components/juicebox/ReconfigurationCompare";
import { ZERO_ADDRESS } from "../constants/Contract";
import { CURRENCY_USD, ETH_TOKEN_ADDRESS, JBConstants, JBFundingCycleData, JBSplit } from "../models/JuiceboxTypes";
import { SQLPayout, Action, Payout, JBSplitNanceStruct } from "../models/NanceTypes";
import { getAddress } from "viem";
import { SectionTableData } from "../components/form/DiffTableWithSection";
import { diff2TableEntry } from "../components/juicebox/JBSplitEntry";

function mulDiv(a: BigNumber, b: BigNumber, denominator: BigNumberish) {
  return a.mul(b).div(denominator);
}

function formatEtherCommify(wei: BigNumberish) {
  return utils.commify(Math.round(BigNumber.from(wei).div(BigNumber.from("1000000000000000000")).toNumber()));
}

// In v1, ETH = 0, USD = 1
// In v2, ETH = 1, USD = 2, we subtract 1 to get the same value
export const formatCurrency = (currency: BigNumber, amount: BigNumber) => {
  const symbol = currency.toNumber() == 0 ? "Ξ" : "$";
  const formatted = amount.gte(JBConstants.UintMax) ? "∞" : formatEtherCommify(amount ?? 0);
  return symbol + formatted;
};

function compareBN(a: BigNumberish | undefined, b: BigNumberish | undefined) {
  a = a ?? BIG_ZERO;
  b = b ?? BIG_ZERO;

  return BigNumber.from(a).eq(BigNumber.from(b)) ? "Keep" : "Edit";
}

function getBooleanLabel(enable: boolean | undefined) {
  return enable ? "Enabled" : "Disabled";
}

function compareBoolean(a: boolean | undefined, b: boolean | undefined) {
  return a === b ? "Keep" : "Edit";
}

// ====== Split ======

export function isEqualJBSplit(a: JBSplit, b: JBSplit) {
  return a.allocator === b.allocator
    && a.beneficiary === b.beneficiary
    && a.lockedUntil.eq(b.lockedUntil)
    && a.percent.eq(b.percent)
    && a.preferAddToBalance === b.preferAddToBalance
    && a.preferClaimed === b.preferClaimed
    && a.projectId.eq(b.projectId);
}

export const keyOfSplit = (mod: JBSplit) => `${getAddress(mod.beneficiary || ZERO_ADDRESS)}-${mod.projectId}-${mod.allocator}`;
export const keyOfPayout2Split = (mod: Payout) => `${getAddress(mod.address || ZERO_ADDRESS)}-${mod.project ?? 0}-${ZERO_ADDRESS}`;
export const keyOfNanceSplit2Split = (mod: JBSplitNanceStruct) => `${getAddress(mod.beneficiary || ZERO_ADDRESS)}-${mod.projectId}-${mod.allocator}`;
export const keyOfNancePayout2Split = (mod: SQLPayout) => `${getAddress(mod.payAddress || ZERO_ADDRESS)}-${mod.payProject ?? 0}-${mod.payAllocator || ZERO_ADDRESS}`;

// ====== Split Diff ======

export interface SplitDiffEntry {
  split: JBSplit;
  oldVal: string;
  newVal: string;
  proposalId: number;
  amount: number;
}

interface SplitDiff {
  expire: {
    [key: string]: SplitDiffEntry
  },
  new: {
    [key: string]: SplitDiffEntry
  },
  change: {
    [key: string]: SplitDiffEntry
  },
  keep: {
    [key: string]: SplitDiffEntry
  },
  newTotal: BigNumber
}

const BIG_ZERO = BigNumber.from(0);

// Update percent in JBSplit struct, because we have new distributionLimit
function percentUpdaterFrom(newLimitBG: BigNumber, currency: BigNumber, version: number) {
  return (entry: SplitDiffEntry) => {
    const newPercent = splitAmount2Percent(newLimitBG, entry.amount);
    entry.split = {
      ...entry.split,
      percent: newPercent
    };
    entry.newVal = formattedSplit(
      newPercent,
      currency,
      newLimitBG,
      version
    ) || "";
  };
}

export function compareRules(config: FundingCycleConfigProps, newConfig: FundingCycleConfigProps | undefined): SectionTableData[] {
  if (!newConfig) return [];

  const discountRateDenominator = BigNumber.from(JBConstants.TotalPercent.DiscountRate[2]);
  const reservedRateDenominator = BigNumber.from(JBConstants.TotalPercent.ReservedRate[2]);

  const weight = config.fundingCycle.weight || BIG_ZERO;
  const discountRate = config.fundingCycle.discountRate || BIG_ZERO;
  const reservedRate = config.metadata?.reservedRate || BIG_ZERO;
  const redemptionRate = config.metadata?.redemptionRate || BIG_ZERO;
  let newWeight = newConfig.fundingCycle.weight || BIG_ZERO;
  const newDiscountRate = newConfig.fundingCycle.discountRate || BIG_ZERO;
  const newReservedRate = newConfig.metadata?.reservedRate || BIG_ZERO;
  const newRedemptionRate = newConfig.metadata?.redemptionRate || BIG_ZERO;

  const weightSpecified = !newWeight.eq(0);
  newWeight = weightSpecified ?
    newWeight :
    mulDiv(weight, discountRateDenominator.sub(discountRate), discountRateDenominator);

  // Payer gets what left after reserved tokens are issued.
  const payerWeight = weight.sub(mulDiv(weight, reservedRate, reservedRateDenominator));
  const newPayerWeight = newWeight.sub(mulDiv(newWeight, newReservedRate, reservedRateDenominator));

  // For display, 0.01 % precision
  const discountRateLabel = (discountRate.toNumber() / JBConstants.TotalPercent.DiscountRate[2] * 100).toFixed(2) + "%";
  const reservedRateLabel = (reservedRate.toNumber() / JBConstants.TotalPercent.ReservedRate[2] * 100).toFixed(2) + "%";
  const redemptionRateLabel = (redemptionRate.toNumber() / JBConstants.TotalPercent.RedemptionRate[2] * 100).toFixed(2) + "%";
  const newDiscountRateLabel = (newDiscountRate.toNumber() / JBConstants.TotalPercent.DiscountRate[2] * 100).toFixed(2) + "%";
  const newReservedRateLabel = (newReservedRate.toNumber() / JBConstants.TotalPercent.ReservedRate[2] * 100).toFixed(2) + "%";
  const newRedemptionRateLabel = (newRedemptionRate.toNumber() / JBConstants.TotalPercent.RedemptionRate[2] * 100).toFixed(2) + "%";

  return [
    {
      section: "Cycle",
      entries: [
        {
          id: "duration",
          title: "Duration",
          proposal: 0,
          oldVal: config.fundingCycle.duration?.div(86400).toString() + " days",
          newVal: newConfig.fundingCycle.duration?.div(86400).toString() + " days",
          status: compareBN(config.fundingCycle.duration, newConfig.fundingCycle.duration),
          valueToBeSorted: 0
        },
        {
          id: "payouts",
          title: "Payouts",
          proposal: 0,
          oldVal: formatCurrency(config.fundingCycle.currency, config.fundingCycle.target),
          newVal: formatCurrency(newConfig.fundingCycle.currency, newConfig.fundingCycle.target),
          status: (config.fundingCycle.currency.eq(newConfig.fundingCycle.currency) && config.fundingCycle.target.eq(newConfig.fundingCycle.target)) ? "Keep" : "Edit",
          valueToBeSorted: 0
        },
        {
          id: "editDeadline",
          title: "Edit Deadline",
          proposal: 0,
          oldVal: config.fundingCycle.ballot,
          newVal: newConfig.fundingCycle.ballot,
          status: config.fundingCycle.ballot === newConfig.fundingCycle.ballot ? "Keep" : "Edit",
          valueToBeSorted: 0
        }
      ]
    },
    {
      section: "Token",
      entries: [
        {
          id: "totalIssuanceRate",
          title: "Total issuance rate",
          proposal: 0,
          oldVal: formatEtherCommify(weight),
          newVal: formatEtherCommify(newWeight),
          status: compareBN(weight, newWeight),
          valueToBeSorted: 0
        },
        {
          id: "payerIssuanceRate",
          title: "Payer issuance rate",
          proposal: 0,
          oldVal: formatEtherCommify(payerWeight),
          newVal: formatEtherCommify(newPayerWeight),
          status: compareBN(payerWeight, newPayerWeight),
          valueToBeSorted: 0
        },
        {
          id: "reservedRate",
          title: "Reserved rate",
          proposal: 0,
          oldVal: reservedRateLabel,
          newVal: newReservedRateLabel,
          status: compareBN(reservedRate, newReservedRate),
          valueToBeSorted: 0
        },
        {
          id: "issuanceReductionRate",
          title: "Issuance reduction rate",
          proposal: 0,
          oldVal: discountRateLabel,
          newVal: newDiscountRateLabel,
          status: compareBN(discountRate, newDiscountRate),
          valueToBeSorted: 0
        },
        {
          id: "redemptionRate",
          title: "Redemption rate",
          proposal: 0,
          oldVal: redemptionRateLabel,
          newVal: newRedemptionRateLabel,
          status: compareBN(redemptionRate, newRedemptionRate),
          valueToBeSorted: 0
        },
        {
          id: "ownerTokenMinting",
          title: "Owner token minting",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.allowMinting),
          newVal: getBooleanLabel(newConfig.metadata?.allowMinting),
          status: compareBoolean(config.metadata?.allowMinting, newConfig.metadata?.allowMinting),
          valueToBeSorted: 0
        },
        {
          id: "tokenTransfers",
          title: "Token transfers",
          proposal: 0,
          // @ts-ignore we do have pauseTransfers
          oldVal: getBooleanLabel(!config.metadata?.global.pauseTransfers),
          // @ts-ignore
          newVal: getBooleanLabel(!newConfig.metadata?.global.pauseTransfers),
          // @ts-ignore
          status: compareBoolean(config.metadata?.global.pauseTransfers, newConfig.metadata?.global.pauseTransfers),
          valueToBeSorted: 0
        }
      ]
    },
    {
      section: "Other Rules",
      entries: [
        {
          id: "paymentToThisProject",
          title: "Payment to this project",
          proposal: 0,
          oldVal: getBooleanLabel(!config.metadata?.pausePay),
          newVal: getBooleanLabel(!newConfig.metadata?.pausePay),
          status: compareBoolean(config.metadata?.pausePay, newConfig.metadata?.pausePay),
          valueToBeSorted: 0
        },
        {
          id: "holdFees",
          title: "Hold fees",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.holdFees),
          newVal: getBooleanLabel(newConfig.metadata?.holdFees),
          status: compareBoolean(config.metadata?.holdFees, newConfig.metadata?.holdFees),
          valueToBeSorted: 0
        },
        {
          id: "setPaymentTerminals",
          title: "Set payment terminals",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.global.allowSetTerminals),
          newVal: getBooleanLabel(newConfig.metadata?.global.allowSetTerminals),
          status: compareBoolean(config.metadata?.global.allowSetTerminals, newConfig.metadata?.global.allowSetTerminals),
          valueToBeSorted: 0
        },
        {
          id: "setController",
          title: "Set controller",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.global.allowSetController),
          newVal: getBooleanLabel(newConfig.metadata?.global.allowSetController),
          status: compareBoolean(config.metadata?.global.allowSetController, newConfig.metadata?.global.allowSetController),
          valueToBeSorted: 0
        },
        {
          id: "migratePaymentTerminal",
          title: "Migrate payment terminal",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.allowTerminalMigration),
          newVal: getBooleanLabel(newConfig.metadata?.allowTerminalMigration),
          status: compareBoolean(config.metadata?.allowTerminalMigration, newConfig.metadata?.allowTerminalMigration),
          valueToBeSorted: 0
        },
        {
          id: "migrateController",
          title: "Migrate controller",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.allowControllerMigration),
          newVal: getBooleanLabel(newConfig.metadata?.allowControllerMigration),
          status: compareBoolean(config.metadata?.allowControllerMigration, newConfig.metadata?.allowControllerMigration),
          valueToBeSorted: 0
        }
      ]
    }];
}

export function comparePayouts(config: FundingCycleConfigProps, newConfig: FundingCycleConfigProps | undefined, oldPayouts: JBSplit[], newPayouts: JBSplit[]) {
  const diff: SplitDiff = {
    expire: {},
    new: {},
    change: {},
    keep: {},
    newTotal: newConfig?.fundingCycle.target || BIG_ZERO
  };
  if (!newConfig) return diff;

  const newPayoutsMap = new Map<string, JBSplit>();
  newPayouts.forEach(payout => newPayoutsMap.set(keyOfSplit(payout), payout));

  const isInfiniteLimit = config.fundingCycle.target.gte(JBConstants.UintMax);

  // Calculate diff
  oldPayouts.forEach(split => {
    const key = keyOfSplit(split);
    const newSplit = newPayoutsMap.get(key);
    const entry = {
      split: newSplit || split,
      proposalId: 0,
      oldVal: formattedSplit(
        split.percent || BIG_ZERO,
        config.fundingCycle.currency,
        config.fundingCycle.target,
        config.version
      ) || "",
      newVal: "",
      amount: 0
    };

    if (newSplit) {
      // keep or change
      const equal = isEqualPayoutSplit(
        split.percent, config.fundingCycle.currency, config.fundingCycle.target,
        newSplit.percent, newConfig.fundingCycle.currency, newConfig.fundingCycle.target);

      if (equal) {
        diff.keep[key] = {
          ...entry,
          newVal: formattedSplit(
            split.percent || BIG_ZERO,
            config.fundingCycle.currency,
            config.fundingCycle.target,
            config.version
          ) || "",
          amount: calculateSplitAmount(split.percent, config.fundingCycle.target)
        };
      } else {
        diff.change[key] = {
          ...entry,
          newVal: formattedSplit(
            newSplit.percent || BIG_ZERO,
            newConfig.fundingCycle.currency,
            newConfig.fundingCycle.target,
            newConfig.version
          ) || "",
          amount: calculateSplitAmount(newSplit.percent, newConfig.fundingCycle.target)
        };
      }
    } else {
      // expire
      diff.expire[key] = entry;
    }

    // Remove map entry so it won't get calculated twice later
    newPayoutsMap.delete(key);
  });

  newPayoutsMap.forEach((split, key) => {
    // New entry
    const amount = calculateSplitAmount(split.percent, newConfig.fundingCycle.target);
    diff.new[key] = {
      split,
      proposalId: 0,
      oldVal: "",
      newVal: formattedSplit(
        split.percent || BIG_ZERO,
        newConfig.fundingCycle.currency,
        newConfig.fundingCycle.target,
        newConfig.version
      ) || "",
      amount
    };
  });

  //console.debug("payoutsCompare.final", { diff, isInfiniteLimit });
  return diff;
}

export function mergePayouts(config: FundingCycleConfigProps, currentCycle: number | undefined, onchainPayouts: JBSplit[], registeredPayouts: SQLPayout[], actionPayouts: { pid: number, action: Action }[]) {
  const diff: SplitDiff = {
    expire: {},
    new: {},
    change: {},
    keep: {},
    newTotal: config.fundingCycle.target
  };

  // Maps
  const registeredPayoutMap = new Map<string, SQLPayout>();
  const actionPayoutMap = new Map<string, { pid: number, action: Action }>();
  registeredPayouts.forEach(payout => registeredPayoutMap.set(keyOfNancePayout2Split(payout), payout));
  actionPayouts.forEach(action => actionPayoutMap.set(keyOfPayout2Split((action.action.payload as Payout)), action));
  //console.debug("payoutsDiffOf.start", onchainPayouts, registeredPayoutMap, actionPayoutMap);

  // Calculate diff
  //  abc.eth 20% => 100u
  //  1. expired: numberOfPayouts == (currentCycle - governanceCycleStart + 1)
  //  2. added: split not existed before
  //  3. changed: payouts amount changed
  onchainPayouts.forEach(split => {
    const key = keyOfSplit(split);
    const registeredPayout = registeredPayoutMap.get(key);
    const actionPayout = actionPayoutMap.get(key);

    if (actionPayout) {
      // Amount change or refresh
      diff.change[key] = {
        split,
        proposalId: actionPayout.pid,
        oldVal: formattedSplit(
          split.percent || BigNumber.from(0),
          config.fundingCycle.currency,
          config.fundingCycle.target,
          config.version
        ) || "",
        newVal: "",
        amount: (actionPayout.action.payload as Payout).amountUSD
      };
    } else if (registeredPayout) {
      // Will it expire?
      const willExpire = currentCycle && registeredPayout.numberOfPayouts < (currentCycle - registeredPayout.governanceCycleStart + 1);
      if (willExpire) {
        diff.expire[key] = {
          split,
          proposalId: registeredPayout.proposalId || 0,
          oldVal: formattedSplit(
            split.percent || BIG_ZERO,
            config.fundingCycle.currency,
            config.fundingCycle.target,
            config.version
          ) || "",
          newVal: "",
          amount: calculateSplitAmount(split.percent, config.fundingCycle.target)
        };
      } else {
        // keep it
        diff.keep[key] = {
          split,
          proposalId: registeredPayout.proposalId || 0,
          oldVal: formattedSplit(
            split.percent || BIG_ZERO,
            config.fundingCycle.currency,
            config.fundingCycle.target,
            config.version
          ) || "",
          newVal: "",
          amount: calculateSplitAmount(split.percent, config.fundingCycle.target)
        };
      }
    } else {
      // keep it
      diff.keep[key] = {
        split,
        proposalId: 0,
        oldVal: formattedSplit(
          split.percent || BIG_ZERO,
          config.fundingCycle.currency,
          config.fundingCycle.target,
          config.version
        ) || "",
        newVal: "",
        amount: calculateSplitAmount(split.percent, config.fundingCycle.target)
      };
    }

    // Remove map entry so it won't get calculated twice later
    actionPayoutMap.delete(key);
  });

  actionPayoutMap.forEach((action, key) => {
    // New entry
    const payout = action.action.payload as Payout;
    const split: JBSplit = {
      preferClaimed: false,
      preferAddToBalance: false,
      percent: BIG_ZERO,
      lockedUntil: BIG_ZERO,
      beneficiary: payout.address,
      projectId: BigNumber.from(payout.project || 0),
      allocator: ZERO_ADDRESS
    };
    diff.new[key] = {
      split,
      proposalId: action.pid,
      oldVal: "",
      newVal: "",
      amount: payout.amountUSD
    };
  });

  // Calculate new distributionLimit and percentages for all payouts if there are changes.
  // FIXME here we assume all project will use USD-based payout, otherwise we need to handle currency
  const isInfiniteLimit = config.fundingCycle.target.gte(JBConstants.UintMax);
  const oldLimit = parseInt(utils.formatEther(config.fundingCycle.target ?? 0));
  let newLimit = oldLimit;
  Object.entries(diff.new).forEach((v) => newLimit += v[1].amount);
  Object.entries(diff.expire).forEach((v) => newLimit -= v[1].amount);
  Object.entries(diff.change).forEach((v) => {
    newLimit -= calculateSplitAmount(v[1].split.percent, config.fundingCycle.target);
    newLimit += v[1].amount;
  });
  const newLimitBG = utils.parseEther(newLimit.toFixed(0));
  diff.newTotal = newLimitBG;

  // FIXME: remining funds should be allocated to project owner
  const updatePercentAndNewVal = percentUpdaterFrom(newLimitBG, config.fundingCycle.currency, config.version);
  Object.values(diff.keep).forEach(updatePercentAndNewVal);
  Object.values(diff.new).forEach(updatePercentAndNewVal);
  Object.values(diff.change).forEach(updatePercentAndNewVal);

  //console.debug("payoutsDiffOf.final", { diff, isInfiniteLimit, oldLimit, newLimit });
  return diff;
}

export function splitStruct2JBSplit(v: JBSplitNanceStruct) {
  const split: JBSplit = {
    preferClaimed: v.preferClaimed,
    preferAddToBalance: v.preferAddToBalance,
    percent: BigNumber.from(v.percent),
    lockedUntil: BigNumber.from(v.lockedUntil),
    beneficiary: v.beneficiary,
    projectId: BigNumber.from(v.projectId || 0),
    allocator: v.allocator
  };
  return split;
}

export function compareReserves(oldReserves: JBSplit[], newReserves: JBSplit[], pid: number = 0) {
  const newReserveMap = new Map<string, JBSplit>();
  newReserves.forEach(split => newReserveMap.set(keyOfSplit(split), split));
  const diff: SplitDiff = {
    expire: {},
    new: {},
    change: {},
    keep: {},
    newTotal: BIG_ZERO
  };

  oldReserves.forEach(ticket => {
    const key = keyOfSplit(ticket);
    const reserve = newReserveMap.get(key);

    if (reserve) {
      const equal = isEqualJBSplit(ticket, reserve);
      diff.newTotal = diff.newTotal.add(BigNumber.from(reserve.percent));

      if (equal) {
        // keep
        diff.keep[key] = {
          split: ticket,
          oldVal: `${(ticket.percent.toNumber() / JBConstants.TotalPercent.Splits[2] * 100).toFixed(2)}%`,
          newVal: `${(ticket.percent.toNumber() / JBConstants.TotalPercent.Splits[2] * 100).toFixed(2)}%`,
          proposalId: 0,
          amount: ticket.percent.toNumber()
        };
      } else {
        // change
        diff.change[key] = {
          split: reserve,
          oldVal: `${(ticket.percent.toNumber() / JBConstants.TotalPercent.Splits[2] * 100).toFixed(2)}%`,
          newVal: `${(reserve.percent.toNumber() / JBConstants.TotalPercent.Splits[2] * 100).toFixed(2)}%`,
          proposalId: pid,
          amount: reserve.percent.toNumber()
        };
      }
    } else {
      // remove
      diff.expire[key] = {
        split: ticket,
        oldVal: `${(ticket.percent.toNumber() / JBConstants.TotalPercent.Splits[2] * 100).toFixed(2)}%`,
        newVal: "",
        proposalId: pid,
        amount: ticket.percent.toNumber()
      };
    }

    newReserveMap.delete(key);
  });

  newReserveMap.forEach((v, k) => {
    diff.newTotal = diff.newTotal.add(BigNumber.from(v.percent));
    diff.new[k] = {
      split: v,
      oldVal: `${(v.percent.toNumber() / JBConstants.TotalPercent.Splits[2] * 100).toFixed(2)}%`,
      newVal: "",
      proposalId: pid,
      amount: v.percent.toNumber()
    };
  });

  //console.debug("reservesDiffOf.final", diff);
  return diff;
}

export function payout2JBSplit(payout: Payout) {
  // FIXME: this may not work for allocator
  const split: JBSplit = {
    preferClaimed: false,
    preferAddToBalance: false,
    percent: BigNumber.from(payout.amountUSD),
    lockedUntil: BIG_ZERO,
    beneficiary: payout.address,
    projectId: BigNumber.from(payout.project || 0),
    allocator: ZERO_ADDRESS
  };
  return split;
}

export function calcDiffTableData(config: FundingCycleConfigProps, newConfig: FundingCycleConfigProps | undefined, payoutsDiff: SplitDiff, reservesDiff: SplitDiff) {
  // Table data
  //console.debug("calcDiffTableData", { config, newConfig, payoutsDiff, reservesDiff });

  const tableData: SectionTableData[] = [
    ...compareRules(config, newConfig),
    {
      section: "Distribution",
      entries: []
    },
    {
      section: "Reserve Token",
      entries: []
    }
  ];

  const payoutIndex = tableData.length - 2;
  const reserveIndex = tableData.length - 1;
  // Payout Diff
  Object.values(payoutsDiff.new).forEach(diff2TableEntry(payoutIndex, "Add", tableData));
  Object.values(payoutsDiff.change).forEach(diff2TableEntry(payoutIndex, "Edit", tableData));
  Object.values(payoutsDiff.expire).forEach(diff2TableEntry(payoutIndex, "Remove", tableData));
  Object.values(payoutsDiff.keep).forEach(diff2TableEntry(payoutIndex, "Keep", tableData));
  tableData[payoutIndex].entries.sort((a, b) => b.valueToBeSorted - a.valueToBeSorted);
  // Reserve Diff
  Object.values(reservesDiff.new).forEach(diff2TableEntry(reserveIndex, "Add", tableData));
  Object.values(reservesDiff.change).forEach(diff2TableEntry(reserveIndex, "Edit", tableData));
  Object.values(reservesDiff.expire).forEach(diff2TableEntry(reserveIndex, "Remove", tableData));
  Object.values(reservesDiff.keep).forEach(diff2TableEntry(reserveIndex, "Keep", tableData));
  tableData[reserveIndex].entries.sort((a, b) => b.valueToBeSorted - a.valueToBeSorted);

  return tableData;
}

export function encodedReconfigureFundingCyclesOf(config: FundingCycleConfigProps, payoutsDiff: SplitDiff, reservesDiff: SplitDiff, projectId: number, controller: Contract | undefined, terminal: Contract) {
  const BIG_ZERO = BigNumber.from(0);
  const fc = config.fundingCycle;
  const jbFundingCycleData: JBFundingCycleData = {
    duration: fc?.duration || BIG_ZERO,
    // discountRate is a percent by how much the weight of the subsequent funding cycle should be reduced,
    //   if the project owner hasn't configured the subsequent funding cycle with an explicit weight.
    weight: BIG_ZERO,
    discountRate: fc?.discountRate || BIG_ZERO,
    ballot: fc?.ballot || ZERO_ADDRESS
  };
  const reconfigurationRawData = [
    BigNumber.from(projectId),                       // _projectId
    jbFundingCycleData,                              // _data
    config.metadata,                          // _metadata
    BigNumber.from(Math.floor(Date.now() / 1000)),   // _mustStartAtOrAfter
    [                                                // _groupedSplits
      {
        group: JBConstants.SplitGroup.ETH,
        // gather JBSplit of payoutsDiff.new .change .keep
        splits: Object.values(payoutsDiff.new).concat(Object.values(payoutsDiff.change)).concat(Object.values(payoutsDiff.keep)).map(v => v.split)
      },
      {
        group: JBConstants.SplitGroup.RESERVED_TOKEN,
        // gather JBSplit of reservesDiff.new .change .keep
        splits: Object.values(reservesDiff.new).concat(Object.values(reservesDiff.change)).concat(Object.values(reservesDiff.keep)).map(v => v.split)
      }
    ],
    [{                                                // _fundAccessConstraints
      terminal: terminal.address,
      token: ETH_TOKEN_ADDRESS,
      distributionLimit: payoutsDiff.newTotal,
      distributionLimitCurrency: CURRENCY_USD,
      overflowAllowance: BIG_ZERO,
      overflowAllowanceCurrency: BIG_ZERO
    }],
    "Queued from Nance.QueueExecutionFlow"           // _memo
  ];
  console.debug("reconfigurationRawData", reconfigurationRawData);

  return controller?.interface?.encodeFunctionData("reconfigureFundingCyclesOf", reconfigurationRawData);
}
