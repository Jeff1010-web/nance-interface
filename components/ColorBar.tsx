import { Tooltip } from "flowbite-react";
import { classNames } from "@/utils/functions/tailwind";

export const JB_THRESHOLD = 80_000_000;

const COLOR_VARIANTS: { [key: string]: string } = {
  "green": 'bg-green-500',
  "red": 'bg-red-500',
  "gray": 'bg-gray-200'
};
const WIDTH_VARIANTS: { [key: number]: string } = {
  0: 'w-0',
  1: 'w-1/12',
  2: 'w-2/12',
  3: 'w-3/12',
  4: 'w-4/12',
  5: 'w-5/12',
  6: 'w-6/12',
  7: 'w-7/12',
  8: 'w-8/12',
  9: 'w-9/12',
  10: 'w-10/12',
  11: 'w-11/12',
  12: 'w-full',
};
const TOTAL_WIDTH = 12;

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact", compactDisplay: "short" });
const formatNumber = (num: number) => formatter.format(num);

function ColorDiv({ color, width }: { color: string, width: number }) {
  if (!width) return null;

  return (
    <div className={classNames(COLOR_VARIANTS[color], WIDTH_VARIANTS[width], 'h-3 first:rounded-l-full last:rounded-r-full')} />
  );
}

// Proposals with 80,000,000 or more votes (including "Abstain" and "Against" votes) and at least 66% "For" votes (not counting "Abstain" votes) will be implemented.
// case 1: full green
// case 2: full red
// case 3: full gray
// case 4: green + red, green
export default function ColorBar({ greenScore, redScore, noTooltip = false, threshold = JB_THRESHOLD }: { greenScore: number, redScore: number, noTooltip?: boolean, threshold?: number }) {
  const totalScore = greenScore + redScore;
  const hasPass = totalScore >= threshold && greenScore / totalScore >= 0.66;
  const shouldDisplayVerticalLine = totalScore >= threshold && greenScore / totalScore < 0.66;
  const colorWidth = Math.min(TOTAL_WIDTH, Math.round(totalScore / threshold * TOTAL_WIDTH));
  const grayWidth = TOTAL_WIDTH - colorWidth;

  const greenWidth = Math.round(greenScore / totalScore * colorWidth);
  const redWidth = Math.round(redScore / totalScore * colorWidth);

  const renderBar = () => (
    <>
      <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 flex flex-row">
        <ColorDiv color="green" width={greenWidth} />
        <ColorDiv color="red" width={redWidth} />
        <ColorDiv color="gray" width={grayWidth} />
      </div>
      {shouldDisplayVerticalLine && <div className='relative h-3 border-r-2 w-8/12 z-10 -mt-3' />}
    </>
  );

  if (noTooltip) {
    return renderBar();
  }

  return (
    <Tooltip
      content={`${hasPass ? "✅" : "❌"} For ${formatNumber(greenScore)}, Against ${formatNumber(redScore)}, Threshold ${formatNumber(threshold)}`}
      trigger="hover"
    >
      {renderBar()}
    </Tooltip>
  );
}
