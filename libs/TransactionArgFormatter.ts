import { BigNumber, utils } from 'ethers'
import { TransactionDescription } from 'ethers/lib/utils'

export default function formatArgs(abi, obj) {
    return TransactionArgFormatter
        .withABI(abi)
        .removeAbundantKeys()
        .flattenToEntries()
        .toMultiLineJSON()
        .call(obj)
}

export class TransactionArgFormatter {
    _parser: (o: any) => { data: TransactionDescription; message: string }
    _func: (obj: any) => any = (o) => o

    constructor(abi: string) {
        this._parser = (o) => _parse(abi, o)
    }

    static withABI(abi: string) {
        return new TransactionArgFormatter(abi)
    }

    appendFunc(newFunc: (o: any) => any) {
        const currentFunc = this._func
        this._func = (o) => newFunc(currentFunc(o))
        return this
    }

    removeAbundantKeys() {
        return this.appendFunc(_removeAbundantKeys)
    }

    flattenToEntries() {
        return this.appendFunc(_flattenToEntries)
    }

    toMultiLineJSON() {
        return this.appendFunc(_toMultiLineJSON)
    }

    call(obj: any) {
        const { data, message } = this._parser(obj)
        if (data?.args === undefined) {
            return { data: undefined, message }
        } else {
            return { data: this._func(data.args), message }
        }
    }
}

function _parse(abi: string, rawData: string) {
    let data: TransactionDescription
    let message = ''
    try {
        const iface = new utils.Interface(abi);
        data = iface.parseTransaction({ data: rawData });
        message = data.signature
    } catch (e) {
        message = e.message;
    }

    console.info('Diff.parse', {abi, rawData, data, message})

    return { data, message };
}

function range(start, end) {
    return Array(end - start + 1).fill(1).map((_, idx) => start + idx)
}

function _removeAbundantKeys(obj) {
    if(typeof obj === 'object' && obj.length !== undefined) {
        // Array
        if (Object.keys(obj).length === 2*obj.length) {
            // have named keys, let's remove abundant index keys
            // [3, 4, [1, top: 1], [1, 2], first: 3, second: 4, third: {1, top: 1}, fourth: [1,2]] 
            // =>
            // {first: 3, second: 4, third: {top: 1}, fourth: [1,2]]}
            const indexKeys = range(0, obj.length-1).map((i) => i.toString())
            const newObj = {}
            for (const key of Object.keys(obj)) {
                if(!indexKeys.includes(key)) {
                    newObj[key] = _removeAbundantKeys(obj[key])
                }
            }
            return newObj
        } else {
            return obj.map(_removeAbundantKeys)
        }

    } else {
        return obj
    }
}

export interface ArgEntry {
    level: number
    key: string
    value: any
}

function _flattenToEntries(obj: any, level = 0): ArgEntry[] {
    if(obj !== undefined)
    return Object.keys(obj).reduce((acc, key) => {

        if (typeof obj[key] === 'object') {
            if (BigNumber.isBigNumber(obj[key])) {
                const bn: BigNumber = obj[key]
                acc.push({ level, key, value: {
                    _isBigNumber: true,
                    _hex: bn.toHexString()
                } })
            } else {
                // array / struct, continue to flatten
                const value = obj.length !== undefined ? [] : {}
                const subArr = _flattenToEntries(obj[key], level + 1)
                acc.push({ level, key, value })
                acc.push(...subArr)
            }
            
        } else {
            acc.push({ level, key, value: obj[key] })
        }
        
        return acc
    }, []);
}

function _toMultiLineJSON(obj: any) {
    return Object.values(obj).map((o) => JSON.stringify(o)).join('\n')
}
  