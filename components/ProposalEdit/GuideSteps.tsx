import { DriveStep } from "driver.js";

export const driverSteps: DriveStep[] = [
  {
    element: "#add-action-button",
    popover: {
      title: "Add an action",
      description: "Specify this proposal's onchain actions.",
      side: "bottom", align: 'start'
    },
  },
  {
    element: "#proposal-title",
    popover: {
      title: "Input proposal title",
      description: "Keep it short and simple.",
      side: "bottom", align: 'start'
    },
  },
  {
    element: "#proposal-body",
    popover: {
      title: "Input proposal body",
      description: "You can write more details here. You can also drag and drop markdown file or image to attach content (images are pinned to IPFS).",
      side: "bottom", align: 'start'
    },
  },
  {
    element: "#submit-button-div",
    popover: {
      title: "Submit the proposal",
      description: "After you connected wallet, you can either submit the proposal or save it as private draft.",
      side: "top", align: 'start'
    },
  },
];
