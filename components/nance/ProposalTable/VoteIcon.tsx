import { Tooltip } from 'flowbite-react';
import { CheckIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function getVotedIcon(choice: any) {
  if (choice === undefined) {
    return null;
  } else if (typeof choice === 'string') {
    if (choice === 'For' || choice === 'Yes') {
      return <CheckIcon className="h-5 w-5 text-green-500 text-center" aria-hidden="true" />;
    } else if (choice === 'Against' || choice === 'No') {
      return <XMarkIcon className="h-5 w-5 text-red-500" aria-hidden="true" />;
    }
  }
  
  return (
    <Tooltip content={JSON.stringify(choice)}>
      <InformationCircleIcon className="h-5 w-5 text-gray-500 text-center" aria-hidden="true" />
    </Tooltip>
  );
}