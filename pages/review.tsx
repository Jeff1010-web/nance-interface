import { BigNumber, utils } from 'ethers';
import { useState } from "react";
import SiteNav from "../components/SiteNav";
import { NumberParam, StringParam, useQueryParams, withDefault } from 'next-query-params';
import { AddressMap, SafeTransactionSelector, TxOption } from '../components/safe/SafeTransactionSelector';
import useProjectInfo from '../hooks/juicebox/ProjectInfo';
import ProjectSearch from "../components/juicebox/ProjectSearch";
import { RevisedSafeMultisigTransactionResponse } from '../models/SafeTypes';
import parseSafeJuiceboxTx from '../libs/SafeJuiceboxParser';
import { useMultisigTransactionOf } from '../hooks/SafeHooks';
import Footer from '../components/Footer';
import { useReconfigurationOfProject } from '../hooks/juicebox/ReconfigurationOfProject';
import JBProjectInfo from '../components/pages/review/JBProjectInfo';
import TableWithSection from '../components/form/TableWithSection';
import { calcDiffTableData, payoutsCompare, reservesDiffOf } from '../libs/juicebox';

const CONTRACT_MAP: AddressMap = {
  "0xFFdD70C318915879d5192e8a0dcbFcB0285b3C98": "JBController_V3",
  "0x4e3ef8AFCC2B52E4e704f4c8d9B7E7948F651351": "JBController_V2",
  "0x7Ae63FBa045Fec7CaE1a75cF7Aa14183483b8397": "JBETHPaymentTerminal_V2",
  "0xd569D3CCE55b71a8a3f3C418c329A66e5f714431": "TerminalV1",
  "0xB9E4B658298C7A36BdF4C2832042A5D6700c3Ab8": "ModStore"
};

export default function ReviewReconfigurationPage() {
  // router
  const [query, setQuery] = useQueryParams({
    project: withDefault(NumberParam, 1),
    safeTxHash: withDefault(StringParam, "")
  });
  const projectId = query.project;

  // state
  const [selectedSafeTx, setSelectedSafeTx] = useState<TxOption>();
  
  // hooks
  const { data: projectInfo, loading: infoIsLoading } = useProjectInfo(3, projectId);
  const { value: specifiedSafeTx } = useMultisigTransactionOf(query.safeTxHash, query.safeTxHash !== "" && selectedSafeTx === undefined);

  const owner = projectInfo?.owner ? utils.getAddress(projectInfo.owner) : "";
  const txForComponent = selectedSafeTx?.tx || specifiedSafeTx;

  const setSelectedTxOption = (tx: TxOption) => {
    setSelectedSafeTx(tx);
    setQuery({ safeTxHash: tx?.tx?.safeTxHash });
  };

  return (
    <>
      <SiteNav pageTitle="Juicebox Reconfiguration Reviewer" withWallet />
      <div className="bg-white">
        {projectInfo && <JBProjectInfo metadataUri={projectInfo.metadataUri} />}

        <div id="project-selector" className="flex flex-col items-center gap-x-3 pt-2 mx-6">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700">Seach project</label>
            <ProjectSearch val={projectId} setVal={(p) => setQuery({ project: p })} />
          </div>
        </div>
        <div id="safetx-loader" className="flex justify-center pt-2 mx-6">
          <div className="w-1/2">
            <SafeTransactionSelector val={selectedSafeTx} setVal={setSelectedTxOption} safeAddress={owner} addressMap={CONTRACT_MAP} />
          </div>
        </div>
        <br />

        {txForComponent && <Compare projectId={projectId} tx={txForComponent} />}
      </div>
      <Footer />
    </>
  );
}

function Compare({ projectId, tx }: { projectId: number, tx: RevisedSafeMultisigTransactionResponse }) {
  const { value: currentConfig, loading: loading } = useReconfigurationOfProject(projectId);
  const newConfig = parseSafeJuiceboxTx(tx.data || "", tx?.submissionDate || "", currentConfig.fundingCycle.fee || BigNumber.from(0), currentConfig.fundingCycle.configuration || BigNumber.from(0));

  const payoutsDiff = payoutsCompare(currentConfig, currentConfig.payoutMods, newConfig?.payoutMods || []);
  const reservesDiff = reservesDiffOf(currentConfig.ticketMods, newConfig?.ticketMods || []);
  const tableData = calcDiffTableData(currentConfig, payoutsDiff, reservesDiff);

  return (
    (loading)
      ? <div className="text-center">Loading...</div>
      : <TableWithSection space="juicebox" tableData={tableData} />
  );
}
