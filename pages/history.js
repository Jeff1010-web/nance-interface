import Image from 'next/image'
import Link from 'next/link'
import Layout from '../components/Layout.js'
import TimelineItem from '../components/TimelineItem.js'
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

export default function History() {
  return (
    <Layout>
      <div className="px-8">
        <VerticalTimeline>
          <TimelineItem
            date="1/26/2021"
            title="Git Init"
            text="jango creates the first commit in the Github repo of juicebox-interface."
            imgSrc="/images/timeline/first-commit.jpg"
            linkText="View commit"
            link="https://github.com/jbx-protocol/juice-interface/commit/0537abeefa21168dddf942ca52d9e938975afabc" />

          <TimelineItem
            date="7/18/2021"
            title="First Public Tweet"
            text="jango tweeted about Juicebox deployment."
            imgSrc="/images/timeline/first-deployment.jpg"
            linkText="View tweet"
            link="https://twitter.com/me_jango/status/1416454601151221765" />

          <TimelineItem
            date="8/16/2021"
            title="First Proposal Passes"
            text="The DAO's first proposal on snapshot, 'What's your favorite fruit?', passes with the winner 'Banana'."
            imgSrc="/images/timeline/first-proposal.jpg"
            linkText="Read proposal"
            link="https://snapshot.org/#/jbdao.eth/proposal/QmeJESaxVPbRtNybEg42CduDAquPLPPcTTZZ6aybCQrjRy" />

          <TimelineItem
            date="11/15/2021"
            title="ConstitutionDAO Launch"
            text="they said 'We are buying the United States Constitution.'"
            imgSrc="/images/timeline/constitution.jpg"
            linkText="View tweet"
            link="https://twitter.com/ConstitutionDAO/status/1460062961117147141" />

        </VerticalTimeline>
      </div>
    </Layout>
  )
}
