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
const TOTAL_WIDGTH = 12;

const formatter = new Intl.NumberFormat('en-GB', { notation: "compact" , compactDisplay: "short" });
const formatNumber = (num) => formatter.format(num);

function ColorDiv({color, width}) {
    if (width === 0) return null;

    return (
        <div className={classNames(COLOR_VARIANTS[color], WIDTH_VARIANTS[width], 'h-3 first:rounded-l-full last:rounded-r-full')}/>
    )
}

export default function ColorBar({greenScore, redScore, noTooltip = false, threshold = JB_THRESHOLD}: {greenScore: number, redScore: number, noTooltip?: boolean, threshold?: number}) {
    const totalScore = greenScore + redScore;
    const totalAllocation = Math.max(totalScore, threshold);

    const greenWidth = Math.round(greenScore / totalAllocation * TOTAL_WIDGTH);
    const redWidth = Math.round(redScore / totalAllocation * TOTAL_WIDGTH);
    const grayWidth = Math.round((totalAllocation - totalScore) / totalAllocation * TOTAL_WIDGTH);

    if (noTooltip) {
        return (
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 flex flex-row">
                <ColorDiv color="green" width={greenWidth}/>
                <ColorDiv color="red" width={redWidth}/>
                <ColorDiv color="gray" width={grayWidth}/>
            </div>
        )
    }

    return (
        <Tooltip
            content={`For ${formatNumber(greenScore)}, Against ${formatNumber(redScore)}, Threshold ${formatNumber(threshold)}`}
            trigger="hover"
        >
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 flex flex-row">
                <ColorDiv color="green" width={greenWidth}/>
                <ColorDiv color="red" width={redWidth}/>
                <ColorDiv color="gray" width={grayWidth}/>
            </div>
        </Tooltip>
    )
}