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
import Schedule from "./sub/Schedule";
import { useCreateSpace } from "@/utils/hooks/NanceHooks";
import { useSession } from "next-auth/react";
import { Spinner } from "flowbite-react";
import {
  getCurrentEvent,
  getCurrentGovernanceCycleDay,
} from "@/utils/functions/nance";

export default function SpaceSettings({
  spaceConfig,
}: {
  spaceConfig: SpaceConfig;
}) {
  const navigation = [
    { name: "General", icon: IdentificationIcon, component: General },
    { name: "Tasks", icon: HandRaisedIcon, component: Tasks },
    { name: "Schedule", icon: CalendarDaysIcon, component: Schedule },
    { name: "Dialog", icon: ChatBubbleOvalLeftIcon, component: Dialog },
    // { name: "Vote", icon: BuildingLibraryIcon, component: () => <div>Component for Vote</div> },
    { name: "Execution", icon: KeyIcon, component: Execution },
  ];

  const [selectedSetting, setSelectedSetting] = useState<string>(
    navigation[0].name,
  );
  const [editMode, setEditMode] = useState<boolean>(false);
  const [spaceOwners, setSpaceOwners] = useState<string[]>(
    spaceConfig.spaceOwners,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { data: session } = useSession();

  const { trigger, data } = useCreateSpace();

  // reset form to current config when edit is toggled
  useEffect(() => {
    const currentEvent = getCurrentEvent(
      spaceConfig.calendar,
      spaceConfig.cycleStageLengths,
      new Date(),
    );
    const currentGovernanceCycleDay = getCurrentGovernanceCycleDay(
      currentEvent,
      spaceConfig.cycleStageLengths,
      new Date(),
    );
    // keep this in mind: our date variable is actually split into two parts, the date and the time (TimePicker)
    // so remember to set the date and time separately
    // here we use start of currentEvent to set time properly
    const startOfCycle = new Date(
      currentEvent.start.setDate(
        new Date().getDate() - currentGovernanceCycleDay,
      ),
    );
    methods.reset({
      config: spaceConfig.config,
      spaceOwners: spaceOwners.map((address) => ({ address })),
      governanceCycleForm: {
        // subtract currentGovernanceCycleDay from today
        startDate: startOfCycle,
        temperatureCheckLength: spaceConfig.cycleStageLengths[0],
        voteLength: spaceConfig.cycleStageLengths[1],
        executionLength: spaceConfig.cycleStageLengths[2],
        delayLength: spaceConfig.cycleStageLengths[3],
        // here's form values for TimePicker
        time: {
          ampm: startOfCycle.getHours() > 12 ? "PM" : "AM",
          hour:
            startOfCycle.getHours() > 12
              ? startOfCycle.getHours() % 12
              : startOfCycle.getHours(),
          minute: startOfCycle.getMinutes().toString(),
        },
      },
    });
  }, [editMode, spaceConfig]);

  const methods = useForm<CreateFormValues>({
    mode: "onChange",
  });

  const { handleSubmit } = methods;
  const onSubmit: SubmitHandler<CreateFormValues> = async (formData) => {
    trigger(formData).then((res) => {
      if (res?.data) setSpaceOwners(res.data.spaceOwners);
      setEditMode(false);
      setIsLoading(false);
    });
  };

  return (
    <div className="justify-left m-4 flex lg:m-10 lg:px-20">
      <div className="flex-col">
        <SettingsNav
          navigation={navigation}
          selectedSetting={selectedSetting}
          setSelectedSetting={setSelectedSetting}
        />
      </div>
      <div className="ml-4 flex min-w-full flex-col p-4">
        <div className="flex flex-row align-text-bottom">
          <h1 className="text-xl font-bold">{selectedSetting}</h1>
          {/* Edit and Save settings buttons, only show if spaceOwner connected */}
          {spaceConfig.spaceOwners.includes(session?.user?.name || "") && (
            <>
              <div
                className="ml-2 mt-1 cursor-pointer text-sm underline"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? "cancel" : "edit"}
              </div>
              {editMode && isLoading ? (
                <Spinner className="ml-2" />
              ) : (
                editMode && (
                  <div
                    className="ml-2 mt-1 cursor-pointer text-sm font-bold underline"
                    onClick={() => {
                      setIsLoading(true);
                      handleSubmit(onSubmit)();
                    }}
                  >
                    save
                  </div>
                )
              )}
            </>
          )}
        </div>
        {/* Display Area */}
        <div className="m-4 min-w-full justify-items-start">
          <FormProvider {...methods}>
            {navigation.map((item) => (
              <div
                key={item.name}
                className={selectedSetting === item.name ? "" : "hidden"}
              >
                <item.component
                  spaceConfig={{ ...spaceConfig, spaceOwners: spaceOwners }}
                  edit={editMode}
                />
              </div>
            ))}
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
