import FormattedAddress from '../../../FormattedAddress';
import { classNames } from '../../../../libs/tailwind';
import ProposalBadgeLabel from './ProposalBadgeLabel';

export default function ProposalPrivateRow(
  { proposal, proposalIdx, proposalIdPrefix, proposalUrlPrefix } :
  { proposal: any, proposalIdx: number, proposalIdPrefix: string, proposalUrlPrefix: string }
) {
  return (
    <tr key={proposal.hash} className="hover:bg-slate-100 hover:cursor-pointer" 
      onClick={() => {
        window.location.href = `${proposalUrlPrefix}${proposal.proposalId || proposal.hash}`;
      }}
    >
      <td
        className={classNames(
          proposalIdx === 0 ? '' : 'border-t border-transparent',
          'relative py-4 pl-6 pr-3 text-sm hidden md:table-cell'
        )}
      >
        <ProposalBadgeLabel status={proposal.status} />

        {proposalIdx !== 0 ? <div className="absolute right-0 left-6 -top-px h-px bg-gray-200" /> : null}
      </td>
      <td
        className={classNames(
          proposalIdx === 0 ? '' : 'border-t border-gray-200',
          'px-3 py-3.5 text-sm text-gray-500'
        )}
      >
        <div className="flex flex-col space-y-1">
          <div className="text-gray-900 block md:hidden">
            <ProposalBadgeLabel status={proposal.status} />
          </div>
          <span className="text-xs">
            {`GC-${proposal.governanceCycle}, ${proposalIdPrefix}${proposal.proposalId || "tbd"} - by `}
            <FormattedAddress address={proposal.authorAddress} noLink />
          </span>

          <p className="break-words text-base text-black">
            {proposal.title}
          </p>
        </div>

      </td>
      <td
        className={classNames(
          proposalIdx === 0 ? '' : 'border-t border-gray-200',
          'hidden px-3 py-3.5 text-sm text-gray-500 md:table-cell text-center'
        )}
      >
        {proposal?.voteResults?.votes || '-'}
      </td>
      <td
        className={classNames(
          proposalIdx === 0 ? '' : 'border-t border-gray-200',
          'px-3 py-3.5 text-sm text-gray-500 hidden md:table-cell text-center'
        )}
      > -
      </td>
      <td
        className={classNames(
          proposalIdx === 0 ? '' : 'border-t border-gray-200',
          'px-3 py-3.5 text-sm text-gray-500 hidden md:table-cell text-center'
        )}
      > -
      </td>
    </tr>
  );
}
