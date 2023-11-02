import { Switch } from "@headlessui/react";
import { classNames } from "../utils/functions/tailwind";

export default function ToggleSwitch(
  { label, enabled, setEnabled,} : { label: string; enabled: boolean; setEnabled: any }) {
  return (
    <div>
      <Switch.Group as="div" className="flex flex-row items-center"> {/* Change flex-col to flex-row */}
        <Switch.Label as="span" className="text-sm">
          <span className="font-medium text-gray-900">{label}</span>
        </Switch.Label>
        <Switch
          checked={enabled}
          onChange={() => setEnabled(!enabled)}
          className={classNames(
            enabled ? "bg-indigo-600" : "bg-gray-200",
            "relative ml-2 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          )}
        >
          <span
            aria-hidden="true"
            className={classNames(
              enabled
                ? "translate-x-5"
                : "translate-x-0",
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            )}
          />
        </Switch>
      </Switch.Group>
    </div>
  );
}
