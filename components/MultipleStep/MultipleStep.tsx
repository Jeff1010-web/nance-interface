import { classNames } from "@/utils/functions/tailwind";
import { CheckIcon } from "@heroicons/react/24/solid";
import { useRef, useState } from "react";
import SmallListbox from "../common/SmallListBox";

interface Step {
  name: string;
  content?: JSX.Element;
  contentRender?: (
    back: (() => void) | undefined,
    next: (() => void) | undefined,
  ) => JSX.Element;
}

interface MultipleStepProps {
  /**
   * Array of steps
   */
  steps: Step[];
  /**
   * Enable default style which wrap the component with border and padding
   */
  enableDefaultStyle?: boolean;
}

/**
 * Group of steps with progress bar, each step has a name and content. Only current step is visible.
 * @param steps Array of steps
 * @param enableDefaultStyle Enable default style which wrap the component with border and padding
 */
export default function MultipleStep({
  steps,
  enableDefaultStyle = true,
}: MultipleStepProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const currentListRef = useRef<HTMLOListElement>(null);

  const stepOptions = Array.from(Array(steps.length).keys()).map((i) => i + 1);

  function setCurrentStepIdxWithScroll(idx: number) {
    setCurrentStepIdx(idx);
    if (currentListRef.current) {
      // scroll to current step li
      currentListRef.current.children[idx].scrollIntoView({
        behavior: "smooth",
        inline: "center",
      });
    }
  }

  return (
    <>
      <nav aria-label="Progress" className="hidden md:block">
        <ol
          role="list"
          ref={currentListRef}
          className="divide-y divide-gray-300 overflow-x-scroll rounded-md border border-gray-300 md:flex md:divide-y-0"
        >
          {steps.map((step, stepIdx) => (
            <li
              key={step.name}
              className="relative md:flex md:flex-1"
              onClick={(e) => setCurrentStepIdx(stepIdx)}
            >
              {stepIdx < currentStepIdx ? (
                <div className="group flex w-full items-center">
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                      <CheckIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-900">
                      {step.name}
                    </span>
                  </span>
                </div>
              ) : stepIdx === currentStepIdx ? (
                <div
                  className="flex items-center px-6 py-4 text-sm font-medium"
                  aria-current="step"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-indigo-600">
                    <span className="text-indigo-600">{stepIdx + 1}</span>
                  </span>
                  <span className="ml-4 text-sm font-medium text-indigo-600">
                    {step.name}
                  </span>
                </div>
              ) : (
                <div className="group flex items-center">
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400">
                      <span className="text-gray-500 group-hover:text-gray-900">
                        {stepIdx + 1}
                      </span>
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                      {step.name}
                    </span>
                  </span>
                </div>
              )}

              {stepIdx !== steps.length - 1 ? (
                <>
                  {/* Arrow separator for lg screens and up */}
                  <div
                    className="absolute right-0 top-0 hidden h-full w-5 md:block"
                    aria-hidden="true"
                  >
                    <svg
                      className="h-full w-full text-gray-300"
                      viewBox="0 0 22 80"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 -2L20 40L0 82"
                        vectorEffect="non-scaling-stroke"
                        stroke="currentcolor"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex items-end justify-end space-x-2 md:hidden">
        <span>step</span>
        <SmallListbox
          options={stepOptions}
          selected={currentStepIdx + 1}
          setSelected={(i) => setCurrentStepIdx(i - 1)}
        />
        <span>{`of ${steps.length}`}</span>
      </div>

      <div
        className={classNames(
          "mt-5",
          enableDefaultStyle ? "rounded-md border border-gray-300 p-6" : "",
        )}
      >
        {steps.map((step, stepIdx) => (
          <div
            key={step.name}
            className={stepIdx === currentStepIdx ? "block" : "hidden"}
          >
            {step.contentRender
              ? step.contentRender(
                  currentStepIdx - 1 >= 0
                    ? () => setCurrentStepIdxWithScroll(currentStepIdx - 1)
                    : undefined,
                  currentStepIdx + 1 <= steps.length - 1
                    ? () => setCurrentStepIdxWithScroll(currentStepIdx + 1)
                    : undefined,
                )
              : step.content}
          </div>
        ))}
      </div>
    </>
  );
}
