import Layout from "../components/Layout";
import { useRouter } from 'next/router';
import { amountSubFee } from "../libs/math";
import { fromUnixTime, format } from 'date-fns'

import { utils } from 'ethers'
import { useContractRead, useContractReads } from 'wagmi';
import { FundingCycleContract, ModStoreContract, TerminalV1Contract } from "../libs/contractsV1";
import FormattedAddress from "../components/FormattedAddress";
import FormattedProject from "../components/FormattedProject";
import { useState } from "react";

function genOnEnter(elementId) {
    return (e) => {
        if(e.keyCode == 13) {
            document.getElementById(elementId).click();
        }
    }
}

export default function Juicebox() {
    // router
    const router = useRouter();
    const { project: projectParam } = router.query;
    let projectId = parseInt(projectParam);
    // default space
    if (!projectId) {
        projectId = 1;
    }

    const [previewArgs, setPreviewArgs] = useState(undefined);

    const { data, isLoading } = useContractRead({
        ...FundingCycleContract,
        functionName: 'currentOf',
        args: projectId
    })

    if (isLoading) {
        return <Loading />
    }

    const iface = new utils.Interface(TerminalV1Contract.contractInterface);
    const parseV1Reconfig = (raw) => {
        const ret = iface.parseTransaction({data: raw, value: 0});
        console.info("📗 TerminalV1.interface.parse >", raw, ret.args);
        setPreviewArgs(ret.args);
    }
    
    return (
        <Layout
            pageTitle="Juicebox Reconfiguration Helper"
            pageDescription="import/export hex data, preview with basic interface.">

            <div id="project-status" className="flex justify-center py-2">
                Current:&nbsp;<FormattedProject projectId={projectId} />
                {previewArgs && <span className="text-amber-300">(Preview Mode)</span>}
            </div>
            <div id="project-selector" className="flex justify-center gap-x-3 pt-2">
                <input type="number" min="1" className="rounded-xl pl-2" id="project-input" placeholder="Input project id here" onKeyDown={genOnEnter("load-project-btn")} />
                <button id="load-project-btn" onClick={() => router.push('/juicebox?project=' + document.getElementById("project-input").value, undefined, { shallow: true })} className="px-4 py-2 font-semibold text-sm bg-amber-200 hover:bg-amber-300 rounded-xl shadow-sm">Load V1 Project</button>
            </div>
            <div id="v1-reconfig-loader" className="flex justify-center gap-x-3 pt-2">
                <input type="text" className="rounded-xl pl-2" id="v1-reconfig-input" placeholder="Paste raw data here" onKeyDown={genOnEnter("load-v1-reconfig-btn")} />
                <button id="load-v1-reconfig-btn" onClick={() => parseV1Reconfig(document.getElementById("v1-reconfig-input").value)} className="px-4 py-2 font-semibold text-sm bg-amber-200 hover:bg-amber-300 rounded-xl shadow-sm">Load V1 Reconfig</button>
            </div>
            <br />
            {previewArgs ? <FundingConfigPreivew previewArgs={previewArgs} /> : <FundingConfig properties={data} />}
        </Layout>
    )
}

function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function parseV1Metadata(raw) {
    const bytes = hexToBytes(raw.toHexString()).reverse();
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

function parsePayoutMod(raw) {
    return {
        projectId: raw.projectId.toNumber(),
        beneficiary: raw.beneficiary,
        percent: raw.percent,
        preferUnstaked: raw.preferUnstaked,
        lockedUntil: raw.lockedUntil,
        allocator: raw.allocator
    }
}

function parseTicketMod(raw) {
    return {
        beneficiary: raw.beneficiary,
        percent: raw.percent,
        preferUnstaked: raw.preferUnstaked,
        lockedUntil: raw.lockedUntil
    }
}

function Loading() {
    return (
        <div className="text-center">Loading...</div>
    )
}

function FundingConfigPreivew({previewArgs}) {
    const {
        _projectId: projectId,
        _properties: properties,
        _metadata: metadata,
        _payoutMods: payoutMods,
        _ticketMods: ticketMods
    } = previewArgs;
    const currencySign = properties.currency.toNumber() == 0 ? "Ξ" : "$";
    const formatCurrency = (amount) => currencySign + utils.formatEther(amount ?? 0);
    const parsed = {
        projectId: projectId.toNumber(),
        target: formatCurrency(properties.target),
        duration: properties.duration.toNumber(),
        discountRate: properties.discountRate.toNumber() / 10 + "%",
        reserveRate: metadata.reservedRate / 2 + "%",
        bondingCurveRate: metadata.bondingCurveRate / 2 + "%",
        reconfigurationBondingCurveRate: metadata.reconfigurationBondingCurveRate / 2 + "%",
        ballot: properties.ballot,
        payIsPaused: metadata.payIsPaused ? "Enabled" : "Disabled",
        ticketPrintingIsAllowed: metadata.ticketPrintingIsAllowed ? "Enabled" : "Disabled"
    };

    const { data: fee, isLoading } = useContractRead({
        ...TerminalV1Contract,
        functionName: 'fee'
    })

    if (isLoading) {
        return <Loading />
    }

    console.log("📗 TerminalV1.payoutMod.pecentage >", properties.target, fee);

    return (
        <div id="project-detail" className="p-2 m-2 flex justify-center rounded-xl shadow-sm border-2">
            <table>
                <tbody>
                    {Object.entries(parsed).map(entry => (
                        <tr key={entry[0]}>
                            <td>{entry[0]}:&nbsp;</td>
                            <td>{entry[1]}</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="2">
                            <hr />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <span className="text-amber-300">Funding distribution</span>
                        </td>
                    </tr>
                    {payoutMods.map(mod => (
                        <tr key={`${mod.beneficiary}-${mod.projectId}`}>
                            <td>
                                {mod.projectId != 0 && <FormattedProject projectId={mod.projectId.toNumber()} />}
                                <FormattedAddress address={mod.beneficiary} />:&nbsp;
                            </td>
                            <td>{mod.percent/100 + "%"} ({utils.formatEther(amountSubFee(properties.target, fee)) * mod.percent / 10000})</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="2">
                            <hr />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <span className="text-amber-300">Reserved Token</span>
                        </td>
                    </tr>
                    {ticketMods.map(mod => (
                        <tr key={`${mod.beneficiary}`}>
                            <td>
                                <FormattedAddress address={mod.beneficiary} />:&nbsp;
                            </td>
                            <td>{mod.percent/100 + "%"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function FundingConfig({properties}) {
    console.info("📗 FundingConfig.properties >", properties);

    const { data: modData, isLoading } = useContractReads({
        contracts: [
          {
            ...ModStoreContract,
            functionName: 'payoutModsOf',
            args: [properties.projectId, properties.configured]
          },
          {
            ...ModStoreContract,
            functionName: 'ticketModsOf',
            args: [properties.projectId, properties.configured]
          }
        ]
    })
    console.info("📗 FundingConfig.configured >", properties.configured.toNumber());
    console.info("📗 FundingConfig.modData >", modData);

    const currencySign = properties.currency.toNumber() == 0 ? "Ξ" : "$";
    const formatCurrency = (amount) => currencySign + utils.formatEther(amount ?? 0);
    const metadata = parseV1Metadata(properties.metadata);

    const parsed = {
        projectId: properties.projectId.toNumber(),
        cycle: properties.number.toNumber(),
        tapped: formatCurrency(properties.tapped),
        target: formatCurrency(properties.target),
        duration: properties.duration.toNumber(),
        start: format(fromUnixTime(properties.start.toNumber()), 'yyyy-MM-dd hh:mmaaa'),
        discountRate: properties.discountRate.toNumber() / 10 + "%",
        reserveRate: metadata.reserveRate / 2 + "%",
        bondingCurveRate: metadata.bondingCurveRate / 2 + "%",
        reconfigurationBondingCurveRate: metadata.reconfigurationBondingCurveRate / 2 + "%",
        weight: utils.formatEther(properties.weight),
        ballot: properties.ballot,
        payIsPaused: metadata.payIsPaused ? "Enabled" : "Disabled",
        ticketPrintingIsAllowed: metadata.ticketPrintingIsAllowed ? "Enabled" : "Disabled"
    };

    if (isLoading) {
        return <Loading />
    }

    return (
        <div id="project-detail" className="p-2 m-2 flex justify-center rounded-xl shadow-sm border-2">
            <table>
                <tbody>
                    {Object.entries(parsed).map(entry => (
                        <tr key={entry[0]}>
                            <td>{entry[0]}:&nbsp;</td>
                            <td>{entry[1]}</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="2">
                            <hr />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <span className="text-amber-300">Funding distribution</span>
                        </td>
                    </tr>
                    {modData?.[0].map(parsePayoutMod).map(mod => (
                        <tr key={`${mod.beneficiary}-${mod.projectId}`}>
                            <td>
                                {mod.projectId != 0 && <FormattedProject projectId={mod.projectId} />}
                                <FormattedAddress address={mod.beneficiary} />:&nbsp;
                            </td>
                            <td>{mod.percent/100 + "%"} ({utils.formatEther(amountSubFee(properties.target, properties.fee)) * mod.percent / 10000})</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="2">
                            <hr />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <span className="text-amber-300">Reserved Token</span>
                        </td>
                    </tr>
                    {modData?.[1].map(parseTicketMod).map(mod => (
                        <tr key={`${mod.beneficiary}`}>
                            <td>
                                <FormattedAddress address={mod.beneficiary} />:&nbsp;
                            </td>
                            <td>{mod.percent/100 + "%"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}