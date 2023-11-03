import Image from "next/image";
import Link from "next/link";

export default function SpaceNotFound() {
  return (
    <div className="flex h-screen flex-col items-center">
      <div className="mt-20 flex flex-col">
        <Image
          src="/images/character/Empty_orange_2.png"
          alt="Empty orange"
          width={300}
          height={300}
        />
        <h1 className="mt-4 text-center text-2xl font-bold">Space Not Found</h1>
        <p className="mt-2 text-center text-sm">
          The space you are looking for does not exist.
        </p>
        <p className="mt-2 text-center text-sm">
          Do you want to create a new space?
        </p>
        <div className="mt-6 flex items-center justify-center gap-x-6">
          <Link
            href="/create"
            className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Create Space
          </Link>

          <Link
            href="/s"
            className="rounded-md bg-gray-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          >
            See All Spaces
          </Link>
        </div>
      </div>
    </div>
  );
}
