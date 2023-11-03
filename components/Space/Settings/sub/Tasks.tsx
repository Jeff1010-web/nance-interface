import { NANCE_PROXY_API_URL } from '@/constants/Nance';
import { SpaceConfig } from '@/models/NanceTypes';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import ResultModal from "@/components/modal/ResultModal";

const tasks = [
  { name: 'Send Daily Alert', endpoint: `dailyAlert`},
  { name: 'Start Temperature Check', endpoint: 'temperatureCheckStart'},
  { name: 'End Temperature Check', endpoint: ''},
  { name: 'Start Voting', endpoint: ''},
  { name: 'End Voting', endpoint: ''},
];

export default function Tasks({ spaceConfig }: { spaceConfig: SpaceConfig }) {
  return (
    <div className="flex flex-col space-y-5">
      {tasks.map((task) => (
        <div key={task.name}>
          <button 
            onClick={() => {
              fetch(`${NANCE_PROXY_API_URL}/tasks/${spaceConfig.space}/${task.endpoint}`).then(async (res) => {
                console.log(await res.json());
              });
            }}
          >{task.name} </button>
          <ArrowTopRightOnSquareIcon className="inline h-4 w-4 mb-1" />
        </div>
      ))}
    </div>
  );
}

const LoadingSpinner = () => {
  return (
    <div
      className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-current border-t-gray-800 text-gray-200"
      role="status"
      aria-label="loading"
    />
  );
};
