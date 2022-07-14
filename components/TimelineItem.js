import { VerticalTimelineElement }  from 'react-vertical-timeline-component';

export default function TimelineItem() {
  return (
    <VerticalTimelineElement
      className="vertical-timeline-element--work"
      date="7/18/2021"
      contentStyle={{ background: 'rgb(235, 235, 235)', color: 'rgb(21, 28, 59)' }}
      contentArrowStyle={{ borderRight: '7px solid  rgb(235, 235, 235)' }}
      iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
      icon={<img className="rounded-full" src="https://api.cloudnouns.com/v1/pfp?ref=nounscenter&utm_source=1" alt="Vercel Logo" />}
    >
      <h3 className="vertical-timeline-element-title capitalize font-sans">First public tweet</h3>
      <p>
        jango tweeted about Juicebox deployment.
      </p>
      <div class="rounded-lg overflow-hidden my-2">
        <img src="/images/timeline/first-deployment.jpg" alt="pronoun.png" />
      </div>
      <div class="pt-4 pb-2">
        <a class="bg-amber-200 hover:bg-opacity-80 transition rounded-md px-3 py-2 text-xs text-white" href="https://twitter.com/me_jango/status/1416454601151221765" target="_blank" rel="noreferrer">
          View tweet
        </a>
      </div>
    </VerticalTimelineElement>
  )
}
