import { classNames } from "../../../libs/tailwind";

export default function ProposalBadgeLabel({ status } : { status: string }) {
  return (
    <span className={
      classNames(
        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
        `bg-${statusToColor[status]}-100`, `text-${statusToColor[status]}-800`,
        'sm:px-2'
      )
    }>
      {status === 'Temperature Check' ? 'Temp-check' : status}
    </span>
  );
}

const statusToColor: Record<string, string> = {
  'Archived': 'gray',
  'Discussion': 'gray',
  'Draft': 'gray',
  'Revoked': 'gray',
  'Approved': 'green',
  'Cancelled': 'red',
  'Private': 'red',
  'Temperature Check': 'purple',
  'Voting': 'yellow',
};
