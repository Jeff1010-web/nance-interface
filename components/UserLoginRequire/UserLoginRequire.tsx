import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useSession } from "next-auth/react";

export default function UserLoginRequire({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const { openConnectModal } = useConnectModal();

  if (status !== "authenticated") {
    return (
      <button
        type="button"
        disabled={status === "loading"}
        onClick={() => openConnectModal?.()}
        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium
      text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
      >
        {status === "loading" ? "Loading..." : "Login"}
      </button>
    );
  }

  return <>{children}</>;
}
