import type { Meta, StoryObj } from "@storybook/react";
import VotingTimeIndicator from "./VotingTimeIndicator";

const meta: Meta<typeof VotingTimeIndicator> = {
  component: VotingTimeIndicator,
};

export default meta;
type Story = StoryObj<typeof VotingTimeIndicator>;

const getTime = () => Math.floor(Date.now() / 1000);

export const NotStarted: Story = {
  args: {
    start: getTime() + 10000,
    end: getTime() + 30000,
  },
};

export const InProgress: Story = {
  args: {
    start: getTime() - 10000,
    end: getTime() + 10000,
  },
};

export const Ended: Story = {
  args: {
    start: getTime() - 30000,
    end: getTime() - 10000,
  },
};
