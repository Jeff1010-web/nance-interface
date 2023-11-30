import type { Meta, StoryObj } from "@storybook/react";

import MultipleStep from "./MultipleStep";

const meta: Meta<typeof MultipleStep> = {
  component: MultipleStep,
};

export default meta;
type Story = StoryObj<typeof MultipleStep>;

export const ThreeSteps: Story = {
  args: {
    steps: [
      {
        name: "First step",
        contentRender: (back, next) => (
          <div>
            <p>Content</p>
            <div className="flex justify-end space-x-6">
              {back && <button onClick={back}>Back</button>}
              {next && <button onClick={next}>Next</button>}
            </div>
          </div>
        ),
      },
      {
        name: "Second step",
        contentRender: (back, next) => (
          <div>
            <p>Content</p>
            <div className="flex justify-end space-x-6">
              {back && <button onClick={back}>Back</button>}
              {next && <button onClick={next}>Next</button>}
            </div>
          </div>
        ),
      },
      {
        name: "Third step",
        content: <p>Third step content</p>,
      },
      {
        name: "Fourth step",
      },
      {
        name: "Middle step",
        contentRender: (back, next) => (
          <div>
            <p>Content</p>
            <div className="flex justify-end space-x-6">
              {back && <button onClick={back}>Back</button>}
              {next && <button onClick={next}>Next</button>}
            </div>
          </div>
        ),
      },
      {
        name: "Middle step",
        contentRender: (back, next) => (
          <div>
            <p>Content</p>
            <div className="flex justify-end space-x-6">
              {back && <button onClick={back}>Back</button>}
              {next && <button onClick={next}>Next</button>}
            </div>
          </div>
        ),
      },
      {
        name: "Middle step",
        contentRender: (back, next) => (
          <div>
            <p>Content</p>
            <div className="flex justify-end space-x-6">
              {back && <button onClick={back}>Back</button>}
              {next && <button onClick={next}>Next</button>}
            </div>
          </div>
        ),
      },
      {
        name: "Middle step",
        contentRender: (back, next) => (
          <div>
            <p>Content</p>
            <div className="flex justify-end space-x-6">
              {back && <button onClick={back}>Back</button>}
              {next && <button onClick={next}>Next</button>}
            </div>
          </div>
        ),
      },
      {
        name: "Middle step",
        contentRender: (back, next) => (
          <div>
            <p>Content</p>
            <div className="flex justify-end space-x-6">
              {back && <button onClick={back}>Back</button>}
              {next && <button onClick={next}>Next</button>}
            </div>
          </div>
        ),
      },
      {
        name: "Fifth step",
        contentRender: (back, next) => (
          <div>
            <p>Content</p>
            <div className="flex justify-end space-x-6">
              {back && <button onClick={back}>Back</button>}
              {next && <button onClick={next}>Next</button>}
            </div>
          </div>
        ),
      },
    ],
  },
};
