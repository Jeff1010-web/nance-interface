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

const navigation = [
  { name: 'General', icon: IdentificationIcon },
  { name: 'Tasks', component: undefined, icon: HandRaisedIcon },
  { name: 'Schedule', component: undefined, icon: CalendarDaysIcon },
  { name: 'Dialog', component: undefined, icon: ChatBubbleOvalLeftIcon },
  { name: 'Vote', component: undefined, icon: BuildingLibraryIcon },
  { name: 'Execution', component: undefined, icon: KeyIcon },
];

export default function SpaceSettings({ spaceConfig }: { spaceConfig: SpaceConfig}) {
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
          { selectedSetting === 'General' && <General spaceConfig={spaceConfig}/> }
          { selectedSetting === 'Tasks' && <Tasks spaceConfig={spaceConfig}/> }
          { selectedSetting === 'Dialog' && <Dialog spaceConfig={spaceConfig}/> }
        </div>
      </div>
    </div>
  );
}