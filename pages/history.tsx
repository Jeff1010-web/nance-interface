import Layout from '../components/Layout'
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

export default function History() {
  return (
    <Layout 
      pageTitle="Moments & Milestones"
      pageDescription="A timeline of JuiceboxDAO's major milestones and noteworthy moments that have happened since the project's inception.">
      <div className="py-12">
        <VerticalTimeline>
          <TimelineItem
            date="1/26/2021"
            title="Git Init"
            text="jango creates the first commit in the Github repo of juicebox-interface."
            imgSrc="/images/timeline/first-commit.jpg"
            linkText="View commit"
            link="https://github.com/jbx-protocol/juice-interface/commit/0537abeefa21168dddf942ca52d9e938975afabc"
            iconSrc="/images/timeline/jango.jpeg" />
          
          <TimelineItem
            date="7/18/2021"
            title="First Public Tweet"
            text="jango tweeted about Juicebox deployment."
            imgSrc="/images/timeline/first-deployment.jpg"
            linkText="View tweet"
            link="https://twitter.com/me_jango/status/1416454601151221765"
            iconSrc="/images/timeline/jango.jpeg" />

          <TimelineItem
            date="8/16/2021"
            title="First Proposal Passes"
            text="The DAO's first proposal on snapshot, 'What's your favorite fruit?', passes with the winner 'Banana'."
            imgSrc="/images/timeline/first-proposal.jpg"
            linkText="Read proposal"
            link="https://snapshot.org/#/jbdao.eth/proposal/QmeJESaxVPbRtNybEg42CduDAquPLPPcTTZZ6aybCQrjRy" />

          <TimelineItem
            date="11/1/2021"
            title="Purchase JB Crewnecks for the Community"
            text="This would allow JB to reward contributors with something other than funds or in addition too. "
            imgSrc="/images/timeline/crewnecks.jpg"
            linkText="Read proposal"
            link="https://snapshot.org/#/jbdao.eth/proposal/0xa38b9d35cceadd65f549cd3ec95835026d3d221d4e1ddd0cdf8daff70628f6e1"
            iconSrc="images/timeline/0xstvg.jpeg" />

          <TimelineItem
            date="11/15/2021"
            title="ConstitutionDAO Launch"
            text="they said 'We are buying the United States Constitution.'"
            imgSrc="/images/timeline/constitution.jpg"
            linkText="View tweet"
            link="https://twitter.com/ConstitutionDAO/status/1460062961117147141"
            iconSrc="/images/timeline/constitutiondao.jpeg" />

          <TimelineItem
            date="2/1/2022"
            title="PeelDAO Launch"
            text="Create a Frontend DAO comprising of the JB’s frontend contributors to internally handle frontend matters of Juicebox."
            imgSrc="/images/timeline/peel.jpg"
            linkText="Read proposal"
            link="https://snapshot.org/#/jbdao.eth/proposal/0xf017b82be62ab9d0d82945408d7e34a21289d58a8e9ffff3e380352db2167fd0"
            iconSrc="/images/timeline/peeldao.jpeg" />


        </VerticalTimeline>
      </div>
    </Layout>
  )
}

function TimelineItem({ date, title, text, imgSrc, linkText, link, iconSrc = "https://juicebox.money/assets/banana-ol.png" }) {
  return (
    <VerticalTimelineElement
      className="vertical-timeline-element--work"
      date={date}
      contentStyle={{ background: 'rgb(235, 235, 235)', color: 'rgb(21, 28, 59)' }}
      contentArrowStyle={{ borderRight: '7px solid  rgb(235, 235, 235)' }}
      iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
      icon={<img className="rounded-full" src={iconSrc} alt="Vercel Logo" />}
    >
      <h2 className="vertical-timeline-element-title capitalize">
        {title}
      </h2>
      <p>
        {text}
      </p>
      <div className="rounded-lg overflow-hidden my-2">
        <img src={imgSrc} alt={imgSrc} />
      </div>
      <div className="pt-4 pb-2">
        <a className="bg-amber-200 hover:bg-opacity-60 transition rounded-md px-3 py-2 text-xs"
          href={link} target="_blank" rel="noreferrer">
          {linkText}
        </a>
      </div>
    </VerticalTimelineElement>
  )
}
