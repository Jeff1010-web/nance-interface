import { classNames } from "@/utils/functions/tailwind";
import { PropsWithChildren } from "react";

interface Props {
  title: JSX.Element | string;
  description: JSX.Element | string;
  overrideClassName?: string;
  appendClassName?: string;
}

export default function DescriptionCardWrapper({
  children,
  description,
  title,
  overrideClassName = "flex h-full w-full flex-col space-y-4 rounded-lg bg-gray-100 p-8 shadow-md",
  appendClassName = "",
}: PropsWithChildren<Props>) {
  return (
    <div className={classNames(overrideClassName, appendClassName)}>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}
