import Link from "next/link";
import Image from "next/image";

export default function Custom500({ errMsg }: { errMsg?: string }) {
  return (
    <section className="bg-grey-lightest dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <Image src="https://http.cat/500" alt="500" width={487} height={450} />
          <p className="my-4 text-lg font-light text-gray-500 dark:text-gray-400">{errMsg || "Sorry, we can't present that page now due to some errors. You'll find lots to explore on the home page."}</p>
          <div className="inline-block text-black bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4 mr-4">
            <Link href="/">
              <a>Back to home</a>
            </Link>
          </div>
          <div className="inline-block text-black bg-amber-200 hover:bg-amber-300 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4">
            <Link href="discord://discord.com/channels/1090064637858414633/1090064837498896395">
              <a>Contact us</a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
