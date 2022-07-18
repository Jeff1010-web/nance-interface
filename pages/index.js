import Layout from '../components/Layout.js'
import Link from 'next/link'

export default function Home() {
  return (
    <Layout home>
      <div className="px-8">
        <main className="min-h-screen py-16 flex-1 flex flex-col items-center">
          <h1 className="text-7xl font-medium">
            Juicebox Center
          </h1>
          <br/>

          <div className="mt-5 sm:mx-auto grid grid-cols-2 xs:gap-3 sm:gap-8 sm:justify-center md:mt-8 lg:grid-flow-col">
            <HomeCard link="/progress" linkText="Feature Progress" imgSrc="images/character/orange_lady.png" bgColor="bg-red-500" />
            <HomeCard link="/metric" linkText="Health Metrics" imgSrc="images/character/banana.png" bgColor="bg-emerald-500" />
            <HomeCard link="/funding" linkText="Funded Projects" imgSrc="images/character/pina.png" bgColor="bg-sky-500" />
            <HomeCard link="/history" linkText="Timeline" imgSrc="images/character/blueberry.png" bgColor="bg-purple-500" />
          </div>
        </main>
      </div>
    </Layout>
  )
}

function HomeCard({ link, linkText, imgSrc, bgColor }) {
  return (
      <Link href={link}>
        <div class="mt-3 sm:mt-0">
          <div class="nounish_button" id="one">
            <button class="group block text-nouns rounded-xl sm:cursor-pointer transition duration-200 xs:h-40 xs:w-40 sm:h-48 sm:w-48 bg-gray-100 focus-within:ring-2 relative focus-within:ring-offset-2 focus-within:ring-offset-gray-100 hover:ring-2 hover:ring-grey-base focus-within:ring-grey-base overflow-hidden m-auto">
              <div class={`absolute bottom-0 w-full px-4 py-1 justify-center text-lg flex items-end ${bgColor} font-light text-white shadow-lg`}>
                {linkText}
              </div>
              <img class="object-cover w-full h-full" src={imgSrc} alt={linkText} />
            </button>
          </div>
        </div>
      </Link>
  )
}