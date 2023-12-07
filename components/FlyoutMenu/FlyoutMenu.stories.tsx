import type { Meta, StoryObj } from "@storybook/react";
import FlyoutMenu from "./FlyoutMenu";

import { PhoneIcon, PlayCircleIcon } from "@heroicons/react/20/solid";
import {
  ArrowPathIcon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
} from "@heroicons/react/24/outline";

const meta: Meta<typeof FlyoutMenu> = {
  component: FlyoutMenu,
};

export default meta;
type Story = StoryObj<typeof FlyoutMenu>;

export const Basic: Story = {
  args: {
    entries: [
      {
        name: "Analytics",
        description: "Get a better understanding of your traffic",
        href: "#",
        icon: ChartPieIcon,
      },
      {
        name: "Engagement",
        description: "Speak directly to your customers",
        href: "#",
        icon: CursorArrowRaysIcon,
      },
      {
        name: "Security",
        description: "Your customers' data will be safe and secure",
        href: "#",
        icon: FingerPrintIcon,
      },
      {
        name: "Integrations",
        description: "Connect with third-party tools",
        href: "#",
        icon: SquaresPlusIcon,
      },
      {
        name: "Automations",
        description: "Build strategic funnels that will convert",
        href: "#",
        icon: ArrowPathIcon,
      },
    ],
    callToActions: [
      {
        name: "Watch demo",
        href: "#",
        icon: PlayCircleIcon,
        onClick: () => alert("you click me!"),
      },
      { name: "Contact sales", href: "#", icon: PhoneIcon },
    ],
  },
};
