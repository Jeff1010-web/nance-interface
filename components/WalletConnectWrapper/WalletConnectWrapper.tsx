import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useSession } from "next-auth/react";
import { PropsWithChildren } from "react";

interface Props {
  renderButton?: (button: JSX.Element) => JSX.Element;
}

/**
 * Gated component that will only render its children if the user is authenticated via connect wallet and signing.
 */
export default function WalletConnectWrapper({
  children,
  renderButton = (button: JSX.Element) => button,
}: PropsWithChildren<Props>) {
  const { data: session, status } = useSession();
  const { openConnectModal } = useConnectModal();

  function Button() {
    return (
      <button
        type="button"
        disabled={status === "loading"}
        onClick={() => openConnectModal?.()}
        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium
      text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
      >
        {status === "loading" ? "Loading..." : "Connect Wallet"}
      </button>
    );
  }

  return (
    <>
      {status !== "authenticated" && renderButton(<Button />)}

      <div className={status === "authenticated" ? "" : "hidden"}>
        {children}
      </div>
    </>
  );
}
