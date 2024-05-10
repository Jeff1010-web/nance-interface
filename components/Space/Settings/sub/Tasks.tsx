import { useState } from 'react';
import { NANCE_PROXY_API_URL } from '@/constants/Nance';
import { SpaceConfig } from '@nance/nance-sdk';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import ResultModal from "@/components/modal/ResultModal";
import { useSession } from 'next-auth/react';
import ConnectWalletButton from '@/components/common/ConnectWalletButton';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/20/solid';

const tasks = [
  { name: 'Send Daily Alert', endpoint: `dailyAlert` },
  { name: 'Increment Governance Cycle', endpoint: 'incrementGovernanceCycle' },
  { name: 'Start Temperature Check', endpoint: 'temperatureCheckStart' },
  { name: 'End Temperature Check', endpoint: 'temperatureCheckClose' },
  { name: 'Start Voting', endpoint: 'voteSetup' },
  { name: 'End Voting', endpoint: 'voteClose' },
];

export default function Tasks({ spaceConfig }: { spaceConfig: SpaceConfig }) {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState({ name: '', endpoint: ''});
  const [taskLoading, setTaskLoading] = useState<boolean>(false);
  const [taskResult, setTaskResult] = useState({ success: undefined, data: '' });

  const { status } = useSession();

  const performTask = async (space: string, endpoint: string) => {
    const res = await fetch(`${NANCE_PROXY_API_URL}/tasks/${space}/${endpoint}`);
    const data = await res.json();
    console.debug(data);
    setTaskResult(data);
    setTaskLoading(false);
  };

  return (
    <div className="flex flex-col space-y-5">
      {status === "authenticated" ? (
        <>
          {tasks.map((task) => (
            <div key={task.name}>
              <button
                onClick={() => {
                  setOpen(true);
                  setTaskLoading(true);
                  setSelectedTask(task);
                  setTaskResult({ success: undefined, data: '' });
                }}
              >{task.name} </button>
              <div className="inline items-center">
                <ArrowTopRightOnSquareIcon className="inline h-4 w-4 ml-1" />
                {/* Loading */}
                <div className="relative inline-block align-middle">
                  {selectedTask.name === task.name && taskLoading && <LoadingSpinner />}
                </div>
                {/* Success */}
                {selectedTask.name === task.name && taskResult.success === true && (
                  <CheckCircleIcon
                    className="inline ml-2 h-5 w-5 text-green-400"
                    aria-hidden="true"
                  />
                )}
                {/* Fail */}
                {selectedTask.name === task.name && taskResult.success === false && (
                  <ExclamationCircleIcon
                    className="inline ml-2 h-5 w-5 text-red-400"
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="w-1/4">
          <ConnectWalletButton />
        </div>
      )}
      <ResultModal
        shouldOpen={open}
        title="Confirm task run"
        description={`Are you sure you want to run: ${selectedTask.name}?`}
        buttonText="Confirm"
        onClick={() => {
          performTask(spaceConfig.space, selectedTask.endpoint);
          setOpen(false);
        }}
        cancelButtonText="Cancel"
        close={() => {
          setOpen(false);
          setTaskLoading(false);
          setTaskResult({ success: undefined, data: '' });
        }}
      />
    </div>
  );
}

const LoadingSpinner = () => {
  return (
    <div
      className="ml-2 h-5 w-5 animate-spin rounded-full border-[3px] border-current border-t-gray-800 text-gray-200"
      role="status"
      aria-label="loading"
    />
  );
};
