import Link from "next/link";

export default function Contact() {
  return (
    <div className="mt-6 flex flex-col items-center space-y-4">
      <p className="text-lg font-semibold text-gray-900">
        Questions?
      </p>
      <Link
        href="/contact"
        className="rounded-md bg-blue-600 sm:px-36 px-32 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
      Contact Us
      </Link>
    </div>
  );
}
