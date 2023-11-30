import { DriveStep } from "driver.js";

export const UIGUIDE_SPACE_NAME = "SpacePage";

export const driverSteps: DriveStep[] = [
  {
    element: "#cycle-select-box",
    popover: {
      title: "Select the cycle",
      description:
        "Proposals are grouped by cycles, you can select the cycle you want to view.",
      side: "top",
      align: "start",
    },
  },
  {
    element: "#search-bar",
    popover: {
      title: "Search proposals with keywords",
      description:
        "You can search proposals with keywords, which can be the words in the title or the content. Use space to separate multiple keywords.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#new-proposal-button",
    popover: {
      title: "Create new proposal",
      description:
        "You can request payouts, reserve tokens and custom transactions.",
      side: "left",
      align: "start",
    },
  },
  {
    element: "#advanced-actions",
    popover: {
      title: "Advanced actions",
      description:
        "You can create proposals or change space settings with this menu.",
      side: "left",
      align: "start",
    },
  },
  {
    element: "#proposals-table",
    popover: {
      title: "View proposals",
      description:
        "All proposals are listed here. You can view the details of each proposal by clicking the proposal.",
      side: "top",
      align: "start",
    },
  },
  {
    element: "#proposals-table-head",
    popover: {
      title: "Sort proposals",
      description:
        "You can sort proposals by clicking the table headers. And to reverse the order, just click again.",
      side: "bottom",
      align: "start",
    },
  },
];
