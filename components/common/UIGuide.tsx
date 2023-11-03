import { DriveStep, driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useState } from "react";
import useLocalStorage, {
  LocalStorageState,
} from "../../utils/hooks/LocalStorage";
import ResultModal from "../modal/ResultModal";

function getDriver(steps: DriveStep[], action: () => void | undefined) {
  const driverObj = driver({
    showProgress: true,
    steps,
    onDestroyStarted: () => {
      if (!driverObj.hasNextStep() || confirm("Are you sure?")) {
        driverObj.destroy();
        if (action) {
          action();
        }
      }
    },
  });

  return driverObj;
}

interface GuideRecord extends LocalStorageState {
  shouldOpen: boolean;
}

export default function UIGuide({
  name,
  steps,
}: {
  name: string;
  steps: DriveStep[];
}) {
  const [spaceGuide, setSpaceGuide] = useLocalStorage<GuideRecord>(
    `UIGuide-${name}`,
    1,
    {
      shouldOpen: true,
      version: 1,
    },
  );
  const [open, setOpen] = useState<boolean>(spaceGuide.shouldOpen);

  const driver = getDriver(steps, () => {
    setSpaceGuide({
      shouldOpen: false,
      version: 1,
    });
  });

  return (
    <ResultModal
      shouldOpen={open}
      title="Do you need guide on UI?"
      description="It's your first time visiting this page. Do you need some guides?"
      buttonText="Show me"
      onClick={() => {
        setOpen(false);
        driver.drive();
      }}
      cancelButtonText="Nope"
      close={() => {
        setOpen(false);
        setSpaceGuide({
          shouldOpen: false,
          version: 1,
        });
      }}
    />
  );
}
