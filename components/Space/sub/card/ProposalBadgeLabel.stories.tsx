import type { Meta, StoryObj } from "@storybook/react";
import ProposalBadgeLabel from "./ProposalBadgeLabel";

const meta: Meta<typeof ProposalBadgeLabel> = {
  component: ProposalBadgeLabel,
};

export default meta;
type Story = StoryObj<typeof ProposalBadgeLabel>;

export const Archived: Story = {
  args: {
    status: "Archived",
  },
};

export const Approved: Story = {
  args: {
    status: "Approved",
  },
};

export const Cancelled: Story = {
  args: {
    status: "Cancelled",
  },
};

export const TemperatureCheck: Story = {
  args: {
    status: "Temperature Check",
  },
};

export const Voting: Story = {
  args: {
    status: "Voting",
  },
};
