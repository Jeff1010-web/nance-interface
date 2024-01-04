import {
  IdentificationIcon,
  ChatBubbleOvalLeftIcon,
  BuildingLibraryIcon,
  KeyIcon,
  CalendarDaysIcon,
  HandRaisedIcon,
} from '@heroicons/react/20/solid';
import { useState } from 'react';
import SettingsNav from './SettingsNav';
import { SpaceConfig } from '@/models/NanceTypes';
import General from './sub/General';
import Tasks from './sub/Tasks';
import Dialog from './sub/Dialog';
import Execution from "./sub/Execution";

export default function SpaceSettings({ spaceConfig }: { spaceConfig: SpaceConfig }) {
  const navigation = [
    { name: 'General', icon: IdentificationIcon, component: <General spaceConfig={spaceConfig}/> },
    { name: 'Tasks', icon: HandRaisedIcon, component: <Tasks spaceConfig={spaceConfig}/> },
    { name: 'Schedule', icon: CalendarDaysIcon, component: <div>Component for Schedule</div> },
    { name: 'Dialog', icon: ChatBubbleOvalLeftIcon, component: <Dialog spaceConfig={spaceConfig}/> },
    { name: 'Vote', icon: BuildingLibraryIcon, component: <div>Component for Vote</div> },
    { name: 'Execution', icon: KeyIcon, component: <Execution spaceConfig={spaceConfig}/> },
  ];

  const [selectedSetting, setSelectedSetting] = useState<string>(navigation[0].name);

  return (
    <div className="m-4 flex justify-left lg:m-10 lg:px-20">
      <div className="flex-col">
        <SettingsNav navigation={navigation} selectedSetting={selectedSetting} setSelectedSetting={setSelectedSetting}/>
      </div>
      <div className="flex flex-col p-4 ml-4">
        <h1 className="text-xl font-bold">{selectedSetting}</h1>
        {/* Display Area */}
        <div className="m-4">
          {navigation.map((item) => (
            <div key={item.name} className={selectedSetting === item.name ? '' : 'hidden' }>
              {item.component}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
