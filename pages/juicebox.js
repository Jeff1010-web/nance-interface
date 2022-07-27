import Layout from "../components/Layout";
import { fromUnixTime, formatDistanceToNow, format } from 'date-fns'

import { utils } from 'ethers'
import { useContractReads } from 'wagmi';
import FundingCycles from '@jbx-protocol/contracts-v1/deployments/mainnet/FundingCycles.json';
import ModStore from '@jbx-protocol/contracts-v1/deployments/mainnet/ModStore.json';
import { useState, useEffect } from "react";

const fundingCycleContract = {
    addressOrName: FundingCycles.address,
    contractInterface: FundingCycles.abi
}
const modStoreContract = {
    addressOrName: ModStore.address,
    contractInterface: ModStore.abi
}

export default function Juicebox() {
    const { data, isError, isLoading } = useContractReads({
        contracts: [
          {
            ...fundingCycleContract,
            functionName: 'currentOf',
            args: 1
          }
        ]
      })

    if (isLoading) {
        return <div className="text-center">Loading proposals...</div>
    }
    
    return (
        <Layout
            pageTitle="[WIP] Juicebox Reconfiguration Helper"
            pageDescription="import/export hex data, preview with basic interface.">

            <FundingConfig data={data[0]} />
        </Layout>
    )
}

function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function parseV1Metadata(metadata) {
    const bytes = hexToBytes(metadata.toHexString()).reverse();
    let ret = {
        version: bytes[0],
        reserveRate: bytes[1],
        bondingCurveRate: bytes[2],
        reconfigurationBondingCurveRate: bytes[3],
        payIsPaused: bytes[0] == 1 ? bytes[4] : false,
        ticketPrintingIsAllowed: bytes[0] == 1 ? bytes[5] : false
    }
    return ret;
}

function FundingConfig({data}) {
    console.info("FundingCycleDetail", data);
    const currencySign = data?.currency.toNumber() == 0 ? "Ξ" : "$";
    const formatCurrency = (amount) => currencySign + utils.formatEther(amount ?? 0);
    const metadata = parseV1Metadata(data.metadata);

    const parsed = {
        cycle: data.number.toNumber(),
        tapped: formatCurrency(data.tapped),
        target: formatCurrency(data.target),
        duration: data.duration.toNumber(),
        start: format(fromUnixTime(data.start.toNumber()), 'yyyy-MM-dd hh:mmaaa'),
        discountRate: data.discountRate.toNumber() / 10 + "%",
        reserveRate: metadata.reserveRate / 2 + "%",
        bondingCurveRate: metadata.bondingCurveRate / 2 + "%",
        reconfigurationBondingCurveRate: metadata.reconfigurationBondingCurveRate / 2 + "%",
        weight: utils.formatEther(data.weight),
        ballot: data.ballot
    };

    return (
        <div id="project-detail" className="px-2">
            <table>
                <tbody>
                    {Object.entries(parsed).map(entry => 
                        (
                            <tr key={entry[0]}>
                                <td>
                                    <span>{entry[0]}: {entry[1]}</span>
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>
        </div>
    )
}