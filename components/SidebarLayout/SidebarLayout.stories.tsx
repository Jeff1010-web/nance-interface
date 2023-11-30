import type { Meta, StoryObj } from "@storybook/react";
import SidebarLayout from "./SidebarLayout";

function PlaceHolderText() {
  return (
    <>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Viverra nibh cras
        pulvinar mattis nunc. Vel orci porta non pulvinar. Ullamcorper morbi
        tincidunt ornare massa eget egestas purus. Pharetra sit amet aliquam id
        diam maecenas. Tellus molestie nunc non blandit massa enim nec dui.
        Felis imperdiet proin fermentum leo vel orci. Lorem ipsum dolor sit amet
        consectetur adipiscing elit. Diam quam nulla porttitor massa id. Ut eu
        sem integer vitae justo. Placerat vestibulum lectus mauris ultrices
        eros. Ut porttitor leo a diam. Viverra nam libero justo laoreet sit
        amet. Rutrum quisque non tellus orci ac auctor augue. Viverra justo nec
        ultrices dui sapien eget mi. Dignissim suspendisse in est ante in nibh
        mauris cursus mattis.
      </p>
      <p>
        Mi bibendum neque egestas congue quisque. Tempus urna et pharetra
        pharetra massa massa ultricies. Tortor at auctor urna nunc id cursus.
        Amet cursus sit amet dictum. Turpis in eu mi bibendum. Mauris nunc
        congue nisi vitae. Sapien eget mi proin sed libero enim sed faucibus.
        Sapien faucibus et molestie ac feugiat sed lectus. Nibh nisl condimentum
        id venenatis a condimentum. Mus mauris vitae ultricies leo integer
        malesuada nunc vel.
      </p>
      <p>
        Massa eget egestas purus viverra accumsan. Diam sit amet nisl suscipit.
        Cursus euismod quis viverra nibh cras pulvinar mattis. Libero justo
        laoreet sit amet cursus sit. Eget mauris pharetra et ultrices neque
        ornare aenean euismod. Suspendisse faucibus interdum posuere lorem. Sed
        felis eget velit aliquet sagittis id. Habitasse platea dictumst quisque
        sagittis purus sit. Lacus laoreet non curabitur gravida arcu ac. Non
        nisi est sit amet facilisis magna etiam tempor. Faucibus a pellentesque
        sit amet porttitor eget.
      </p>
    </>
  );
}

const meta: Meta<typeof SidebarLayout> = {
  component: SidebarLayout,
};

export default meta;
type Story = StoryObj<typeof SidebarLayout>;

export const Basic: Story = {
  args: {
    children: (
      <>
        <SidebarLayout.Sidebar>
          <p>Sidebar</p>
        </SidebarLayout.Sidebar>
        <SidebarLayout.Content>
          <PlaceHolderText />
        </SidebarLayout.Content>
      </>
    ),
  },
};

export const Styled: Story = {
  args: {
    className: "grid grid-cols-2 gap-4",
    children: (
      <>
        <SidebarLayout.Sidebar>
          <p>Sidebar</p>
        </SidebarLayout.Sidebar>
        <SidebarLayout.Content className="col-span-1">
          <PlaceHolderText />
        </SidebarLayout.Content>
      </>
    ),
  },
};
