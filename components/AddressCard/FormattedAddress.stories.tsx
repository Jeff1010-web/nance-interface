import type { Meta, StoryObj } from "@storybook/react";
import { createMock } from "storybook-addon-module-mock";
import * as wagmi from "wagmi";
import { goerli } from "wagmi/chains";

import FormattedAddress from "./FormattedAddress";
import { NetworkContext } from "@/context/NetworkContext";

const meta: Meta<typeof FormattedAddress> = {
  title: "Nance Components/common/FormattedAddress",
  component: FormattedAddress,
};

export default meta;
type Story = StoryObj<typeof FormattedAddress>;

export const ENSResolved: Story = {
  args: {
    address: "0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e",
    subText: "I have ENS",
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

export const NoENSResolved: Story = {
  args: {
    address: "0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e",
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

export const Minified: Story = {
  args: {
    address: "0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e",
    minified: true,
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

export const OnGoerli: Story = {
  args: {
    address: "0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e",
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
  decorators: [
    (Story) => (
      <NetworkContext.Provider value={goerli.name}>
        <Story />
      </NetworkContext.Provider>
    ),
  ],
};
