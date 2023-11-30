import type { Meta, StoryObj } from "@storybook/react";

import GenericListbox from "./GenericListbox";

const meta: Meta<typeof GenericListbox> = {
  title: "Nance Components/common/GenericListbox",
  component: GenericListbox,
};

export default meta;
type Story = StoryObj<typeof GenericListbox>;

export const Icon: Story = {
  args: {
    label: "Select a value",
    value: {
      id: "001",
      name: "first",
      icon: "/images/unknown.png",
    },
    items: [
      { id: "001", name: "first", icon: "/images/unknown.png" },
      { id: "002", name: "second", icon: "/images/unknown.png" },
      { id: "003", name: "third", icon: "/images/unknown.png" },
    ],
  },
};

export const Basic: Story = {
  args: {
    label: "Select a value",
    value: {
      id: "001",
      name: "first",
    },
    items: [
      { id: "001", name: "first" },
      { id: "002", name: "second" },
      { id: "003", name: "third" },
    ],
  },
};
