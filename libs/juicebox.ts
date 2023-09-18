/* eslint-disable max-lines */
import { BigNumber, BigNumberish, Contract, utils } from "ethers";
import { FundingCycleConfigProps, formattedSplit, calculateSplitAmount, splitAmount2Percent } from "../components/juicebox/ReconfigurationCompare";
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
  const formatter = new Intl.NumberFormat('en-GB');
  const symbol = currency.toNumber() == 0 ? "Ξ" : "$";
  const formatted = amount.gte(JBConstants.UintMax) ? "∞" : formatEtherCommify(amount ?? 0);
  return symbol + formatted;
};

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

export function compareRules(oldConfig: FundingCycleConfigProps, newConfig: FundingCycleConfigProps): SplitDiff {
  const diff: SplitDiff = {
    expire: {},
    new: {},
    change: {},
    keep: {},
    newTotal: BIG_ZERO
  };

  return diff;
}

export function comparePayouts(config: FundingCycleConfigProps, oldPayouts: JBSplit[], newPayouts: JBSplit[]) {
  const diff: SplitDiff = {
    expire: {},
    new: {},
    change: {},
    keep: {},
    newTotal: config.fundingCycle.target
  };

  const newPayoutsMap = new Map<string, JBSplit>();
  newPayouts.forEach(payout => newPayoutsMap.set(keyOfSplit(payout), payout));

  const isInfiniteLimit = config.fundingCycle.target.gte(JBConstants.UintMax);
  const oldLimit = parseInt(utils.formatEther(config.fundingCycle.target ?? 0));
  let newLimit = oldLimit;

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
      amount: calculateSplitAmount((newSplit || split).percent, config.fundingCycle.target)
    };

    if (newSplit) {
      // keep or change
      const equal = isEqualJBSplit(split, newSplit);
      if (equal) {
        diff.keep[key] = entry;
      } else {
        diff.change[key] = entry;
        newLimit -= calculateSplitAmount(entry.split.percent, config.fundingCycle.target);
        newLimit += entry.amount;
      }
    } else {
      // expire
      diff.expire[key] = entry;
      newLimit -= entry.amount;
    }

    // Remove map entry so it won't get calculated twice later
    newPayoutsMap.delete(key);
  });

  newPayoutsMap.forEach((split, key) => {
    // New entry
    const amount = calculateSplitAmount(split.percent, config.fundingCycle.target);
    diff.new[key] = {
      split,
      proposalId: 0,
      oldVal: "",
      newVal: "",
      amount
    };
    newLimit += amount;
  });

  // Calculate new distributionLimit and percentages for all payouts if there are changes.
  const newLimitBG = utils.parseEther(newLimit.toFixed(0));
  diff.newTotal = newLimitBG;

  // FIXME: remining funds should be allocated to project owner
  const updatePercentAndNewVal = percentUpdaterFrom(newLimitBG, config.fundingCycle.currency, config.version);
  Object.values(diff.keep).forEach(updatePercentAndNewVal);
  Object.values(diff.new).forEach(updatePercentAndNewVal);
  Object.values(diff.change).forEach(updatePercentAndNewVal);

  console.debug("payoutsCompare.final", { diff, isInfiniteLimit, oldLimit, newLimit });
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

  console.debug("payoutsDiffOf.final", { diff, isInfiniteLimit, oldLimit, newLimit });
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

  console.debug("reservesDiffOf.final", diff);
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

function calcTokenRates(weight: BigNumber, discountRate: BigNumber, reservedRate: BigNumber, redemptionRate: BigNumber) {
  const discountRateDenominator = BigNumber.from(JBConstants.TotalPercent.DiscountRate[2]);
  const reservedRateDenominator = BigNumber.from(JBConstants.TotalPercent.ReservedRate[2]);

  // Payer gets what left after reserved tokens are issued.
  const payerIssuanceRate = weight.sub(mulDiv(weight, reservedRate, reservedRateDenominator));
  // Discounted issuance rate in next cycle.
  const newIssuanceRate = mulDiv(weight, discountRateDenominator.sub(discountRate), discountRateDenominator);
  const newPayerIssuanceRate = newIssuanceRate.sub(mulDiv(newIssuanceRate, reservedRate, reservedRateDenominator));

  // For display, 0.01 % precision
  const discountRateLabel = (discountRate.toNumber() / JBConstants.TotalPercent.DiscountRate[2] * 100).toFixed(2) + "%";
  const reservedRateLabel = (reservedRate.toNumber() / JBConstants.TotalPercent.ReservedRate[2] * 100).toFixed(2) + "%";
  const redemptionRateLabel = (redemptionRate.toNumber() / JBConstants.TotalPercent.RedemptionRate[2] * 100).toFixed(2) + "%";

  return {
    issuanceRate: weight, payerIssuanceRate, newIssuanceRate, newPayerIssuanceRate,
    discountRateLabel, reservedRateLabel, redemptionRateLabel
  };
}

function getBooleanLabel(enable: boolean | undefined) {
  return enable ? "Enabled" : "Disabled";
}

export function calcDiffTableData(config: FundingCycleConfigProps, payoutsDiff: SplitDiff, reservesDiff: SplitDiff) {
  // Table data
  // TODO: to review, we can decode queued reconfiguration, calculate diff and display it.
  // Separate this part and we can reuse it.
  //
  const weight = config.fundingCycle.weight || BIG_ZERO;
  const discountRate = config.fundingCycle.discountRate || BIG_ZERO;
  const reservedRate = config.metadata?.reservedRate || BIG_ZERO;
  const redemptionRate = config.metadata?.redemptionRate || BIG_ZERO;
  const rates = calcTokenRates(weight, discountRate, reservedRate, redemptionRate);

  console.debug("calcDiffTableData", { config, rates });

  const tableData: SectionTableData[] = [
    {
      section: "Cycle",
      entries: [
        {
          id: "duration",
          title: "Duration",
          proposal: 0,
          oldVal: config.fundingCycle.duration?.div(86400).toString() + " days",
          newVal: config.fundingCycle.duration?.div(86400).toString() + " days",
          status: "Keep",
          valueToBeSorted: 0
        },
        {
          id: "payouts",
          title: "Payouts",
          proposal: 0,
          oldVal: formatCurrency(config.fundingCycle.currency, config.fundingCycle.target),
          newVal: formatCurrency(config.fundingCycle.currency, payoutsDiff.newTotal),
          status: payoutsDiff.newTotal.eq(config.fundingCycle.target) ? "Keep" : "Edit",
          valueToBeSorted: 0
        },
        {
          id: "editDeadline",
          title: "Edit Deadline",
          proposal: 0,
          oldVal: config.fundingCycle.ballot,
          newVal: config.fundingCycle.ballot,
          status: "Keep",
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
          oldVal: formatEtherCommify(rates.issuanceRate),
          newVal: formatEtherCommify(rates.newIssuanceRate),
          status: rates.issuanceRate.eq(rates.newIssuanceRate) ? "Keep" : "Edit",
          valueToBeSorted: 0
        },
        {
          id: "payerIssuanceRate",
          title: "Payer issuance rate",
          proposal: 0,
          oldVal: formatEtherCommify(rates.payerIssuanceRate),
          newVal: formatEtherCommify(rates.newPayerIssuanceRate),
          status: rates.payerIssuanceRate.eq(rates.newPayerIssuanceRate) ? "Keep" : "Edit",
          valueToBeSorted: 0
        },
        {
          id: "reservedRate",
          title: "Reserved rate",
          proposal: 0,
          oldVal: rates.reservedRateLabel,
          newVal: rates.reservedRateLabel,
          status: "Keep",
          valueToBeSorted: 0
        },
        {
          id: "issuanceReductionRate",
          title: "Issuance reduction rate",
          proposal: 0,
          oldVal: rates.discountRateLabel,
          newVal: rates.discountRateLabel,
          status: "Keep",
          valueToBeSorted: 0
        },
        {
          id: "redemptionRate",
          title: "Redemption rate",
          proposal: 0,
          oldVal: rates.redemptionRateLabel,
          newVal: rates.redemptionRateLabel,
          status: "Keep",
          valueToBeSorted: 0
        },
        {
          id: "ownerTokenMinting",
          title: "Owner token minting",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.allowMinting),
          newVal: getBooleanLabel(config.metadata?.allowMinting),
          status: "Keep",
          valueToBeSorted: 0
        },
        {
          id: "tokenTransfers",
          title: "Token transfers",
          proposal: 0,
          // @ts-ignore we do have pauseTransfers
          oldVal: getBooleanLabel(!config.metadata?.global.pauseTransfers),
          // @ts-ignore
          newVal: getBooleanLabel(!config.metadata?.global.pauseTransfers),
          status: "Keep",
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
          newVal: getBooleanLabel(!config.metadata?.pausePay),
          status: "Keep",
          valueToBeSorted: 0
        },
        {
          id: "holdFees",
          title: "Hold fees",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.holdFees),
          newVal: getBooleanLabel(config.metadata?.holdFees),
          status: "Keep",
          valueToBeSorted: 0
        },
        {
          id: "setPaymentTerminals",
          title: "Set payment terminals",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.global.allowSetTerminals),
          newVal: getBooleanLabel(config.metadata?.global.allowSetTerminals),
          status: "Keep",
          valueToBeSorted: 0
        },
        {
          id: "setController",
          title: "Set controller",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.global.allowSetController),
          newVal: getBooleanLabel(config.metadata?.global.allowSetController),
          status: "Keep",
          valueToBeSorted: 0
        },
        {
          id: "migratePaymentTerminal",
          title: "Migrate payment terminal",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.allowTerminalMigration),
          newVal: getBooleanLabel(config.metadata?.allowTerminalMigration),
          status: "Keep",
          valueToBeSorted: 0
        },
        {
          id: "migrateController",
          title: "Migrate controller",
          proposal: 0,
          oldVal: getBooleanLabel(config.metadata?.allowControllerMigration),
          newVal: getBooleanLabel(config.metadata?.allowControllerMigration),
          status: "Keep",
          valueToBeSorted: 0
        }
      ]
    },
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
  tableData[1].entries.sort((a, b) => b.valueToBeSorted - a.valueToBeSorted);
  // Reserve Diff
  Object.values(reservesDiff.new).forEach(diff2TableEntry(reserveIndex, "Add", tableData));
  Object.values(reservesDiff.change).forEach(diff2TableEntry(reserveIndex, "Edit", tableData));
  Object.values(reservesDiff.expire).forEach(diff2TableEntry(reserveIndex, "Remove", tableData));
  Object.values(reservesDiff.keep).forEach(diff2TableEntry(reserveIndex, "Keep", tableData));
  tableData[2].entries.sort((a, b) => b.valueToBeSorted - a.valueToBeSorted);

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
