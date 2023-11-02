import { getLastSlash } from "../../../utils/functions/nance";

export default function DoltCommitInfo({ dolthubLink }: { dolthubLink: string }) {
  return (
    <div className="mt-2 text-center">
      <p className="text-center text-xs text-gray-500">
        ∴ dolt commit <a href={dolthubLink} target="_blank" rel="noopener noreferrer">{getLastSlash(dolthubLink)?.slice(0, 7)}</a>
      </p>
    </div>
  )
}
