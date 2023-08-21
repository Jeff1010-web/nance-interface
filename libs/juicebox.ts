import { BigNumber, utils } from "ethers";
import { FundingCycleConfigProps, formattedSplit, calculateSplitAmount, splitAmount2Percent } from "../components/juicebox/ReconfigurationCompare";
import { ZERO_ADDRESS } from "../constants/Contract";
import { JBConstants, JBSplit } from "../models/JuiceboxTypes";
import { SQLPayout, Action, Payout, Reserve, JBSplitNanceStruct } from "../models/NanceTypes";
import { getAddress } from "viem";
import { formatNumber } from "./NumberFormatter";

// In v1, ETH = 0, USD = 1
// In v2, ETH = 1, USD = 2, we subtract 1 to get the same value
export const formatCurrency = (currency: BigNumber, amount: BigNumber) => {
  const symbol = currency.toNumber() == 0 ? "Ξ" : "$";
  const formatted = amount.gte(JBConstants.UintMax) ? "∞" : formatNumber(parseInt(utils.formatEther(amount ?? 0)));
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
    && a.projectId.eq(b.projectId)
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

export function payoutsDiffOf(config: FundingCycleConfigProps, currentCycle: number | undefined, onchainPayouts: JBSplit[], registeredPayouts: SQLPayout[], actionPayouts: {pid: number, action: Action}[]) {
  const diff: SplitDiff = {
    expire: {},
    new: {},
    change: {},
    keep: {},
    newTotal: config.fundingCycle.target
  }

  // Maps
  const registeredPayoutMap = new Map<string, SQLPayout>();
  const actionPayoutMap = new Map<string, {pid: number, action: Action}>();
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
      }
    } else if (registeredPayout) {
      // Will it expire?
      const willExpire = currentCycle && registeredPayout.numberOfPayouts < (currentCycle - registeredPayout.governanceCycleStart + 1)
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
        }
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
        }
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
      }
    }

    // Remove map entry so it won't get calculated twice later
    actionPayoutMap.delete(key);
  })

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
    }
    diff.new[key] = {
      split,
      proposalId: action.pid,
      oldVal: "",
      newVal: "",
      amount: payout.amountUSD
    }
  })

  // Calculate new distributionLimit and percentages for all payouts if there are changes.
  // FIXME here we assume all project will use USD-based payout, otherwise we need to handle currency
  const isInfiniteLimit = config.fundingCycle.target.gte(JBConstants.UintMax);
  const oldLimit = parseInt(utils.formatEther(config.fundingCycle.target ?? 0));
  let newLimit = oldLimit;
  Object.entries(diff.new).forEach((v) => newLimit += v[1].amount)
  Object.entries(diff.expire).forEach((v) => newLimit -= v[1].amount)
  Object.entries(diff.change).forEach((v) => {
    newLimit -= calculateSplitAmount(v[1].split.percent, config.fundingCycle.target);
    newLimit += v[1].amount;
  })
  const newLimitBG = utils.parseEther(newLimit.toFixed(0));
  diff.newTotal = newLimitBG;

  // FIXME: remining funds should be allocated to project owner

  // Update percent in JBSplit struct, because we have new distributionLimit
  function updatePercentAndNewVal(entry: SplitDiffEntry) {
    const newPercent = splitAmount2Percent(newLimitBG, entry.amount);
    entry.split = {
      ...entry.split,
      percent: newPercent
    };
    entry.newVal = formattedSplit(
      newPercent,
      config.fundingCycle.currency,
      newLimitBG,
      config.version
    ) || "";
  }

  Object.values(diff.keep).forEach(updatePercentAndNewVal);
  Object.values(diff.new).forEach(updatePercentAndNewVal);
  Object.values(diff.change).forEach(updatePercentAndNewVal);

  console.debug("payoutsDiffOf.final", { diff, isInfiniteLimit, oldLimit, newLimit });
  return diff;
}

export function reservesDiffOf(onchainReserves: JBSplit[], actionReserve: Reserve, pid: number) {
  const actionReserveMap = new Map<string, JBSplitNanceStruct>();
  actionReserve?.splits.forEach(splitStruct => actionReserveMap.set(keyOfNanceSplit2Split(splitStruct), splitStruct));
  const diff: SplitDiff = {
    expire: {},
    new: {},
    change: {},
    keep: {},
    newTotal: BIG_ZERO
  }
  // entry.concat(onchainReserves.map(ticket => {
  //   return {
  //     split: ticket,
  //     oldVal: `${(ticket.percent.toNumber() / JBConstants.TotalPercent.Splits[2] * 100).toFixed(2)}%`,
  //     newVal: "",
  //     proposalId: 0,
  //     amount: ticket.percent.toNumber()
  //   }
  // }))

  function splitStruct2JBSplit(v: JBSplitNanceStruct) {
    const split: JBSplit = {
      preferClaimed: v.preferClaimed,
      preferAddToBalance: v.preferAddToBalance,
      percent: BigNumber.from(v.percent),
      lockedUntil: BigNumber.from(v.lockedUntil),
      beneficiary: v.beneficiary,
      projectId: BigNumber.from(v.projectId || 0),
      allocator: v.allocator
    }
    return split
  }

  onchainReserves.forEach(ticket => {
    const key = keyOfSplit(ticket);
    const reserve = actionReserveMap.get(key);

    if (actionReserve) {
      if (reserve) {
        const reserveAsJBSplit = splitStruct2JBSplit(reserve);
        const equal = isEqualJBSplit(ticket, reserveAsJBSplit);
        diff.newTotal = diff.newTotal.add(BigNumber.from(reserveAsJBSplit.percent));
  
        if (equal) {
          // keep
          diff.keep[key] = {
            split: ticket,
            oldVal: `${(ticket.percent.toNumber() / JBConstants.TotalPercent.Splits[2] * 100).toFixed(2)}%`,
            newVal: `${(ticket.percent.toNumber() / JBConstants.TotalPercent.Splits[2] * 100).toFixed(2)}%`,
            proposalId: 0,
            amount: ticket.percent.toNumber()
          }
        } else {
          // change
          diff.change[key] = {
            split: reserveAsJBSplit,
            oldVal: `${(ticket.percent.toNumber() / JBConstants.TotalPercent.Splits[2] * 100).toFixed(2)}%`,
            newVal: `${(reserve.percent / JBConstants.TotalPercent.Splits[2] * 100).toFixed(2)}%`,
            proposalId: pid,
            amount: reserve.percent
          }
        }
      } else {
        // remove
        diff.expire[key] = {
          split: ticket,
          oldVal: `${(ticket.percent.toNumber() / JBConstants.TotalPercent.Splits[2] * 100).toFixed(2)}%`,
          newVal: "",
          proposalId: pid,
          amount: ticket.percent.toNumber()
        }
      } 
    } else {
      diff.keep[key] = {
        split: ticket,
        oldVal: `${(ticket.percent.toNumber() / JBConstants.TotalPercent.Splits[2] * 100).toFixed(2)}%`,
        newVal: `${(ticket.percent.toNumber() / JBConstants.TotalPercent.Splits[2] * 100).toFixed(2)}%`,
        proposalId: 0,
        amount: ticket.percent.toNumber()
      }
    }

    actionReserveMap.delete(key);
  })

  actionReserveMap.forEach((v, k) => {
    const reserveAsJBSplit = splitStruct2JBSplit(v);
    diff.newTotal = diff.newTotal.add(BigNumber.from(reserveAsJBSplit.percent));
    diff.new[k] = {
      split: reserveAsJBSplit,
      oldVal: `${(v.percent / JBConstants.TotalPercent.Splits[2] * 100).toFixed(2)}%`,
      newVal: "",
      proposalId: pid,
      amount: v.percent
    }
  })

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
  }
  return split;
}