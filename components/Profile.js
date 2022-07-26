import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi'
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
  const { disconnect } = useDisconnect()

  const [text, setText] = useState('Connect')
  const clickHandler = () => {
    if (isConnected) {
      disconnect()
    } else {
      connect()
    }
  }
  useEffect(() => {
    if (isConnected) {
      setText(ensName || shortenAddress(address))
    } else {
      setText('Connect')
    }
  }, [isConnected, ensName, address])

  return (
    <div className="flex m-5 p-3 bg-amber-200 text-2xl rounded-xl border-3 border-solid border-slate-200 gap-4 items-center transition-colors hover:bg-amber-300">
      <button onClick={clickHandler}>
        {text}
      </button>
    </div>
  )
}
