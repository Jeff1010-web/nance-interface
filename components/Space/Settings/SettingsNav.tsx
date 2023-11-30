import { classNames } from "@/utils/functions/tailwind";

export type NavigationItem = {
  name: string;
  icon: any;
};

type SettingsNavProps = {
  navigation: NavigationItem[];
  selectedSetting: string;
  setSelectedSetting: (setting: string) => void;
};

export default function SettingsNav({
  navigation,
  selectedSetting,
  setSelectedSetting,
}: SettingsNavProps) {
  return (
    <nav className="h-75 rounded-lg border bg-white p-4" aria-label="Sidebar">
      <ul role="list" className="-mx-2 space-y-1">
        {navigation.map((item) => (
          <li key={item.name}>
            <a
              className={classNames(
                selectedSetting === item.name
                  ? "bg-gray-50 text-gray-800"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800",
                "group flex cursor-pointer gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
              )}
              onClick={() => setSelectedSetting(item.name)}
            >
              <item.icon
                className={classNames(
                  selectedSetting === item.name
                    ? "text-gray-800"
                    : "text-gray-400 group-hover:text-gray-800",
                  "h-6 w-6 shrink-0",
                )}
                aria-hidden="true"
              />
              {item.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
