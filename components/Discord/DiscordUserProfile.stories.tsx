import type { Meta, StoryObj } from "@storybook/react";

import { createMock } from "storybook-addon-module-mock";
import * as discordHooks from "@/utils/hooks/DiscordHooks";

import DiscordUserProfile from "./DiscordUserProfile";

const meta: Meta<typeof DiscordUserProfile> = {
  title: "Nance Components/Discord/DiscordUserProfile",
  component: DiscordUserProfile,
};

export default meta;
type Story = StoryObj<typeof DiscordUserProfile>;

export const Authenticated: Story = {
  args: {
    address: "0xEdf62C8A931e164E20f221f4c95397Fba4b6568A",
  },
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(discordHooks, "useFetchDiscordUser");
        mock.mockReturnValue({
          data: {
            id: "1138511865358594148",
            username: "nance-bot",
            avatar: "310aeb4f9d4f4e546e6f112d1c9eeb24",
            discriminator: "0",
            public_flags: 0,
            premium_type: 0,
            flags: 0,
            banner: null,
            accent_color: 3553599,
            global_name: "twodam",
            avatar_decoration: null,
            banner_color: "#36393f",
            mfa_enabled: true,
            locale: "en-US",
          },
          isLoading: false,
          error: undefined,
          mutate: (() => {}) as any,
          isValidating: false,
        });

        return [mock];
      },
    },
  },
};

export const Unauthenticated: Story = {
  args: {
    address: "0xEdf62C8A931e164E20f221f4c95397Fba4b6568A",
  },
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(discordHooks, "useFetchDiscordUser");
        mock.mockReturnValue({
          data: undefined,
          isLoading: false,
          error: undefined,
          mutate: (() => {}) as any,
          isValidating: false,
        });

        return [mock];
      },
    },
  },
};

export const Connecting: Story = {
  args: {
    address: "0xEdf62C8A931e164E20f221f4c95397Fba4b6568A",
  },
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(discordHooks, "useFetchDiscordUser");
        mock.mockReturnValue({
          data: undefined,
          isLoading: true,
          error: undefined,
          mutate: (() => {}) as any,
          isValidating: false,
        });

        return [mock];
      },
    },
  },
};
