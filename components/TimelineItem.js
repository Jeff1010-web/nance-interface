import { VerticalTimelineElement }  from 'react-vertical-timeline-component';

export default function TimelineItem({ date, title, text, imgSrc, linkText, link }) {
  return (
    <VerticalTimelineElement
      className="vertical-timeline-element--work"
      date={date}
      contentStyle={{ background: 'rgb(235, 235, 235)', color: 'rgb(21, 28, 59)' }}
      contentArrowStyle={{ borderRight: '7px solid  rgb(235, 235, 235)' }}
      iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
      icon={<img className="rounded-full" src="https://api.cloudnouns.com/v1/pfp?ref=nounscenter&utm_source=1" alt="Vercel Logo" />}
    >
      <h2 className="vertical-timeline-element-title capitalize">
        {title}
      </h2>
      <p>
        {text}
      </p>
      <div class="rounded-lg overflow-hidden my-2">
        <img src={imgSrc} alt={imgSrc} />
      </div>
      <div class="pt-4 pb-2">
        <a class="bg-amber-200 hover:bg-opacity-60 transition rounded-md px-3 py-2 text-xs"
          href={link} target="_blank" rel="noreferrer">
          {linkText}
        </a>
      </div>
    </VerticalTimelineElement>
  )
}
