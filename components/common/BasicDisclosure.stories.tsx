import type { Meta, StoryObj } from "@storybook/react";

import BasicDisclosure from "./BasicDisclosure";

const meta: Meta<typeof BasicDisclosure> = {
  title: "Nance Components/common/BasicDisclosure",
  component: BasicDisclosure,
};

export default meta;
type Story = StoryObj<typeof BasicDisclosure>;

export const Basic: Story = {
  args: {
    title: "What's underneath?",
    children: (
      <div className="rounded-2xl bg-white p-2">
        <p>It can be anything!</p>
      </div>
    ),
  },
};
