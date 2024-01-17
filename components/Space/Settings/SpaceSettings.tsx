import {
  IdentificationIcon,
  ChatBubbleOvalLeftIcon,
  BuildingLibraryIcon,
  KeyIcon,
  CalendarDaysIcon,
  HandRaisedIcon,
} from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import SettingsNav from "./SettingsNav";
import { CreateFormValues, SpaceConfig } from "@/models/NanceTypes";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import General from "./sub/General";
import Tasks from "./sub/Tasks";
import Dialog from "./sub/Dialog";
import Execution from "./sub/Execution";
import { useCreateSpace } from "@/utils/hooks/NanceHooks";
import { useSession } from "next-auth/react";

export default function SpaceSettings({ spaceConfig }: { spaceConfig: SpaceConfig }) {
  const navigation = [
    { name: "General", icon: IdentificationIcon, component: General },
    { name: "Tasks", icon: HandRaisedIcon, component: Tasks },
    { name: "Schedule", icon: CalendarDaysIcon, component: () => "" },
    { name: "Dialog", icon: ChatBubbleOvalLeftIcon, component: Dialog },
    { name: "Vote", icon: BuildingLibraryIcon, component: () => <div>Component for Vote</div> },
    { name: "Execution", icon: KeyIcon, component: Execution },
  ];

  const [selectedSetting, setSelectedSetting] = useState<string>(navigation[0].name);
  const [editMode, setEditMode] = useState<boolean>(false);

  const { data: session } = useSession();

  const { trigger } = useCreateSpace();

  // reset form to current config when edit is toggled
  useEffect(() => {
    methods.reset({
      config: spaceConfig.config,
    });
  }, [editMode]);

  const methods = useForm<CreateFormValues>({
    mode: "onChange",
    defaultValues: { config: spaceConfig.config },
  });

  const { handleSubmit } = methods;
  const onSubmit: SubmitHandler<CreateFormValues> = async (formData) => {
    console.log("submitting");
    console.log(formData);
    trigger(formData);
  };

  return (
    <div className="m-4 flex justify-left lg:m-10 lg:px-20">
      <div className="flex-col">
        <SettingsNav navigation={navigation} selectedSetting={selectedSetting} setSelectedSetting={setSelectedSetting}/>
      </div>
      <div className="flex flex-col p-4 ml-4 min-w-full">
        <div className="flex flex-row align-text-bottom">
          <h1 className="text-xl font-bold">{selectedSetting}</h1>
          {/* Edit and Save settings buttons, only show if spaceOwner connected */}
          {spaceConfig.spaceOwners.includes(session?.user?.name || "") && (
            <>
              <div className="ml-2 mt-1 text-sm underline cursor-pointer"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? "cancel" : "edit"}
              </div>
              { editMode && (<div className="ml-2 mt-1 text-sm underline cursor-pointer"
                onClick={() => {
                  handleSubmit(onSubmit)();
                  setEditMode(false);
                }}
              >save</div>)}
            </>
          )}
        </div>
        {/* Display Area */}
        <div className="m-4 min-w-full justify-items-start">
          <FormProvider {...methods}>
            {navigation.map((item) => (
              <div key={item.name} className={selectedSetting === item.name ? '' : 'hidden' }>
                <item.component spaceConfig={spaceConfig} edit={editMode} />
              </div>
            ))}
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
