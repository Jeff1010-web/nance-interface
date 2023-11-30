import { PropsWithChildren } from "react";

interface ClassNameProps {
  className?: string;
}

function SidebarLayout({
  children,
  className = "grid grid-cols-3 gap-4",
}: PropsWithChildren<ClassNameProps>) {
  return <div className={className}>{children}</div>;
}

function Sidebar({
  children,
  className = "col-span-1",
}: PropsWithChildren<ClassNameProps>) {
  return (
    <div className={className}>
      <div
        className="sticky bottom-6 top-6 bg-white px-4 py-5 opacity-100 shadow sm:rounded-lg sm:px-6"
        style={{
          maxHeight: "calc(100vh - 9rem)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Content({
  children,
  className = "col-span-2",
}: PropsWithChildren<ClassNameProps>) {
  return <div className={className}>{children}</div>;
}

SidebarLayout.Sidebar = Sidebar;
SidebarLayout.Content = Content;
export default SidebarLayout;
