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
        <TimelineItem />
        <TimelineItem />
        <TimelineItem />
        <TimelineItem />
        <TimelineItem />
      </VerticalTimeline>
    </div>
  )
}
