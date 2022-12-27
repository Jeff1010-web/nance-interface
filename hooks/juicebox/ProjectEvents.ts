import { BigNumber } from "ethers";
import { SUBGRAPH_URL } from "../../constants/Juicebox";
import { shortenAddress } from "../../libs/address";

const Query = `query ProjectEvents($first: Int, $skip: Int) {
  projectEvents(
    first: $first, 
    skip: $skip, 
    orderBy: timestamp,
    orderDirection: desc
    where: {
      mintTokensEvent: null,
      distributeToPayoutModEvent: null,
      distributeToTicketModEvent: null,
      distributeToPayoutSplitEvent: null,
      useAllowanceEvent: null,
    }
  ) {
    id
    project {
      projectId
      handle
      pv
      metadataUri
    }
    timestamp
    payEvent {
      txHash
      caller
      beneficiary
      amount
      note
    }
    redeemEvent {
      txHash
      holder
      beneficiary
      amount
      returnAmount
    }
    deployedERC20Event {
      txHash
      address
      symbol
    }
    projectCreateEvent {
      txHash
      caller
    }
    tapEvent {
      txHash
      caller
      beneficiary
      netTransferAmount
    }
    distributePayoutsEvent {
      txHash
      caller
      distributedAmount
      fee
      memo
    }
    printReservesEvent {
      txHash
      caller
      count
    }
    distributeReservedTokensEvent {
      txHash
      caller
      tokenCount
      memo
    }
    deployETHERC20ProjectPayerEvent {
      txHash
      caller
      address
      memo
    }
  }
}`

// model for graphql response
export interface ProjectEventResponse {
    id: string
    project: {
      projectId: string
      pv: string
      handle: string
      metadataUri: string
    }
    timestamp: number
    payEvent: {
      txHash: string
      caller: string
      beneficiary: string
      amount: string
      note: string
    } | null
    redeemEvent: {
      txHash: string
      holder: string
      beneficiary: string
      amount: string
      returnAmount: string
    } | null
    deployedERC20Event: {
      txHash: string
      address: string
      symbol: string
    } | null
    projectCreateEvent: {
      txHash: string
      caller: string
    } | null
    tapEvent: {
      txHash: string
      caller: string
      beneficiary: string
      netTransferAmount: string
    } | null
    distributePayoutsEvent: {
      txHash: string
      caller: string
      distributedAmount: string
      fee: string
      memo: string
    } | null
    printReservesEvent: {
      txHash: string
      caller: string
      count: string
    } | null
    distributeReservedTokensEvent: {
      txHash: string
      caller: string
      tokenCount: string
      memo: string
    } | null
    deployETHERC20ProjectPayerEvent: {
      txHash: string
      caller: string
      address: string
      memo: string
    } | null
}

export interface ProjectEvent {
  id: string
  project: {
    projectId: string
    pv: string
    handle: string
    metadataUri: string
  }
  // timestamp call eventType project ethAmount description
  timestamp: number
  caller: string
  eventType: 'Pay' | 'Redeem' | 'DeployERC20' | 'CreateProject' | 'Tap' | 'DistributePayouts' | 'PrintReserves' | 'DistributeReservedTokens' | 'DeployETHERC20ProjectPayer' | 'Unknown'
  txHash: string
  ethAmount: string
  tokenAmount: string
  memo?: string
  payload?: any
}

export default async function fetchProjectEvents(first: number = 20, skip: number = 0): Promise<ProjectEvent[]> {
    const response = await fetch(SUBGRAPH_URL, {
        method: "POST",
        body: JSON.stringify({ 
            query: Query, 
            variables: { 
                first,
                skip
            } 
        }),
    });
    const { data } = await response.json();

    const events: ProjectEvent[] = (data.projectEvents as ProjectEventResponse[]).map(eventRes => {
      if (eventRes.payEvent) {
        return {
          id: eventRes.id,
          project: eventRes.project,
          timestamp: eventRes.timestamp,
          caller: eventRes.payEvent.caller,
          eventType: 'Pay',
          txHash: eventRes.payEvent.txHash,
          ethAmount: eventRes.payEvent.amount,
          tokenAmount: '0',
          memo: eventRes.payEvent.note
        }
      } else if (eventRes.redeemEvent) {
        return {
          id: eventRes.id,
          project: eventRes.project,
          timestamp: eventRes.timestamp,
          caller: eventRes.redeemEvent.holder,
          eventType: 'Redeem',
          txHash: eventRes.redeemEvent.txHash,
          ethAmount: eventRes.redeemEvent.returnAmount,
          tokenAmount: eventRes.redeemEvent.amount,
        }
      } else if (eventRes.deployedERC20Event) {
        return {
          id: eventRes.id,
          project: eventRes.project,
          timestamp: eventRes.timestamp,
          caller: '',
          eventType: 'DeployERC20',
          txHash: eventRes.deployedERC20Event.txHash,
          ethAmount: '0',
          tokenAmount: '0',
          payload: {
            address: eventRes.deployedERC20Event.address,
            symbol: eventRes.deployedERC20Event.symbol
          }
        }
      } else if (eventRes.projectCreateEvent) {
        return {
          id: eventRes.id,
          project: eventRes.project,
          timestamp: eventRes.timestamp,
          caller: eventRes.projectCreateEvent.caller,
          eventType: 'CreateProject',
          txHash: eventRes.projectCreateEvent.txHash,
          ethAmount: '0',
          tokenAmount: '0',
        }
      } else if (eventRes.tapEvent) {
        return {
          id: eventRes.id,
          project: eventRes.project,
          timestamp: eventRes.timestamp,
          caller: eventRes.tapEvent.caller,
          eventType: 'Tap',
          txHash: eventRes.tapEvent.txHash,
          ethAmount: eventRes.tapEvent.netTransferAmount,
          tokenAmount: '0',
        }
      } else if (eventRes.distributePayoutsEvent) {
        return {
          id: eventRes.id,
          project: eventRes.project,
          timestamp: eventRes.timestamp,
          caller: eventRes.distributePayoutsEvent.caller,
          eventType: 'DistributePayouts',
          txHash: eventRes.distributePayoutsEvent.txHash,
          ethAmount: BigNumber.from(eventRes.distributePayoutsEvent.distributedAmount).add(eventRes.distributePayoutsEvent.fee).toString(),
          tokenAmount: '0',
          memo: eventRes.distributePayoutsEvent.memo
        }
      } else if (eventRes.printReservesEvent) {
        return {
          id: eventRes.id,
          project: eventRes.project,
          timestamp: eventRes.timestamp,
          caller: eventRes.printReservesEvent.caller,
          eventType: 'PrintReserves',
          txHash: eventRes.printReservesEvent.txHash,
          ethAmount: '0',
          tokenAmount: eventRes.printReservesEvent.count,
        }
      } else if (eventRes.distributeReservedTokensEvent) {
        return {
          id: eventRes.id,
          project: eventRes.project,
          timestamp: eventRes.timestamp,
          caller: eventRes.distributeReservedTokensEvent.caller,
          eventType: 'DistributeReservedTokens',
          txHash: eventRes.distributeReservedTokensEvent.txHash,
          ethAmount: '0',
          tokenAmount: eventRes.distributeReservedTokensEvent.tokenCount,
          memo: eventRes.distributeReservedTokensEvent.memo
        }
      } else if (eventRes.deployETHERC20ProjectPayerEvent) {
        return {
          id: eventRes.id,
          project: eventRes.project,
          timestamp: eventRes.timestamp,
          caller: eventRes.deployETHERC20ProjectPayerEvent.caller,
          eventType: 'DeployETHERC20ProjectPayer',
          txHash: eventRes.deployETHERC20ProjectPayerEvent.txHash,
          ethAmount: '0',
          tokenAmount: '0',
          memo: `Deployed ETHERC20 project payer at ${shortenAddress(eventRes.deployETHERC20ProjectPayerEvent.address)} | memo: ${eventRes.deployETHERC20ProjectPayerEvent.memo}`
        }
      } else {
        console.warn('Unknown event type', eventRes)
        return {
          id: eventRes.id,
          project: eventRes.project,
          timestamp: eventRes.timestamp,
          caller: '',
          eventType: 'Unknown',
          txHash: '',
          ethAmount: '0',
          tokenAmount: '0'
        }
      }
    })
    return events.filter(event => event.eventType !== 'Unknown');
}