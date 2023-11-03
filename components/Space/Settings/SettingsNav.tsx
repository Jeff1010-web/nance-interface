import { classNames } from '@/utils/functions/tailwind';

export type NavigationItem = {
  name: string;
  icon: any;
};

type SettingsNavProps = {
  navigation: NavigationItem[];
  selectedSetting: string;
  setSelectedSetting: (setting: string) => void;
};

export default function SettingsNav({ navigation, selectedSetting, setSelectedSetting }: SettingsNavProps) {
  return (
    <nav className="bg-white border rounded-lg p-4 w-48 h-75" aria-label="Sidebar">
      <ul role="list" className="-mx-2 space-y-1">
        {navigation.map((item) => (
          <li key={item.name}>
            <a
              className={classNames(
                (selectedSetting === item.name) ? 'bg-gray-50 text-gray-800' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50',
                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold cursor-pointer'
              )}
              onClick={() => setSelectedSetting(item.name)}
            >
              <item.icon
                className={classNames(
                  (selectedSetting === item.name) ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-800',
                  'h-6 w-6 shrink-0'
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