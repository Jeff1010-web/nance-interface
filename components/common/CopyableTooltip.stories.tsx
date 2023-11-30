import type { Meta, StoryObj } from "@storybook/react";

import CopyableTooltip from "./CopyableTooltip";

const meta: Meta<typeof CopyableTooltip> = {
  title: "Nance Components/common/CopyableTooltip",
  component: CopyableTooltip,
};

export default meta;
type Story = StoryObj<typeof CopyableTooltip>;

export const Basic: Story = {
  args: {
    text: "Text can be copied",
    children: <a href="#">Hover on me</a>,
  },
};
