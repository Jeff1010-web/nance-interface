import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact" , compactDisplay: "short" });
export const formatNumber = (num: number | bigint) => formatter.format(num);

export function formatTokenBalance(balance: BigNumber): string {
    console.log(balance)
    return formatter.format(parseInt(formatEther(balance)));
}