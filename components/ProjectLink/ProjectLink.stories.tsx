import type { Meta, StoryObj } from "@storybook/react";
import ProjectLink from "./ProjectLink";

import { createMock } from "storybook-addon-module-mock";
import * as ProjectHandle from "@/utils/hooks/juicebox/ProjectHandle";

const meta: Meta<typeof ProjectLink> = {
  title: "Nance Components/Juicebox/ProjectLink",
  component: ProjectLink,
};

export default meta;
type Story = StoryObj<typeof ProjectLink>;

export const ProjectId: Story = {
  args: {
    projectId: 1,
  },
};

export const ProjectIdOnTestnet: Story = {
  args: {
    ...ProjectId.args,
    isTestnet: true,
  },
};

export const ProjectWithHandle: Story = {
  args: {
    projectId: 1,
  },
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(ProjectHandle, "default");
        mock.mockReturnValue({
          data: "juicebox",
          loading: false,
          error: null,
        });

        return [mock];
      },
    },
  },
};

export const ProjectWithHandleOnTestnet: Story = {
  args: {
    ...ProjectWithHandle.args,
    isTestnet: true,
  },
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(ProjectHandle, "default");
        mock.mockReturnValue({
          data: "juicebox.test",
          loading: false,
          error: null,
        });

        return [mock];
      },
    },
  },
};

export const ProjectNotExist: Story = {
  args: {
    projectId: 0,
  },
};
