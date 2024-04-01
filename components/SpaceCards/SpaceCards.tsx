import Image from "next/image";
import { SpaceInfo } from "@nance/nance-sdk";
import ProjectLink from "../ProjectLink";
import ContentNotFound from "../ContentNotFound";

export default function SpaceCards({
  spaceInfos,
  isLoading = false,
  error = undefined,
}: {
  spaceInfos: SpaceInfo[] | undefined;
  isLoading?: boolean;
  error?: Error | undefined;
}) {
  if (error) {
    return (
      <div className="m-4 flex justify-center lg:m-6 lg:px-20">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Error loading spaces
          </h1>
          <p className="text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="m-4 flex justify-center lg:m-6 lg:px-20">
        <ul
          role="list"
          className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
        >
          <SpaceCardSkeleton />
          <SpaceCardSkeleton />
          <SpaceCardSkeleton />
        </ul>
      </div>
    );
  }

  if (spaceInfos?.length === 0) {
    return (
      <ContentNotFound
        title="No Spaces Found."
        reason="There are no spaces to show"
        recommendationText="Do you want to create a new space?"
        recommendationActionHref="/create"
        recommendationActionText="Create Space"
        fallbackActionHref="/"
        fallbackActionText="Back to Home"
      />
    );
  }

  return (
    <div className="m-4 flex justify-center lg:m-6 lg:px-20">
      <ul
        role="list"
        className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
      >
        {spaceInfos?.sort((a, b) => b.nextProposalId - a.nextProposalId).map((spaceInfo: SpaceInfo) => (
          <li
            key={spaceInfo.name}
            className="overflow-hidden rounded-xl border border-gray-200"
          >
            <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
              <a href={`/s/${spaceInfo.name}`}>
                <Image
                  src={`https://cdn.stamp.fyi/space/${spaceInfo.snapshotSpace}?s=160`}
                  alt={`${spaceInfo.displayName} Logo`}
                  className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
                  height={48}
                  width={48}
                />
              </a>
              <a
                href={`/s/${spaceInfo.name}`}
                className="text-sm font-medium leading-6 text-gray-900"
              >
                {spaceInfo.displayName}
              </a>
            </div>
            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Current cycle</dt>
                <dd className="text-gray-700">
                  {`${
                    spaceInfo.currentEvent?.title
                      ? `${spaceInfo.currentEvent?.title} of `
                      : ""
                  }GC${spaceInfo.currentCycle}`}
                </dd>
              </div>
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Proposals</dt>
                <dd className="text-gray-700">
                  {spaceInfo.nextProposalId - 1}
                </dd>
              </div>
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Treasury</dt>
                <dd className="flex items-start gap-x-2">
                  <ProjectLink
                    projectId={parseInt(spaceInfo.juiceboxProjectId)}
                    isTestnet={
                      spaceInfo.transactorAddress?.network === "goerli"
                    }
                    minified
                  />
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SpaceCardSkeleton() {
  return (
    <li className="overflow-hidden rounded-xl border border-gray-200">
      <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
        <a href="#">
          <div className="h-12 w-12 flex-none animate-pulse rounded-lg bg-gray-200" />
        </a>
        <a
          href="#"
          className="h-6 w-[150px] animate-pulse cursor-not-allowed rounded bg-gray-200"
        ></a>
      </div>
      <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Current cycle</dt>
          <dd className="h-6 w-20 animate-pulse rounded bg-gray-200"></dd>
        </div>
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Treasury</dt>
          <dd className="h-6 w-20 animate-pulse rounded bg-gray-200"></dd>
        </div>
      </dl>
    </li>
  );
}
