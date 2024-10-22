import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact" , compactDisplay: "short" });
export const formatNumber = (num: number | bigint) => {
  if (num === 0) return 0;
  if (num < 1) return `~0`;
  return formatter.format(num);
};

export function formatTokenBalance(balance: BigNumber): string {
  console.log(balance);
  return formatter.format(parseInt(formatEther(balance)));
}

export function numToPrettyString(num: number | undefined) {
  if (num === undefined) {
    return '';
  } if (num === 0) {
    return 0;
  } if (num > 1E9) {
    return `${(num / 1E9).toFixed(1)}B`;
  } if (num >= 1E6) {
    return `${(num / 1E6).toFixed(1)}M`;
  } if (num > 1E3) {
    return `${(num / 1E3).toFixed(1)}k`;
  }
  return num.toFixed(1);
}