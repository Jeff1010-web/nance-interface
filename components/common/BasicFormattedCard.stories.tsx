import type { Meta, StoryObj } from "@storybook/react";

import BasicFormattedCard from "./BasicFormattedCard";

const meta: Meta<typeof BasicFormattedCard> = {
  title: "Nance Components/common/BasicFormattedCard",
  component: BasicFormattedCard,
};

export default meta;
type Story = StoryObj<typeof BasicFormattedCard>;

export const Basic: Story = {
  args: {
    imgSrc: "https://cdn.stamp.fyi/space/jbdao.eth?w=100&h=100",
    imgAlt: "jbdao.eth space on snapshot",
    action: () => alert("clicked!"),
    children: (
      <>
        <p>JuiceboxDAO Snapshot</p>
        <p>0x123...456</p>
      </>
    ),
  },
};
