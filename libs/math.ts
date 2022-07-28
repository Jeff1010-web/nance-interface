import { BigNumber } from '@ethersproject/bignumber'

/**
 * Scale a given [percentValue] to the perbicent unit by multiplying it by 2.
 *
 * Perbicent: x/200
 */
export const percentToPerbicent = (percentValue?: string | number) =>
    BigNumber.from(
        percentValue ? Math.floor(parseFloat(percentValue.toString()) * 2) : 0,
    )

export const feeForAmount = (
    amount: BigNumber | undefined,
    feePerbicent: BigNumber | undefined,
) => {
    if (!feePerbicent || !amount) return
    return amount.sub(amount.mul(200).div(feePerbicent.add(200)))
}

export const amountSubFee = (amount?: BigNumber, feePerbicent?: BigNumber) => {
    if (!feePerbicent || !amount) return
    return amount.sub(feeForAmount(amount, feePerbicent) ?? 0)
}

/**
 * new amount = old amount / (1 - fee)
 */
export const amountAddFee = (amount?: string, feePerbicent?: BigNumber) => {
    if (!feePerbicent || !amount) return

    const inverseFeePerbicent = percentToPerbicent(100).sub(feePerbicent)
    const amountPerbicent = BigNumber.from(amount).mul(percentToPerbicent(100))
    // new amount is in regular decimal units
    const newAmount = amountPerbicent.div(inverseFeePerbicent)

    return newAmount.toString()
}