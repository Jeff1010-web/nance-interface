import type { Meta, StoryObj } from "@storybook/react";
import DescriptionCardWrapper from "./DescriptionCardWrapper";

const meta: Meta<typeof DescriptionCardWrapper> = {
  component: DescriptionCardWrapper,
};

export default meta;
type Story = StoryObj<typeof DescriptionCardWrapper>;

export const Basic: Story = {
  args: {
    title: "Title",
    description: "Description",
    children: <input type="text" placeholder="aha" />,
  },
};
