import { Tooltip } from "flowbite-react";

const JB_THRESHOLD = 80_000_000;

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const COLOR_VARIANTS = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    gray: 'bg-gray-200'
}
const WIDTH_VARIANTS = {
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
}
const TOTAL_WIDTH = 12;

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact" , compactDisplay: "short" });
const formatNumber = (num) => formatter.format(num);

function ColorDiv({color, width}) {
    if (!width) return null;

    return (
        <div className={classNames(COLOR_VARIANTS[color], WIDTH_VARIANTS[width], 'h-3 first:rounded-l-full last:rounded-r-full')}/>
    )
}

// Proposals which receive at least 80,000,000 affirmative JBX votes amounting to at least 66% of total votes are queued for execution. "Abstain" votes are not included in these counts.
// case 1: full green
// case 2: full red
// case 3: full gray
// case 4: green + red, green
export default function ColorBar({greenScore, redScore, noTooltip = false, threshold = JB_THRESHOLD}: {greenScore: number, redScore: number, noTooltip?: boolean, threshold?: number}) {
    const totalScore = greenScore + redScore;
    const shouldDisplayVerticalLine = greenScore >= threshold && greenScore / totalScore < 0.66;
    const colorWidth = Math.min(TOTAL_WIDTH, Math.round(greenScore / threshold * TOTAL_WIDTH));
    const grayWidth = TOTAL_WIDTH - colorWidth;

    const greenWidth = Math.round(greenScore / totalScore * colorWidth);
    const redWidth = Math.round(redScore / totalScore * colorWidth);

    const renderBar = () => (
        <>
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 flex flex-row">
                <ColorDiv color="green" width={greenWidth}/>
                <ColorDiv color="red" width={redWidth}/>
                <ColorDiv color="gray" width={grayWidth}/>
            </div>
            {shouldDisplayVerticalLine && <div className='relative h-3 border-r-2 w-8/12 z-10 -mt-3' />}
        </>
    );

    if (noTooltip) {
        return renderBar();
    }

    return (
        <Tooltip
            content={`For ${formatNumber(greenScore)}, Against ${formatNumber(redScore)}, ApprovalThreshold ${formatNumber(threshold)}`}
            trigger="hover"
        >
            {renderBar()}
        </Tooltip>
    )
}