// Copied from https://github.com/jbx-protocol/juice-interface/blob/10ba3e0e04/src/hooks/ContractReader/ContractReadValue.ts
import { Contract } from '@ethersproject/contracts'
import { useCallback, useState } from 'react'
import { useDeepCompareEffectNoCheck } from 'use-deep-compare-effect'

/**
 * Calls the `readContract` to be read from `contracts` in `functionName`.
 *
 * This is done in pureJS.
 */
 export async function callContractRead({
  readContract,
  functionName,
  args,
}: {
  readContract: Contract | undefined
  functionName: string | undefined
  args: unknown[] | null | undefined
}) {
  if (!readContract || !functionName || args === null) return

  try {
    console.debug(`📚 Read >`, functionName)
    return await readContract[functionName](...(args ?? []))
  } catch (err) {
    console.warn(
      `📕 Read error >`,
      functionName,
      { args },
      { err },
      { contract: readContract.address },
    )

    throw err
  }
}

/**
 * Reads a `contract` value from `contracts`, using the `functionName`.
 *
 * Upon load, the contract is initially read. From there, `refetchValue` must be
 * called.
 *
 * @returns refetchValue - Call to refetch and hydrate the `value`.
 * @returns value - Value returned from the contract.
 * @returns loading - Whether the contract is currently being read.
 */
 export function useContractReadValue<V>({
  contract,
  functionName,
  args,
  formatter,
  valueDidChange,
}: {
  contract: Contract | undefined
  functionName: string | undefined
  args: unknown[] | null | undefined // undefined if there is no args
  formatter?: (val?: any) => V | undefined // eslint-disable-line @typescript-eslint/no-explicit-any
  valueDidChange?: (oldVal?: V, newVal?: V) => boolean
}) {
  const [value, setValue] = useState<V | undefined>()
  const [loading, setLoading] = useState<boolean>(true)

  const _formatter = useCallback(
    (val: any) => (formatter ? formatter(val) : val), // eslint-disable-line @typescript-eslint/no-explicit-any
    [formatter],
  )
  const _valueDidChange = useCallback(
    (a?: any, b?: any) => (valueDidChange ? valueDidChange(a, b) : a !== b), // eslint-disable-line @typescript-eslint/no-explicit-any
    [valueDidChange],
  )

  const fetchValue = useCallback(async () => {
    const readContract = contract
    try {
      setLoading(true)
      const result = await callContractRead({
        readContract,
        functionName,
        args,
      })
      const newValue = _formatter(result)

      if (_valueDidChange(value, newValue)) {
        console.debug(
          `📗 New >`,
          functionName,
          { args },
          { newValue },
          { contract: readContract?.address },
        )
        setValue(newValue)
      }
    } catch (err) {
      console.warn('Read contract >', {
        functionName,
        error: err,
      })
      setValue(_formatter(undefined))
    } finally {
      setLoading(false)
    }
  }, [
    _formatter,
    _valueDidChange,
    args,
    contract,
    functionName,
    setValue,
    value,
  ])

  // Fetch the value on load or when args change.
  useDeepCompareEffectNoCheck(() => {
    fetchValue()

    // args and contracts may initially be not defined, so we want to keep
    // calling until they are
  }, [args, functionName, contract?.address])
  //}, [args, functionName, contract])

  return { refetchValue: fetchValue, value, loading }
}