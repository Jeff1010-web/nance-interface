import Link from 'next/link'
import SiteNav from '../components/SiteNav'

const tools: ContentLink[] = [
  {
    id: 1,
    title: "Random Juicebox Project",
    description: "roll dice and get one random Juicebox Project.",
    link: "/lucky"
  },
  {
    id: 2,
    title: "Safe UI",
    description: "another way to see Safe Txns.",
    link: "/safe/0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e"
  },
  {
    id: 3,
    title: "Juicebox Reconfiguration Compare",
    description: "import/export hex data, preview with basic interface.",
    link: "/juicebox"
  },
]

interface ContentLink {
  id: number
  title: string
  description: string
  link: string
}

export default function OldHome() {
  return (
    <>
      <SiteNav pageTitle={`Old Homepage`} />
      <div className="px-8 bg-white">
        <div className="py-16 flex-1 flex flex-col items-center">
          <h1 className="text-7xl font-medium">
            JuiceTool
          </h1>
          <br/>

          <div className="mt-5 sm:mx-auto grid grid-cols-2 xs:gap-3 sm:gap-8 sm:justify-center md:mt-12 lg:grid-flow-col">
            <HomeCard link="/progress" linkText="Feature Progress" imgSrc="images/character/orange_lady.png" bgColor="bg-red-500" />
            <HomeCard link="/metric" linkText="Health Metrics" imgSrc="images/character/banana.png" bgColor="bg-emerald-500" />
            <HomeCard link="/funding" linkText="Funded Projects" imgSrc="images/character/pina.png" bgColor="bg-sky-500" />
            <HomeCard link="/history" linkText="Timeline" imgSrc="images/character/blueberry.png" bgColor="bg-purple-500" />
          </div>

          <div>
            <span className='block text-2xl mt-6'>Other Tools</span>
            <div className="mt-6 flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {tools.map((tool) => (
                  <li key={tool.id} className="py-5">
                    <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                      <h3 className="text-sm font-semibold text-gray-800">
                        <Link href={tool.link}>
                          <a className="hover:underline focus:outline-none">
                            {/* Extend touch target to entire panel */}
                            <span className="absolute inset-0" aria-hidden="true" />
                            {tool.title}
                          </a>
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{tool.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function HomeCard({ link, linkText, imgSrc, bgColor }) {
  return (
      <Link href={link}>
        <div className="mt-3 sm:mt-0">
          <div>
            <button className="group block text-nouns rounded-xl sm:cursor-pointer transition duration-200 xs:h-40 xs:w-40 sm:h-48 sm:w-48 bg-gray-100 focus-within:ring-2 relative focus-within:ring-offset-2 focus-within:ring-offset-gray-100 hover:ring-2 hover:ring-grey-base focus-within:ring-grey-base overflow-hidden m-auto">
              <div className={`absolute bottom-0 w-full px-4 py-1 justify-center text-lg flex items-end ${bgColor} font-light text-white shadow-lg text-xs sm:text-sm`}>
                {linkText}
              </div>
              <img className="object-cover w-full h-full" src={imgSrc} alt={linkText} />
            </button>
          </div>
        </div>
      </Link>
  )
}