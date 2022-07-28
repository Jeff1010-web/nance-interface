import Layout from "../components/Layout";
import { useRouter } from 'next/router';
import { amountSubFee } from "../libs/math";
import { fromUnixTime, format } from 'date-fns'

import { utils } from 'ethers'
import { useContractRead, useContractReads } from 'wagmi';
import { FundingCycleContract, ModStoreContract } from "../libs/contractsV1";
import FormattedAddress from "../components/FormattedAddress";
import FormattedProject from "../components/FormattedProject";

const onEnter = (e) => {
    if(e.keyCode == 13) {
        document.getElementById('load-btn').click();
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

    const { data, isLoading } = useContractRead({
        ...FundingCycleContract,
        functionName: 'currentOf',
        args: projectId
    })

    if (isLoading) {
        return <Loading />
    }
    
    return (
        <Layout
            pageTitle="Juicebox Reconfiguration Helper"
            pageDescription="import/export hex data, preview with basic interface.">

            <div id="project-status" className="flex justify-center py-2">
                Current:&nbsp;<FormattedProject projectId={projectId} />
            </div>
            <div id="project-selector" className="flex justify-center gap-x-3 pt-2">
                <input type="number" min="1" className="rounded-xl pl-2" id="project-input" placeholder="Input project id here" onKeyDown={onEnter} />
                <button id="load-btn" onClick={() => router.push('/juicebox?project=' + document.getElementById("project-input").value, undefined, { shallow: true })} className="px-4 py-2 font-semibold text-sm bg-amber-200 hover:bg-amber-300 rounded-xl shadow-sm">Load V1 Project</button>
            </div>
            <br />
            <FundingConfig cycleData={data} />
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

function FundingConfig({cycleData}) {
    console.info("📗 FundingConfig.cycleData >", cycleData);

    const { data: modData, isLoading } = useContractReads({
        contracts: [
          {
            ...ModStoreContract,
            functionName: 'payoutModsOf',
            args: [cycleData.projectId, cycleData.configured]
          },
          {
            ...ModStoreContract,
            functionName: 'ticketModsOf',
            args: [cycleData.projectId, cycleData.configured]
          }
        ]
    })
    console.info("📗 FundingConfig.configured >", cycleData.configured.toNumber());
    console.info("📗 FundingConfig.modData >", modData);

    const currencySign = cycleData.currency.toNumber() == 0 ? "Ξ" : "$";
    const formatCurrency = (amount) => currencySign + utils.formatEther(amount ?? 0);
    const metadata = parseV1Metadata(cycleData.metadata);

    const parsed = {
        projectId: cycleData.projectId.toNumber(),
        cycle: cycleData.number.toNumber(),
        tapped: formatCurrency(cycleData.tapped),
        target: formatCurrency(cycleData.target),
        duration: cycleData.duration.toNumber(),
        start: format(fromUnixTime(cycleData.start.toNumber()), 'yyyy-MM-dd hh:mmaaa'),
        discountRate: cycleData.discountRate.toNumber() / 10 + "%",
        reserveRate: metadata.reserveRate / 2 + "%",
        bondingCurveRate: metadata.bondingCurveRate / 2 + "%",
        reconfigurationBondingCurveRate: metadata.reconfigurationBondingCurveRate / 2 + "%",
        weight: utils.formatEther(cycleData.weight),
        ballot: cycleData.ballot,
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
                            <td>{mod.percent/100 + "%"} ({utils.formatEther(amountSubFee(cycleData.target, cycleData.fee)) * mod.percent / 10000})</td>
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