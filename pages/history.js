import Image from 'next/image'
import Link from 'next/link'
import TopNav from '../components/TopNav.js'
import TimelineItem from '../components/TimelineItem.js'
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

export default function History() {
  return (
    <div className="px-8 bg-gray-100 text-black">
      <TopNav/>

      <VerticalTimeline>
        <TimelineItem
          date="7/18/2021"
          title="First public tweet"
          text="jango tweeted about Juicebox deployment."
          imgSrc="/images/timeline/first-deployment.jpg"
          linkText="View tweet"
          link="https://twitter.com/me_jango/status/1416454601151221765" />
      </VerticalTimeline>
    </div>
  )
}
