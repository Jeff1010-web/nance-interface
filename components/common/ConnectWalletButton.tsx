import { useConnectModal } from '@rainbow-me/rainbowkit';

export default function ConnectWalletButton() {
  const { openConnectModal } = useConnectModal();
  
  return (
    <button
      type="button"
      onClick={() => openConnectModal?.()}
      className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium
    text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
    >
      Connect Wallet
    </button>
  );
}