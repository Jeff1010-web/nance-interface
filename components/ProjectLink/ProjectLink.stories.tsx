import type { Meta, StoryObj } from "@storybook/react";
import ProjectLink from "./ProjectLink";

const meta: Meta<typeof ProjectLink> = {
  component: ProjectLink,
};

export default meta;
type Story = StoryObj<typeof ProjectLink>;

export const ProjectId: Story = {
  args: {
    projectId: 4,
    subText: "subText here",
  },
};

export const ProjectIdOnTestnet: Story = {
  args: {
    ...ProjectId.args,
    isTestnet: true,
  },
};

export const ProjectIdOnTestnetMinified: Story = {
  args: {
    ...ProjectIdOnTestnet.args,
    minified: true,
  },
};

export const ProjectWithHandle: Story = {
  args: {
    projectId: 1,
  },
};

export const ProjectWithHandleMinified: Story = {
  args: {
    ...ProjectWithHandle.args,
    minified: true,
  },
};

export const ProjectNotExist: Story = {
  args: {
    projectId: 0,
  },
};
