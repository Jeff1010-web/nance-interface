import type { Meta, StoryObj } from "@storybook/react";
import { createMock } from "storybook-addon-module-mock";
import * as wagmi from "wagmi";

import JBSplitEntry from "./JBSplitEntry";
import { ZERO_ADDRESS } from "@/constants/Contract";
import { BigNumber } from "ethers";
import { JBSplit } from "@/models/JuiceboxTypes";

const meta: Meta<typeof JBSplitEntry> = {
  title: "Nance Components/Juicebox/JBSplitEntry",
  component: JBSplitEntry,
};

export default meta;
type Story = StoryObj<typeof JBSplitEntry>;

const DEFAULT_SPLIT: JBSplit = {
  allocator: ZERO_ADDRESS,
  projectId: BigNumber.from(0),
  beneficiary: ZERO_ADDRESS,
  percent: BigNumber.from(0),
  preferAddToBalance: false,
  preferClaimed: false,
  lockedUntil: BigNumber.from(0),
};

export const Project: Story = {
  args: {
    mod: {
      ...DEFAULT_SPLIT,
      projectId: BigNumber.from(1),
      beneficiary: "0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e",
    },
  },
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(wagmi, "useEnsName");
        mock.mockReturnValue({
          data: "jbdao.eth",
        } as any);
      },
    },
  },
};

export const Address: Story = {
  args: {
    mod: {
      ...DEFAULT_SPLIT,
      beneficiary: "0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e",
    },
  },
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(wagmi, "useEnsName");
        mock.mockReturnValue({
          data: "jbdao.eth",
        } as any);
      },
    },
  },
};

export const Allocator: Story = {
  args: {
    mod: {
      ...DEFAULT_SPLIT,
      allocator: "0x1eb759829b1a3d55193472142f18df3091BcAc4B",
    },
  },
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(wagmi, "useEnsName");
        mock.mockReturnValue({
          data: undefined,
        } as any);
      },
    },
  },
};
