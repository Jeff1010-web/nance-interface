import { useAccount, useConnect, useEnsName } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

const shortenAddress = (address) => {
  return address.substring(0, 6) + '...' + address.substring(address.length - 4)
}

export default function Profile() {
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })

  if (isConnected) {
    return (
      <div className="flex m-5 p-3 bg-amber-200 text-2xl rounded-xl border-3 border-solid border-slate-200 gap-4 items-center">
        {ensName ?? shortenAddress(address)}
      </div>
    )
  } else {
    return (
      <button
        className="flex m-5 p-3 bg-amber-200 text-2xl rounded-xl border-3 border-solid border-slate-200 gap-4 items-center transition-colors hover:bg-amber-300"
        onClick={() => connect()}>
        Connect
      </button>
    )
  }
}
