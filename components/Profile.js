import { useAccount, useConnect, useEnsName } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

export default function Profile() {
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })

  if (isConnected) {
    return (
      <div className="flex m-5 p-3 bg-amber-200 text-2xl rounded-xl border-3 border-solid border-slate-200 gap-4 items-center">
        Connected to {ensName ?? address}
      </div>
    )
  } else {
    return (
      <button
        className="flex m-5 p-3 bg-amber-200 text-2xl rounded-xl border-3 border-solid border-slate-200 gap-4 items-center transition-colors hover:bg-amber-300"
        onClick={() => connect()}>
        Connect Wallet
      </button>
    )
  }
}
