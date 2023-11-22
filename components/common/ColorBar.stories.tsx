import type { Meta, StoryObj } from "@storybook/react";
import ColorBar from "./ColorBar";

const meta: Meta<typeof ColorBar> = {
  component: ColorBar,
};

export default meta;
type Story = StoryObj<typeof ColorBar>;

export const Passed: Story = {
  args: {
    greenScore: 100,
    redScore: 20,
    threshold: 50,
    approvalPercent: 0.5,
  },
};

export const Failed: Story = {
  args: {
    greenScore: 20,
    redScore: 30,
    threshold: 50,
    approvalPercent: 0.5,
  },
};

export const UnderThreshold: Story = {
  args: {
    greenScore: 40,
    redScore: 5,
    threshold: 50,
    approvalPercent: 0.5,
  },
};

export const UnderApprovalPercent: Story = {
  args: {
    greenScore: 30,
    redScore: 35,
    threshold: 50,
    approvalPercent: 0.5,
  },
};
