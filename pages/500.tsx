import Link from "next/link";

export default function Custom500() {
    return (
        <section className="bg-grey-lightest dark:bg-gray-900">
            <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
                <div className="mx-auto max-w-screen-sm text-center">
                    <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">500</h1>
                    <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">Something&apos;s wrong.</p>
                    <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">Sorry, we can&apos;t present that page now due to some errors. You&apos;ll find lots to explore on the home page. </p>
                    <div className="inline-block text-black bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4 mr-4">
                        <Link href="/">
                            <a>Back to home</a>
                        </Link>
                    </div>
                    <div className="inline-block text-black bg-amber-200 hover:bg-amber-300 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4">
                        <Link href="https://discord.com/channels/775859454780244028/1001875129569120406">
                            <a>Contact us</a>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}