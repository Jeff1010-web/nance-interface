import type { Meta, StoryObj } from "@storybook/react";
import ContentNotFound from "./ContentNotFound";

const meta: Meta<typeof ContentNotFound> = {
  title: "Nance Components/ContentNotFound",
  component: ContentNotFound,
};

export default meta;
type Story = StoryObj<typeof ContentNotFound>;

export const PageNotFound: Story = {
  args: {
    title: "Page Not Found",
    reason:
      "Sorry, we can't find that page. You'll find lots to explore on the home page.",
    recommendationText: "Do you want to contact us?",
    recommendationActionHref: "/contact",
    recommendationActionText: "Contact us",
    fallbackActionHref: "/",
    fallbackActionText: "Back to Home",
  },
};

export const SpaceNotFound: Story = {
  args: {
    title: "Space Not Found",
    reason: "The space you are looking for does not exist.",
    recommendationText: "Do you want to create a new space?",
    recommendationActionHref: "/create",
    recommendationActionText: "Create Space",
    fallbackActionHref: "/s",
    fallbackActionText: "See All Spaces",
  },
};
