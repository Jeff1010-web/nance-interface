import type { Meta, StoryObj } from "@storybook/react";

import { createMock } from "storybook-addon-module-mock";
import * as reactHookForm from "react-hook-form";

import UIntForm from "./UIntForm";

const meta: Meta<typeof UIntForm> = {
  title: "Nance Components/Form/UIntForm",
  component: UIntForm,
};

export default meta;
type Story = StoryObj<typeof UIntForm>;

const FieldName = "placeholder";
const anyFunction = (() => {}) as any;

export const Basic: Story = {
  args: {
    label: "UInt256",
    fieldName: FieldName,
  },
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(reactHookForm, "useFormContext");
        mock.mockReturnValue({
          register: (name: string, options: any) => {
            return {
              name: name,
              onChange: anyFunction,
              onBlur: anyFunction,
              ref: {
                name: name,
                value: "",
              } as any,
            };
          },
          getValues: ((name: string) => {
            return (document.getElementsByName(name)[0] as HTMLInputElement)
              .value;
          }) as any,
          setValue: (name: string, value: string) => {
            (document.getElementsByName(name)[0] as HTMLInputElement).value =
              value;
          },
          formState: {
            errors: {},
          } as any,
        } as any);

        return [mock];
      },
    },
  },
};
